import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // next-themes returns undefined on first render (SSR/hydration safety)
  // We must wait until mounted to avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full w-10 h-10 border border-border bg-background/50 backdrop-blur-sm"
        disabled
      >
        <Sun className="h-[1.2rem] w-[1.2rem] text-foreground" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="rounded-full w-10 h-10 border border-border bg-background/50 backdrop-blur-sm"
    >
      {resolvedTheme === "dark" ? (
        <Moon className="h-[1.2rem] w-[1.2rem] text-foreground" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] text-foreground" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
