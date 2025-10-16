# Recipe Manager - Agentic Coder Instructions

**AI-Powered Recipe Generator & Meal Planning Application**

Built with Next.js 15, TypeScript, Clerk Auth, Neon PostgreSQL, and OpenRouter AI

---

## Quick Navigation

- **Project Overview**: README.md
- **Roadmap**: ROADMAP.md
- **Mobile Parity**: docs/guides/MOBILE_PARITY_REQUIREMENTS.md (🔴 CURRENT PRIORITY)
- **Project Organization**: docs/reference/PROJECT_ORGANIZATION.md
- **Authentication**: docs/guides/AUTHENTICATION_GUIDE.md
- **Environment Setup**: docs/guides/ENVIRONMENT_SETUP.md
- **Deployment**: OPS.md (see below)
- **Database Schema**: src/lib/db/schema.ts
- **API Routes**: src/app/api/

---

## Priority Rankings Legend

- 🔴 **CRITICAL** - Core functionality, security, or data integrity
- 🟡 **HIGH** - Important features, performance, user experience
- 🟢 **MEDIUM** - Enhancement, optimization, nice-to-have
- ⚪ **LOW** - Documentation, refactoring, cleanup

---

## Project Structure Requirements

All code changes MUST follow the project organization standard defined in:
**docs/reference/PROJECT_ORGANIZATION.md**

Key organizational principles:
- Documentation files go in `docs/` subdirectories (guides/, reference/, api/)
- Temporary files and logs go in `tmp/` (never at project root)
- Scripts go in `scripts/` directory
- Follow Next.js App Router conventions for src/ structure
- Use feature-based component organization

When in doubt about file placement, consult PROJECT_ORGANIZATION.md.

---

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.5.3 (App Router, Server Actions, Turbopack)
- **Language**: TypeScript 5 (Strict mode enabled)
- **Authentication**: Clerk (Dual-environment: dev + production on localhost)
- **Database**: Neon PostgreSQL (Serverless)
- **ORM**: Drizzle ORM 0.44.5 + Drizzle Kit 0.31.4
- **AI Integration**: OpenRouter API (multi-LLM support)
- **UI Framework**: Tailwind CSS v4 + shadcn/ui components
- **State Management**: React Hook Form + Zod validation
- **Package Manager**: pnpm
- **Dev Port**: 3004 (configured in package.json)

### Project Structure
```
recipe-manager/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── recipes/       # Recipe CRUD operations
│   │   │   ├── meal-plans/    # Meal planning endpoints
│   │   │   ├── shopping-lists/# Shopping list generation
│   │   │   ├── clerk-config/  # Clerk configuration proxy
│   │   │   ├── clerk-proxy/   # Clerk API proxy for dual-env
│   │   │   └── security-audit/# Security validation endpoint
│   │   ├── recipes/           # Recipe pages
│   │   ├── meal-plans/        # Meal planning UI
│   │   ├── shopping-lists/    # Shopping list UI
│   │   ├── discover/          # Recipe discovery (system recipes)
│   │   ├── shared/            # Shared public recipes
│   │   ├── sign-in/           # Clerk sign-in page
│   │   ├── sign-up/           # Clerk sign-up page
│   │   └── user-profile/      # User profile management
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui base components
│   │   ├── auth/             # Authentication components
│   │   ├── recipe/           # Recipe-specific components
│   │   ├── meal-plan/        # Meal planning components
│   │   ├── shopping-list/    # Shopping list components
│   │   └── providers/        # React context providers
│   ├── lib/                   # Core utilities
│   │   ├── ai/               # AI/LLM integration
│   │   │   ├── openrouter.ts        # Client-side OpenRouter
│   │   │   ├── openrouter-server.ts # Server-side OpenRouter
│   │   │   └── recipe-generator.ts  # Recipe AI logic
│   │   ├── db/               # Database
│   │   │   ├── index.ts      # Database connection
│   │   │   └── schema.ts     # Drizzle schema definitions
│   │   ├── security/         # Security utilities
│   │   │   └── auth-validator.ts # Auth validation
│   │   ├── utils/            # Utility functions
│   │   ├── auth.ts           # Auth utilities
│   │   ├── auth-config.ts    # Auth configuration
│   │   └── clerk-proxy.ts    # Clerk proxy utilities
│   ├── config/               # Configuration files
│   │   ├── auth.config.ts    # Authentication config
│   │   └── clerk-dev.ts      # Clerk dev environment config
│   ├── types/                # TypeScript type definitions
│   └── middleware.ts         # Next.js middleware (Clerk auth)
├── scripts/                   # Utility scripts
│   ├── init-db.ts            # Database initialization
│   ├── cleanup-unused-tables.ts  # Database cleanup
│   ├── populate-system-recipes.ts # System recipe seeding
│   ├── validate-auth.js      # Auth validation script
│   └── test-production-keys.js   # Production key testing
├── drizzle/                   # Database migrations
└── docs/                      # Extended documentation
```

### Key Features
- 🔴 AI Recipe Generation (OpenRouter API with multiple LLM models)
- 🔴 User Authentication (Clerk dual-environment setup)
- 🔴 Recipe Library (CRUD operations with PostgreSQL)
- 🟡 Meal Planning (Drag-and-drop interface with @dnd-kit)
- 🟡 Shopping Lists (Auto-generation from meal plans)
- 🟡 Recipe Import (URL-based recipe extraction)
- 🟡 Recipe Sharing (Public/private visibility)
- 🟢 Nutritional Information Tracking
- 🟢 Multi-image Support (up to 6 images per recipe)
- 🟢 System/Curated Recipes (Discover page)
- 🟢 Recipe Export (PDF, JSON, Markdown, ZIP)

### 🔴 Current Priority: Version 0.45.0 - Mobile Parity
**See**: `ROADMAP.md` and `docs/guides/MOBILE_PARITY_REQUIREMENTS.md`

Before adding more advanced features, we're ensuring the existing desktop experience works flawlessly on mobile devices. Mobile users represent 60-70% of recipe site traffic, and they often cook with their phones/tablets in hand.

**Focus Areas**:
- Responsive layouts (mobile-first approach)
- Touch optimization (44x44px minimum targets)
- Mobile navigation (hamburger menu, bottom nav)
- Performance optimization (< 200KB bundle, 90+ Lighthouse score)
- Real device testing (iOS, Android)

---

## Single-Path Workflows

### Development
```bash
# ONE way to install dependencies
pnpm install

# ONE way to run development server
pnpm dev
# OR (for Makefile users)
make dev

# Opens on: http://localhost:3004
```

### Database Operations
```bash
# ONE way to initialize database
pnpm db:push

# ONE way to manage database schema
pnpm db:studio        # Open Drizzle Studio
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations

# ONE way to seed system recipes
pnpm db:seed:system
```

### Authentication Validation
```bash
# ONE way to validate auth setup
pnpm auth:validate

# ONE way to test production keys on localhost
node scripts/test-production-keys.js
```

### Building & Deployment
```bash
# ONE way to build for production
pnpm build
# OR
make build

# ONE way to start production server
pnpm start
# OR
make start
```

### Code Quality (🟢 TO BE IMPLEMENTED)
```bash
# Planned single-path quality commands
make lint          # Run linting
make lint-fix      # Auto-fix lint issues
make typecheck     # TypeScript type checking
make format        # Format code
make test          # Run all tests
make quality       # Run all quality checks
```

---

## Critical Configuration Files

### 🔴 Environment Variables (.env.local)
```env
# Database
DATABASE_URL=postgresql://...              # Neon PostgreSQL connection

# AI Integration
OPENROUTER_API_KEY=sk-or-...              # OpenRouter API key
NEXT_PUBLIC_APP_URL=http://localhost:3004 # Application URL

# Clerk Authentication (Development Environment)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... # Dev publishable key
CLERK_SECRET_KEY=sk_test_...                   # Dev secret key

# Clerk Authentication (Production Environment on Localhost)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD=pk_live_... # Prod publishable key
CLERK_SECRET_KEY_PROD=sk_live_...                   # Prod secret key

# Clerk Configuration
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

See: `.env.local.example` for full configuration template

### 🔴 Database Schema (src/lib/db/schema.ts)
```typescript
// Primary tables:
- recipes          // User recipes with AI generation support
- mealPlans        // Weekly meal planning
- mealPlanRecipes  // Many-to-many relationship
- shoppingLists    // Generated shopping lists

// Key fields:
- userId (Clerk ID) // User ownership
- isAiGenerated     // AI-generated recipe flag
- isPublic          // Public visibility
- isSystemRecipe    // Curated/system recipe flag
```

### 🟡 TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "strict": true,           // Strict mode enabled
    "target": "ES2017",
    "module": "esnext",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]      // Path alias for imports
    }
  }
}
```

### 🟡 Drizzle Configuration (drizzle.config.ts)
```typescript
export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```

---

## Authentication Architecture

### 🔴 Dual-Environment Clerk Setup
The application supports **TWO Clerk environments simultaneously on localhost**:
1. **Development Environment** (pk_test_*, sk_test_*)
2. **Production Environment** (pk_live_*, sk_live_*)

### Environment Detection
Environment selection is controlled by:
- **URL Parameter**: `?env=prod` or `?env=dev`
- **Local Storage**: Persists environment choice
- **Default**: Development environment

### Key Files
- `src/middleware.ts` - Clerk middleware with dynamic configuration
- `src/components/auth/AuthProvider.tsx` - Client-side environment switcher
- `src/lib/auth-config.ts` - Auth configuration logic
- `src/lib/clerk-proxy.ts` - Clerk API proxy utilities
- `src/app/api/clerk-config/route.ts` - Configuration endpoint
- `src/app/api/clerk-proxy/[...path]/route.ts` - API proxy

### Authentication Flow
1. User visits site → Middleware detects environment
2. Appropriate Clerk keys loaded (dev or prod)
3. User signs in → Clerk session established
4. Server actions validate userId from Clerk
5. Database operations scoped to userId

See: `AUTHENTICATION_GUIDE.md` for detailed setup

---

## Database Architecture

### 🔴 Core Tables

#### recipes
```typescript
{
  id: string (UUID)
  userId: string (Clerk user ID)
  name: string
  description: string
  ingredients: string (JSON array)
  instructions: string (JSON array)
  prepTime: number (minutes)
  cookTime: number (minutes)
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine: string
  tags: string (JSON array)
  images: string (JSON array, max 6 URLs)
  isAiGenerated: boolean
  isPublic: boolean
  isSystemRecipe: boolean
  nutritionInfo: string (JSON object)
  modelUsed: string (AI model identifier)
  source: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### mealPlans
```typescript
{
  id: string (UUID)
  userId: string
  name: string
  startDate: timestamp
  endDate: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### mealPlanRecipes
```typescript
{
  id: string (UUID)
  mealPlanId: string
  recipeId: string
  dayOfWeek: number (0-6)
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  createdAt: timestamp
}
```

#### shoppingLists
```typescript
{
  id: string (UUID)
  userId: string
  mealPlanId: string (nullable)
  name: string
  items: string (JSON array)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 🟡 Database Operations
- **Connection**: Neon PostgreSQL serverless via Drizzle ORM
- **Migrations**: Automatic with `drizzle-kit push`
- **Studio**: Web UI via `pnpm db:studio` (port 4983)
- **Validation**: Zod schemas generated from Drizzle schemas

---

## AI Integration

### 🔴 OpenRouter Configuration
- **API**: OpenRouter.ai (supports 200+ LLM models)
- **Primary Model**: google/gemini-2.0-flash-exp:free
- **Fallback Models**: anthropic/claude-3.5-sonnet, openai/gpt-4o
- **Use Cases**:
  - Recipe generation from ingredients
  - Recipe generation from description
  - Recipe URL extraction and parsing
  - Nutritional information estimation

### Implementation Files
- `src/lib/ai/openrouter.ts` - Client-side API wrapper
- `src/lib/ai/openrouter-server.ts` - Server-side API wrapper
- `src/lib/ai/recipe-generator.ts` - Recipe generation logic
- `src/app/actions/ai-recipes.ts` - Server actions for AI operations

### API Key Management
- **Environment Variable**: `OPENROUTER_API_KEY`
- **Server-Side Only**: API key never exposed to client
- **Rate Limiting**: Handled by OpenRouter (varies by model)

---

## UI Component System

### 🟡 shadcn/ui Components
Base components in `src/components/ui/`:
- Button, Input, Label, Select
- Dialog, AlertDialog, Popover
- Tabs, Switch, Checkbox
- Command (cmdk for search)

### 🟡 Custom Components

#### Recipe Components (`src/components/recipe/`)
- RecipeCard - Recipe display card
- RecipeForm - Recipe creation/edit form
- RecipeList - Recipe grid/list view
- RecipeGenerator - AI recipe generation UI

#### Meal Plan Components (`src/components/meal-plan/`)
- MealPlanCalendar - Weekly calendar view
- MealPlanCard - Meal plan card
- DragDropInterface - Drag-and-drop meal assignment

#### Shopping List Components (`src/components/shopping-list/`)
- ShoppingListCard - Shopping list display
- ShoppingListGenerator - Auto-generation from meal plans

---

## Server Actions

### 🔴 Recipe Actions (`src/app/actions/recipes.ts`)
```typescript
- createRecipe(recipe: NewRecipe)
- updateRecipe(id: string, recipe: Partial<Recipe>)
- deleteRecipe(id: string)
- getRecipeById(id: string)
- getUserRecipes(userId: string)
- getPublicRecipes()
- getSystemRecipes()
```

### 🔴 AI Recipe Actions (`src/app/actions/ai-recipes.ts`)
```typescript
- generateRecipeFromIngredients(ingredients: string[], preferences)
- generateRecipeFromDescription(description: string)
- estimateNutrition(recipe: Recipe)
```

### 🟡 Recipe Import Actions (`src/app/actions/recipe-import.ts`)
```typescript
- importRecipeFromUrl(url: string)
```

### 🟡 Recipe Export Actions (`src/app/actions/recipe-export.ts`)
```typescript
- exportRecipeAsPdf(recipe: Recipe)
- exportRecipeAsJson(recipe: Recipe)
- exportRecipeAsMarkdown(recipe: Recipe)
- exportMultipleRecipes(recipes: Recipe[], format: string)
```

---

## API Routes

### 🔴 Authentication Routes
- `/api/clerk-config` - GET: Returns Clerk configuration for current environment
- `/api/clerk-proxy/[...path]` - ALL: Proxies Clerk API requests with environment awareness
- `/api/debug-clerk` - GET: Debug endpoint for Clerk configuration
- `/api/security-audit` - GET: Security validation and environment audit

### 🟡 Recipe Routes
- `/api/recipes` - GET: List recipes, POST: Create recipe
- `/api/recipes/[id]` - GET: Get recipe, PUT: Update, DELETE: Delete

### 🟡 Meal Plan Routes
- `/api/meal-plans` - GET: List meal plans, POST: Create
- `/api/meal-plans/[id]` - GET/PUT/DELETE: Manage meal plan

### 🟡 Shopping List Routes
- `/api/shopping-lists` - GET: List, POST: Create
- `/api/shopping-lists/[id]` - GET/PUT/DELETE: Manage shopping list

---

## Development Guidelines

### 🔴 Critical Rules
1. **Never commit secrets** - Use `.env.local` (gitignored)
2. **Always validate userId** - Check Clerk auth in server actions
3. **Use server actions** - Prefer over API routes for mutations
4. **Type safety** - Use Zod schemas for validation
5. **Database transactions** - Use Drizzle's transaction API for multi-table operations

### 🟡 Best Practices
1. **Component structure**: Use shadcn/ui patterns
2. **File organization**: Group by feature, not by type
3. **Error handling**: Use try-catch with user-friendly messages
4. **Loading states**: Always provide feedback during async operations
5. **Accessibility**: Use semantic HTML and ARIA attributes

### 🟢 Code Style
1. **Imports**: Group by external → internal → relative
2. **Naming**: camelCase for variables, PascalCase for components
3. **Comments**: Explain WHY, not WHAT
4. **TypeScript**: Prefer interfaces over types for objects
5. **Async/await**: Prefer over Promise chains

---

## Testing Strategy (🟢 TO BE IMPLEMENTED)

### Planned Testing Setup
- **Unit Tests**: Vitest + React Testing Library
- **Integration Tests**: Playwright for E2E
- **Database Tests**: Drizzle + PostgreSQL test database
- **API Tests**: Supertest for API route testing

### Test Commands (Planned)
```bash
make test-unit         # Unit tests
make test-integration  # Integration tests
make test-e2e          # End-to-end tests
make test              # All tests
make test-watch        # Watch mode
make test-coverage     # Coverage report
```

---

## Deployment Guide

### 🔴 Vercel Deployment (Recommended)
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set build command: `pnpm build`
4. Set output directory: `.next`
5. Deploy

### Environment Variables for Production
```env
DATABASE_URL=postgresql://...
OPENROUTER_API_KEY=sk-or-...
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Production Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 🟡 Database Migration Workflow
1. Make schema changes in `src/lib/db/schema.ts`
2. Run `pnpm db:generate` to create migration
3. Review migration in `drizzle/` directory
4. Test migration locally: `pnpm db:migrate`
5. Deploy: Vercel auto-runs migrations on build

### 🟢 Performance Optimization
- Enable Vercel Edge Runtime for API routes
- Use Next.js Image Optimization for recipe images
- Implement ISR for public recipe pages
- Configure caching headers for static assets

---

## Troubleshooting

### 🔴 Common Issues

#### Authentication Not Working
```bash
# Validate Clerk configuration
pnpm auth:validate

# Check environment variables
cat .env.local | grep CLERK

# Test production keys
node scripts/test-production-keys.js
```

#### Database Connection Errors
```bash
# Verify DATABASE_URL format
echo $DATABASE_URL

# Test connection
pnpm db:studio

# Push schema changes
pnpm db:push
```

#### AI Recipe Generation Fails
```bash
# Check OpenRouter API key
cat .env.local | grep OPENROUTER

# Verify API quota at: https://openrouter.ai/account
# Check model availability: https://openrouter.ai/models
```

### 🟡 Development Server Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Restart development server
pnpm dev
```

### 🟢 Type Errors
```bash
# Regenerate Drizzle types
pnpm db:generate

# Clear TypeScript cache
rm -rf .next/cache

# Rebuild
pnpm build
```

---

## Security Considerations

### 🔴 Critical Security Measures
1. **Environment Variables**: Never commit `.env.local`
2. **API Keys**: Server-side only (OpenRouter, Clerk Secret)
3. **User Data**: Always scope queries to `userId`
4. **Input Validation**: Use Zod schemas on all inputs
5. **SQL Injection**: Use Drizzle ORM (parameterized queries)

### 🟡 Authentication Security
1. **Clerk Middleware**: Protects all routes except public pages
2. **Server Action Validation**: Check `userId` from Clerk
3. **CORS**: Configured in `next.config.ts`
4. **HTTPS**: Enforce in production

### 🟢 Additional Hardening
1. **Rate Limiting**: Implement on AI endpoints
2. **Content Security Policy**: Configure CSP headers
3. **Dependency Scanning**: Use `pnpm audit`
4. **Security Headers**: Configure in `next.config.ts`

---

## Memory Categories for Claude Code

### Project Architecture
- Next.js 15 App Router with Server Actions
- Clerk dual-environment authentication setup
- Drizzle ORM with Neon PostgreSQL
- OpenRouter AI integration with multiple LLM models
- shadcn/ui component system with Tailwind CSS v4

### Implementation Guidelines
- Use server actions over API routes for mutations
- Validate userId from Clerk in all server-side operations
- Use Zod schemas for input validation
- Implement single-path workflows for all operations
- Follow Next.js App Router conventions

### Current Technical Context
- Development port: 3004
- Package manager: pnpm
- Authentication: Dual-env Clerk (dev + prod on localhost)
- Database: Neon PostgreSQL serverless
- AI Provider: OpenRouter (primary model: Gemini 2.0 Flash)

---

## Quick Reference

### Essential Commands
```bash
pnpm install           # Install dependencies
pnpm dev               # Start development server (port 3004)
pnpm build             # Build for production
pnpm db:push           # Push database schema
pnpm db:studio         # Open Drizzle Studio
pnpm auth:validate     # Validate authentication setup
```

### Key Files
- `src/lib/db/schema.ts` - Database schema
- `src/middleware.ts` - Authentication middleware
- `src/app/actions/` - Server actions
- `src/components/` - React components
- `.env.local` - Environment configuration

### Documentation
- `README.md` - Project overview
- `docs/reference/PROJECT_ORGANIZATION.md` - File organization standard
- `docs/guides/AUTHENTICATION_GUIDE.md` - Clerk setup guide
- `docs/guides/ENVIRONMENT_SETUP.md` - Environment configuration
- `docs/guides/CLERK_SETUP_GUIDE.md` - Detailed Clerk instructions
- `docs/guides/PRODUCTION_KEYS_LOCALHOST.md` - Dual-env setup

---

## Contributing

### 🟢 Contribution Workflow
1. Fork repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes following guidelines above
4. Test thoroughly
5. Commit with descriptive message
6. Push and create pull request

### Code Review Checklist
- [ ] TypeScript types are correct
- [ ] Zod validation on inputs
- [ ] Error handling implemented
- [ ] Loading states for async operations
- [ ] Accessibility considerations
- [ ] Authentication checks in place
- [ ] Database queries scoped to userId
- [ ] No secrets in code

---

## Support & Resources

### Documentation Links
- **Next.js**: https://nextjs.org/docs
- **Clerk**: https://clerk.com/docs
- **Drizzle ORM**: https://orm.drizzle.team/docs
- **OpenRouter**: https://openrouter.ai/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs

### Project Links
- **Repository**: (Add GitHub repo URL)
- **Live Demo**: (Add deployment URL)
- **Issues**: (Add GitHub issues URL)

---

**Last Updated**: 2025-10-14
**Version**: 0.1.0
**Maintained By**: Recipe Manager Team
