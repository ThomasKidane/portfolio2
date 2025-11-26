# Thomas Kidane - Personal Portfolio & Blog

A modern, minimalist portfolio website built with React, TypeScript, and Tailwind CSS. Features a clean design inspired by mathematical aesthetics with "Press Start 2P" typography and a blue color scheme.

## Features

- **Responsive Design**: Works beautifully on desktop and mobile
- **Blog System**: Write and display blog posts with modal reading experience
- **Project Showcase**: Highlight your work and technical projects
- **Contact Page**: Professional contact information and availability
- **Clean Typography**: Uses "Press Start 2P" for headings and Georgia for body text
- **Mathematical Aesthetic**: Inspired by technical/scientific design principles

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd personal-portfolio
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Customization

### Personal Information
- Update contact details in `src/pages/Contact.tsx`
- Modify the about section in `src/pages/About.tsx`
- Change the name in navigation (`src/components/Navigation.tsx`)

### Blog Posts
- Add new blog posts to `src/data/blog-posts.ts`
- Follow the existing structure for consistent formatting

### Projects
- Update the projects array in `src/pages/Projects.tsx`
- Add your own project descriptions and technologies

### Styling
- Colors can be modified in `tailwind.config.js`
- Typography settings are in `src/index.css`
- Component-specific styles use Tailwind classes

## Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Icon library

## Design Philosophy

This portfolio embraces a mathematical/technical aesthetic with:
- Clean, minimal layouts
- Consistent typography hierarchy
- Subtle hover interactions
- Professional color scheme
- Focus on readability and content

## License

MIT License - feel free to use this as a starting point for your own portfolio!
