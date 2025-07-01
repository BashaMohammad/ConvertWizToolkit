# ConvertWiz - JPG to PNG Converter

## Overview

ConvertWiz is a focused, client-side web application that specializes in converting JPG images to PNG format with perfect quality retention. The application features drag & drop functionality, daily usage limits for anonymous users, animated progress tracking, and optional watermarking capabilities.

## System Architecture

**Frontend-Only Architecture**
- Pure client-side application using vanilla HTML, CSS, and JavaScript
- No backend server required - all processing happens in the browser
- Static hosting compatible (can be deployed on any web server or CDN)

**Technology Stack:**
- HTML5 for structure
- Tailwind CSS for styling (CDN-based)
- Font Awesome for icons
- Vanilla JavaScript for functionality
- Canvas API for image processing

## Key Components

### 1. Drag & Drop Upload Interface
- Intuitive drag and drop file handling
- Visual feedback with hover animations and border glow effects
- Click-to-browse fallback functionality
- File validation (JPG/JPEG only, 10MB max size)

### 2. Daily Usage Limiting System
- LocalStorage-based tracking of daily conversions
- 3 free conversions per day for anonymous users
- Automatic reset at midnight
- Clear visual counter showing remaining conversions

### 3. Animated Progress Tracking
- Multi-stage progress animation (2-second duration)
- Visual progress bar with gradient effects and glow
- Step-by-step status messages during conversion
- Smooth transitions between conversion stages

### 4. High-Quality Image Processing
- Canvas API with imageSmoothingEnabled for quality retention
- Maintains original image dimensions and quality
- PNG output with maximum quality (1.0 quality factor)
- Side-by-side preview comparison with file size information

### 5. Optional Watermarking Feature
- Toggle switch for adding watermarks (default OFF)
- Subtle watermark placement with transparency
- Dynamic sizing based on image dimensions

## Data Flow

1. **File Upload Flow:**
   - User selects file via input element
   - File validation occurs client-side
   - FileReader API processes the file
   - Canvas element handles conversion
   - Result displayed with download option

2. **Conversion Process:**
   - Image loaded into canvas element
   - Format conversion performed using canvas.toDataURL()
   - New image generated and displayed
   - Download link created using blob URLs

## External Dependencies

- **Tailwind CSS** (CDN): `https://cdn.tailwindcss.com`
- **Font Awesome** (CDN): `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css`

**Rationale for CDN Usage:**
- Reduces bundle size and complexity
- Ensures latest versions
- Leverages browser caching
- Simplifies deployment

## Deployment Strategy

**Static Hosting Approach:**
- Application can be hosted on any static file server
- Compatible with GitHub Pages, Netlify, Vercel, or traditional web hosting
- No server-side processing required
- CDN-friendly for global distribution

**Performance Considerations:**
- Minimal resource requirements
- Fast loading times with CDN dependencies
- Client-side processing reduces server load
- Responsive images and lazy loading potential

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 01, 2025. Initial setup

## Development Notes

**Code Organization:**
- Modular JavaScript classes for each converter tool
- Separation of concerns between HTML structure, CSS styling, and JavaScript functionality
- Event-driven architecture for user interactions

**Future Enhancements:**
- Currency conversion API integration
- Additional image format support
- Batch processing capabilities
- Progressive Web App (PWA) features
- Offline functionality

**Browser Compatibility:**
- Modern browsers with Canvas API support
- FileReader API compatibility
- ES6+ JavaScript features used