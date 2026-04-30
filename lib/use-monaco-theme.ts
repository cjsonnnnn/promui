"use client"

import { useTheme } from "next-themes"
import { THEMES } from "./themes"

export function useMonacoTheme(): string {
  const { resolvedTheme } = useTheme()
  return THEMES.find((t) => t.id === resolvedTheme)?.monacoTheme ?? "vs-dark"
}
