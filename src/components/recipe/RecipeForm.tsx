'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Recipe } from '@/lib/db/schema';
import { createRecipe, updateRecipe } from '@/app/actions/recipes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/lib/toast';
import { Plus, X, Save, Loader2 } from 'lucide-react';

interface RecipeFormProps {
  recipe?: Recipe;
}

export function RecipeForm({ recipe }: RecipeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse existing recipe data if editing
  const existingIngredients = recipe?.ingredients ? JSON.parse(recipe.ingredients as string) : [''];
  const existingInstructions = recipe?.instructions ? JSON.parse(recipe.instructions as string) : [''];
  const existingTags = recipe?.tags ? JSON.parse(recipe.tags as string) : [''];

  const [formData, setFormData] = useState({
    name: recipe?.name || '',
    description: recipe?.description || '',
    ingredients: existingIngredients,
    instructions: existingInstructions,
    prepTime: recipe?.prepTime || 0,
    cookTime: recipe?.cookTime || 0,
    servings: recipe?.servings || 4,
    difficulty: recipe?.difficulty || 'medium',
    cuisine: recipe?.cuisine || '',
    tags: existingTags,
    imageUrl: recipe?.imageUrl || '',
  });

  const handleArrayChange = (field: 'ingredients' | 'instructions' | 'tags', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'ingredients' | 'instructions' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'ingredients' | 'instructions' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: string, i: number) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out empty strings
      const cleanedData = {
        ...formData,
        ingredients: formData.ingredients.filter((i: string) => i.trim()),
        instructions: formData.instructions.filter((i: string) => i.trim()),
        tags: formData.tags.filter((t: string) => t.trim()),
        prepTime: formData.prepTime || null,
        cookTime: formData.cookTime || null,
        servings: formData.servings || null,
        description: formData.description || null,
        cuisine: formData.cuisine || null,
        imageUrl: formData.imageUrl || null,
      };

      if (cleanedData.ingredients.length === 0) {
        toast.error('Please add at least one ingredient');
        setIsSubmitting(false);
        return;
      }

      if (cleanedData.instructions.length === 0) {
        toast.error('Please add at least one instruction');
        setIsSubmitting(false);
        return;
      }

      let result;
      if (recipe) {
        result = await updateRecipe(recipe.id, cleanedData);
      } else {
        result = await createRecipe(cleanedData);
      }

      if (result.success && result.data) {
        toast.success(recipe ? 'Recipe updated successfully' : 'Recipe created successfully');
        router.push(`/recipes/${result.data.id}`);
      } else {
        toast.error(result.error || 'Failed to save recipe');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential details about your recipe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Recipe Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Chocolate Chip Cookies"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="A brief description of the recipe"
              />
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cuisine">Cuisine</Label>
                <Input
                  id="cuisine"
                  value={formData.cuisine}
                  onChange={(e) => setFormData(prev => ({ ...prev, cuisine: e.target.value }))}
                  placeholder="e.g., Italian, Mexican"
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as any }))}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="prepTime">Prep Time (min)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  min="0"
                  value={formData.prepTime || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, prepTime: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="cookTime">Cook Time (min)</Label>
                <Input
                  id="cookTime"
                  type="number"
                  min="0"
                  value={formData.cookTime || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, cookTime: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  min="1"
                  value={formData.servings || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle>Ingredients *</CardTitle>
            <CardDescription>List all ingredients needed for the recipe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {formData.ingredients.map((ingredient: string, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={ingredient}
                  onChange={(e) => handleArrayChange('ingredients', index, e.target.value)}
                  placeholder="e.g., 2 cups flour"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeArrayItem('ingredients', index)}
                  disabled={formData.ingredients.length === 1}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem('ingredients')}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Ingredient
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions *</CardTitle>
            <CardDescription>Step-by-step instructions for the recipe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {formData.instructions.map((instruction: string, index: number) => (
              <div key={index} className="flex gap-2">
                <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center text-sm text-muted-foreground">
                  {index + 1}.
                </div>
                <Input
                  value={instruction}
                  onChange={(e) => handleArrayChange('instructions', index, e.target.value)}
                  placeholder="Describe this step..."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeArrayItem('instructions', index)}
                  disabled={formData.instructions.length === 1}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem('instructions')}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>Add tags to help categorize your recipe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {formData.tags.map((tag: string, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={tag}
                  onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                  placeholder="e.g., dessert, vegan"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeArrayItem('tags', index)}
                  disabled={formData.tags.length === 1}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem('tags')}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tag
            </Button>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || !formData.name}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {recipe ? 'Update Recipe' : 'Create Recipe'}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}