'use client';

import { useState } from 'react';
import { type Recipe } from '@/lib/db/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, ChefHat, ExternalLink, Copy, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { copyRecipeToCollection } from '@/app/actions/recipes';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';

interface SharedRecipeCardProps {
  recipe: Recipe;
  isSystemRecipe?: boolean;
}

export function SharedRecipeCard({ recipe, isSystemRecipe = false }: SharedRecipeCardProps) {
  const router = useRouter();
  const [isCopying, setIsCopying] = useState(false);
  const tags = recipe.tags ? JSON.parse(recipe.tags as string) : [];
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  const handleCopy = async () => {
    setIsCopying(true);
    try {
      const result = await copyRecipeToCollection(recipe.id);
      if (result.success && result.data) {
        toast.success('Recipe copied to your collection!');
        router.push(`/recipes/${result.data.id}`);
      } else {
        toast.error(result.error || 'Failed to copy recipe');
      }
    } catch (error) {
      toast.error('An error occurred while copying the recipe');
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow relative">
      {/* System Recipe Badge */}
      {isSystemRecipe && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}

      {recipe.imageUrl && (
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="object-cover w-full h-full"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {recipe.isAiGenerated && (
            <Badge className="absolute bottom-2 left-2" variant="secondary">
              AI Generated
            </Badge>
          )}
        </div>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-2">{recipe.name}</CardTitle>
        {recipe.description && (
          <CardDescription className="line-clamp-2">{recipe.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-3">
          {recipe.cuisine && (
            <Badge variant="outline">
              <ChefHat className="w-3 h-3 mr-1" />
              {recipe.cuisine}
            </Badge>
          )}
          {recipe.difficulty && (
            <Badge variant="outline" className={
              recipe.difficulty === 'easy' ? 'text-green-600' :
              recipe.difficulty === 'medium' ? 'text-yellow-600' :
              'text-red-600'
            }>
              {recipe.difficulty}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {totalTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{totalTime} min</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{recipe.servings} servings</span>
            </div>
          )}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link href={`/recipes/${recipe.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            <ExternalLink className="w-4 h-4 mr-1" />
            View
          </Button>
        </Link>
        <Button
          onClick={handleCopy}
          disabled={isCopying}
          className="flex-1"
        >
          {isCopying ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Copying...
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}