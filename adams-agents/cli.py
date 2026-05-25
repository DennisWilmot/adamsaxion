#!/usr/bin/env python3

import click
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.panel import Panel
from rich.text import Text
from datetime import datetime
from typing import Dict, List, Optional
import json
import logging
import os
import re
from pathlib import Path

from utils.project_manager import ProjectManager
from utils.google_drive import GoogleDriveManager
from simple_agents import SimpleContentAgent
from config import (
    OPENAI_API_KEY, 
    SERPER_API_KEY,
    ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, ELEVENLABS_SPEED, VOICE_SETTINGS,  # Deprecated
    GOOGLE_SERVICE_ACCOUNT_KEY, GOOGLE_CLOUD_PROJECT_ID, GOOGLE_TTS_VOICE_SETTINGS,  # New
    CHUNK_SETTINGS,
    TOPIC_QUEUE_FILE,
)
from utils.topic_queue import TopicQueue

logger = logging.getLogger(__name__)

# Initialize rich console for better output
console = Console()

@click.group()
@click.version_option(version="1.0.0")
def cli():
    """Adams Agents - AI-Powered Content Creation Tool
    
    Create, manage, and generate educational content with AI assistance.
    Supports outline generation, script writing, audio creation, and Google Drive integration.
    """
    pass

@cli.command()
@click.option('--topic', '-t', required=True, help='Topic for the content')
@click.option('--context', '-c', required=True, help='Context or focus area')
@click.option('--voice-id', '-v', default='iP95p4xoKVk53GoZ742B', help='ElevenLabs voice ID')
@click.option('--speed', '-s', default=None, type=float, help='Speech speed (default: from config)')
def create(topic, context, voice_id, speed):
    """Create a new content project"""
    console.print(f"\n[bold blue]Creating new project:[/bold blue] {topic}")
    console.print(f"[dim]Context:[/dim] {context}")
    
    try:
        # Initialize project manager
        pm = ProjectManager()
        
        # Use config speed if none provided
        if speed is None:
            speed = ELEVENLABS_SPEED
        
        # Create project
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("Creating project...", total=None)
            
            project_id = pm.create_project(
                topic=topic,
                context=context,
                voice_id=voice_id,
                speed=speed
            )
            
            progress.update(task, description="Project created successfully!")
        
        # Show project details
        project = pm.get_project(project_id)
        if project:
            console.print(f"\n[bold green]✓ Project created![/bold green]")
            console.print(f"[bold]Project ID:[/bold] {project_id}")
            console.print(f"[bold]Status:[/bold] {project['status']}")
            console.print(f"[bold]Created:[/bold] {project['created_at']}")
            
            # Show next steps
            console.print(f"\n[bold yellow]Next steps:[/bold yellow]")
            console.print(f"1. Generate outline: [bold]python cli.py generate_outline {project_id}[/bold]")
            console.print("2. Generate script: [dim]Coming soon...[/dim]")
            console.print(f"3. Generate audio: [bold]python cli.py generate_audio {project_id}[/bold]")
    
    except Exception as e:
        console.print(f"\n[bold red]Error creating project:[/bold red] {str(e)}")
        raise click.Abort()

@cli.command()
def list():
    """List all projects"""
    try:
        pm = ProjectManager()
        projects = pm.list_projects()
        
        if not projects:
            console.print("\n[dim]No projects found. Create your first project with:[/dim]")
            console.print("[bold]python cli.py create --topic 'Your Topic' --context 'Your Context'[/bold]")
            return
        
        # Create table
        table = Table(title="📊 Content Projects")
        table.add_column("Project ID", style="cyan", no_wrap=True)
        table.add_column("Topic", style="green")
        table.add_column("Status", style="yellow")
        table.add_column("Created", style="dim")
        table.add_column("Segments", style="blue")
        table.add_column("Duration", style="magenta")
        
        for project in projects:
            status_style = {
                "created": "dim",
                "in_progress": "yellow",
                "completed": "green",
                "failed": "red"
            }.get(project["status"], "white")
            
            table.add_row(
                project["project_id"],
                project["topic"],
                f"[{status_style}]{project['status']}[/{status_style}]",
                project["created_at"],
                str(project["segments_count"]),
                project["total_duration"]
            )
        
        console.print(table)
        
    except Exception as e:
        console.print(f"\n[bold red]Error listing projects:[/bold red] {str(e)}")
        raise click.Abort()

@cli.command()
@click.argument('project_identifier')
def show(project_identifier):
    """Show detailed information about a specific project (use project ID or topic)"""
    try:
        pm = ProjectManager()
        
        # Try to find project by ID first, then by topic
        project = pm.get_project(project_identifier)
        if not project:
            project = pm.find_project_by_topic(project_identifier)
        
        if not project:
            console.print(f"\n[bold red]Project not found:[/bold red] {project_identifier}")
            console.print("Try using the project ID or search by topic")
            return
        
        # Create detailed project view
        console.print(f"\n[bold blue]Project Details:[/bold blue]")
        
        details = Table.grid()
        details.add_column(style="cyan", justify="right")
        details.add_column(style="white")
        
        details.add_row("Project ID:", project["project_id"])
        details.add_row("Topic:", project["topic"])
        details.add_row("Context:", project["context"])
        details.add_row("Status:", f"[bold]{project['status']}[/bold]")
        details.add_row("Created:", project["created_at"])
        details.add_row("Voice ID:", project["voice_id"])
        details.add_row("Speed:", str(project["speed"]))
        details.add_row("Segments:", str(project["segments_count"]))
        details.add_row("Duration:", project["total_duration"])
        details.add_row("Drive Synced:", project["drive_synced"])
        
        console.print(details)
        
        # Show generation timestamps
        if any([project["outline_generated"], project["script_generated"], project["audio_generated"]]):
            console.print(f"\n[bold yellow]Generation Timeline:[/bold yellow]")
            timeline = Table.grid()
            timeline.add_column(style="cyan", justify="right")
            timeline.add_column(style="white")
            
            if project["outline_generated"]:
                timeline.add_row("Outline:", project["outline_generated"])
            if project["script_generated"]:
                timeline.add_row("Script:", project["script_generated"])
            if project["audio_generated"]:
                timeline.add_row("Audio:", project["audio_generated"])
            
            console.print(timeline)
        
        # Show next steps based on current status
        console.print(f"\n[bold yellow]Next steps:[/bold yellow]")
        if project["status"] == "created":
            console.print(f"1. Generate outline: [bold]python cli.py generate_outline {project['topic']}[/bold]")
        elif project["status"] == "outline_generated":
            console.print(f"1. Generate script: [bold]python cli.py generate_script {project['topic']}[/bold]")
        elif project["status"] == "script_generated":
            console.print(f"1. Generate audio: [bold]python cli.py generate_audio {project['topic']}[/bold]")
        elif project["status"] == "audio_generated":
            console.print(f"1. Render video: [bold]python cli.py render_video {project['topic']}[/bold]")
            console.print("2. Review audio files before rendering")
        elif project["status"] == "video_rendered":
            console.print(f"1. Preview video: [bold]open projects/{project['project_id']}/output/video.mp4[/bold]")
            console.print(f"2. Upload to Google Drive: [bold]python cli.py upload_to_drive {project['topic']}[/bold]")
        
        # Always show available commands
        console.print(f"\n[bold blue]Available commands:[/bold blue]")
        console.print(f"• [bold]python cli.py generate_outline {project['topic']}[/bold] - Generate outline")
        console.print(f"• [bold]python cli.py generate_script {project['topic']}[/bold] - Generate script")
        console.print(f"• [bold]python cli.py generate_audio {project['topic']}[/bold] - Generate audio")
        console.print(f"• [bold]python cli.py render_video {project['topic']}[/bold] - Render video")
        console.print(f"• [bold]python cli.py upload_to_drive {project['topic']}[/bold] - Upload to Google Drive")
        console.print(f"• [bold]python cli.py validate {project['topic']}[/bold] - Validate content")
    
    except Exception as e:
        console.print(f"\n[bold red]Error showing project:[/bold red] {str(e)}")
        raise click.Abort()

@cli.command()
def status():
    """Show overall system status"""
    try:
        pm = ProjectManager()
        projects = pm.list_projects()
        
        if not projects:
            console.print("\n[dim]No projects found[/dim]")
            return
        
        # Calculate statistics
        total_projects = len(projects)
        completed = len([p for p in projects if p["status"] == "completed"])
        in_progress = len([p for p in projects if p["status"] == "in_progress"])
        created = len([p for p in projects if p["status"] == "created"])
        
        # Create status panel
        status_text = Text()
        status_text.append(f"📊 Total Projects: {total_projects}\n", style="bold blue")
        status_text.append(f"✅ Completed: {completed}\n", style="green")
        status_text.append(f"🔄 In Progress: {in_progress}\n", style="yellow")
        status_text.append(f"📝 Created: {created}\n", style="cyan")
        
        panel = Panel(status_text, title="System Status", border_style="blue")
        console.print(panel)
        
    except Exception as e:
        console.print(f"\n[bold red]Error getting status:[/bold red] {str(e)}")
        raise click.Abort()

@cli.command()
@click.argument('project_identifier')
def generate_outline(project_identifier):
    """Generate an outline for a project (use project ID or topic)"""
    try:
        pm = ProjectManager()
        
        # Try to find project by ID first, then by topic
        project = pm.get_project(project_identifier)
        if not project:
            project = pm.find_project_by_topic(project_identifier)
        
        if not project:
            console.print(f"\n[bold red]Project not found:[/bold red] {project_identifier}")
            console.print("Try using the project ID or search by topic")
            return
        
        console.print(f"\n[bold blue]Generating outline for:[/bold blue] {project['topic']}")
        console.print(f"[dim]Context:[/dim] {project['context']}")
        
        # Initialize Simple Agent
        agent = SimpleContentAgent(OPENAI_API_KEY)
        agent.set_project_dir(pm.projects_dir / project["project_id"])
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("Generating outline...", total=None)
            
            outline = agent.create_outline(
                topic=project['topic'],
                context=project['context']
            )
            
            progress.update(task, description="Outline generated successfully!")
        
        # Save outline to project
        outline_file = pm.projects_dir / project["project_id"] / "outline.txt"
        with open(outline_file, 'w') as f:
            f.write(outline)
        
        # Update project status
        pm.update_project_status(
            project["project_id"], 
            "outline_generated",
            outline_generated=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        
        console.print(f"\n[bold green]✓ Outline generated![/bold green]")
        console.print(f"[bold]Saved to:[/bold] {outline_file}")
        
        # Show next steps
        console.print(f"\n[bold yellow]Next steps:[/bold yellow]")
        console.print(f"1. Generate script: [bold]python cli.py generate_script {project['topic']}[/bold]")
        console.print(f"2. Generate audio: [bold]python cli.py generate_audio {project['topic']}[/bold]")
        console.print(f"3. Upload to Google Drive: [bold]python cli.py upload_to_drive {project['topic']}[/bold]")
        
    except Exception as e:
        console.print(f"\n[bold red]Error generating outline:[/bold red] {str(e)}")
        raise click.Abort()

@cli.command()
@click.argument('project_identifier')
def generate_script(project_identifier):
    """Generate a script based on the project outline (use project ID or topic)"""
    try:
        pm = ProjectManager()
        
        # Try to find project by ID first, then by topic
        project = pm.get_project(project_identifier)
        if not project:
            project = pm.find_project_by_topic(project_identifier)
        
        if not project:
            console.print(f"\n[bold red]Project not found:[/bold red] {project_identifier}")
            console.print("Try using the project ID or search by topic")
            return
        
        # Check if outline exists
        outline_file = pm.projects_dir / project["project_id"] / "outline.txt"
        if not outline_file.exists():
            console.print(f"\n[bold red]No outline found for project:[/bold red] {project['topic']}")
            console.print(f"Generate an outline first: [bold]python cli.py generate_outline {project_identifier}[/bold]")
            return
        
        console.print(f"\n[bold blue]Generating script for:[/bold blue] {project['topic']}")
        
        # Read outline
        with open(outline_file, 'r') as f:
            outline = f.read()
        
        project_dir = pm.projects_dir / project["project_id"]

        # Initialize Simple Agent
        agent = SimpleContentAgent(OPENAI_API_KEY)
        agent.set_project_dir(project_dir)
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("Generating structured script...", total=None)
            
            script_json = agent.create_structured_script(
                outline, project['topic'], project_id=project["project_id"]
            )
            
            progress.update(task, description="Saving script outputs...")
            
            paths = agent.save_script_outputs(script_json, project_dir)
            
            progress.update(task, description="Script generated successfully!")
        
        # Update project status
        pm.update_project_status(
            project["project_id"], 
            "script_generated",
            script_generated=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        
        console.print(f"\n[bold green]✓ Script generated![/bold green]")
        console.print(f"[bold]JSON:[/bold] {paths['json_path']}")
        console.print(f"[bold]Text:[/bold] {paths['txt_path']}")
        console.print(f"[bold]Sections:[/bold] {script_json['section_count']}")
        console.print(f"[bold]Words:[/bold] {script_json['total_word_count']}")
        console.print(f"[bold]Est. Duration:[/bold] {script_json['estimated_total_duration_seconds'] // 60}m "
                       f"{script_json['estimated_total_duration_seconds'] % 60}s")
        
        # Show next steps
        console.print(f"\n[bold yellow]Next steps:[/bold yellow]")
        console.print(f"1. Generate audio: [bold]python cli.py generate_audio {project['topic']}[/bold]")
        console.print(f"   [dim]Note: Audio generation automatically cleans the script[/dim]")
        console.print(f"2. Validate content: [bold]python cli.py validate {project['topic']}[/bold]")
        
    except Exception as e:
        console.print(f"\n[bold red]Error generating script:[/bold red] {str(e)}")
        raise click.Abort()

@cli.command()
@click.argument('project_identifier')
def validate(project_identifier):
    """Validate the project content (use project ID or topic)"""
    try:
        pm = ProjectManager()
        
        # Try to find project by ID first, then by topic
        project = pm.get_project(project_identifier)
        if not project:
            project = pm.find_project_by_topic(project_identifier)
        
        if not project:
            console.print(f"\n[bold red]Project not found:[/bold red] {project_identifier}")
            console.print("Try using the project ID or search by topic")
            return
        
        console.print(f"\n[bold blue]Validating content for:[/bold blue] {project['topic']}")
        
        # Check what content exists
        project_dir = pm.projects_dir / project["project_id"]
        outline_file = project_dir / "outline.txt"
        script_file = project_dir / "script.txt"
        
        if not outline_file.exists() and not script_file.exists():
            console.print(f"\n[bold red]No content found to validate[/bold red]")
            return
        
                # Initialize Simple Agent
        agent = SimpleContentAgent(OPENAI_API_KEY)
        
        validation_results = {}
        
        # Validate outline if it exists
        if outline_file.exists():
            console.print(f"\n[bold yellow]Validating outline...[/bold yellow]")
            with open(outline_file, 'r') as f:
                outline = f.read()
            
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                console=console
            ) as progress:
                task = progress.add_task("Validating outline...", total=None)
                
                outline_validation = agent.validate_content(outline, "outline")
                validation_results['outline'] = outline_validation
                
                progress.update(task, description="Outline validation complete!")
        
        # Validate script if it exists
        if script_file.exists():
            console.print(f"\n[bold yellow]Validating script...[/bold yellow]")
            with open(script_file, 'r') as f:
                script = f.read()
            
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                console=console
            ) as progress:
                task = progress.add_task("Validating script...", total=None)
                
                script_validation = agent.validate_content(script, "script")
                validation_results['script'] = script_validation
                
                progress.update(task, description="Script validation complete!")
        
        # Display validation results
        console.print(f"\n[bold green]✓ Validation complete![/bold green]")
        
        for content_type, result in validation_results.items():
            console.print(f"\n[bold blue]{content_type.title()} Validation:[/bold blue]")
            console.print(result)
        
    except Exception as e:
        console.print(f"\n[bold red]Error validating content:[/bold red] {str(e)}")
        raise click.Abort()

@cli.command()
@click.argument('search_term')
def search(search_term):
    """Search for projects by topic or context"""
    try:
        pm = ProjectManager()
        matches = pm.search_projects(search_term)
        
        if not matches:
            console.print(f"\n[dim]No projects found matching:[/dim] {search_term}")
            return
        
        console.print(f"\n[bold blue]Projects matching:[/bold blue] {search_term}")
        
        # Create table
        table = Table(title="🔍 Search Results")
        table.add_column("Project ID", style="cyan", no_wrap=True)
        table.add_column("Topic", style="green")
        table.add_column("Context", style="yellow")
        table.add_column("Status", style="blue")
        table.add_column("Created", style="dim")
        
        for project in matches:
            status_style = {
                "created": "dim",
                "outline_generated": "yellow",
                "script_generated": "green",
                "completed": "green"
            }.get(project["status"], "white")
            
            table.add_row(
                project["project_id"],
                project["topic"],
                project["context"][:50] + "..." if len(project["context"]) > 50 else project["context"],
                f"[{status_style}]{project['status']}[/{status_style}]",
                project["created_at"]
            )
        
        console.print(table)
        
        # Show how to use these projects
        console.print(f"\n[bold yellow]To work with these projects:[/bold yellow]")
        console.print("Use the project ID or topic name with other commands:")
        console.print(f"[bold]python cli.py generate_outline [project_id_or_topic][/bold]")
        
    except Exception as e:
        console.print(f"\n[bold red]Error searching projects:[/bold red] {str(e)}")
        raise click.Abort()

@cli.command()
@click.argument('project_identifier')
@click.option('--speaking-rate', '-r', type=float, help='Speaking rate (default: 1.0)')
def generate_audio(project_identifier, speaking_rate):
    """Generate section-mapped audio from script.json with manifest and resume support.

    Reads projects/<id>/script/script.json, generates one MP3 per section
    (splitting long sections into sub-chunks), writes an audio manifest, and
    supports resuming from the last successful chunk."""
    import asyncio
    return asyncio.run(_generate_audio_async(project_identifier, speaking_rate))


# ── Audio-pipeline helpers ────────────────────────────────────────────

def _slugify(text: str, max_len: int = 40) -> str:
    """Convert text to a filesystem-safe slug."""
    slug = re.sub(r'[^a-z0-9]+', '_', text.lower()).strip('_')
    return slug[:max_len]


def _audio_filename(
    section_number: int,
    section_type: str,
    section_title: str,
    sub_index: Optional[int] = None,
) -> str:
    """Build the canonical audio filename for a section (or sub-chunk)."""
    slug = _slugify(section_title)
    if sub_index is not None:
        letter = chr(ord('a') + sub_index)
        return f"{section_number:02d}{letter}_{section_type}_{slug}.mp3"
    return f"{section_number:02d}_{section_type}_{slug}.mp3"


_MAX_WORDS_PER_CHUNK = 200  # ~80 seconds at 150 WPM


def _split_narration(narration: str) -> List[str]:
    """Split narration into sentence-boundary-respecting chunks."""
    words = narration.split()
    if len(words) <= _MAX_WORDS_PER_CHUNK:
        return [narration]

    sentences = re.split(r'(?<=[.!?])\s+', narration)
    chunks: List[str] = []
    buf: List[str] = []
    buf_wc = 0

    for sentence in sentences:
        s_wc = len(sentence.split())
        if buf_wc + s_wc > _MAX_WORDS_PER_CHUNK and buf:
            chunks.append(' '.join(buf))
            buf = [sentence]
            buf_wc = s_wc
        else:
            buf.append(sentence)
            buf_wc += s_wc
    if buf:
        chunks.append(' '.join(buf))
    return chunks


def _load_or_create_manifest(path: Path, video_id: str) -> dict:
    """Load an existing manifest or return a blank scaffold."""
    if path.exists():
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            pass
    return {
        "video_id": video_id,
        "voice": "en-US-Chirp3-HD-Puck",
        "total_chunks": 0,
        "total_duration_seconds": 0,
        "sections": [],
        "failed_sections": [],
    }


def _completed_files_from_manifest(manifest: dict, audio_dir: Path) -> Dict[str, dict]:
    """Return {filename: file_entry} for every chunk already on disk."""
    completed: Dict[str, dict] = {}
    for sec in manifest.get('sections', []):
        for af in sec.get('audio_files', []):
            fp = audio_dir / af['filename']
            if fp.exists() and fp.stat().st_size > 0:
                completed[af['filename']] = af
    return completed


async def _generate_audio_async(project_identifier, speaking_rate):
    """Section-based audio generation with manifest, resume, and retry."""
    try:
        pm = ProjectManager()

        project = pm.get_project(project_identifier)
        if not project:
            project = pm.find_project_by_topic(project_identifier)
        if not project:
            console.print(f"\n[bold red]Project not found:[/bold red] {project_identifier}")
            console.print("Try using the project ID or search by topic")
            return

        project_dir = pm.projects_dir / project["project_id"]

        # Locate script.json (try script/ subdir first, then project root)
        script_json_path = project_dir / "script" / "script.json"
        if not script_json_path.exists():
            script_json_path = project_dir / "script.json"
        if not script_json_path.exists():
            console.print(f"\n[bold red]No script.json found for project:[/bold red] {project['topic']}")
            console.print(f"Expected at: {project_dir / 'script' / 'script.json'}")
            console.print(f"Generate a script first: [bold]python cli.py generate_script {project_identifier}[/bold]")
            return

        with open(script_json_path, 'r', encoding='utf-8') as f:
            script_data = json.load(f)

        sections = script_data.get('sections', [])
        if not sections:
            console.print(f"\n[bold red]No sections found in script.json[/bold red]")
            return

        # ── Config ──
        selected_speaking_rate = speaking_rate or GOOGLE_TTS_VOICE_SETTINGS['speaking_rate']

        console.print(f"\n[bold blue]Generating audio for:[/bold blue] {project['topic']}")
        console.print(f"[dim]Sections:[/dim] {len(sections)}")
        console.print(f"[dim]Voice:[/dim] Puck (en-US-Chirp3-HD-Puck)")
        console.print(f"[dim]Speaking Rate:[/dim] {selected_speaking_rate}")
        console.print(f"[dim]Sample Rate:[/dim] {GOOGLE_TTS_VOICE_SETTINGS['sample_rate']} Hz")

        # ── TTS client ──
        from utils.google_tts import GoogleCloudTTS, get_mp3_duration

        if not GOOGLE_CLOUD_PROJECT_ID:
            console.print(f"\n[bold red]Error:[/bold red] GOOGLE_CLOUD_PROJECT_ID not found in environment")
            return
        if not GOOGLE_SERVICE_ACCOUNT_KEY:
            console.print(f"\n[bold red]Error:[/bold red] GOOGLE_SERVICE_ACCOUNT_KEY not found in environment")
            return

        google_tts = GoogleCloudTTS(
            project_id=GOOGLE_CLOUD_PROJECT_ID,
            service_account_key=GOOGLE_SERVICE_ACCOUNT_KEY,
        )

        audio_dir = project_dir / "audio"
        audio_dir.mkdir(exist_ok=True)

        # ── Resume support ──
        manifest_path = audio_dir / "manifest.json"
        old_manifest = _load_or_create_manifest(manifest_path, project["project_id"])
        completed = _completed_files_from_manifest(old_manifest, audio_dir)

        if completed:
            console.print(f"[dim]Resuming: {len(completed)} chunks already completed[/dim]")

        audio_settings = {
            "speaking_rate": selected_speaking_rate,
            "pitch": GOOGLE_TTS_VOICE_SETTINGS['pitch'],
            "volume_gain_db": GOOGLE_TTS_VOICE_SETTINGS['volume_gain_db'],
            "sample_rate_hertz": GOOGLE_TTS_VOICE_SETTINGS['sample_rate'],
        }

        # ── Per-section generation ──
        manifest_sections: List[dict] = []
        failed_sections: List[dict] = []
        total_chunks = 0
        total_duration = 0.0

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            task = progress.add_task("Generating audio...", total=len(sections))

            for section in sections:
                sec_num = section['section_number']
                sec_type = section['section_type']
                sec_title = section['section_title']
                narration = section['narration']

                progress.update(
                    task,
                    description=f"Section {sec_num}: {sec_title[:30]}...",
                )

                chunks = _split_narration(narration)
                use_sub = len(chunks) > 1

                section_files: List[dict] = []
                section_failed = False

                for i, chunk_text in enumerate(chunks):
                    sub_idx = i if use_sub else None
                    filename = _audio_filename(sec_num, sec_type, sec_title, sub_idx)

                    # Skip already-completed chunks (resume)
                    if filename in completed:
                        existing = completed[filename]
                        section_files.append(existing)
                        total_chunks += 1
                        total_duration += existing.get('duration_seconds', 0)
                        console.print(f"[dim]  Skipped (cached): {filename}[/dim]")
                        continue

                    # Generate with retry
                    try:
                        mp3_bytes = await google_tts.generate_audio_with_retry(
                            text=chunk_text,
                            audio_settings=audio_settings,
                        )

                        filepath = audio_dir / filename
                        with open(filepath, 'wb') as fout:
                            fout.write(mp3_bytes)

                        try:
                            duration = get_mp3_duration(mp3_bytes)
                        except Exception:
                            duration = len(chunk_text.split()) / 2.5

                        word_count = len(chunk_text.split())
                        file_entry = {
                            "filename": filename,
                            "duration_seconds": round(duration),
                            "word_count": word_count,
                        }
                        section_files.append(file_entry)
                        total_chunks += 1
                        total_duration += duration
                        console.print(f"[dim]  Generated: {filename} ({round(duration)}s, {word_count}w)[/dim]")

                    except Exception as e:
                        logger.warning(f"Failed to generate audio for {filename}: {e}")
                        console.print(f"\n[bold red]Failed:[/bold red] {filename}: {e}")
                        section_failed = True
                        failed_sections.append({
                            "section_number": sec_num,
                            "section_title": sec_title,
                            "error": str(e),
                        })
                        break  # skip remaining sub-chunks in this section

                if not section_failed:
                    manifest_sections.append({
                        "section_number": sec_num,
                        "section_title": sec_title,
                        "audio_files": section_files,
                    })

                progress.update(task, advance=1)

        # ── Failure threshold check ──
        total_sections = len(sections)
        failure_ratio = len(failed_sections) / total_sections if total_sections else 0

        if failure_ratio > 0.3:
            console.print(
                f"\n[bold red]FAILED: {len(failed_sections)}/{total_sections} "
                f"sections failed (>{30}% threshold)[/bold red]"
            )
            pm.update_project_status(project["project_id"], "failed")

        # ── Save manifest ──
        manifest = {
            "video_id": project["project_id"],
            "voice": GoogleCloudTTS.VOICE_NAME,
            "total_chunks": total_chunks,
            "total_duration_seconds": round(total_duration),
            "sections": manifest_sections,
            "failed_sections": failed_sections,
        }
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2)

        # ── Update project status (if not already marked failed) ──
        if failure_ratio <= 0.3:
            minutes = int(total_duration // 60)
            seconds = int(total_duration % 60)
            pm.update_project_status(
                project["project_id"],
                "audio_generated",
                audio_generated=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            )

        minutes = int(total_duration // 60)
        seconds = int(total_duration % 60)
        duration_str = f"{minutes}m {seconds}s"

        console.print(f"\n[bold green]✓ Audio generation complete![/bold green]")
        console.print(f"[bold]Audio dir:[/bold]  {audio_dir}")
        console.print(f"[bold]Manifest:[/bold]   {manifest_path}")
        console.print(f"[bold]Duration:[/bold]   {duration_str}")
        console.print(f"[bold]Chunks:[/bold]     {total_chunks}")
        if failed_sections:
            console.print(f"[bold red]Failed:[/bold red]     {len(failed_sections)} section(s)")

        console.print(f"\n[bold yellow]Next steps:[/bold yellow]")
        console.print("1. Listen to the audio files")
        console.print(f"2. Render video: [bold]python cli.py render_video {project['topic']}[/bold]")
        console.print(f"3. Upload to Google Drive: [bold]python cli.py upload_to_drive {project['topic']}[/bold]")
        if failed_sections:
            console.print(f"4. Re-run to retry failed sections: [bold]python cli.py generate_audio {project_identifier}[/bold]")

    except Exception as e:
        console.print(f"\n[bold red]Error generating audio:[/bold red] {str(e)}")
        raise click.Abort()

@cli.command()
@click.argument('project_identifier')
def generate_thumbnail(project_identifier):
    """Generate a YouTube thumbnail for a project (use project ID or topic)"""
    try:
        pm = ProjectManager()

        project = pm.get_project(project_identifier)
        if not project:
            project = pm.find_project_by_topic(project_identifier)

        if not project:
            console.print(f"\n[bold red]Project not found:[/bold red] {project_identifier}")
            console.print("Try using the project ID or search by topic")
            return

        project_dir = pm.projects_dir / project["project_id"]

        script_json_path = project_dir / "script" / "script.json"
        if not script_json_path.exists():
            console.print(f"\n[bold red]No script.json found for project:[/bold red] {project['topic']}")
            console.print(f"Generate a script first: [bold]python cli.py generate_script {project_identifier}[/bold]")
            return

        console.print(f"\n[bold blue]Generating thumbnail for:[/bold blue] {project['topic']}")

        from utils.thumbnail_generator import generate_thumbnail as _gen_thumb

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            task = progress.add_task("Compositing thumbnail...", total=None)
            result = _gen_thumb(project_dir)
            progress.update(task, description="Thumbnail generated!")

        console.print(f"\n[bold green]✓ Thumbnail generated![/bold green]")
        console.print(f"[bold]Saved to:[/bold]   {result['path']}")
        console.print(f"[bold]Dimensions:[/bold] {result['width']}×{result['height']}")
        console.print(f"[bold]Icons:[/bold]      {result['icon_count']}")
        console.print(f"[bold]Headline:[/bold]   {result['headline']}")
        if result['sub_text']:
            console.print(f"[bold]Sub-text:[/bold]   {result['sub_text']}")

        if result.get('warnings'):
            for w in result['warnings']:
                console.print(f"[dim yellow]  Warning: {w}[/dim yellow]")

        console.print(f"\n[bold yellow]Next steps:[/bold yellow]")
        console.print(f"1. Preview: [bold]open {result['path']}[/bold]")
        console.print(f"2. Upload to Drive: [bold]python cli.py upload_to_drive {project['topic']}[/bold]")

    except Exception as e:
        console.print(f"\n[bold red]Error generating thumbnail:[/bold red] {str(e)}")
        raise click.Abort()


@cli.command()
@click.argument('project_identifier')
def cleanup_script(project_identifier):
    """Clean up a project script by removing screen directions and formatting for audio generation"""
    try:
        pm = ProjectManager()
        
        # Try to find project by ID first, then by topic
        project = pm.get_project(project_identifier)
        if not project:
            project = pm.find_project_by_topic(project_identifier)
        
        if not project:
            console.print(f"\n[bold red]Project not found:[/bold red] {project_identifier}")
            console.print("Try using the project ID or search by topic")
            return
        
        # Check if script exists
        script_file = pm.projects_dir / project["project_id"] / "script.txt"
        if not script_file.exists():
            console.print(f"\n[bold red]No script found for project:[/bold red] {project['topic']}")
            console.print(f"Generate a script first: [bold]python cli.py generate_script {project_identifier}[/bold]")
            return
        
        console.print(f"\n[bold blue]Cleaning up script for:[/bold blue] {project['topic']}")
        
        # Read script
        with open(script_file, 'r', encoding='utf-8') as f:
            script_content = f.read()
        
        # Clean up script
        agent = SimpleContentAgent(OPENAI_API_KEY)
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("Cleaning up script...", total=None)
            
            cleaned_script = agent.cleanup_script_for_audio(script_content)
            
            progress.update(task, description="Script cleanup complete!")
        
        # Save cleaned script
        cleaned_script_file = pm.projects_dir / project["project_id"] / "script_cleaned.txt"
        with open(cleaned_script_file, 'w', encoding='utf-8') as f:
            f.write(cleaned_script)
        
        console.print(f"\n[bold green]✓ Script cleanup complete![/bold green]")
        console.print(f"[bold]Cleaned script saved to:[/bold] {cleaned_script_file}")
        
        # Show next steps
        console.print(f"\n[bold yellow]Next steps:[/bold yellow]")
        console.print(f"1. Generate audio: [bold]python cli.py generate_audio {project['topic']}[/bold]")
        console.print(f"2. Review cleaned script: [bold]open {cleaned_script_file}[/bold]")
        console.print(f"3. Upload to Google Drive: [bold]python cli.py upload_to_drive {project['topic']}[/bold]")
        
    except Exception as e:
        console.print(f"\n[bold red]Error cleaning up script:[/bold red] {str(e)}")
        raise click.Abort()

@cli.command()
@click.argument('project_identifier')
@click.option('--root-folder-id', '-r', help='Custom Google Drive root folder ID to use instead of creating "YouTube Content"')
def upload_to_drive(project_identifier, root_folder_id):
    """Upload project files to Google Drive (use project ID or topic)"""
    try:
        # Check if Google Drive is configured
        google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        
        if not google_client_id or not google_client_secret:
            console.print(f"\n[bold red]Google Drive not configured![/bold red]")
            console.print("Please set the following in your .env file:")
            console.print("GOOGLE_CLIENT_ID=your_client_id_here")
            console.print("GOOGLE_CLIENT_SECRET=your_client_secret_here")
            console.print("You can get these from: https://console.cloud.google.com/apis/credentials")
            return
        
        pm = ProjectManager()
        
        # Try to find project by ID first, then by topic
        project = pm.get_project(project_identifier)
        if not project:
            project = pm.find_project_by_topic(project_identifier)
        
        if not project:
            console.print(f"\n[bold red]Project not found:[/bold red] {project_identifier}")
            console.print("Try using the project ID or search by topic")
            return
        
        console.print(f"\n[bold blue]Uploading project to Google Drive:[/bold blue] {project['topic']}")
        
        # Check if project has content to upload
        project_dir = pm.projects_dir / project["project_id"]
        script_file = project_dir / "script.txt"
        audio_dir = project_dir / "audio"
        
        if not script_file.exists() and not audio_dir.exists():
            console.print(f"\n[bold red]No content found to upload[/bold red]")
            console.print("Generate a script and audio first:")
            console.print(f"1. [bold]python cli.py generate_script {project['topic']}[/bold]")
            console.print(f"2. [bold]python cli.py generate_audio {project['topic']}[/bold]")
            return
        
        # Initialize Google Drive manager
        try:
            drive_manager = GoogleDriveManager()
        except Exception as e:
            console.print(f"\n[bold red]Failed to authenticate with Google Drive:[/bold red] {str(e)}")
            console.print("Please check your credentials and try again")
            return
        
        # Upload files to Google Drive
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("Uploading to Google Drive...", total=None)
            
            try:
                upload_result = drive_manager.upload_project_files(project_dir, project['topic'], root_folder_id)
                progress.update(task, description="Upload complete!")
            except Exception as e:
                progress.update(task, description="Upload failed!")
                raise e
        
        # Update project status
        pm.update_project_status(
            project["project_id"], 
            "drive_synced",
            drive_synced="yes"
        )
        
        # Display results
        console.print(f"\n[bold green]✓ Upload complete![/bold green]")
        console.print(f"[bold]Project folder:[/bold] {drive_manager.get_folder_url(upload_result['project_folder_id'])}")
        console.print(f"[bold]Scripts folder:[/bold] {drive_manager.get_folder_url(upload_result['scripts_folder_id'])}")
        console.print(f"[bold]Audio folder:[/bold] {drive_manager.get_folder_url(upload_result['audio_folder_id'])}")
        
        # Show uploaded files
        if upload_result['uploaded_files']:
            console.print(f"\n[bold blue]Uploaded files:[/bold blue]")
            for filename, file_id in upload_result['uploaded_files'].items():
                console.print(f"  ✓ {filename}")
        
        # Show next steps
        console.print(f"\n[bold yellow]Next steps:[/bold yellow]")
        console.print("1. Access your files in Google Drive using the links above")
        console.print("2. Share folders with team members if needed")
        console.print("3. Download files for editing or distribution")
        
    except Exception as e:
        console.print(f"\n[bold red]Error uploading to Google Drive:[/bold red] {str(e)}")
        raise click.Abort()

@cli.command()
def list_drive_folders():
    """List available Google Drive folders that can be used as root folders"""
    try:
        # Check if Google Drive is configured
        google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        
        if not google_client_id or not google_client_secret:
            console.print(f"\n[bold red]Google Drive not configured![/bold red]")
            console.print("Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file")
            return
        
        # Initialize Google Drive manager
        try:
            drive_manager = GoogleDriveManager()
        except Exception as e:
            console.print(f"\n[bold red]Failed to authenticate with Google Drive:[/bold red] {str(e)}")
            return
        
        # List root-level folders
        console.print(f"\n[bold blue]Available Google Drive Root Folders:[/bold blue]")
        
        try:
            # Get root-level folders (folders in the root of Google Drive)
            root_folders = drive_manager.service.files().list(
                q="'root' in parents and mimeType='application/vnd.google-apps.folder'",
                spaces='drive',
                fields='files(id, name, createdTime)'
            ).execute()
            
            if not root_folders.get('files'):
                console.print("No folders found in your Google Drive root")
                return
            
            # Create table
            from rich.table import Table
            table = Table(title="📁 Google Drive Root Folders")
            table.add_column("Folder Name", style="green")
            table.add_column("Folder ID", style="cyan", no_wrap=True)
            table.add_column("Created", style="dim")
            
            for folder in root_folders['files']:
                table.add_row(
                    folder['name'],
                    folder['id'],
                    folder.get('createdTime', 'Unknown')
                )
            
            console.print(table)
            
            console.print(f"\n[bold yellow]To use a custom root folder:[/bold yellow]")
            console.print("python cli.py upload_to_drive 'Your Topic' --root-folder-id FOLDER_ID_HERE")
            
        except Exception as e:
            console.print(f"\n[bold red]Error listing folders:[/bold red] {str(e)}")
    
    except Exception as e:
        console.print(f"\n[bold red]Error:[/bold red] {str(e)}")

def _split_script_into_chunks(script_content: str, max_chunk_size: int = None) -> list:
    """Split script content into manageable chunks for audio generation using Google Gemini AI"""
    if max_chunk_size is None:
        max_chunk_size = CHUNK_SETTINGS["max_chunk_size"]
    
    try:
        import google.generativeai as genai
        from config import GOOGLE_GEMINI_API_KEY
        
        if not GOOGLE_GEMINI_API_KEY:
            console.print("[bold yellow]Warning:[/bold yellow] No Google Gemini API key found. Using fallback chunking.")
            return _fallback_chunking(script_content, max_chunk_size)
        
        # Configure Gemini
        genai.configure(api_key=GOOGLE_GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""Split this script into optimal chunks for audio generation. Each chunk should be approximately 200 words for optimal model performance.

        SCRIPT:
        {script_content}

        REQUIREMENTS:
        - Create chunks that are approximately 200 words each
        - Each chunk should be a complete thought or section
        - Respect natural content breaks and topic transitions
        - Ensure chunks flow naturally when spoken
        - Don't break mid-sentence or mid-thought

        OUTPUT FORMAT:
        Return chunks separated by the word 'CHUNK_BREAK' on its own line. No numbering, no labels, just the text chunks.

        Example:
        [First chunk content here]
        CHUNK_BREAK
        [Second chunk content here]
        CHUNK_BREAK
        [Third chunk content here]"""
        
        response = model.generate_content(prompt)
        chunks = [chunk.strip() for chunk in response.text.split('CHUNK_BREAK') if chunk.strip()]
        
        # Validate chunk sizes (focus on 90-second optimal performance)
        valid_chunks = []
        for chunk in chunks:
            word_count = len(chunk.split())
            if 120 <= word_count <= 250:  # Target: 90 seconds (~225 words), max 250 for safety
                valid_chunks.append(chunk)
            elif word_count < 120:
                # Try to combine with next chunk if possible
                if valid_chunks and len(valid_chunks[-1].split()) + word_count <= 250:
                    valid_chunks[-1] += " " + chunk
                else:
                    valid_chunks.append(chunk)
            else:
                # Split oversized chunks into ~90 second pieces
                words = chunk.split()
                current_chunk = ""
                for word in words:
                    if len(current_chunk.split()) < 225:  # Keep chunks around 90 seconds
                        current_chunk += " " + word if current_chunk else word
                    else:
                        if current_chunk:
                            valid_chunks.append(current_chunk.strip())
                        current_chunk = word
                if current_chunk:
                    valid_chunks.append(current_chunk.strip())
        
        console.print(f"[dim]AI chunking created {len(valid_chunks)} optimal chunks[/dim]")
        return valid_chunks
        
    except Exception as e:
        console.print(f"[bold yellow]Warning:[/bold yellow] AI chunking failed: {str(e)}. Using fallback method.")
        return _fallback_chunking(script_content, max_chunk_size)

def _fallback_chunking(script_content: str, max_chunk_size: int) -> list:
    """Fallback chunking method when AI chunking fails"""
    # Simple sentence-based chunking as backup, targeting ~200 words per chunk
    sentences = script_content.replace('\n', ' ').split('. ')
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        
        if not sentence.endswith('.'):
            sentence += '.'
        
        # Check if adding this sentence would exceed ~90 seconds (225 words)
        if len(current_chunk.split()) + len(sentence.split()) > 225 and current_chunk:
            chunks.append(current_chunk.strip())
            current_chunk = sentence
        else:
            if current_chunk:
                current_chunk += " " + sentence
            else:
                current_chunk = sentence
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks

# ── Video rendering ────────────────────────────────────────────────────

@cli.command()
@click.argument('project_identifier')
def render_video(project_identifier):
    """Render a final MP4 video from script, audio, and images (use project ID or topic)"""
    try:
        pm = ProjectManager()

        project = pm.get_project(project_identifier)
        if not project:
            project = pm.find_project_by_topic(project_identifier)
        if not project:
            console.print(f"\n[bold red]Project not found:[/bold red] {project_identifier}")
            console.print("Try using the project ID or search by topic")
            return

        project_dir = pm.projects_dir / project["project_id"]

        # Pre-flight checks
        script_path = project_dir / "script" / "script.json"
        if not script_path.exists():
            script_path = project_dir / "script.json"
        if not script_path.exists():
            console.print(f"\n[bold red]No script.json found for project:[/bold red] {project['topic']}")
            console.print(f"Generate a script first: [bold]python cli.py generate_script {project_identifier}[/bold]")
            return

        manifest_path = project_dir / "audio" / "manifest.json"
        if not manifest_path.exists():
            console.print(f"\n[bold red]No audio manifest found for project:[/bold red] {project['topic']}")
            console.print(f"Generate audio first: [bold]python cli.py generate_audio {project_identifier}[/bold]")
            return

        console.print(f"\n[bold blue]Rendering video for:[/bold blue] {project['topic']}")

        with open(script_path, 'r', encoding='utf-8') as f:
            script_data = json.load(f)
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest_data = json.load(f)

        section_count = len(script_data.get('sections', []))
        est_duration = script_data.get('estimated_total_duration_seconds', 0)
        console.print(f"[dim]Sections:[/dim] {section_count}")
        console.print(f"[dim]Estimated duration:[/dim] {est_duration // 60}m {est_duration % 60}s")
        console.print(f"[dim]Audio chunks:[/dim] {manifest_data.get('total_chunks', '?')}")
        if manifest_data.get('failed_sections'):
            console.print(f"[dim yellow]Skipped sections (no audio):[/dim yellow] "
                          f"{len(manifest_data['failed_sections'])}")

        from utils.video_assembler import assemble_video

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            task = progress.add_task("Preparing video assembly...", total=None)

            def _on_progress(current, total, message):
                progress.update(task, description=f"[{current}/{total}] {message}")

            result = assemble_video(project_dir, progress_callback=_on_progress)

            progress.update(task, description="Video rendered successfully!")

        pm.update_project_status(
            project["project_id"],
            "video_rendered",
            video_rendered=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        )

        duration = result["duration_seconds"]
        minutes = int(duration // 60)
        seconds = int(duration % 60)

        console.print(f"\n[bold green]✓ Video rendered![/bold green]")
        console.print(f"[bold]Video:[/bold]    {result['video_path']}")
        console.print(f"[bold]Metadata:[/bold] {result['metadata_path']}")
        console.print(f"[bold]Duration:[/bold] {minutes}m {seconds}s")
        console.print(f"[bold]Sections:[/bold] {result['section_count']}")

        if duration < 120:
            console.print(f"\n[bold yellow]Warning:[/bold yellow] Video is under 2 minutes — double-check for missing sections")
        elif duration > 1800:
            console.print(f"\n[bold yellow]Warning:[/bold yellow] Video is over 30 minutes — consider trimming")

        console.print(f"\n[bold yellow]Next steps:[/bold yellow]")
        console.print(f"1. Preview: [bold]open {result['video_path']}[/bold]")
        console.print(f"2. Copy upload metadata: [bold]open {result['metadata_path']}[/bold]")
        console.print(f"3. Upload to Google Drive: [bold]python cli.py upload_to_drive {project['topic']}[/bold]")

    except Exception as e:
        console.print(f"\n[bold red]Error rendering video:[/bold red] {str(e)}")
        raise click.Abort()


# ── Topic Queue commands ──────────────────────────────────────────────

@cli.group()
def queue():
    """Manage the topic queue for upcoming videos"""
    pass


@queue.command("list")
@click.option("--status", "-s", default=None, help="Filter by status (suggested, approved, in_progress, completed, failed, rejected)")
def queue_list(status):
    """Show all topics in the queue"""
    tq = TopicQueue(TOPIC_QUEUE_FILE)
    topics = tq.list_topics(status=status)

    if not topics:
        console.print("\n[dim]Topic queue is empty. Add topics with:[/dim]")
        console.print('[bold]python cli.py queue add "Your Topic Title"[/bold]')
        console.print("[bold]python cli.py suggest --count 5[/bold]")
        return

    console.print()
    title_text = Text("TOPIC QUEUE — Adam's Axiom", style="bold blue")
    console.print(title_text)
    console.print("━" * 80)

    table = Table(show_header=True, header_style="bold", box=None, pad_edge=False)
    table.add_column("ID", style="cyan", no_wrap=True, min_width=10)
    table.add_column("Priority", min_width=8)
    table.add_column("Status", min_width=12)
    table.add_column("Category", style="dim", min_width=14)
    table.add_column("Topic", style="white")

    priority_style = {"high": "bold red", "normal": "yellow", "low": "dim"}
    status_style = {
        "suggested": "blue",
        "approved": "green",
        "in_progress": "yellow",
        "completed": "bold green",
        "failed": "bold red",
        "rejected": "dim",
    }

    for t in topics:
        ps = priority_style.get(t["priority"], "white")
        ss = status_style.get(t["status"], "white")
        table.add_row(
            t["id"],
            f"[{ps}]{t['priority']}[/{ps}]",
            f"[{ss}]{t['status']}[/{ss}]",
            t.get("category", ""),
            t["topic"],
        )

    console.print(table)

    counts = tq.get_status_counts()
    summary_parts = []
    for label, key in [("Approved", "approved"), ("Suggested", "suggested"),
                       ("Rejected", "rejected"), ("In Progress", "in_progress"),
                       ("Completed", "completed"), ("Failed", "failed")]:
        if counts.get(key, 0) > 0:
            summary_parts.append(f"{label}: {counts[key]}")
    console.print(f"\n[dim]{' | '.join(summary_parts)}[/dim]")


@queue.command("add")
@click.argument("topic")
@click.option("--context", "-c", default="", help="Additional context or angle")
@click.option("--priority", "-p", type=click.Choice(["high", "normal", "low"]), default="normal", help="Topic priority")
def queue_add(topic, context, priority):
    """Add a topic to the queue manually"""
    tq = TopicQueue(TOPIC_QUEUE_FILE)
    entry = tq.add_topic(topic=topic, context=context, priority=priority)
    console.print(f"\n[bold green]✓ Topic added to queue[/bold green]")
    console.print(f"  [bold]ID:[/bold]       {entry['id']}")
    console.print(f"  [bold]Topic:[/bold]    {entry['topic']}")
    console.print(f"  [bold]Priority:[/bold] {entry['priority']}")
    console.print(f"  [bold]Status:[/bold]   {entry['status']}")


@queue.command("approve")
@click.argument("topic_id")
def queue_approve(topic_id):
    """Approve a suggested topic"""
    tq = TopicQueue(TOPIC_QUEUE_FILE)
    entry = tq.get_topic(topic_id)
    if not entry:
        console.print(f"\n[bold red]Topic not found:[/bold red] {topic_id}")
        return
    if entry["status"] not in ("suggested",):
        console.print(f"\n[bold yellow]Topic is already '{entry['status']}', cannot approve.[/bold yellow]")
        return
    updated = tq.update_topic_status(topic_id, "approved")
    console.print(f"\n[bold green]✓ Topic approved:[/bold green] {updated['topic']}")


@queue.command("reject")
@click.argument("topic_id")
def queue_reject(topic_id):
    """Reject a suggested topic"""
    tq = TopicQueue(TOPIC_QUEUE_FILE)
    entry = tq.get_topic(topic_id)
    if not entry:
        console.print(f"\n[bold red]Topic not found:[/bold red] {topic_id}")
        return
    if entry["status"] not in ("suggested",):
        console.print(f"\n[bold yellow]Topic is already '{entry['status']}', cannot reject.[/bold yellow]")
        return
    updated = tq.update_topic_status(topic_id, "rejected")
    console.print(f"\n[bold green]✓ Topic rejected:[/bold green] {updated['topic']}")


# ── Suggest command ───────────────────────────────────────────────────

@cli.command()
@click.option("--count", "-n", default=5, help="Number of topics to suggest")
@click.option("--outlier", "-o", default=None, help="Outlier topic for Phase 2 variation mining")
def suggest(count, outlier):
    """Generate topic suggestions using GPT-4o

    Phase 1 (default): broad topic casting for the channel niche.
    Phase 2 (--outlier): generate variations of a high-performing topic.
    """
    if not OPENAI_API_KEY:
        console.print("\n[bold red]OPENAI_API_KEY not set.[/bold red] Add it to your .env file.")
        return

    tq = TopicQueue(TOPIC_QUEUE_FILE)

    phase_label = "Phase 2 (variation mining)" if outlier else "Phase 1 (topic casting)"
    console.print(f"\n[bold blue]Generating {count} topic suggestions — {phase_label}[/bold blue]")
    if outlier:
        console.print(f"[dim]Outlier topic:[/dim] {outlier}")

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        task = progress.add_task("Calling GPT-4o...", total=None)
        try:
            added = tq.generate_suggestions(
                api_key=OPENAI_API_KEY,
                count=count,
                outlier_topic=outlier,
            )
            progress.update(task, description="Suggestions generated!")
        except Exception as e:
            progress.update(task, description="Failed!")
            console.print(f"\n[bold red]Error generating suggestions:[/bold red] {str(e)}")
            return

    console.print(f"\n[bold green]✓ {len(added)} topics added to queue[/bold green]\n")

    table = Table(show_header=True, header_style="bold", box=None, pad_edge=False)
    table.add_column("ID", style="cyan", no_wrap=True)
    table.add_column("Priority", min_width=8)
    table.add_column("Topic", style="white")
    table.add_column("Context", style="dim")

    priority_style = {"high": "bold red", "normal": "yellow", "low": "dim"}
    for t in added:
        ps = priority_style.get(t["priority"], "white")
        ctx = t.get("context", "")
        if len(ctx) > 60:
            ctx = ctx[:57] + "..."
        table.add_row(t["id"], f"[{ps}]{t['priority']}[/{ps}]", t["topic"], ctx)

    console.print(table)
    console.print(f"\n[dim]Approve topics with: python cli.py queue approve <id>[/dim]")


# ── Orchestrator: full pipeline ───────────────────────────────────────

PIPELINE_STEPS = [
    ("outline",   "Generating outline",    "generate_outline"),
    ("script",    "Generating script",     "generate_script"),
    ("audio",     "Generating audio",      "generate_audio"),
    ("images",    "Fetching images + QA",  "fetch_images"),
    ("thumbnail", "Generating thumbnail",  "generate_thumbnail"),
    ("video",     "Rendering video",       "render_video"),
    ("upload",    "Uploading to Drive",    "upload_to_drive"),
]


def _step_already_done(project: dict, step_key: str) -> bool:
    """Heuristic: check if a pipeline step was already completed for a project."""
    status = project.get("status", "")
    order = ["created", "outline_generated", "script_generated",
             "audio_generated", "images_fetched", "thumbnail_generated",
             "video_rendered", "drive_synced", "completed"]
    step_to_status = {
        "outline":   "outline_generated",
        "script":    "script_generated",
        "audio":     "audio_generated",
        "images":    "images_fetched",
        "thumbnail": "thumbnail_generated",
        "video":     "video_rendered",
        "upload":    "drive_synced",
    }
    target = step_to_status.get(step_key, "")
    if target not in order or status not in order:
        return False
    return order.index(status) >= order.index(target)


@cli.command()
@click.option("--topic", "-t", default=None, help="Topic for the video")
@click.option("--context", "-c", default="", help="Additional context or angle for the video")
@click.option("--skip-upload", is_flag=True, help="Skip Google Drive upload at the end")
@click.option("--resume", "-r", default=None, help="Resume a failed/partial project by ID or topic")
@click.option("--from-queue", is_flag=True, help="Pick the next approved topic from the queue")
def produce(topic, context, skip_upload, resume, from_queue):
    """Run the full video production pipeline end-to-end.

    Creates a project, then runs: outline → script → audio → images →
    thumbnail → video → upload.  If any step fails, the project is left in
    its last successful state so you can fix the issue and re-run with --resume.

    \b
    Examples:
      python cli.py produce -t "Quantitative Easing Explained" -c "Focus on 2008"
      python cli.py produce --from-queue
      python cli.py produce --resume <project_id>
    """
    import asyncio
    import time as _time

    pm = ProjectManager()
    tq = TopicQueue(TOPIC_QUEUE_FILE)
    topic_queue_entry = None

    # ── Resolve project ──────────────────────────────────────────────
    if resume:
        project = pm.get_project(resume)
        if not project:
            project = pm.find_project_by_topic(resume)
        if not project:
            console.print(f"\n[bold red]Project not found:[/bold red] {resume}")
            return
        console.print(f"\n[bold blue]Resuming project:[/bold blue] {project['topic']}")

    elif from_queue:
        topic_queue_entry = tq.get_next_approved_topic()
        if not topic_queue_entry:
            console.print("\n[bold yellow]No approved topics in the queue.[/bold yellow]")
            console.print("Add topics with: [bold]python cli.py suggest --count 5[/bold]")
            return

        topic = topic_queue_entry["topic"]
        context = topic_queue_entry.get("context", context)
        tq.update_topic_status(topic_queue_entry["id"], "in_progress")

        console.print(f"\n[bold blue]Producing from queue:[/bold blue] {topic}")
        console.print(f"[dim]Queue ID:[/dim] {topic_queue_entry['id']}")

        project_id = pm.create_project(topic=topic, context=context or "Full video production")
        project = pm.get_project(project_id)
        if topic_queue_entry:
            tq.update_topic_status(topic_queue_entry["id"], "in_progress", project_id=project_id)

    else:
        if not topic:
            console.print("\n[bold red]Provide a topic or use --from-queue / --resume[/bold red]")
            return

        project_id = pm.create_project(topic=topic, context=context or "Full video production")
        project = pm.get_project(project_id)
        console.print(f"\n[bold blue]Starting production:[/bold blue] {topic}")

    project_id = project["project_id"]
    project_dir = pm.projects_dir / project_id

    console.print(f"[dim]Project ID:[/dim] {project_id}")
    console.print(f"[dim]Directory:[/dim] {project_dir}\n")

    # ── Pipeline steps ───────────────────────────────────────────────
    steps_to_run = [s for s in PIPELINE_STEPS]
    if skip_upload:
        steps_to_run = [s for s in steps_to_run if s[0] != "upload"]

    completed_steps = []
    failed_step = None
    start_time = _time.time()

    for step_key, step_label, _cmd_name in steps_to_run:
        # Skip already-completed steps on resume
        project = pm.get_project(project_id)
        if _step_already_done(project, step_key):
            console.print(f"[dim]⏭  {step_label} — already done, skipping[/dim]")
            completed_steps.append(step_key)
            continue

        console.print(f"\n[bold cyan]▶ Step {len(completed_steps)+1}/{len(steps_to_run)}: {step_label}[/bold cyan]")
        step_start = _time.time()

        try:
            if step_key == "outline":
                agent = SimpleContentAgent(OPENAI_API_KEY)
                agent.set_project_dir(project_dir)
                outline = agent.create_outline(topic=project["topic"], context=project.get("context", ""))
                outline_file = project_dir / "outline.txt"
                with open(outline_file, "w", encoding="utf-8") as f:
                    f.write(outline)
                pm.update_project_status(project_id, "outline_generated",
                                         outline_generated=datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

            elif step_key == "script":
                outline_file = project_dir / "outline.txt"
                with open(outline_file, "r", encoding="utf-8") as f:
                    outline = f.read()
                agent = SimpleContentAgent(OPENAI_API_KEY)
                agent.set_project_dir(project_dir)
                script_json = agent.create_structured_script(outline, project["topic"], project_id=project_id)
                agent.save_script_outputs(script_json, project_dir)
                pm.update_project_status(project_id, "script_generated",
                                         script_generated=datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

            elif step_key == "audio":
                await_result = asyncio.run(_generate_audio_async(project_id, None))

            elif step_key == "images":
                from utils.image_search import fetch_images_for_project
                from utils.image_qa import run_qa_for_section
                from utils.image_search import create_section_icon, create_thumbnail_icons

                script_path = project_dir / "script" / "script.json"
                with open(script_path, "r", encoding="utf-8") as f:
                    script_data = json.load(f)

                sections = script_data.get("sections", [])
                images_dir = project_dir / "images"
                images_dir.mkdir(parents=True, exist_ok=True)

                from utils.image_search import search_and_download_section
                text_only_sections = []

                for section in sections:
                    sec_num = section.get("section_number", 0)
                    image_searches = section.get("image_searches", [])
                    sec_title = section.get("section_title", "")

                    if not image_searches:
                        continue

                    console.print(f"[dim]  Searching images for section {sec_num}: {sec_title[:40]}...[/dim]")
                    search_result = search_and_download_section(sec_num, image_searches, images_dir)

                    if search_result["candidate_paths"]:
                        qa_result = run_qa_for_section(
                            section_number=sec_num,
                            section_title=sec_title,
                            candidate_paths=search_result["candidate_paths"],
                            image_searches=image_searches,
                            images_dir=images_dir,
                        )
                        section_dir = images_dir / f"section_{sec_num:02d}"
                        approved_dir = section_dir / "approved"
                        if approved_dir.exists():
                            create_section_icon(approved_dir, section_dir)

                        if qa_result.get("text_only"):
                            text_only_sections.append(sec_num)
                    else:
                        text_only_sections.append(sec_num)

                create_thumbnail_icons(images_dir)

                if text_only_sections:
                    console.print(f"[yellow]  Sections with no approved images (text-only): {text_only_sections}[/yellow]")

                pm.update_project_status(project_id, "images_fetched")

            elif step_key == "thumbnail":
                from utils.thumbnail_generator import generate_thumbnail as _gen_thumb
                result = _gen_thumb(project_dir)
                console.print(f"[dim]  Thumbnail saved: {result.get('path', 'N/A')}[/dim]")
                pm.update_project_status(project_id, "thumbnail_generated")

            elif step_key == "video":
                from utils.video_assembler import assemble_video
                result = assemble_video(project_dir)
                console.print(f"[dim]  Video saved: {result.get('video_path', 'N/A')}[/dim]")
                pm.update_project_status(project_id, "video_rendered")

            elif step_key == "upload":
                google_client_id = os.getenv("GOOGLE_CLIENT_ID")
                google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
                if not google_client_id or not google_client_secret:
                    console.print("[yellow]  Google Drive not configured — skipping upload[/yellow]")
                    completed_steps.append(step_key)
                    continue

                drive_manager = GoogleDriveManager()
                upload_result = drive_manager.upload_project_files(project_dir, project["topic"])
                pm.update_project_status(project_id, "drive_synced", drive_synced="yes")
                console.print(f"[dim]  Uploaded to Google Drive[/dim]")

            elapsed = _time.time() - step_start
            console.print(f"[green]  ✓ {step_label} completed ({elapsed:.0f}s)[/green]")
            completed_steps.append(step_key)

        except Exception as e:
            elapsed = _time.time() - step_start
            console.print(f"\n[bold red]  ✗ {step_label} failed ({elapsed:.0f}s):[/bold red] {e}")
            logger.exception(f"Pipeline step '{step_key}' failed")
            failed_step = step_key
            break

    # ── Summary ──────────────────────────────────────────────────────
    total_time = _time.time() - start_time
    minutes = int(total_time // 60)
    seconds = int(total_time % 60)

    console.print("\n" + "━" * 60)

    if failed_step:
        console.print(f"[bold red]Pipeline stopped at: {failed_step}[/bold red]")
        console.print(f"[dim]Completed: {', '.join(completed_steps) or 'none'}[/dim]")
        console.print(f"[dim]Total time: {minutes}m {seconds}s[/dim]")
        console.print(f"\n[bold yellow]To resume:[/bold yellow]")
        console.print(f"  python cli.py produce \"\" --resume {project_id}")

        if topic_queue_entry:
            tq.update_topic_status(topic_queue_entry["id"], "failed", project_id=project_id)
    else:
        pm.update_project_status(project_id, "completed")
        console.print(f"[bold green]✓ Production complete![/bold green]")
        console.print(f"[dim]All steps: {', '.join(completed_steps)}[/dim]")
        console.print(f"[dim]Total time: {minutes}m {seconds}s[/dim]")

        output_dir = project_dir / "output"
        if (output_dir / "video.mp4").exists():
            console.print(f"\n[bold]Video:[/bold]     {output_dir / 'video.mp4'}")
        if (output_dir / "thumbnail.jpg").exists():
            console.print(f"[bold]Thumbnail:[/bold] {output_dir / 'thumbnail.jpg'}")
        if (output_dir / "_metadata.txt").exists():
            console.print(f"[bold]Metadata:[/bold]  {output_dir / '_metadata.txt'}")

        if topic_queue_entry:
            tq.update_topic_status(topic_queue_entry["id"], "completed", project_id=project_id)

    console.print("━" * 60)


@cli.command()
@click.option("--count", "-n", default=1, type=int, help="Number of topics to produce from the queue")
@click.option("--skip-upload", is_flag=True, help="Skip Google Drive upload")
def produce_batch(count, skip_upload):
    """Produce multiple videos from the approved topic queue.

    Picks the top N approved topics (by priority, then age) and runs the
    full pipeline for each sequentially.

    \b
    Examples:
      python cli.py produce_batch -n 3
      python cli.py produce_batch -n 5 --skip-upload
    """
    import time as _time

    tq = TopicQueue(TOPIC_QUEUE_FILE)
    approved = [t for t in tq.list_topics() if t["status"] == "approved"]

    PRIORITY_ORDER = {"high": 0, "normal": 1, "low": 2}
    approved.sort(key=lambda t: (PRIORITY_ORDER.get(t["priority"], 1), t["suggested_at"]))

    batch = approved[:count]

    if not batch:
        console.print("\n[bold yellow]No approved topics in the queue.[/bold yellow]")
        console.print("Add topics with: [bold]python cli.py suggest --count 5[/bold]")
        return

    console.print(f"\n[bold blue]Batch production: {len(batch)} video(s)[/bold blue]")
    for i, t in enumerate(batch):
        console.print(f"  {i+1}. {t['topic']} [{t['priority']}]")

    console.print()

    results = []
    batch_start = _time.time()

    for i, entry in enumerate(batch):
        console.print(f"\n{'═' * 60}")
        console.print(f"[bold blue]Video {i+1}/{len(batch)}: {entry['topic']}[/bold blue]")
        console.print(f"{'═' * 60}")

        # Invoke the produce pipeline via Click's context
        ctx = click.Context(produce)
        ctx.invoke(
            produce,
            topic=entry["topic"],
            context=entry.get("context", ""),
            skip_upload=skip_upload,
            resume=None,
            from_queue=False,
        )

        # Mark in queue (produce already handles this via from_queue, but
        # since we're calling directly, update status here)
        pm = ProjectManager()
        project = pm.find_project_by_topic(entry["topic"])
        status = project["status"] if project else "unknown"
        results.append({"topic": entry["topic"], "status": status})

        if status in ("completed", "drive_synced", "video_rendered"):
            tq.update_topic_status(entry["id"], "completed",
                                   project_id=project["project_id"] if project else None)
        elif status == "failed":
            tq.update_topic_status(entry["id"], "failed",
                                   project_id=project["project_id"] if project else None)

    batch_elapsed = _time.time() - batch_start
    bm = int(batch_elapsed // 60)
    bs = int(batch_elapsed % 60)

    console.print(f"\n{'═' * 60}")
    console.print(f"[bold blue]Batch complete — {len(batch)} video(s) in {bm}m {bs}s[/bold blue]")
    for r in results:
        icon = "✓" if r["status"] in ("completed", "drive_synced", "video_rendered") else "✗"
        style = "green" if icon == "✓" else "red"
        console.print(f"  [{style}]{icon}[/{style}] {r['topic']} — {r['status']}")
    console.print(f"{'═' * 60}")


if __name__ == '__main__':
    cli()