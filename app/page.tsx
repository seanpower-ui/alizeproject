"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent,
  Badge,
  Input,
  Checkbox,
  Switch,
  MaterialSymbol,
} from "@jllt/alize-ui";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering theme UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to Alize UI
          </h1>
          <p className="text-muted-foreground">
            Your project is ready! Start building beautiful interfaces.
          </p>
        </header>

        <Card className="hover:bg-secondary/80 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MaterialSymbol name="widgets" size={20} weight={300} />
              Components
            </CardTitle>
            <CardDescription>
              Edit <code className="bg-muted px-1 rounded text-sm">app/page.tsx</code> to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Buttons</p>
              <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Badges</p>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Form Controls</p>
              <div className="flex flex-col gap-4 max-w-sm">
                <Input placeholder="Type something..." />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox /> Remember me
                  </label>
                  {mounted && (
                    <label className="flex items-center gap-2 text-sm">
                      <Switch 
                        checked={theme === "dark"} 
                        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} 
                      /> 
                      Dark mode
                    </label>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Docs: <a href="https://github.com/JLLT-Apps/alize-ui" target="_blank" className="text-primary underline">github.com/JLLT-Apps/alize-ui</a>
        </p>
      </div>
    </main>
  );
}
