# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**n8n 中文社区** is a full-stack web application built with Start UI framework, serving as a Chinese community platform for n8n automation workflows. It provides workflow templates, tutorials, and community interaction features in Chinese.

## Core Technologies

- **Frontend**: Next.js 14.2.4, React 18.3.1, TypeScript 5.5.3, Chakra UI 2.8.2
- **Backend**: tRPC 10.45.2, Prisma 5.16.2, PostgreSQL
- **State Management**: TanStack Query 4.36.1, Zustand 4.5.4
- **Authentication**: Custom JWT + OAuth (GitHub, Google, Discord)
- **Testing**: Playwright (E2E), Vitest (unit), React Testing Library
- **Deployment**: Docker, Node.js 20+

## Quick Commands

### Development Setup
```bash
# Install dependencies (includes automatic schema generation and build info)
pnpm install

# Start database with Docker and initialize schema
pnpm dk:init

# Run development server (runs dev:next and dev:email in parallel)
pnpm dev

# Run tests
pnpm test          # Unit tests with Vitest
pnpm test:ci       # Unit tests in CI mode
pnpm test:ui       # Unit tests with Vitest UI
pnpm e2e           # E2E tests with Playwright
pnpm e2e:ui        # E2E tests with Playwright UI
```

### Database Operations
```bash
pnpm dk:start     # Start Docker services
pnpm dk:stop      # Stop Docker services
pnpm dk:clear     # Clear Docker volumes
pnpm db:init      # Initialize database (push schema + seed)
pnpm db:push      # Push schema changes to database
pnpm db:seed      # Seed database with initial data
pnpm db:ui        # Open Prisma Studio database UI
```

### Build & Production
```bash
pnpm build        # Build for production (runs build:info + next build)
pnpm start        # Start production server
pnpm lint         # Run linting (parallel: lint:next + lint:ts)
pnpm pretty       # Format code with Prettier
```

### Component Development
```bash
pnpm storybook           # Start Storybook on port 6006
pnpm storybook:build     # Build Storybook to /public/storybook
pnpm theme:generate-typing  # Update Chakra UI theme TypeScript types
pnpm theme:generate-icons   # Generate React components from SVG icons
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public-only)/      # Public routes (login/register)
│   ├── admin/              # Admin dashboard with auth layout
│   ├── api/                # API routes (tRPC, REST, RSS)
│   ├── app/                # Main app with authenticated layout
│   ├── devtools/           # Development tools (email preview)
│   └── oauth/              # OAuth callback routes
├── features/               # Feature modules
│   ├── account/            # Account management
│   ├── auth/               # Authentication system
│   ├── admin/              # Admin components
│   ├── admin-dashboard/    # Admin dashboard
│   ├── app/                # App layout and navigation
│   ├── app-home/           # Home page
│   ├── demo-mode/          # Demo mode components
│   ├── docs/               # API documentation
│   ├── management/         # Management navigation
│   ├── n8n-showcase/       # n8n workflow showcase
│   ├── repositories/       # Repository management
│   ├── users/              # User management
│   └── workflows/          # Workflow management
├── components/             # Reusable UI components
│   ├── Form/               # Form components with React Hook Form
│   ├── Icons/              # Icon system with SVG generation
│   ├── ui/                 # Base UI components
│   └── [Component]/        # Other components with Storybook stories
├── server/                 # Server-side logic
│   ├── config/             # Server configuration (auth, db, email, oauth)
│   └── routers/            # tRPC route handlers
├── lib/                    # Shared utilities
├── theme/                  # Chakra UI theme system
├── locales/                # i18n translations
└── emails/                 # Email templates
```

## Key Features

### Authentication System
- **Location**: `src/features/auth/`, `src/server/config/auth.ts`
- **Routes**: `/login`, `/register`, `/oauth/[provider]`
- **Methods**: Email/password verification codes, GitHub OAuth, Google OAuth, Discord OAuth
- **Session**: Custom JWT-based session management with configurable expiration
- **Security**: Password hashing with bcrypt, rate limiting, email verification

### Workflow Management
- **Location**: `src/features/workflows/`, `src/server/routers/workflows.ts`
- **Models**: Workflow, WorkflowLike, WorkflowTag
- **Categories**: CONTENT_AUTOMATION, SOCIAL_MEDIA, DATA_PROCESSING, COMMUNICATION, FINANCE, MARKETING, DEVELOPMENT, OTHER
- **Complexity**: SIMPLE, INTERMEDIATE, ADVANCED, BUSINESS
- **Trigger Types**: SCHEDULED, WEBHOOK, MANUAL, EMAIL, FILE_CHANGE, DATABASE_CHANGE, API_CALL, OTHER
- **Status**: DRAFT, PUBLISHED, ARCHIVED
- **Features**: View/download counts, like system, tag-based categorization, JSON workflow data storage

### User Management
- **Location**: `src/features/users/`, `src/server/routers/users.ts`
- **Roles**: USER, ADMIN
- **Status**: ACTIVE, INACTIVE, DELETED
- **Features**: Role-based access control, admin user management interface

### Repository Management
- **Location**: `src/features/repositories/`, `src/server/routers/repositories.ts`
- **Integration**: GitHub repositories for workflow code storage
- **Features**: Repository linking, admin management interface

## Database Schema

### Core Entities
- **User**: User accounts with role-based access (USER, ADMIN) and status tracking
- **Workflow**: n8n workflow templates with metadata, categories, complexity, and trigger types
- **WorkflowLike**: User likes on workflows with unique constraints
- **WorkflowTag**: Categorization tags with optional colors
- **Repository**: GitHub repositories for workflow storage and sharing
- **OAuthAccount**: Third-party OAuth connections for GitHub, Google, Discord

### Key Schema Features
- **Enums**: WorkflowCategory, WorkflowComplexity, WorkflowTriggerType, WorkflowStatus
- **Storage**: JSON fields for n8n workflow data, preview images
- **Analytics**: View count, download count, like count tracking
- **Security**: Cascading deletes, unique constraints, proper indexing

### Relationships
```
User → Workflow (1:N)      // User creates workflows
User → WorkflowLike (1:N)  // User likes workflows  
Workflow → WorkflowLike (1:N)  // Workflow has likes
Workflow → WorkflowTag (M:N)   // Workflows have multiple tags
User → Repository (1:N)   // User owns repositories
User → OAuthAccount (1:N) // User has OAuth connections
```

## API Architecture

### tRPC Routers
```typescript
appRouter = {
  auth: authRouter,
  account: accountRouter,
  users: usersRouter,
  workflows: workflowsRouter,
  repositories: repositoriesRouter,
  oauth: oauthRouter,
}
```

### API Features
- Type-safe endpoints with full TypeScript inference
- Automatic OpenAPI documentation at `/api/openapi.json`
- Request batching and caching
- Error handling middleware

## Development Environment

### Environment Variables
Key variables in `.env`:
- `DATABASE_URL`: PostgreSQL connection string (constructed from Docker vars)
- `NEXT_PUBLIC_BASE_URL`: App base URL for OAuth callbacks
- `NEXT_PUBLIC_ENV_NAME`: Environment name display (LOCAL, STAGING, PRODUCTION)
- `NEXT_PUBLIC_IS_DEMO`: Demo mode flag for read-only access
- `SESSION_EXPIRATION_SECONDS`: JWT session expiration (default 30 days)
- OAuth credentials: GITHUB_CLIENT_ID/SECRET, GOOGLE_CLIENT_ID/SECRET, DISCORD_CLIENT_ID/SECRET
- Email server: EMAIL_SERVER, EMAIL_FROM for development emails
- Aliyun email config: MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM

### Services
- **Database**: PostgreSQL 16.1 via Docker Compose on port 5432
- **Email**: Maildev for development email preview (localhost:1080)
- **Email Templates**: React Email templates at `http://localhost:3000/devtools/email/[template]`
- **Storybook**: Component development (localhost:6006)
- **Prisma Studio**: Database browser (pnpm db:ui)

### Testing
- **Unit Tests**: `src/**/*.test.ts(x)` with Vitest and React Testing Library
- **E2E Tests**: `e2e/**/*.spec.ts` with Playwright
- **Test Utils**: `src/tests/setup.ts`, `e2e/utils/`
- **Test Commands**: `pnpm test` (unit), `pnpm test:ci` (CI mode), `pnpm e2e` (E2E), `pnpm e2e:ui` (E2E with UI)

## Theme & Design System

### Chakra UI Theme
- **Location**: `src/theme/`
- **Components**: Custom component variants and styles
- **Foundations**: Colors, typography, spacing, shadows
- **RTL Support**: Right-to-left language support

### Icons
- **Custom Icons**: `src/components/Icons/svg-sources/`
- **Generation**: `pnpm theme:generate-icons`
- **Usage**: Import from `@/components/Icons`

## Internationalization

### Supported Languages
- **Primary**: Chinese (zh)
- **Secondary**: English (en)
- **Additional**: Arabic (ar), French (fr), Swedish (sw)

### Translation Files
- **Location**: `src/locales/[lang]/`
- **Namespaces**: account, admin, adminDashboard, app, appHome, auth, common, components, emails, management, n8nShowcase, repositories, users, workflows
- **Tools**: i18n Ally extension recommended with specific VS Code settings in README

### i18n Configuration
- **Library**: react-i18next with server-side and client-side configs
- **Language Detection**: Browser language detection with fallbacks
- **Namespaces**: Modular translation organization by feature
- **Type Safety**: TypeScript definitions for translation keys

## Common Development Tasks

### Adding a New Feature
1. Create feature module in `src/features/[feature-name]/`
2. Add tRPC router in `src/server/routers/[feature].ts`
3. Update `src/server/router.ts` to include new router
4. Add Prisma model in appropriate schema file (`prisma/schema/[feature].prisma`)
5. Create components in feature module with proper routing
6. Add translations to `src/locales/[lang]/[feature].json`
7. Add tests (unit tests in `src/features/[feature-name]/`, E2E tests in `e2e/`)

### Adding a New Component
1. Create component in `src/components/[ComponentName]/`
2. Add Storybook stories in `docs.stories.tsx`
3. Add TypeScript types and proper exports
4. Add tests in `[ComponentName].spec.tsx` using React Testing Library
5. Export from `src/components/index.ts`

### Database Changes
1. Update Prisma schema in appropriate file (`prisma/schema/[feature].prisma`)
2. Run `pnpm db:push` to apply changes to database
3. Update seed data in `prisma/seed/index.ts`
4. Update TypeScript types by running `pnpm install` (generates Prisma client)
5. Update tRPC routers to use new schema

### Adding OAuth Provider
1. Add provider configuration in `src/server/config/oauth/providers/[provider].ts`
2. Update `src/server/config/oauth/index.ts` to include provider
3. Update `src/features/auth/oauth-config.ts` with provider settings
4. Add environment variables for client ID/secret in `.env`

## Deployment

### Docker Production
```bash
docker build -t start-ui-web .
docker run -p 80:3000 start-ui-web
```

### Production Build Process
```bash
pnpm install                    # Install dependencies
pnpm storybook:build           # Optional: Build Storybook to /public/storybook
pnpm build                     # Build Next.js application with build info
pnpm start                     # Start production server
```

### Environment Setup
- **Required**: `DATABASE_URL`, OAuth credentials (GitHub, Google, Discord)
- **Optional**: Email server configuration, Aliyun email settings
- **Monitoring**: `NEXT_PUBLIC_ENV_NAME`, `NEXT_PUBLIC_ENV_EMOJI`, `NEXT_PUBLIC_ENV_COLOR_SCHEME` for environment display
- **Demo Mode**: `NEXT_PUBLIC_IS_DEMO` for read-only access

## Troubleshooting

### Common Issues
- **Database connection**: Check `DATABASE_URL` and ensure Docker services are running (`pnpm dk:start`)
- **OAuth issues**: Verify client IDs/secrets in `.env` and ensure redirect URIs match
- **Build failures**: Check TypeScript errors with `pnpm lint:ts` and dependency issues
- **Test failures**: Ensure database is running for E2E tests (`pnpm dk:start`)
- **Email issues**: Check Maildev is running on localhost:1080 for development

### Debug Tools
- **Prisma Studio**: `pnpm db:ui` - Database browser and management
- **Maildev UI**: `http://localhost:1080` - Development email preview
- **Email Templates**: `http://localhost:3000/devtools/email/[template]` - React Email template preview
- **Storybook**: `http://localhost:6006` - Component development and testing
- **OpenAPI Docs**: `/api/openapi.json` - Auto-generated API documentation
- **tRPC Playground**: Available through tRPC endpoints for API testing