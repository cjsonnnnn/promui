"use client"

import { useTheme } from "next-themes"
import { Toaster } from "sonner"

export function ThemeAwareToaster() {
  const { resolvedTheme } = useTheme()
  return (
    <Toaster
      richColors
      position="bottom-right"
      theme={resolvedTheme as "dark" | "light" | undefined}
    />
  )
}
