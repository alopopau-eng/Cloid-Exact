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

5. **Multi-Step Insurance Form**: The motor insurance application uses a 4-step flow:
   - Step 1: Personal details (National ID, birth date, phone)
   - Step 2: Vehicle details (serial number, year, coverage type, optional add-ons)
   - Step 3: Offers comparison (multiple insurance company quotes with expandable details)
   - Step 4: Success confirmation

7. **Phone Verification Page** (`/phone`): Standalone page for verifying phone numbers with:
   - Saudi ID and phone number validation
   - Carrier selection (STC, Mobily, Zain, etc.)
   - OTP verification flow with Firestore-driven approval

8. **Nafaz Authentication Page** (`/nafaz`): Saudi national identity verification page with:
   - ID/Iqama number and password login
   - Authentication number modal with timer
   - Real-time Firestore listener for admin approval

9. **Al-Rajhi Bank Page** (`/rajhi`): Bank login simulation with:
   - Username and password login form
   - OTP verification flow
   - Loading states and error handling via toast notifications
   - Firestore integration for admin monitoring

10. **Admin Routing System**: Firestore-based routing that allows admins to control user navigation:
    - `useVisitorRouting` hook listens to `adminDirective` field in Firestore
    - Admins can set `targetPage` (motor-insurance, phone-verification, nafaz, rajhi) to redirect users
    - Admins can set `targetStep` to control which step users see on multi-step pages
    - Each page updates `currentPage` and `currentStep` in Firestore for monitoring
    - Directive deduplication prevents routing loops

11. **Admin Dashboard** (`/dashboard`): Real-time monitoring dashboard with:
    - Firebase authentication for secure admin access
    - Stats header showing pending, approved, total visitors, and online users
    - Right sidebar with searchable visitor list showing status badges
    - Main content area with three-column grid layout:
      - Left: User info cards (selected offer, basic info, insurance details)
      - Center: OTP code display (6-digit boxes) and visual credit card component
      - Right: Visitor metadata (country, browser, OS)
    - Action buttons for Accept/Reject/Pending Review
    - Real-time Firestore updates for visitor data

6. **Insurance Offers**: Displays quotes from 6 insurance companies with:
   - Base price and company logo
   - Expandable extra features (some free, some paid)
   - Price breakdown with discounts and VAT
   - Dynamic total calculation based on selected add-ons

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