"use client"

import { useTheme } from "next-themes"
import { Palette, Check, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { THEMES } from "@/lib/themes"
import { cn } from "@/lib/utils"

const SYSTEM_LIGHT_BG = "oklch(0.99 0 0)"
const SYSTEM_DARK_BG = "oklch(0.13 0 0)"

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const active = theme ?? "dark"

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0" data-testid="theme-selector-btn">
              <Palette className="h-4 w-4" />
              <span className="sr-only">Select theme</span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Select theme</TooltipContent>
      </Tooltip>

      <PopoverContent align="end" className="w-72 p-3">
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Theme
        </p>

        {/* System option — full width */}
        <button
          type="button"
          data-testid="theme-option-system"
          onClick={() => setTheme("system")}
          className={cn(
            "mb-2 flex w-full items-center gap-3 rounded-md border px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent",
            active === "system" ? "border-primary bg-accent" : "border-border/50"
          )}
        >
          <div className="flex h-7 w-16 shrink-0 overflow-hidden rounded border border-border/30">
            <div style={{ background: SYSTEM_LIGHT_BG, flex: 1 }} />
            <div
              style={{
                background:
                  "linear-gradient(to right, oklch(0.16 0 0), oklch(0.13 0 0))",
                flex: 1,
              }}
            />
          </div>
          <div className="flex flex-1 items-center gap-1.5">
            <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">System</span>
          </div>
          {active === "system" && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
        </button>

        {/* Theme grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              data-testid={`theme-option-${t.id}`}
              onClick={() => setTheme(t.id)}
              className={cn(
                "flex flex-col gap-2 rounded-md border p-2 text-left transition-colors hover:bg-accent",
                active === t.id ? "border-primary bg-accent" : "border-border/50"
              )}
            >
              {/* Color swatch: bg | card | primary */}
              <div className="flex h-7 w-full overflow-hidden rounded border border-border/30">
                <div style={{ background: t.preview.bg, flex: 3 }} />
                <div style={{ background: t.preview.card, flex: 2 }} />
                <div style={{ background: t.preview.primary, flex: 1 }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{t.name}</span>
                {active === t.id && (
                  <Check className="h-3 w-3 shrink-0 text-primary" />
                )}
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
