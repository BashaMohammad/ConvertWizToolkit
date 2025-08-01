# ConvertWiz - Multi-Tool Converter Suite

## Overview
ConvertWiz is a comprehensive, full-stack SaaS application offering 13+ conversion tools through a professional single-page application. The platform provides diverse tools including image conversion, currency conversion, land unit conversion, Instagram profile picture resizing, percentage calculations, temperature conversions, color format conversions, image compression, IP address extraction, QR code generation, and text processing. It aims to be a go-to solution for various conversion needs, accessible via dedicated pages with smooth navigation and backend API integration.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

**Full-Stack Architecture:**
- Frontend: Vanilla HTML, CSS, and JavaScript with Canvas API for image processing.
- Backend: Node.js Express server with Firebase Admin SDK integration.
- Hybrid processing: Client-side calculations with backend API enhancement.
- Static asset serving with dynamic API endpoints.

**Technology Stack:**
- HTML5 for structure.
- Tailwind CSS for styling (CDN-based).
- Font Awesome for icons.
- Vanilla JavaScript for functionality.
- Node.js Express backend server.
- Firebase Admin SDK for secure server-side operations.
- Canvas API for image processing.
- Chart.js for visualizations.

**UI/UX Decisions:**
- Professional SaaS-style landing page with categorized tool showcase.
- Responsive grid layout with proper tool categorization.
- Sticky navigation header with desktop and mobile menu support.
- Consistent branding and navigation across all pages.
- Professional gradient color schemes (e.g., cyan/teal, purple/violet, emerald/green).
- Glass morphism effects and hover animations.
- Modern 3-column pricing card layout.

**System Design Choices:**
- **Client-Side Routing System:** Single-page application with JavaScript-based routing and History API integration for navigation. Modular page system with dynamic tool initialization.
- **Homepage & Navigation:** Categorized tool showcase (Image Tools, Unit Converters, Utility Tools).
- **Individual Tool Pages:** Dedicated pages for each converter tool with isolated logic and consistent branding.
- **Authentication System:** Email/Password and Google OAuth authentication, user session management (localStorage), responsive login modal, user greeting system, error handling.
- **Usage Tracking System:** Firestore-based subscription plan management (Free, Standard, Premium), daily usage limits with automatic reset, real-time usage display, cross-device synchronization.
- **Admin Dashboard:** Multi-admin access with real-time analytics (users, plan breakdown, conversion statistics), user management, activity monitoring, and Chart.js visualizations.
- **Pricing System:** Clear plan tiers (Free, Standard, Premium) with feature differentiation, current plan detection, and payment integration readiness.
- **Google AdSense Integration:** Strategic, non-intrusive ad placement in high-engagement areas, production-only loading, responsive ad units.
- **Backend API Integration:** Node.js Express server for enhanced functionality including SEO metadata, component lists, and various tool-specific calculations (Percentage, Temperature, Color, Image Compression). Includes Firebase Admin SDK for secure operations and API fallback system.
- **Dedicated Webhook Server Architecture:** Standalone webhook server for Razorpay integration to ensure reliability and independent scaling, forwarding to main app API.
- **Blog System:** SEO-optimized articles under `/blog/` with index page, individual articles, structured data, internal linking, responsive design, and professional formatting.

## External Dependencies

- **Tailwind CSS** (CDN): `https://cdn.tailwindcss.com`
- **Font Awesome** (CDN): `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css`
- **exchangerate.host API**: For real-time currency exchange rates.
- **ipify.org API**: For "Get My IP Address" feature.
- **QRious library**: For QR code generation.
- **Sharp library**: Used in backend for image compression.
- **Chart.js**: For data visualization in the admin dashboard.
- **Firebase Authentication**: For user authentication.
- **Google Firestore**: For user usage tracking and subscription management.
- **Razorpay**: For payment processing (integration ready).
- **Google AdSense**: For monetization.
- **Google Analytics**: For tracking and analytics.
- **PostgreSQL Database**: For persistent URL storage in the URL Shortener tool (via Drizzle ORM).
- **PayPal.Me links**: For international payment options.