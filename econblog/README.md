# Adam's Axioms - Economics Learning Platform

A modern, scalable platform for learning economics through interactive lessons and gamified learning experiences.

## 🚀 Features

- **File-based lesson system** - Each lesson is a separate markdown file
- **Dynamic routing** - Automatic lesson page generation
- **Beautiful UI** - Spacious, responsive design with 16:9 thumbnails
- **Gamification** - XP, levels, and ratings system
- **Scalable architecture** - Handle hundreds of lessons efficiently

## 🏗️ Architecture

### File Structure
```
src/
├── app/                    # Next.js App Router
├── content/               # Lesson content (markdown files)
├── components/            # React components
├── lib/                   # Utilities and data
└── public/                # Static assets
```

### Key Components
- **Lessons Index** - Metadata only (no content)
- **Individual Lesson Files** - Markdown with frontmatter
- **Dynamic Renderer** - File-based content loading
- **Responsive Cards** - Beautiful lesson previews

## 🛠️ Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **View lessons**
   - Navigate to `/lessons` to see all lessons
   - Click on a lesson to read the full content

## 📝 Adding New Lessons

1. **Create markdown file** in `src/content/lessons/`
2. **Add frontmatter** with lesson metadata
3. **Write content** in markdown format
4. **Add to lessons index** in `src/lib/lessons-index.ts`
5. **Add thumbnail** to `public/thumbnails/`

## 🎯 Current Status

- ✅ File-based architecture implemented
- ✅ Dynamic lesson routing working
- ✅ Beautiful UI with proper spacing
- ✅ Markdown content rendering
- ✅ Gamification elements displayed
- 🔄 Quiz integration (next step)
- 🔄 User progress tracking (planned)

## 🚀 Next Steps

- Add quiz components within lessons
- Implement user authentication
- Add progress tracking
- Create lesson unlocking system
- Build search and filtering

## 📚 Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Prisma** - Database ORM (ready for future use)
- **File System** - Markdown-based content management

## 🤝 Contributing

This platform is designed for easy content creation and management. Each lesson is a separate file, making collaboration simple and scalable.

---

Built with ❤️ for economics education
