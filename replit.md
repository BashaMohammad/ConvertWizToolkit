# ConvertWiz - Multi-Tool Converter Suite

## Overview

ConvertWiz is a comprehensive, client-side SaaS application offering multiple conversion tools through a professional single-page application with routing. The platform provides JPG to PNG conversion, currency conversion, land unit conversion, and Instagram profile picture resizing - all accessible through dedicated pages with smooth navigation.

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

## System Architecture

### 1. Client-Side Routing System
- Single-page application with JavaScript-based routing
- Five main routes: `/` (home), `/jpg-to-png`, `/currency`, `/land`, `/dp-resizer`
- History API integration for proper back/forward navigation
- Modular page system with dynamic tool initialization

### 2. Homepage & Navigation
- Professional SaaS-style landing page with tool showcase
- Responsive grid layout displaying 4 conversion tools as interactive cards
- Sticky navigation header with desktop and mobile menu support
- Feature highlight section emphasizing speed, privacy, and mobile compatibility

### 3. Individual Tool Pages
- Dedicated pages for each converter tool with focused UI
- Isolated tool logic preventing interference between converters
- Consistent branding and navigation across all pages
- Tool-specific styling and functionality preservation

### 4. Tool Components

#### JPG to PNG Converter
- Bulk upload support with drag & drop interface
- Daily usage limits (3 conversions per day)
- Individual result cards for each converted image
- Optional watermarking with quality retention
- Progress tracking with real-time status updates

#### Currency Converter
- Real-time exchange rates from exchangerate.host API
- 150+ currency support with dynamic dropdown population
- Live rate display and conversion history
- Fallback currency list for offline functionality

#### Land Unit Converter  
- Indian land measurement units (Acres, Gunta, Square Feet, Bigha)
- Real-time conversion with precise calculation formulas
- Simultaneous display of all unit conversions

#### Instagram DP Resizer
- 320x320px Instagram profile picture optimization
- Aspect ratio preservation with center cropping
- Quality retention during resize process

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