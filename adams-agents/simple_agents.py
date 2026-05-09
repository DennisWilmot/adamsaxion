import openai
from pathlib import Path
import json
from datetime import datetime
from typing import Dict, List, Optional

class ResearchAgent:
    """Agent that researches topics and stores findings for script generation"""
    
    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)
        self.research_dir = Path("research")
        self.research_dir.mkdir(exist_ok=True)
    
    def _is_economics_topic(self, topic: str) -> bool:
        """Check if topic is economics-related"""
        economics_keywords = [
            'economic', 'economics', 'economy', 'market', 'finance', 'financial',
            'monetary', 'fiscal', 'inflation', 'recession', 'depression', 'bubble',
            'crash', 'policy', 'tax', 'trade', 'supply', 'demand', 'capitalism',
            'socialism', 'communism', 'keynesian', 'austrian', 'monetarism',
            'theory', 'theories', 'school of thought', 'economic school'
        ]
        
        topic_lower = topic.lower()
        return any(keyword in topic_lower for keyword in economics_keywords)
    
    def research_topic(self, topic: str, context: str) -> str:
        """Research a topic and return structured findings"""
        is_economics = self._is_economics_topic(topic)
        
        base_prompt = f"""Research the topic: {topic}
        
        Context: {context}
        
        Your task: Gather specific, factual information that would be useful for creating an educational video script.
        
        RESEARCH REQUIREMENTS:
        - Find REAL examples with specific names, dates, numbers, and facts
        - Include surprising or little-known details that would engage viewers
        - Focus on concrete information, not general statements
        - Gather 10-15 specific examples or facts that could anchor script sections
        - Include both well-known and lesser-known aspects of the topic"""
        
        if is_economics:
            economics_enhancement = """
        
        ECONOMIC TOPIC ENHANCEMENT (Since this is an economic topic):
        - Find specific policy details with exact numbers and dates
        - Include historical events with precise figures and percentages
        - Research institutional decisions with concrete outcomes and data
        - Look for specific economic data: GDP changes, inflation rates, unemployment numbers
        - Find policy implementations with exact details: "1981 Economic Recovery Tax Act cut top rate from 70% to 50%"
        - Include specific company examples: "Standard Oil controlled 90% of US oil refining by 1890"
        - Research specific market events: "In 1929, the Dow Jones fell from 381 to 41, a 89% drop"
        - Find specific government actions: "Federal Reserve's 1979 Volcker Shock raised rates to 20%"
        - Look for specific trade data: "US-China trade deficit reached $375 billion in 2017"
        - Research specific inflation examples: "Zimbabwe's hyperinflation reached 79.6 billion percent in 2008"
        - Find specific unemployment data: "US unemployment peaked at 25% during Great Depression"
        - Include specific GDP figures: "US GDP fell 30% from 1929 to 1933" """
        else:
            economics_enhancement = ""
        
        format_instructions = """
        
        FORMAT YOUR FINDINGS AS:
        ## Key Facts & Examples
        
        ### [Category 1]
        - [Specific fact with real details]
        - [Another specific fact with real details]
        
        ### [Category 2] 
        - [Specific fact with real details]
        - [Another specific fact with real details]
        
        ## Interesting Details
        - [Surprising fact 1]
        - [Surprising fact 2]
        
        ## Real-World Applications
        - [Specific example 1 with details]
        - [Specific example 2 with details]
        
        Be specific and factual. No vague statements."""
        
        prompt = base_prompt + economics_enhancement + format_instructions
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are an expert researcher who finds specific, factual information for educational content."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error during research: {str(e)}"
    
    def save_research(self, topic: str, research_data: str) -> str:
        """Save research findings to a file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{topic.lower().replace(' ', '_')}_{timestamp}.txt"
        filepath = self.research_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(f"RESEARCH: {topic}\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 50 + "\n\n")
            f.write(research_data)
        
        return str(filepath)
    
    def get_latest_research(self, topic: str) -> Optional[str]:
        """Get the most recent research file for a topic"""
        topic_pattern = topic.lower().replace(' ', '_')
        research_files = list(self.research_dir.glob(f"{topic_pattern}_*.txt"))
        
        if not research_files:
            return None
        
        # Get the most recent file
        latest_file = max(research_files, key=lambda x: x.stat().st_mtime)
        
        with open(latest_file, 'r', encoding='utf-8') as f:
            return f.read()

class SimpleContentAgent:
    """Content creation agent that uses research data"""
    
    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)
        self.research_agent = ResearchAgent(api_key)
    
    def validate_outline(self, outline: str, research_data: str) -> dict:
        """Validate outline quality and reject if too generic"""
        prompt = f"""Validate this outline against our quality standards:

        OUTLINE:
        {outline}

        RESEARCH DATA USED:
        {research_data}

        VALIDATION CRITERIA:
        1. **Specificity (CRITICAL)**: Does each section contain specific facts, numbers, dates, and concrete examples?
        2. **Research Utilization**: Is the research data being used effectively with specific details?
        3. **Concrete Examples**: Are examples specific (e.g., "1981 Economic Recovery Tax Act cut top rate from 70% to 50%") rather than generic (e.g., "tax cuts in the 1980s")?
        4. **Educational Value**: Does each section teach something substantial with real data?
        5. **Structure**: Does it follow the Hook → Key Points → Example → Cliffhanger format?
        6. **Content Density**: Are sections 300-450 words of rich, detailed content?
        
        PROVIDE:
        - Overall score (1-10)
        - Specific feedback for each criterion
        - Whether content meets standards (pass/fail)
        - If FAIL: Specific reasons why and what needs improvement
        
        Be specific and actionable in your feedback."""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a content quality validator who ensures outlines meet high standards for specificity and educational value."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1
            )
            
            validation_result = response.choices[0].message.content
            
            # Parse the validation result to determine pass/fail
            if "pass" in validation_result.lower() and "fail" not in validation_result.lower():
                return {"status": "pass", "feedback": validation_result}
            else:
                return {"status": "fail", "feedback": validation_result}
                
        except Exception as e:
            return {"status": "error", "feedback": f"Validation error: {str(e)}"}

    def create_outline(self, topic: str, context: str) -> str:
        """Create an outline using research data with validation"""
        max_attempts = 3
        attempt = 1
        
        while attempt <= max_attempts:
            print(f"🔍 Researching {topic}... (Attempt {attempt}/{max_attempts})")
            research_data = self.research_agent.research_topic(topic, context)
            
            # Save the research
            research_file = self.research_agent.save_research(topic, research_data)
            print(f"💾 Research saved to: {research_file}")
            
            # Create outline using research
            prompt = f"""Create a detailed outline for a YouTube video about {topic}.

            Context: {context}

            RESEARCH DATA (Use This Instead of Making Things Up):
            {research_data}

            COMPLETE STORYTELLING RULES (Follow These Exactly):

            {self._load_storytelling_rules()}

            OUTLINE REQUIREMENTS:
            - Target video length: 17-22 minutes
            - Speaking rate: ~150 words per minute  
            - Section length: CRITICAL - Each section must be 300-450 words (2-3 minutes)
            - Total sections: 9-15 sections depending on topic complexity
            - NO sections under 300 words - this is non-negotiable

            CONTENT APPROACH:
            - Each section should start with an engaging hook that captures attention
            - Use the RESEARCH DATA to create content-dense sections
            - Every section should teach something substantial AND evoke emotion
            - Plan for emotional peaks and valleys throughout the video
            - No intro needed - go straight into content
            
            COVERAGE STRATEGY:
            - Use the specific examples and facts from your research
            - Each section should reveal something interesting or surprising
            - Let the research data guide what needs to be covered
            - Ensure comprehensive coverage without being repetitive

            WRITING STYLE:
            - Tone: Dry sarcastic (not pessimistic) - like explaining to a smart friend
            - Humor: Natural, emerges from content, every few sentences when it fits
            - Language: Clear and accessible, but NOT dumbed down or basic
            - Ratio: 70% education, 30% entertainment
            - Educational clarity above all else

            CRITICAL REQUIREMENTS:
            - Each section MUST be 300-450 words - this is the primary goal
            - Content should be DENSE and information-packed
            - Every section should evoke emotion (anger, excitement, disbelief, wonder)
            - Use RESEARCH DATA to create specific, factual content
            - Focus on storytelling flow, not rigid structure

            FORMAT:
            Return the outline in this EXACT structured format. Each section must follow this template:

            ### 1. [Section Title]
               - **Hook:** [Crazy fact or polarizing statement that captures attention]
               - **Key Points:** [2-3 main concepts to be covered]
               - **Example:** [Specific real-world application or historical case]
               - **Cliffhanger:** [Tease/transition into the next section to keep listeners engaged]

            ### 2. [Next Section Title]
               - **Hook:** [Crazy fact or polarizing statement]
               - **Key Points:** [2-3 main concepts]
               - **Example:** [Specific real-world application]
               - **Cliffhanger:** [Tease/transition to next section]

            HOOK REQUIREMENTS:
            - Every hook must be either a SHOCKING FACT or a POLARIZING STATEMENT
            - No academic language or generic openings
            - Make listeners say "wait, what?" or feel strong emotion
            - Examples: "In 1637, people traded entire houses for tulip bulbs" or "Adam Smith was wrong about everything"

            CLIFFHANGER REQUIREMENTS:
            - Must tease or transition into the next section
            - Keep listeners interested in what's coming next
            - Create curiosity and anticipation
            - Examples: "But here's where it gets even worse..." or "What happens when governments try to fix this?"

            TIMING REQUIREMENTS (CRITICAL):
            - Target video length: 17-22 minutes
            - Speaking rate: ~150 words per minute
            - Section length: Each section must be 300-450 words (2-3 minutes)
            - Total sections: 9-15 sections to fit within 22-minute limit
            - NO sections under 300 words - this is non-negotiable
            - NO sections over 450 words - this keeps timing manageable

            CONTENT REQUIREMENTS:
            - Each section must contain 300-450 words of rich, detailed content
            - Use RESEARCH DATA for specific facts, names, dates, and examples
            - Content should be DENSE and information-packed, not thin or basic
            - Every section should evoke emotion (anger, excitement, disbelief, wonder)
            
            Remember: The goal is DENSE, EMOTIONALLY ENGAGING content that actually teaches something substantial, automatically formatted for script generation.
            
            Create a structure that feels natural and comprehensive, covering what needs to be covered without forcing artificial constraints."""
            
            try:
                response = self.client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": "You are an expert content architect who creates detailed, educational outlines for YouTube videos."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7
                )
                
                outline = response.choices[0].message.content
                
                # Validate the outline
                print(f"🔍 Validating outline quality... (Attempt {attempt}/{max_attempts})")
                validation = self.validate_outline(outline, research_data)
                
                if validation["status"] == "pass":
                    print("✅ Outline validation passed!")
                    return outline
                else:
                    print(f"❌ Outline validation failed (Attempt {attempt}/{max_attempts}):")
                    print(validation["feedback"])
                    
                    if attempt < max_attempts:
                        print(f"🔄 Regenerating outline... (Attempt {attempt + 1}/{max_attempts})")
                        attempt += 1
                        continue
                    else:
                        print("⚠️ Max attempts reached. Returning outline despite validation failure.")
                        return outline
                        
            except Exception as e:
                print(f"❌ Error generating outline: {str(e)}")
                if attempt < max_attempts:
                    print(f"🔄 Retrying... (Attempt {attempt + 1}/{max_attempts})")
                    attempt += 1
                    continue
                else:
                    raise e
    
    def create_script(self, outline: str, topic: str = None) -> str:
        """Create a full script based on the outline, using research data if available"""
        # Try to get research data for this topic
        research_context = ""
        if topic:
            research_data = self.research_agent.get_latest_research(topic)
            if research_data:
                research_context = f"\n\nRESEARCH DATA TO USE:\n{research_data}"
        
        prompt = f"""Write a full YouTube script based on this outline:

        {outline}

        IMPORTANT CONTEXT: This content will be converted to speech using text-to-speech technology. Write with this in mind.

        CRITICAL: This is PURE AUDIO CONTENT. Write as if you're speaking directly to someone's ears.
        
        FORMATTING RULES:
        - NO section headers like "Section 1:" or "Part 2:" - just start with content
        - NO formatting markers like **bold** or *italic* - just plain text
        - NO screen directions like [Cut to visuals] or [Show chart]
        - NO timestamps like [00:15] or [2:30]
        - NO speaker notes like [Pause] or [Emphasize]
        - NO technical instructions like [Lower volume] or [Speed up]
        - ONLY use paragraph breaks for natural pauses and flow
        - Write pure, clean text that flows naturally when spoken

        COMPLETE STORYTELLING RULES (Follow These Exactly):

        {self._load_storytelling_rules()}

        REQUIREMENTS:
        - Tone: Dry sarcastic (not pessimistic) - like explaining to a smart friend
        - Humor: Natural, emerges from content, every few sentences when it fits
        - Language: Clear and accessible, but NOT dumbed down or basic
        - Structure: Follow the outline naturally - start with hooks, end with transitions
        - Examples: Use specific, detailed examples with real names, facts, and context
        - Transitions: Smooth, natural flow between sections
        - Length: CRITICAL - Each section must be 300-450 words as outlined
        - Ratio: 70% education, 30% entertainment
        
        WRITING FOR TEXT-TO-SPEECH:
        - Keep sentences short and clear (15-20 words max)
        - Avoid complex comma structures and run-on sentences
        - Use natural speech patterns that flow when spoken
        - Break long thoughts into shorter, digestible sentences
        - Write like you're speaking to someone, not writing an essay
        - Avoid convoluted language that's hard to pronounce
        - Use simple transitions between ideas
        
        CREATIVITY & VARIETY REQUIREMENTS:
        - Vary your opening hooks dramatically - don't use repetitive patterns
        - Mix up sentence structures and lengths naturally
        - Avoid formulaic language like "Ready to take control of..." or "Let's dive into..."
        - Each section should feel unique and fresh
        - Use different emotional tones and approaches for variety
        - Don't fall into AI writing patterns - be genuinely creative
        - Vary your cliffhangers and transitions - no repetitive formulas
        
        BANNED REPETITIVE PATTERNS (NEVER USE):
        - "Imagine if X was Y, well it isn't fantasy, it's reality"
        - "It's not just X, it's Y - a complete change in how we approach something"
        - "This isn't just A, it's B" (repetitive contrast pattern)
        - "What if X could Y? Well, now it can" (predictable Q&A format)
        - "Forget about X, now we have Y" (overused transition)
        - "This is like having X, but instead of Y, you get Z" (formulaic comparison)
        
        WRITING STYLE:
        - Every Hook should be a crazy fact, or something extremely emotional. Hooks should captify the audience.
        - Conversational and engaging
        - Use analogies and clear examples
        - Create emotional peaks and valleys
        - Include surprising facts and "aha" moments
        - Maintain educational clarity above all else
        
        CONTENT DEPTH REQUIREMENTS:
        - NO vague statements like "Meet Sarah" without details
        - NO generic examples like "rare disease" without specifics
        - NO empty phrases like "traditional methods" without explanation
        - Include real names, specific facts, actual numbers, concrete details
        - Each section should teach something substantial and specific
        - Content should be DENSE and information-packed, not thin or basic

        EMOTIONAL ENGAGEMENT REQUIREMENTS:
        - Every section should evoke emotion (anger, excitement, disbelief, wonder)
        - Make listeners feel something - never let them just passively listen
        - Create emotional peaks and valleys throughout
        - Use powerful, evocative language that provokes reaction
        - Content should make listeners think "wow" or "that's unbelievable"
        
        Remember: Education drives the content, humor and emotion enhance understanding.
        
        Write the complete script following the outline structure, optimized for speech conversion."""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a master of economic storytelling who combines deep knowledge with engaging writing."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating script: {str(e)}"
    
    def create_script_section_by_section(self, outline: str, topic: str = None) -> str:
        """Create a full script by generating one section at a time"""
        # Parse outline to get section information
        sections = self._parse_outline_sections(outline)
        
        if not sections:
            return "Error: Could not parse outline sections"
        
        # Try to get research data for this topic
        research_context = ""
        if topic:
            research_data = self.research_agent.get_latest_research(topic)
            if research_data:
                research_context = f"\n\nRESEARCH DATA TO USE:\n{research_data}"
        
        full_script = ""
        completed_sections = []
        
        print(f"🔧 Generating {len(sections)} sections one by one...")
        
        for i, section_info in enumerate(sections, 1):
            print(f"📝 Generating Section {i}: {section_info['title']}")
            
            # Generate this section with context from previous sections
            section_content = self._generate_single_section(
                section_info, 
                completed_sections, 
                research_context,
                topic
            )
            
            # Store the completed section
            completed_sections.append({
                'number': i,
                'title': section_info['title'],
                'content': section_content
            })
            
            # Add to full script
            full_script += f"\n\n**Section {i}: {section_info['title']}**\n\n"
            full_script += section_content
            
            print(f"✅ Section {i} completed ({len(section_content.split())} words)")
        
        print(f"🎉 Full script generated: {len(full_script.split())} total words")
        return full_script
    
    def _parse_outline_sections(self, outline: str) -> List[Dict]:
        """Parse outline to extract section information"""
        sections = []
        lines = outline.split('\n')
        
        current_section = None
        
        for line in lines:
            line = line.strip()
            if line.startswith('###') or line.startswith('**Section'):
                # Extract section title
                title = line.replace('###', '').replace('**', '').replace(':', '').strip()
                if title:
                    current_section = {
                        'title': title,
                        'content': line
                    }
                    sections.append(current_section)
            elif current_section and line:
                current_section['content'] += '\n' + line
        
        return sections
    
    def _generate_single_section(self, section_info: Dict, previous_sections: List, research_context: str, topic: str) -> str:
        """Generate a single section with context from previous sections"""
        # Build context from previous sections
        previous_context = ""
        if previous_sections:
            previous_context = "\n\nPREVIOUS SECTIONS FOR CONTEXT:\n"
            for prev in previous_sections[-2:]:  # Last 2 sections for context
                previous_context += f"\nSection {prev['number']}: {prev['title']}\n{prev['content'][:200]}...\n"
        
        prompt = f"""Generate Section: {section_info['title']}

        SECTION OUTLINE:
        {section_info['content']}

        {research_context}

        {previous_context}

        COMPLETE STORYTELLING RULES (Follow These Exactly):

        {self._load_storytelling_rules()}

        CRITICAL REQUIREMENTS FOR THIS SECTION:
        - Length: MUST be 300-450 words (this is non-negotiable)
        - Content: DENSE and information-packed, not thin or basic
        - Emotional engagement: Evoke emotion (anger, excitement, disbelief, wonder)
        - Make listeners feel something - never let them just passively listen
        - Use powerful, evocative language that provokes reaction
        - Content should make listeners think "wow" or "that's unbelievable"
        - Use RESEARCH DATA for specific facts and examples
        - Follow the outline structure for this section
        - End with a natural transition to the next section

        WRITING STYLE:
        - Tone: Dry sarcastic (not pessimistic) - like explaining to a smart friend
        - Humor: Natural, emerges from content, every few sentences when it fits
        - Language: Clear and accessible, but NOT dumbed down or basic
        - Structure: Follow the section outline exactly
        - Transitions: Smooth flow from previous section to next
        
        FORMATTING RULES:
        - NO section headers like "Section 1:" or "Part 2:" - just start with content
        - NO formatting markers like **bold** or *italic* - just plain text
        - NO screen directions like [Cut to visuals] or [Show chart]
        - NO timestamps like [00:15] or [2:30]
        - NO speaker notes like [Pause] or [Emphasize]
        - NO technical instructions like [Lower volume] or [Speed up]
        - ONLY use paragraph breaks for natural pauses and flow
        - Write pure, clean text that flows naturally when spoken

        Remember: This is ONE SECTION only. Make it dense, engaging, and exactly 300-450 words.
        
        Write this single section now."""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a master storyteller who creates dense, emotionally engaging content one section at a time."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating section: {str(e)}"
    
    def validate_content(self, content: str, content_type: str = "outline") -> Dict:
        """Validate content against quality standards"""
        
        # Load the complete storytelling rules for validation
        storytelling_rules = self._load_storytelling_rules()
        
        prompt = f"""Validate this {content_type} against our quality standards:

        {content}

        COMPLETE STORYTELLING RULES FOR VALIDATION:

        {storytelling_rules}

        VALIDATION CRITERIA (Based on Complete Rules):
        1. **Timing & Structure**: Does it fit 18-26 minute target with appropriate section count (9-15)?
        2. **Section Structure**: Does each section follow Hook → Key Points → Example → Cliffhanger?
        3. **Content Flow**: Is there logical progression that builds understanding naturally?
        4. **Emotional Engagement**: Does each section evoke emotion and create engagement?
        5. **Coverage**: Does it cover essential aspects first, then add depth with examples?
        6. **Examples**: Are real examples used to explain concepts where applicable?
        7. **Transitions**: Are sections connected smoothly with cliffhangers?
        8. **Comprehensiveness**: Is coverage comprehensive without being repetitive?
        9. **AI Pattern Avoidance**: Does it avoid banned words, tricolons, extended metaphors, formulas?
        10. **TTS Optimization**: Are sentences short, clear, and speech-friendly?
        
        VALIDATION DECISION TREE:
        - **PASS (Score 8-10)**: Content meets standards, minor tweaks only
        - **NEEDS REVISION (Score 6-7)**: Make specific improvements, keep structure
        - **MAJOR REVISION (Score 4-5)**: Significant changes needed, but salvageable
        - **REJECT & REGENERATE (Score 1-3)**: Too far off, force first agent to regenerate
        
        PROVIDE:
        - Overall score (1-10)
        - Specific feedback for each criterion
        - Decision: PASS, NEEDS REVISION, MAJOR REVISION, or REJECT & REGENERATE
        - If REJECT: Specific reasons why regeneration is needed
        - If REVISION: Specific improvements to make
        - Action plan: What should happen next
        
        Be specific and actionable in your feedback. Use the complete storytelling rules as your guide."""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a meticulous content validator who ensures that every piece of content meets the highest standards."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            return {
                "validation_result": response.choices[0].message.content,
                "status": "completed"
            }
        except Exception as e:
                    return {
            "validation_result": f"Error during validation: {str(e)}",
            "status": "failed"
        }
    
    def _load_storytelling_rules(self) -> str:
        """Load the complete storytelling rules from file"""
        try:
            rules_file = Path("storytelling_rules.md")
            if rules_file.exists():
                with open(rules_file, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                return "Storytelling rules file not found. Use default rules."
        except Exception as e:
            return f"Error loading rules: {str(e)}. Use default rules."
    
    def handle_validation_decision(self, validation_result: str) -> Dict:
        """Handle validation decision and determine next action"""
        try:
            # Parse the validation result to extract decision and score
            if "REJECT & REGENERATE" in validation_result or "Score 1-3" in validation_result:
                return {
                    "action": "regenerate",
                    "reason": "Content too far off from standards",
                    "message": "Forcing first agent to regenerate completely"
                }
            elif "MAJOR REVISION" in validation_result or "Score 4-5" in validation_result:
                return {
                    "action": "major_revision",
                    "reason": "Significant changes needed but salvageable",
                    "message": "Make major improvements while keeping structure"
                }
            elif "NEEDS REVISION" in validation_result or "Score 6-7" in validation_result:
                return {
                    "action": "minor_revision",
                    "reason": "Specific improvements needed",
                    "message": "Make targeted improvements"
                }
            elif "PASS" in validation_result or "Score 8-10" in validation_result:
                return {
                    "action": "pass",
                    "reason": "Content meets standards",
                    "message": "Minor tweaks only, ready for next step"
                }
            else:
                return {
                    "action": "unknown",
                    "reason": "Could not parse validation result",
                    "message": "Manual review needed"
                }
        except Exception as e:
            return {
                "action": "error",
                "reason": f"Error parsing validation: {str(e)}",
                "message": "Manual review needed"
            }

    def cleanup_script_for_audio(self, script_content: str) -> str:
        """Clean up script content by removing screen directions and formatting for audio generation"""
        
        prompt = f"""Clean up this script for audio generation by removing all non-speech elements:

        {script_content}

        CLEANUP REQUIREMENTS:
        1. **Remove ALL screen directions**: [Cut to visuals], [Transition with music], [Show chart], etc.
        2. **Remove ALL formatting markers**: **bold**, *italic*, etc.
        3. **Remove ALL section headers**: "Section 1:", "Part 2:", etc.
        4. **Remove ALL timestamps**: [00:15], [2:30], etc.
        5. **Remove ALL speaker notes**: [Pause], [Emphasize], etc.
        6. **Remove ALL technical instructions**: [Lower volume], [Speed up], etc.
        7. **Keep ONLY the actual spoken content**
        8. **Ensure smooth flow between sentences and paragraphs**
        9. **Maintain natural speech patterns**
        10. **Preserve all factual content and examples**

        OUTPUT FORMAT:
        - Pure text that flows naturally when spoken
        - No brackets, formatting, or technical instructions
        - Clean paragraph breaks for natural pauses
        - Ready for text-to-speech conversion

        The goal is to create a script that sounds natural when read aloud, with no visual or technical distractions."""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are an expert script editor who specializes in preparing content for audio generation by removing all non-speech elements."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error during script cleanup: {str(e)}"

# Example usage
if __name__ == "__main__":
    # Test the agent
    agent = SimpleContentAgent(api_key="YOUR_API_KEY") # Replace with your actual API key
    
    # Create outline
    outline = agent.create_outline(
        topic="Every Major Economic Theory Explained",
        context="Focus on making complex theories accessible to beginners"
    )
    print("OUTLINE:", outline)
    
    # Create script
    script = agent.create_script(outline, "Every Major Economic Theory Explained")
    print("SCRIPT:", script)
    
    # Validate content
    validation = agent.validate_content(script, "script")
    print("VALIDATION:", validation) 