# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development**: `npm run dev` - Start the Next.js development server
- **Build**: `npm run build` - Build the application for production
- **Lint**: `npm run lint` - Run ESLint to check code quality
- **Start**: `npm start` - Start the production server

Note: The README mentions `pnpm` but package.json uses `npm` scripts. Use npm for commands.

## Project Architecture

This is a Next.js 15 boilerplate with Supabase authentication and organization management, built with a feature-based architecture.

### Core Structure
```
src/
├── features/           # Feature-based organization
│   ├── auth/          # Authentication (login, register, logout)
│   ├── organization/  # Organization management with slug-based routing
│   └── admin/         # Admin interface and user management
├── app/               # Next.js App Router
├── components/ui/     # Shadcn/ui components
└── lib/              # Global utilities and Supabase configuration
```

### Key Features
- **Authentication**: Full Supabase Auth implementation with server actions
- **Organization Management**: Multi-tenant organization system with roles (owner, admin, manager, member)
- **Admin Interface**: User management with role-based access control
- **Feature-based Architecture**: Each domain (auth, organization, admin) is self-contained

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with SSR
- **UI**: Shadcn/ui components + Tailwind CSS v4
- **Validation**: Zod schemas for all forms and server actions
- **State Management**: React hooks + Next.js Server Actions

## Important Implementation Details

### Supabase Configuration
- Server client: `src/lib/supabase/server.ts` - Use for server actions
- Client client: `src/lib/supabase/client.ts` - Use for client-side operations
- Middleware: `middleware.ts` handles session management and admin route protection

### Organization System
- **Slug-based routing**: Organizations use slugs instead of IDs in URLs
- **Role hierarchy**: owner > admin > manager > member
- **Invitation system**: Token-based invitations with expiration
- **Settings management**: Configurable organization settings with validation

### Server Actions Pattern
- Located in `src/features/*/actions/`
- All actions use Zod validation
- Return standardized `ActionResult` interface
- Authentication checks are implemented in each action

### Database Schema
Key tables include:
- `user_profiles` - Extended user information with roles
- `organizations` - Organization data with slug and settings
- `organization_members` - User-organization relationships
- `organization_invitations` - Invitation system with tokens
- `organization_settings` - Configurable organization parameters

### Admin System
- Routes protected by middleware at `/admin`
- Role-based access control (admin, super_admin)
- User management interface with creation, editing, deletion
- Uses service role key for admin operations

### Development Guidelines
The project follows Cursor rules located in `.cursor/rules/`:
- Feature-based architecture with domain separation
- Server Actions for all mutations
- Zod validation for all inputs
- Security-first approach with authentication checks
- Shadcn/ui design system consistency

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Route Groups
- `(auth)` - Authentication pages
- `(dashboard)` - Main application routes
- `(admin)` - Admin interface
- `(landing)` - Landing/marketing pages

### Key Patterns
- All forms use react-hook-form with Zod resolvers
- Server actions follow the pattern: validate → authenticate → authorize → execute
- Organization context is handled through React Context providers
- Middleware handles session management and basic route protection