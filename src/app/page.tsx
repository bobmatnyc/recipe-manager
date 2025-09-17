import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, BookOpen, ShoppingCart, Calendar, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <ChefHat className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-4">Recipe Manager</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personal recipe collection and AI-powered kitchen assistant
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/discover">
              <Button size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Discover Recipes
              </Button>
            </Link>
            <Link href="/recipes">
              <Button size="lg" variant="outline">
                My Recipes
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Link href="/discover">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Sparkles className="h-8 w-8 text-primary mb-2" />
                <CardTitle>AI Recipe Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Generate personalized recipes based on ingredients, dietary preferences, or cuisine types
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/recipes">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Recipe Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Browse, organize, and manage your saved recipes. Add your own or save AI-generated ones
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/recipes/new">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <ChefHat className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Add Your Own</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Manually add your family recipes and personal favorites to your collection
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-8">Get Started</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/discover">
              <Button variant="secondary" size="lg">
                <Sparkles className="h-4 w-4 mr-2" />
                Discover New Recipe
              </Button>
            </Link>
            <Link href="/recipes/new">
              <Button variant="secondary" size="lg">
                <ChefHat className="h-4 w-4 mr-2" />
                Add Recipe
              </Button>
            </Link>
            <Link href="/recipes">
              <Button variant="secondary" size="lg">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Collection
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}