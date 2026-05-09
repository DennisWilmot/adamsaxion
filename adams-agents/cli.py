#!/usr/bin/env python3

import click
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.panel import Panel
from rich.text import Text
from datetime import datetime
import os
from pathlib import Path

from utils.project_manager import ProjectManager
from utils.google_drive import GoogleDriveManager
from simple_agents import SimpleContentAgent
from config import (
    OPENAI_API_KEY, 
    ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, ELEVENLABS_SPEED, VOICE_SETTINGS,  # Deprecated
    GOOGLE_SERVICE_ACCOUNT_KEY, GOOGLE_CLOUD_PROJECT_ID, GOOGLE_TTS_VOICE_SETTINGS,  # New
    CHUNK_SETTINGS
)

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
            console.print(f"1. Upload to Google Drive: [bold]python cli.py upload_to_drive {project['topic']}[/bold]")
            console.print("2. Review and edit content as needed")
        
        # Always show available commands
        console.print(f"\n[bold blue]Available commands:[/bold blue]")
        console.print(f"• [bold]python cli.py generate_outline {project['topic']}[/bold] - Generate outline")
        console.print(f"• [bold]python cli.py generate_script {project['topic']}[/bold] - Generate script")
        console.print(f"• [bold]python cli.py generate_audio {project['topic']}[/bold] - Generate audio")
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
        
        # Initialize Simple Agent
        agent = SimpleContentAgent(OPENAI_API_KEY)
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("Generating script...", total=None)
            
            script = agent.create_script_section_by_section(outline, project['topic'])
            
            progress.update(task, description="Script generated successfully!")
        
        # Save script to project
        script_file = pm.projects_dir / project["project_id"] / "script.txt"
        with open(script_file, 'w') as f:
            f.write(script)
        
        # Update project status
        pm.update_project_status(
            project["project_id"], 
            "script_generated",
            script_generated=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        
        console.print(f"\n[bold green]✓ Script generated![/bold green]")
        console.print(f"[bold]Saved to:[/bold] {script_file}")
        
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
# Voice is now fixed to Puck - no options needed
@click.option('--speaking-rate', '-r', type=float, help='Speaking rate (default: 1.0)')
def generate_audio(project_identifier, speaking_rate):
    """Generate audio from the project script (use project ID or topic)
    
    Automatically cleans up the script and chunks it into optimal audio segments using Google Gemini.
    Creates both individual audio chunks and a cleaned script file."""
    import asyncio
    return asyncio.run(_generate_audio_async(project_identifier, speaking_rate))

async def _generate_audio_async(project_identifier, speaking_rate):
    """Async implementation of audio generation."""
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
        
        console.print(f"\n[bold blue]Generating audio for:[/bold blue] {project['topic']}")
        
        # Use provided options or fall back to defaults
        selected_speaking_rate = speaking_rate or GOOGLE_TTS_VOICE_SETTINGS['speaking_rate']
        
        # Display Google Cloud TTS configuration
        console.print(f"[dim]Voice:[/dim] Puck (en-US-Chirp3-HD-Puck)")
        console.print(f"[dim]Speaking Rate:[/dim] {selected_speaking_rate}")
        console.print(f"[dim]Sample Rate:[/dim] {GOOGLE_TTS_VOICE_SETTINGS['sample_rate']} Hz")
        
        # Read script
        with open(script_file, 'r', encoding='utf-8') as f:
            script_content = f.read()
        
        # Clean up script and chunk it for audio generation using Gemini
        console.print(f"\n[bold yellow]Cleaning and chunking script for audio...[/bold yellow]")
        
        # Initialize Gemini for combined cleanup and chunking
        import google.generativeai as genai
        from config import GOOGLE_GEMINI_API_KEY
        
        if not GOOGLE_GEMINI_API_KEY:
            console.print(f"\n[bold red]Error:[/bold red] GOOGLE_GEMINI_API_KEY not found in environment")
            console.print("Please set your Google Gemini API key in your .env file")
            return
        
        # Configure Gemini
        genai.configure(api_key=GOOGLE_GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""Clean up this script and split it into optimal chunks for audio generation.

        SCRIPT:
        {script_content}

        TASK 1 - CLEANUP:
        - Remove ALL formatting markers like **bold**, *italic*, etc.
        - Remove ALL section headers like "Section 1:", "Part 2:", etc.
        - Remove ALL screen directions like [Cut to visuals], [Show chart], etc.
        - Remove ALL timestamps like [00:15], [2:30], etc.
        - Remove ALL speaker notes like [Pause], [Emphasize], etc.
        - Remove ALL technical instructions like [Lower volume], [Speed up], etc.
        - Keep ONLY the actual spoken content
        - Ensure smooth flow between sentences and paragraphs

        TASK 2 - CHUNKING:
        - Split the cleaned script into chunks of approximately 150-200 words each
        - Target: 90 seconds of audio per chunk (optimal for model performance)
        - Each chunk should be a complete thought or section
        - Respect natural content breaks and topic transitions
        - Ensure chunks flow naturally when spoken
        - Don't break mid-sentence or mid-thought
        - Maximum chunk size: 250 words to avoid model strain

        OUTPUT FORMAT:
        Return the cleaned and chunked script with chunks separated by 'CHUNK_BREAK' on its own line.
        No numbering, no labels, just the cleaned text chunks.

        Example:
        [First cleaned chunk content here]
        CHUNK_BREAK
        [Second cleaned chunk content here]
        CHUNK_BREAK
        [Third cleaned chunk content here]"""
        
        try:
            response = model.generate_content(prompt)
            raw_chunks = [chunk.strip() for chunk in response.text.split('CHUNK_BREAK') if chunk.strip()]
            
            console.print(f"[dim]Gemini created {len(raw_chunks)} raw chunks[/dim]")
            
            # VALIDATE AND OPTIMIZE CHUNK SIZES
            console.print(f"[dim]Validating chunk sizes for optimal performance...[/dim]")
            chunks = []
            for chunk in raw_chunks:
                word_count = len(chunk.split())
                if 120 <= word_count <= 250:  # Target: 90 seconds (~225 words), max 250 for safety
                    chunks.append(chunk)
                    console.print(f"[dim]Chunk {len(chunks)}: {word_count} words ✓[/dim]")
                elif word_count < 120:
                    # Try to combine with next chunk if possible
                    if chunks and len(chunks[-1].split()) + word_count <= 250:
                        chunks[-1] += " " + chunk
                        console.print(f"[dim]Combined small chunk: {word_count} words[/dim]")
                    else:
                        chunks.append(chunk)
                        console.print(f"[dim]Chunk {len(chunks)}: {word_count} words (small)[/dim]")
                else:
                    # Split oversized chunks into ~90 second pieces
                    console.print(f"[dim]Splitting oversized chunk: {word_count} words[/dim]")
                    words = chunk.split()
                    current_chunk = ""
                    for word in words:
                        if len(current_chunk.split()) < 225:  # Keep chunks around 90 seconds
                            current_chunk += " " + word if current_chunk else word
                        else:
                            if current_chunk:
                                chunks.append(current_chunk.strip())
                                console.print(f"[dim]Created sub-chunk: {len(current_chunk.split())} words[/dim]")
                            current_chunk = word
                    if current_chunk:
                        chunks.append(current_chunk.strip())
                        console.print(f"[dim]Final sub-chunk: {len(current_chunk.split())} words[/dim]")
            
            console.print(f"[dim]Validation complete: {len(chunks)} optimized chunks[/dim]")
            
            # Save cleaned and chunked script for reference
            cleaned_script_file = pm.projects_dir / project["project_id"] / "script_cleaned.txt"
            with open(cleaned_script_file, 'w', encoding='utf-8') as f:
                f.write('\n\n'.join(chunks))
            
            console.print(f"[dim]Cleaned and chunked script saved to: {cleaned_script_file}[/dim]")
            console.print(f"[dim]Original script preserved as: {script_file}[/dim]")
            
        except Exception as e:
            console.print(f"[bold yellow]Warning:[/bold yellow] Gemini cleanup/chunking failed: {str(e)}. Using fallback method.")
            # Fallback to simple cleanup and chunking
            agent = SimpleContentAgent(OPENAI_API_KEY)
            cleaned_script = agent.cleanup_script_for_audio(script_content)
            chunks = _split_script_into_chunks(cleaned_script)
        
        # Initialize Google Cloud TTS audio generation
        from utils.google_tts import GoogleCloudTTS
        
        # Check Google Cloud configuration
        if not GOOGLE_CLOUD_PROJECT_ID:
            console.print(f"\n[bold red]Error:[/bold red] GOOGLE_CLOUD_PROJECT_ID not found in environment")
            console.print("Please set your Google Cloud project ID in your .env file")
            return
        
        if not GOOGLE_SERVICE_ACCOUNT_KEY:
            console.print(f"\n[bold red]Error:[/bold red] GOOGLE_SERVICE_ACCOUNT_KEY not found in environment")
            console.print("Please set your Google Cloud service account key in your .env file")
            return
        
        # Initialize Google Cloud TTS client
        google_tts = GoogleCloudTTS(
            project_id=GOOGLE_CLOUD_PROJECT_ID,
            service_account_key=GOOGLE_SERVICE_ACCOUNT_KEY
        )
        
        # Create audio directory
        audio_dir = pm.projects_dir / project["project_id"] / "audio"
        audio_dir.mkdir(exist_ok=True)
        
        console.print(f"\n[dim]Script split into {len(chunks)} chunks for processing[/dim]")
        console.print(f"[dim]Using Google Cloud TTS with Puck voice[/dim]")
        
        # Generate audio for each chunk
        audio_files = []
        total_duration = 0
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("Generating audio...", total=len(chunks))
            
            for i, chunk in enumerate(chunks, 1):
                progress.update(task, description=f"Generating chunk {i}/{len(chunks)}...")
                
                try:
                    # Generate audio using Google Cloud TTS with Puck voice
                    audio_buffer = await google_tts.generate_long_audio(
                        text=chunk,
                        voice_style='puck',  # Fixed to Puck voice
                        audio_settings={
                            "speaking_rate": selected_speaking_rate,
                            "pitch": GOOGLE_TTS_VOICE_SETTINGS['pitch'],
                            "volume_gain_db": GOOGLE_TTS_VOICE_SETTINGS['volume_gain_db'],
                            "sample_rate_hertz": GOOGLE_TTS_VOICE_SETTINGS['sample_rate'],
                            "audio_encoding": GOOGLE_TTS_VOICE_SETTINGS['audio_encoding']
                        }
                    )
                    
                    # Save audio file with topic prefix following naming convention
                    topic_prefix = project['topic'].lower().replace(' ', '_').replace(':', '').replace('-', '_')[:20]
                    chunk_filename = f"t={topic_prefix}_chunk_{i:03d}.mp3"
                    chunk_filepath = audio_dir / chunk_filename
                    
                    with open(chunk_filepath, 'wb') as f:
                        f.write(audio_buffer)
                    
                    audio_files.append(str(chunk_filepath))
                    
                    # Estimate duration (rough calculation: ~150 words per minute)
                    word_count = len(chunk.split())
                    estimated_duration = (word_count / 150) * 60  # seconds
                    total_duration += estimated_duration
                    
                    progress.update(task, advance=1)
                    
                except Exception as e:
                    console.print(f"\n[bold red]Error generating chunk {i}:[/bold red] {str(e)}")
                    continue
        
        if not audio_files:
            console.print(f"\n[bold red]Failed to generate any audio files[/bold red]")
            return
        

        
        # Update project status
        pm.update_project_status(
            project["project_id"], 
            "audio_generated",
            audio_generated=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        
        # Calculate final duration
        minutes = int(total_duration // 60)
        seconds = int(total_duration % 60)
        duration_str = f"{minutes}m {seconds}s"
        
        console.print(f"\n[bold green]✓ Audio generation complete![/bold green]")
        console.print(f"[bold]Audio files saved to:[/bold] {audio_dir}")
        console.print(f"[bold]Total duration:[/bold] {duration_str}")
        console.print(f"[bold]Chunks generated:[/bold] {len(audio_files)}")
        
        # Show next steps
        console.print(f"\n[bold yellow]Next steps:[/bold yellow]")
        console.print("1. Listen to the audio files")
        console.print(f"2. Upload to Google Drive: [bold]python cli.py upload_to_drive {project['topic']}[/bold]")
        console.print("3. Edit or refine as needed")
        
    except Exception as e:
        console.print(f"\n[bold red]Error generating audio:[/bold red] {str(e)}")
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

if __name__ == '__main__':
    cli() 