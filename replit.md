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
- Professional SaaS-style landing page with categorized tool showcase
- Three organized categories: Image Tools, Unit Converters, and Utility Tools
- Responsive grid layout with proper tool categorization and no duplicates
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

#### Global Land Unit Converter  
- International land measurement units from 7+ regions (Global, India, China, Japan, Taiwan, Nepal, Middle East, Latin America)
- 13+ land units including Acres, Square Meters, Hectares, Bigha, Gunta, Mu, Tsubo, Ping, Katha, Dunam, Cuerda
- Regional grouping with intelligent display for large values
- Real-time conversion with precise calculation formulas
- Backward compatibility with legacy HTML structure

#### Enhanced Instagram DP Resizer
- Smart 1:1 aspect ratio conversion to 320x320px Instagram profile pictures
- Drag & drop + manual upload support for JPG, PNG, WebP formats
- Auto-processing with aspect-fit sizing and center positioning
- Optional Instagram-style gradient background fill for non-square images
- Real-time preview with original vs processed comparison
- Enhanced file validation with 10MB size limit and format checking
- Toast notifications for user feedback and error handling
- Mobile-responsive canvas display and touch-friendly interface

#### Professional Word Counter
- Comprehensive text analysis with real-time statistics
- Word count, character count (with/without spaces), sentence and paragraph counting
- Reading time estimation based on 200 WPM average
- Progress indicators for word count milestones and character limits
- Platform-specific character limit guidelines (Twitter, LinkedIn, Facebook, etc.)
- Copy text, clear text, and sample text loading functionality
- Toast notifications for user feedback
- Mobile-responsive design with colorful statistical cards

#### Distance Converter
- Global distance unit conversion between 9 measurement systems
- Supports meters, kilometers, miles, feet, yards, inches, centimeters, millimeters, nautical miles
- Real-time conversion with intelligent number formatting
- Scientific notation for very small values, comma separation for large numbers
- Responsive grid layout with professional cyan/teal color scheme
- Clear functionality and toast notifications for user feedback
- Mobile-optimized input fields and dropdowns

#### Weight Converter
- Mass and weight unit conversion between 7 global measurement systems
- Supports grams, kilograms, pounds, ounces, milligrams, tons, stones
- Real-time conversion with intelligent number formatting and decimal precision
- Scientific notation for very small values, comma separation for large numbers
- Responsive grid layout with professional purple/violet color scheme
- Clear functionality and toast notifications for user feedback
- Mobile-optimized input fields and dropdowns with focus states

#### Height Converter
- Height and length unit conversion between 4 common measurement systems
- Supports feet, inches, centimeters, and meters for human height measurements
- Real-time conversion with precise decimal formatting optimized for height values
- Intelligent number formatting with appropriate precision for each unit type
- Responsive grid layout with professional indigo/blue color scheme
- Clear functionality and toast notifications for user feedback
- Mobile-optimized input fields and dropdowns with focus states

#### IP Address Extractor
- Advanced text processing tool for extracting IPv4 and IPv6 addresses from logs and text
- Robust regex patterns with validation for accurate IP address detection
- Supports both IPv4 (with range validation) and IPv6 (multiple format patterns)
- Groups results by IP version with counts and formatted display
- Copy functionality for extracted results with clipboard API integration
- "Get My IP Address" feature using ipify.org API for quick testing
- Auto-extraction after IP fetch for seamless user experience
- Professional emerald/green color scheme with enhanced UI feedback
- Large textarea input optimized for log file processing

#### QR Code Generator
- Professional QR code generation tool using QRious library for high-quality output
- Supports URLs, text, phone numbers, email addresses, and WiFi network configurations
- Real-time QR code preview with instant generation as user types
- Quick template buttons for common QR code types (URL, phone, email, WiFi)
- Download functionality for PNG format with timestamped filenames
- Copy to clipboard feature for direct image sharing
- Professional violet/purple color scheme with gradient styling
- Responsive two-column layout with dedicated preview section

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
- July 02, 2025. Added QR Code Generator tool and legal compliance pages (Privacy Policy and Terms of Use)
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