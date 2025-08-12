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
# Install dependencies
pnpm install

# Start database with Docker
pnpm dk:init

# Run development server
pnpm dev

# Run tests
pnpm test          # Unit tests
pnpm test:ui       # Unit tests with UI
pnpm e2e          # E2E tests
pnpm e2e:ui       # E2E tests with UI
```

### Database Operations
```bash
pnpm dk:start     # Start Docker services
pnpm dk:stop      # Stop Docker services
pnpm dk:clear     # Clear Docker volumes
pnpm db:push      # Push schema changes
pnpm db:seed      # Seed database
pnpm db:ui        # Prisma Studio
```

### Build & Production
```bash
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run linting
pnpm pretty       # Format code
```

### Component Development
```bash
pnpm storybook           # Start Storybook
pnpm storybook:build     # Build Storybook
pnpm theme:generate-typing  # Update theme types
pnpm theme:generate-icons   # Generate icon components
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public-only)/      # Public routes (login/register)
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes (tRPC, REST)
│   └── app/                # Main app (authenticated)
├── features/               # Feature modules
│   ├── auth/               # Authentication
│   ├── workflows/          # Workflow management
│   ├── repositories/       # Repository management
│   ├── users/              # User management
│   └── account/            # Account settings
├── components/             # Reusable UI components
├── server/                 # Server-side logic
│   ├── routers/            # tRPC route handlers
│   └── config/             # Server configuration
├── lib/                    # Shared utilities
├── theme/                  # Chakra UI theme system
└── locales/                # i18n translations
```

## Key Features

### Authentication System
- **Location**: `src/features/auth/`
- **Routes**: `/login`, `/register`, `/oauth/[provider]`
- **Methods**: Email/password, GitHub OAuth, Google OAuth, Discord OAuth

### Workflow Management
- **Location**: `src/features/workflows/`
- **Models**: Workflow, WorkflowLike, WorkflowTag
- **Categories**: Content automation, social media, data processing
- **Complexity**: Simple, medium, advanced, business

### User Management
- **Location**: `src/features/users/`
- **Roles**: USER, ADMIN
- **Status**: ACTIVE, INACTIVE, DELETED

### Repository Management
- **Location**: `src/features/repositories/`
- **Integration**: GitHub repositories
- **Purpose**: Store and share workflow code

## Database Schema

### Core Entities
- **User**: User accounts with role-based access
- **Workflow**: n8n workflow templates with metadata
- **WorkflowLike**: User likes on workflows
- **WorkflowTag**: Categorization tags
- **Repository**: GitHub repositories for workflow storage
- **OAuthAccount**: Third-party OAuth connections

### Relationships
```
User → Workflow (1:N)
User → WorkflowLike (1:N)
Workflow → WorkflowLike (1:N)
Workflow → WorkflowTag (M:N)
User → Repository (1:N)
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
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_BASE_URL`: App base URL
- OAuth credentials for GitHub, Google, Discord
- Email server configuration
- Demo mode flags

### Services
- **Database**: PostgreSQL via Docker Compose
- **Email**: Maildev for development (localhost:1080)
- **Storybook**: Component development (localhost:6006)

### Testing
- **Unit Tests**: `src/**/*.test.ts(x)` with Vitest
- **E2E Tests**: `e2e/**/*.spec.ts` with Playwright
- **Test Utils**: `src/tests/setup.ts`, `e2e/utils/`

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
- **Namespaces**: auth, common, workflows, repositories, etc.
- **Tools**: i18n Ally extension recommended

## Common Development Tasks

### Adding a New Feature
1. Create feature module in `src/features/[feature-name]/`
2. Add tRPC router in `src/server/routers/`
3. Add Prisma model if needed
4. Create components in feature module
5. Add translations to locale files
6. Add tests

### Adding a New Component
1. Create component in `src/components/[ComponentName]/`
2. Add Storybook stories in `docs.stories.tsx`
3. Add tests if needed
4. Export from `src/components/index.ts`

### Database Changes
1. Update Prisma schema in `prisma/schema/`
2. Run `pnpm db:push` to apply changes
3. Update seed data in `prisma/seed/`
4. Add migration guide if needed

## Deployment

### Docker Production
```bash
docker build -t n8n-zh .
docker run -p 3000:3000 n8n-zh
```

### Environment Setup
- Required: `DATABASE_URL`, OAuth credentials
- Optional: Email server, CDN configuration
- Monitoring: `NEXT_PUBLIC_ENV_NAME` for environment display

## Troubleshooting

### Common Issues
- **Database connection**: Check `DATABASE_URL` and Docker services
- **OAuth issues**: Verify client IDs/secrets in `.env`
- **Build failures**: Check TypeScript errors and dependencies
- **Test failures**: Ensure database is running for E2E tests

### Debug Tools
- **Prisma Studio**: `pnpm db:ui`
- **Maildev UI**: `http://localhost:1080`
- **Email Templates**: `http://localhost:3000/devtools/email/[template]`
- **Storybook**: `http://localhost:6006`