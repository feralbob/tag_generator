# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Fire Department Tag Generator - a React application that creates CR80-sized identification tags for fire department members. It uses Vite as the build tool and generates PDFs client-side using jspdf.

## Essential Commands

```bash
# Development
npm run dev         # Start development server on localhost:5173

# Build & Preview
npm run build       # Build for production (outputs to dist/)
npm run preview     # Preview production build locally
```

## Architecture & Key Implementation Details

### PDF Generation
- Uses jspdf library for client-side PDF generation
- CR80 card size: 85.6mm × 53.98mm (standard credit card size)
- PDF preview is debounced (500ms) for performance
- All processing happens client-side - no server required

### State Management
- Single-page React app with local state management in App.jsx
- Tags are stored as an array with individual properties (name, number, role, etc.)
- Color coding is automatically applied based on role selection

### Styling & UI
- Tailwind CSS for styling (configured in tailwind.config.js)
- Responsive design with mobile-specific notices for PDF preview
- Uses @heroicons/react for UI icons

### Build Configuration
- Vite configured with relative paths (base: './') for static hosting
- Production build outputs to dist/ directory
- Designed for deployment to static hosts like AWS S3

## Important Files

- `src/App.jsx`: Main application logic, PDF generation, and state management
- `vite.config.js`: Build configuration with relative paths for production
- `package.json`: Dependencies and build scripts