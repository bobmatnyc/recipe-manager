'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { cloneRecipe } from '@/app/actions/recipe-cloning';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface CloneRecipeButtonProps {
  recipeId: string;
  recipeName: string;
  currentUserId?: string;
  recipeOwnerId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  className?: string;
}

export function CloneRecipeButton({
  recipeId,
  recipeName,
  currentUserId,
  recipeOwnerId,
  variant = 'outline',
  size = 'default',
  showIcon = true,
  className,
}: CloneRecipeButtonProps) {
  const router = useRouter();
  const [isCloning, setIsCloning] = useState(false);

  // Don't show clone button for own recipes
  if (currentUserId === recipeOwnerId) {
    return null;
  }

  const iconOnly = size === 'icon';

  // Require sign-in
  if (!currentUserId) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => {
          toast.error('Please sign in to clone recipes');
          router.push('/sign-in');
        }}
        title={iconOnly ? 'Fork Recipe' : undefined}
      >
        {showIcon && <span className={iconOnly ? '' : 'mr-2'}>🍴</span>}
        {!iconOnly && 'Fork Recipe'}
      </Button>
    );
  }

  const handleClone = async () => {
    setIsCloning(true);

    try {
      const result = await cloneRecipe(recipeId);

      if (result.success && result.clonedRecipe) {
        toast.success(result.message || 'Recipe cloned successfully!');
        // Redirect to edit page for the cloned recipe
        router.push(`/recipes/${result.clonedRecipe.id}/edit`);
      } else {
        toast.error(result.error || 'Failed to clone recipe');
      }
    } catch (error) {
      console.error('Error cloning recipe:', error);
      toast.error('An error occurred while cloning the recipe');
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={isCloning}
          title={iconOnly ? 'Fork Recipe' : undefined}
        >
          {showIcon && <span className={iconOnly ? '' : 'mr-2'}>🍴</span>}
          {!iconOnly && (isCloning ? 'Cloning...' : 'Fork Recipe')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Fork this recipe?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              You're about to create your own editable copy of{' '}
              <strong>&quot;{recipeName}&quot;</strong>.
            </p>
            <p>What happens when you fork a recipe:</p>
            <ul className="ml-4 list-disc space-y-1 text-sm">
              <li>A copy will be created in your recipe collection</li>
              <li>You can edit ingredients, instructions, and all details</li>
              <li>The original recipe will be credited as the source</li>
              <li>The original author will receive a like from you</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCloning}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleClone} disabled={isCloning}>
            {isCloning ? 'Cloning...' : 'Fork Recipe'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
