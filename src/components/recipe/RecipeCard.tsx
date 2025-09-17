'use client';

import { type Recipe } from '@/lib/db/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, ChefHat, ExternalLink, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { deleteRecipe } from '@/app/actions/recipes';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';

interface RecipeCardProps {
  recipe: Recipe;
  onDelete?: () => void;
}

export function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  const router = useRouter();
  const tags = recipe.tags ? JSON.parse(recipe.tags as string) : [];
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    const result = await deleteRecipe(recipe.id);
    if (result.success) {
      toast.success('Recipe deleted successfully');
      if (onDelete) {
        onDelete();
      }
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to delete recipe');
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
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
            <Badge className="absolute top-2 right-2" variant="secondary">
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
        <Link href={`/recipes/${recipe.id}/edit`}>
          <Button variant="outline" size="icon">
            <Edit className="w-4 h-4" />
          </Button>
        </Link>
        <Button
          variant="outline"
          size="icon"
          onClick={handleDelete}
          className="hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}