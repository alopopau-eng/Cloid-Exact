# replit.md

## Overview

This is an Arabic-language insurance application for "التعاونية" (Tawuniya), a Saudi insurance company. The application allows users to submit insurance applications for various types of coverage including car insurance, health insurance, general insurance, and protection/savings products. The interface is designed with right-to-left (RTL) support for Arabic language users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Framework**: Express.js 5.x running on Node.js
- **Language**: TypeScript with ESM modules
- **API Structure**: RESTful endpoints under `/api` prefix
- **Development Server**: Vite dev server proxied through Express for HMR support

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Validation**: Zod schemas with drizzle-zod integration for type-safe validation
- **Database Migrations**: Drizzle Kit with migrations output to `./migrations`

### Project Structure
```
├── client/           # React frontend application
│   └── src/
│       ├── components/ui/  # shadcn/ui components
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Utility functions and query client
│       └── pages/          # Page components
├── server/           # Express backend
│   ├── db.ts         # Database connection
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Data access layer
│   └── index.ts      # Server entry point
├── shared/           # Shared code between client and server
│   └── schema.ts     # Database schemas and Zod validators
└── script/           # Build scripts
```

### Key Design Decisions

1. **Monorepo Structure**: Client and server share TypeScript types through the `shared/` directory, ensuring type safety across the full stack.

2. **Component Library**: Using shadcn/ui provides accessible, customizable components that can be modified directly in the codebase rather than being locked in node_modules.

3. **RTL Support**: The application is configured for Arabic with `dir="rtl"` and uses the Tajawal font family for proper Arabic text rendering.

4. **Storage Abstraction**: The `IStorage` interface in `storage.ts` abstracts database operations, making it easier to swap implementations if needed.

## External Dependencies

### Database
- **PostgreSQL**: Primary database accessed via `DATABASE_URL` environment variable
- **Connection**: Uses `pg` Pool for connection management

### UI Dependencies
- **Radix UI**: Headless UI primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Fonts
- **Google Fonts**: Tajawal (Arabic) and Inter (Latin) fonts loaded from Google Fonts CDN

### Development Tools
- **Replit Plugins**: Custom Vite plugins for Replit integration (cartographer, dev-banner, runtime-error-modal)