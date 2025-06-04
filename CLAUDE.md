# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Fire Department Tag & Roster Generator - a React application that creates:
1. CR80-sized identification tags for individual fire department members
2. Double-sided roster cards with member listings organized by role

It uses Vite as the build tool and generates PDFs client-side using jspdf.

## Essential Commands

```bash
# Development
npm run dev         # Start development server on localhost:5173

# Build & Preview
npm run build       # Build for production (outputs to dist/)
npm run preview     # Preview production build locally
```

## Architecture & Key Implementation Details

### Application Modes
- **Tag Generator**: Creates individual ID tags (2 copies per member)
- **Roster Cards**: Creates double-sided cards with multiple members per card
- Mode toggle allows switching between the two functionalities

### PDF Generation
- Uses jspdf library for client-side PDF generation
- CR80 card size: 85.6mm × 53.98mm (standard credit card size)
- Tag PDFs: Portrait orientation, 2 pages per member
- Roster PDFs: Portrait orientation, front/back sides
- PDF preview is debounced (500ms) for performance
- All processing happens client-side - no server required

### Roster Card Features
- Members grouped by role with role-specific background colors
- Supports sorting by name (alphabetical) or member number
- Automatic distribution across columns (max ~12 members per column)
- Visual preview with side switching (front/back)
- Role labels displayed above each section

### State Management
- Single-page React app with local state management in App.jsx
- Tags are stored as an array with individual properties (name, number, role, etc.)
- Color coding is automatically applied based on role selection
- Roster mode shares the same member data as tag mode

### Styling & UI
- Tailwind CSS for styling (configured in tailwind.config.js)
- Responsive design with mobile-specific notices for PDF preview
- Uses @heroicons/react for UI icons
- Role-based color mapping for consistent visual identification

### Build Configuration
- Vite configured with relative paths (base: './') for static hosting
- Production build outputs to dist/ directory
- Designed for deployment to static hosts like AWS S3

## Important Files

- `src/App.jsx`: Main application logic, mode switching, PDF generation
- `src/RosterCard.jsx`: Roster card component with distribution logic
- `vite.config.js`: Build configuration with relative paths for production
- `package.json`: Dependencies and build scripts