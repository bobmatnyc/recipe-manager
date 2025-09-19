'use client';

import { useEffect, useState } from 'react';
import { getRecipe } from '@/app/actions/recipes';
import { parseRecipe } from '@/lib/utils/recipe-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Clock, Users, ChefHat, Edit, Printer, Bot, Download, FileText, FileDown } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exportRecipeAsMarkdown, exportRecipeAsPDF } from '@/app/actions/recipe-export';
import { toast } from 'sonner';

interface RecipePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function RecipePage({ params }: RecipePageProps) {
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recipeId, setRecipeId] = useState<string>('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    params.then(p => setRecipeId(p.id));
  }, [params]);

  useEffect(() => {
    if (!recipeId) return;

    async function fetchRecipe() {
      const result = await getRecipe(recipeId);
      if (!result.success || !result.data) {
        notFound();
        return;
      }
      setRecipe(parseRecipe(result.data));
      setLoading(false);
    }
    fetchRecipe();
  }, [recipeId]);

  const handleExportMarkdown = async () => {
    try {
      setExporting(true);
      const result = await exportRecipeAsMarkdown(recipeId);

      // Convert base64 to blob and download
      const blob = new Blob([result.content], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Recipe exported as Markdown!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export recipe');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const result = await exportRecipeAsPDF(recipeId);

      // Convert base64 to blob and download
      const byteCharacters = atob(result.content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.mimeType });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Recipe exported as PDF!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export recipe as PDF');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>;
  }

  if (!recipe) {
    notFound();
    return null;
  }
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link
        href="/recipes"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Recipes
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{recipe.name}</h1>
            {recipe.description && (
              <p className="text-lg text-muted-foreground">{recipe.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/recipes/${recipeId}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <div className="relative group">
              <Button
                variant="outline"
                disabled={exporting}
              >
                <Download className="w-4 h-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export'}
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={handleExportMarkdown}
                  className="w-full text-left px-4 py-2 hover:bg-accent flex items-center"
                  disabled={exporting}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export as Markdown
                </button>
                <button
                  onClick={handleExportPDF}
                  className="w-full text-left px-4 py-2 hover:bg-accent flex items-center"
                  disabled={exporting}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Export as PDF
                </button>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm">
          {recipe.cuisine && (
            <div className="flex items-center gap-1">
              <ChefHat className="w-4 h-4" />
              <span>{recipe.cuisine}</span>
            </div>
          )}
          {totalTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {recipe.prepTime ? `${recipe.prepTime} min prep` : ''}
                {recipe.prepTime && recipe.cookTime ? ' + ' : ''}
                {recipe.cookTime ? `${recipe.cookTime} min cook` : ''}
              </span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{recipe.servings} servings</span>
            </div>
          )}
          {recipe.difficulty && (
            <Badge
              variant="outline"
              className={
                recipe.difficulty === 'easy' ? 'text-green-600' :
                recipe.difficulty === 'medium' ? 'text-yellow-600' :
                'text-red-600'
              }
            >
              {recipe.difficulty}
            </Badge>
          )}
          {recipe.isAiGenerated && (
            <Badge variant="secondary">
              <Bot className="w-3 h-3 mr-1" />
              AI Generated
            </Badge>
          )}
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {recipe.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Image */}
      {recipe.imageUrl && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-auto max-h-[500px] object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
            <CardDescription>Everything you'll need</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mt-1.5 mr-3 flex-shrink-0" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>Step-by-step directions</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction: string, index: number) => (
                <li key={index} className="flex">
                  <span className="font-semibold text-primary mr-3 flex-shrink-0">
                    {index + 1}.
                  </span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}