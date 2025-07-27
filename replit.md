# NewsHub - News Website Application

## Overview

This is a full-stack news website application built with React, Express, and PostgreSQL. It provides a modern, responsive platform for publishing and reading news articles with features like categories, comments, search functionality, and an admin panel for content management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Homepage Layout Standardization (January 27, 2025)
- Implemented consistent 50%-50% layout across all category sections
- Each section now displays: 1 large featured article (left 50%) + 4 smaller articles in 2x2 grid (right 50%)
- Applied same layout to Latest News, Technology, Business, Health, Sports, and other categories
- Added additional Business articles to ensure all sections have 5 articles total
- Responsive design: sections stack vertically on mobile, side-by-side on desktop
- Enhanced with hover effects, category badges, and professional styling

### SEO Enhancement - Sitemap Implementation (January 27, 2025)
- Created dynamic XML sitemap at `/sitemap.xml` that automatically updates with new content
- Added robots.txt file at `/robots.txt` for search engine guidance
- Sitemap includes all pages: homepage, category pages, individual articles, search page
- Proper priority and change frequency settings for different page types
- Admin panel excluded from search engine indexing for security

## System Architecture

The application follows a monorepo structure with separate client and server directories, utilizing a shared schema layer for type safety across the full stack.

### Architecture Pattern
- **Frontend**: Single Page Application (SPA) using React with TypeScript
- **Backend**: RESTful API built with Express.js and Node.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build System**: Vite for frontend bundling and development server
- **Deployment**: Production build with esbuild for server bundling

## Key Components

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **TanStack Query** for server state management and caching
- **React Hook Form** with Zod validation for form handling
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design with proper HTTP status codes
- **Middleware-based** request processing with logging and error handling
- **CORS and security** considerations built-in

### Database Layer
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** as the primary database (configured for Neon serverless)
- **Schema-first** approach with shared types between client and server
- **Migration support** through Drizzle Kit

## Data Flow

### Client-Server Communication
1. **API Requests**: Client makes HTTP requests to `/api/*` endpoints
2. **Data Validation**: Server validates requests using Zod schemas
3. **Database Operations**: Server uses Drizzle ORM to interact with PostgreSQL
4. **Response Handling**: Client receives JSON responses and updates UI via React Query
5. **State Management**: TanStack Query handles caching, background updates, and optimistic updates

### Core Entities
- **Articles**: Main content with title, content, author, category, tags, and metadata
- **Comments**: User comments linked to articles
- **Categories**: Article categorization with slug-based routing

## External Dependencies

### Core Framework Dependencies
- **React ecosystem**: React, React DOM, React Hook Form
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state
- **UI Components**: Radix UI primitives with shadcn/ui wrapper components
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Form Validation**: Zod with React Hook Form resolvers

### Backend Dependencies
- **Server Framework**: Express.js with TypeScript support
- **Database**: Drizzle ORM with PostgreSQL driver (@neondatabase/serverless)
- **Development**: tsx for TypeScript execution, esbuild for production builds
- **Utilities**: Various utility libraries for date formatting, UUID generation

### Development Tools
- **Build Tools**: Vite for frontend, esbuild for backend
- **TypeScript**: Full type safety across the stack
- **Linting/Formatting**: TypeScript compiler for type checking
- **Database Tools**: Drizzle Kit for migrations and schema management

## Deployment Strategy

### Development Environment
- **Concurrent Development**: Vite dev server for frontend with HMR
- **Server**: tsx for running TypeScript server with auto-reload
- **Database**: Uses DATABASE_URL environment variable for connection
- **Replit Integration**: Special handling for Replit development environment

### Production Build
- **Frontend Build**: Vite builds optimized static assets to `dist/public`
- **Backend Build**: esbuild bundles server code to `dist/index.js`
- **Asset Serving**: Express serves static files in production
- **Environment Variables**: DATABASE_URL required for database connection

### Database Configuration
- **PostgreSQL**: Configured for Neon serverless database
- **Connection**: Uses connection string from DATABASE_URL environment variable
- **Migrations**: Drizzle migrations stored in `./migrations` directory
- **Schema**: Shared schema definition in `./shared/schema.ts`

The application is designed to be easily deployable to various platforms including Replit, Vercel, or traditional VPS hosting, with clear separation between development and production configurations.