from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI
from typing import Dict, List
import os
from config import OPENAI_API_KEY

class ContentCreationCrew:
    def __init__(self):
        # Initialize OpenAI model
        self.llm = ChatOpenAI(
            model="gpt-4o",
            api_key=OPENAI_API_KEY,
            temperature=0.7
        )
        
        # Initialize agents
        self.outline_agent = self._create_outline_agent()
        self.research_script_agent = self._create_research_script_agent()
        self.validator_agent = self._create_validator_agent()
        
        # Initialize crew
        self.crew = self._create_crew()
    
    def _create_outline_agent(self) -> Agent:
        """Create the Outline Agent - Content Structure Specialist"""
        return Agent(
            role="Content Structure Specialist",
            goal="Create clear, logical outlines that maximize learning flow and engagement",
            backstory="""You are an expert content architect who specializes in creating 
            educational content structures. You understand that the best learning happens 
            when content flows logically and each section builds naturally on the previous one. 
            You excel at creating hooks that draw listeners in and cliffhangers that keep 
            them engaged.""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm,
            tools=[],
            memory=False
        )
    
    def _create_research_script_agent(self) -> Agent:
        """Create the Research & Script Agent - Economic Researcher + Script Writer"""
        return Agent(
            role="Economic Researcher & Script Writer",
            goal="Write engaging, educational scripts that make complex economics crystal clear",
            backstory="""You are a master of economic storytelling who combines deep 
            knowledge with engaging writing. You write in a conversational, dry sarcastic 
            tone that makes listeners feel like they're learning from a smart friend. 
            You excel at using historical examples, real-world context, and natural humor 
            to enhance understanding. You maintain a 70:30 education-to-entertainment ratio.""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm,
            tools=[],
            memory=False
        )
    
    def _create_validator_agent(self) -> Agent:
        """Create the Validator Agent - Quality Controller"""
        return Agent(
            role="Content Quality Controller",
            goal="Ensure content meets quality standards and maintains educational value",
            backstory="""You are a meticulous content validator who ensures that every 
            piece of content meets the highest standards. You check for educational clarity, 
            natural humor, emotional engagement, and proper structure. You understand that 
            education comes first, but entertainment should enhance understanding, not 
            distract from it. You maintain the 70:30 ratio and ensure content is accessible 
            to a 12-year-old understanding level.""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm,
            tools=[],
            memory=False
        )
    
    def _create_crew(self) -> Crew:
        """Create the content creation crew"""
        return Crew(
            agents=[self.outline_agent, self.research_script_agent, self.validator_agent],
            tasks=[],
            verbose=True,
            process=Process.sequential
        )
    
    def create_outline(self, topic: str, context: str) -> str:
        """Create a detailed outline for the given topic"""
        outline_task = Task(
            description=f"""Create a detailed outline for a YouTube video about '{topic}' with context: '{context}'.

            REQUIREMENTS:
            - Target: ~300 words per section
            - Structure: Hook → Key Points → Example → Cliffhanger
            - Flow: Logical progression that builds understanding
            - Sections: Plan for emotional peaks and valleys
            - No intro needed - go straight into content
            
            FORMAT:
            1. [Section Title]
               - Hook: [Engaging opening]
               - Key Points: [2-3 main concepts]
               - Example: [Real-world application]
               - Cliffhanger: [Tease next section]
            
            2. [Next Section]
               - Hook: [Engaging opening]
               - Key Points: [2-3 main concepts]
               - Example: [Real-world application]
               - Cliffhanger: [Tease next section]
            
            Focus on creating a structure that will make complex economics accessible and engaging.""",
            agent=self.outline_agent,
            expected_output="A detailed outline with clear sections, hooks, and cliffhangers"
        )
        
        result = self.crew.kickoff()
        return result.raw_output
    
    def create_script(self, outline: str) -> str:
        """Create a full script based on the outline"""
        script_task = Task(
            description=f"""Write a full YouTube script based on this outline:

            {outline}

            REQUIREMENTS:
            - Tone: Dry sarcastic (not pessimistic) - like explaining to a smart friend
            - Humor: Natural, emerges from content, every few sentences when it fits
            - Language: Simple enough for 12-year-old understanding
            - Structure: Follow the outline exactly - Hook → Key Points → Example → Cliffhanger
            - Examples: Use historical context and real-world applications
            - Transitions: Smooth, natural flow between sections
            - Length: ~300 words per section as outlined
            - Ratio: 70% education, 30% entertainment
            
            WRITING STYLE:
            - Conversational and engaging
            - Use analogies and clear examples
            - Create emotional peaks and valleys
            - Include surprising facts and "aha" moments
            - Maintain educational clarity above all else
            
            Remember: Education drives the content, humor and emotion enhance understanding.""",
            agent=self.research_script_agent,
            expected_output="A complete, engaging script that follows the outline and style guide"
        )
        
        result = self.crew.kickoff()
        return result.raw_output
    
    def validate_content(self, content: str, content_type: str = "script") -> Dict:
        """Validate content against quality standards"""
        validation_task = Task(
            description=f"""Validate this {content_type} against our quality standards:

            {content}

            VALIDATION CRITERIA:
            1. **Educational Value (70%)**: Is the core educational content clear and accurate?
            2. **Entertainment Quality (30%)**: Does humor feel natural and enhance understanding?
            3. **Tone**: Is it dry sarcastic without being pessimistic?
            4. **Clarity**: Is language simple enough for 12-year-old understanding?
            5. **Structure**: Does it follow Hook → Key Points → Example → Cliffhanger?
            6. **Emotional Engagement**: Does it evoke emotions that support learning?
            7. **Transitions**: Are sections connected smoothly?
            8. **Examples**: Are concepts illustrated with clear examples?
            
            PROVIDE:
            - Overall score (1-10)
            - Specific feedback for each criterion
            - Suggested improvements
            - Whether content meets standards (pass/fail)
            
            Be specific and actionable in your feedback.""",
            agent=self.validator_agent,
            expected_output="Detailed validation report with scores, feedback, and recommendations"
        )
        
        result = self.crew.kickoff()
        return result.raw_output

# Example usage
if __name__ == "__main__":
    # Test the crew
    crew = ContentCreationCrew()
    
    # Create outline
    outline = crew.create_outline(
        topic="Every Major Economic Theory Explained",
        context="Focus on making complex theories accessible to beginners"
    )
    print("OUTLINE:", outline)
    
    # Create script
    script = crew.create_script(outline)
    print("SCRIPT:", script)
    
    # Validate content
    validation = crew.validate_content(script, "script")
    print("VALIDATION:", validation) 