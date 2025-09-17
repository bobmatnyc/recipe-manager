# Recipe Manager

An AI-powered recipe generator and meal planning application built with Next.js 15, TypeScript, and Neon PostgreSQL.

## Features

- **AI Recipe Generation**: Generate custom recipes based on ingredients, dietary preferences, or cuisine types
- **Recipe Library**: Save and organize your favorite recipes
- **Meal Planning**: Plan meals for the week with drag-and-drop simplicity
- **Shopping Lists**: Automatically generate shopping lists from meal plans
- **Recipe Import**: Import recipes from URLs
- **Nutritional Information**: Track nutritional data for recipes

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: Neon PostgreSQL with Drizzle ORM
- **UI**: Tailwind CSS v4 + shadcn/ui components
- **AI Integration**: OpenRouter API (supports multiple LLM providers)
- **Package Manager**: pnpm

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your OpenRouter API key

4. Initialize the database:
   ```bash
   pnpm db:push
   ```

5. Run the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Commands

- `pnpm db:generate` - Generate migrations from schema
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:migrate` - Run migrations

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── recipes/           # Recipe pages
│   ├── meal-plans/        # Meal planning pages
│   └── shopping-lists/    # Shopping list pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── recipe/           # Recipe-specific components
│   ├── meal-plan/        # Meal planning components
│   └── shopping-list/    # Shopping list components
├── lib/                   # Utilities and services
│   ├── ai/               # AI/LLM integration
│   ├── db/               # Database configuration and schema
│   └── utils/            # Utility functions
└── types/                # TypeScript type definitions
```

## Environment Variables

- `OPENROUTER_API_KEY` - Your OpenRouter API key for AI features
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL` - Application URL (default: `http://localhost:3000`)

## Development

The application uses:
- **Drizzle ORM** for type-safe database queries
- **Zod** for schema validation
- **React Hook Form** for form management
- **Sonner** for toast notifications
- **Lucide React** for icons

## License

MIT