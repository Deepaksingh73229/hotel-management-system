"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex h-8 w-[100px] rounded-md border border-border/50 bg-muted/20 p-0.5" />
        );
    }

    return (
        <div className="flex rounded-md border border-border/50 bg-muted/20 p-0.5">
            <button
                onClick={() => setTheme("light")}
                className={`flex h-6 w-8 items-center justify-center rounded-sm transition-colors ${theme === "light"
                    ? "bg-background text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                title="Light Mode"
            >
                <Sun className="size-3.5" />
                <span className="sr-only">Light</span>
            </button>

            <button
                onClick={() => setTheme("system")}
                className={`flex h-6 w-8 items-center justify-center rounded-sm transition-colors ${theme === "system"
                    ? "bg-background text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                title="System Theme"
            >
                <Monitor className="size-3.5" />
                <span className="sr-only">System</span>
            </button>

            <button
                onClick={() => setTheme("dark")}
                className={`flex h-6 w-8 items-center justify-center rounded-sm transition-colors ${theme === "dark"
                    ? "bg-background text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                title="Dark Mode"
            >
                <Moon className="size-3.5" />
                <span className="sr-only">Dark</span>
            </button>
        </div>
    );
}