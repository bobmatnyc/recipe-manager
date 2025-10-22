'use client';

import Image from 'next/image';
import { Wrench } from 'lucide-react';
import type { KitchenTool } from '@/app/actions/tools';

interface ToolCardProps {
  tool: KitchenTool;
  className?: string;
}

/**
 * ToolCard - Card component for displaying kitchen tool in grid view
 *
 * Features:
 * - Tool image with fallback
 * - Canonical name and variant
 * - Usage count
 *
 * Design:
 * - Matches IngredientCard style
 * - Card-based layout
 * - Hover effects
 * - Mobile-responsive
 */
export function ToolCard({ tool, className = '' }: ToolCardProps) {
  return (
    <div
      className={`group block rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600 overflow-hidden ${className}`}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
        {tool.imageUrl ? (
          <Image
            src={tool.imageUrl}
            alt={tool.displayName}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Wrench className="h-12 w-12 text-gray-300 dark:text-gray-600" />
          </div>
        )}

        {/* High Usage Badge */}
        {tool.usageCount >= 5 && (
          <div className="absolute top-1.5 right-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-xs font-semibold text-white">
            Popular
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3">
        {/* Tool Name */}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
          {tool.displayName}
        </h3>

        {/* Canonical & Variant - Single line */}
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400 truncate">
            {tool.canonicalName}
          </span>
        </div>

        {/* Variant info if different from display name */}
        {tool.variant !== 'Standard' && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
            {tool.variant}
          </div>
        )}

        {/* Usage Stats */}
        <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {tool.usageCount} {tool.usageCount === 1 ? 'recipe' : 'recipes'}
        </div>
      </div>
    </div>
  );
}
