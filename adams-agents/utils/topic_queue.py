import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from openai import OpenAI

from config import OPENAI_BASE_URL, OPENAI_MODEL


VALID_STATUSES = {"suggested", "approved", "in_progress", "completed", "failed", "rejected"}
VALID_PRIORITIES = {"high", "normal", "low"}
VALID_CATEGORIES = {"phase1_cast", "phase2_variation"}

PRIORITY_ORDER = {"high": 0, "normal": 1, "low": 2}


class TopicQueue:
    def __init__(self, queue_file: str = None):
        if queue_file is None:
            queue_file = Path(__file__).parent.parent / "topic_queue.json"
        self.queue_file = Path(queue_file)
        self._ensure_queue_file()

    def _ensure_queue_file(self):
        if not self.queue_file.exists():
            self._write_queue({"topics": []})

    def _read_queue(self) -> Dict:
        with open(self.queue_file, "r", encoding="utf-8") as f:
            return json.load(f)

    def _write_queue(self, data: Dict):
        with open(self.queue_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def _generate_id(self) -> str:
        short = uuid.uuid4().hex[:6]
        return f"aa-t{short}"

    # ── CRUD ────────────────────────────────────────────────────────────

    def add_topic(
        self,
        topic: str,
        context: str = "",
        priority: str = "normal",
        category: str = "phase1_cast",
        parent_topic_id: Optional[str] = None,
        status: str = "suggested",
    ) -> Dict:
        if priority not in VALID_PRIORITIES:
            raise ValueError(f"Invalid priority '{priority}'. Must be one of: {VALID_PRIORITIES}")
        if category not in VALID_CATEGORIES:
            raise ValueError(f"Invalid category '{category}'. Must be one of: {VALID_CATEGORIES}")
        if status not in VALID_STATUSES:
            raise ValueError(f"Invalid status '{status}'. Must be one of: {VALID_STATUSES}")

        entry = {
            "id": self._generate_id(),
            "topic": topic,
            "context": context,
            "priority": priority,
            "category": category,
            "parent_topic_id": parent_topic_id,
            "status": status,
            "suggested_at": datetime.now().isoformat(),
            "approved_at": None,
            "completed_at": None,
            "project_id": None,
        }

        data = self._read_queue()
        data["topics"].append(entry)
        self._write_queue(data)
        return entry

    def get_topic(self, topic_id: str) -> Optional[Dict]:
        data = self._read_queue()
        for t in data["topics"]:
            if t["id"] == topic_id:
                return t
        return None

    def list_topics(self, status: Optional[str] = None) -> List[Dict]:
        data = self._read_queue()
        topics = data["topics"]
        if status:
            topics = [t for t in topics if t["status"] == status]
        return topics

    def update_topic_status(
        self, topic_id: str, status: str, project_id: Optional[str] = None
    ) -> Optional[Dict]:
        if status not in VALID_STATUSES:
            raise ValueError(f"Invalid status '{status}'. Must be one of: {VALID_STATUSES}")

        data = self._read_queue()
        for t in data["topics"]:
            if t["id"] == topic_id:
                t["status"] = status
                if status == "approved":
                    t["approved_at"] = datetime.now().isoformat()
                if status in ("completed", "failed"):
                    t["completed_at"] = datetime.now().isoformat()
                if project_id is not None:
                    t["project_id"] = project_id
                self._write_queue(data)
                return t
        return None

    def get_next_approved_topic(self) -> Optional[Dict]:
        """Return the highest-priority approved topic (ties broken by suggested_at)."""
        approved = [t for t in self.list_topics() if t["status"] == "approved"]
        if not approved:
            return None
        approved.sort(
            key=lambda t: (
                PRIORITY_ORDER.get(t["priority"], 1),
                t["suggested_at"],
            )
        )
        return approved[0]

    def get_status_counts(self) -> Dict[str, int]:
        topics = self.list_topics()
        counts: Dict[str, int] = {}
        for s in VALID_STATUSES:
            counts[s] = sum(1 for t in topics if t["status"] == s)
        return counts

    # ── Suggestion Engine ───────────────────────────────────────────────

    def generate_suggestions(
        self,
        api_key: str,
        count: int = 5,
        outlier_topic: Optional[str] = None,
    ) -> List[Dict]:
        """Use GPT-4o to generate topic suggestions and add them to the queue.

        If `outlier_topic` is provided, generates Phase 2 (variation/mining)
        suggestions. Otherwise generates Phase 1 (broad casting) suggestions.
        """
        client_kwargs = {"api_key": api_key}
        if OPENAI_BASE_URL:
            client_kwargs["base_url"] = OPENAI_BASE_URL
        client = OpenAI(**client_kwargs)

        if outlier_topic:
            suggestions = self._phase2_suggestions(client, count, outlier_topic)
            category = "phase2_variation"
            parent_id = self._find_topic_id_by_title(outlier_topic)
        else:
            suggestions = self._phase1_suggestions(client, count)
            category = "phase1_cast"
            parent_id = None

        added: List[Dict] = []
        for s in suggestions:
            entry = self.add_topic(
                topic=s["title"],
                context=s.get("context", ""),
                priority=s.get("priority", "normal"),
                category=category,
                parent_topic_id=parent_id,
            )
            added.append(entry)
        return added

    def _find_topic_id_by_title(self, title: str) -> Optional[str]:
        title_lower = title.lower()
        for t in self.list_topics():
            if t["topic"].lower() == title_lower:
                return t["id"]
        return None

    def _phase1_suggestions(self, client: OpenAI, count: int) -> List[Dict]:
        existing = [t["topic"] for t in self.list_topics()]
        exclusion = ""
        if existing:
            exclusion = (
                "\n\nDo NOT suggest any of the following topics (already in queue):\n"
                + "\n".join(f"- {t}" for t in existing)
            )

        prompt = (
            'You are a topic strategist for "Adam\'s Axiom", a YouTube economics education channel.\n'
            "The channel produces 10-25 minute explainer videos about economics, finance, and economic history.\n\n"
            f"Generate {count} video topic suggestions. Each topic must meet at least 3 of these 4 criteria:\n"
            '1. Can be framed as a comprehensive explainer ("Every X", "All of Y", "The Complete Z", "X Explained in Y Minutes")\n'
            "2. Has a dramatic historical narrative built in\n"
            "3. Has a surprising or counterintuitive angle\n"
            "4. Would someone share it to look smart?\n\n"
            "For each topic provide:\n"
            "- title: The exact video title (compelling, clickable, specific)\n"
            "- context: A 1-2 sentence description of the angle to take\n"
            '- priority: "high" if it\'s evergreen + high search volume, "normal" otherwise\n\n'
            "Respond as a JSON array. Only output the JSON array, no extra text."
            + exclusion
        )

        return self._call_gpt(client, prompt)

    def _phase2_suggestions(self, client: OpenAI, count: int, outlier_topic: str) -> List[Dict]:
        prompt = (
            f'You are a topic strategist for "Adam\'s Axiom". '
            f'The video "{outlier_topic}" performed significantly above average.\n\n'
            f"Generate {count} variation topics on the same core subject but with different emotional angles.\n\n"
            "Examples of good variations:\n"
            '- "Economic Theories That Failed"\n'
            '- "Economic Theories Governments Don\'t Want You to Know"\n'
            '- "The Economic Theory That Predicted 2008"\n'
            '- "Economic Theories That Changed History"\n\n'
            "For each variation provide:\n"
            "- title: Compelling variation title\n"
            "- context: How this angle differs from the original\n"
            '- priority: "high"\n\n'
            "Respond as a JSON array. Only output the JSON array, no extra text."
        )

        return self._call_gpt(client, prompt)

    def _call_gpt(self, client: OpenAI, prompt: str) -> List[Dict]:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.9,
            response_format={"type": "json_object"},
        )

        raw = response.choices[0].message.content
        parsed = json.loads(raw)

        # Handle both {"topics": [...]} and bare [...] responses
        if isinstance(parsed, list):
            return parsed
        if isinstance(parsed, dict):
            for key in ("topics", "suggestions", "results"):
                if key in parsed and isinstance(parsed[key], list):
                    return parsed[key]
            # Last resort: if the dict has a single list value, use it
            for v in parsed.values():
                if isinstance(v, list):
                    return v
        raise ValueError(f"Unexpected GPT response structure: {type(parsed)}")
