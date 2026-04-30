export type ThemeId = "dark" | "light" | "darker" | "soft" | "ocean" | "high-contrast"

export type ThemeDefinition = {
  id: ThemeId
  name: string
  /** Monaco editor theme string */
  monacoTheme: string
  /** Preview swatches — raw CSS color values */
  preview: {
    bg: string
    card: string
    primary: string
    border: string
  }
}

export const THEMES: ThemeDefinition[] = [
  {
    id: "dark",
    name: "Dark",
    monacoTheme: "vs-dark",
    preview: {
      bg: "oklch(0.13 0 0)",
      card: "oklch(0.16 0 0)",
      primary: "oklch(0.95 0 0)",
      border: "oklch(0.28 0 0)",
    },
  },
  {
    id: "light",
    name: "Light",
    monacoTheme: "vs",
    preview: {
      bg: "oklch(0.99 0 0)",
      card: "oklch(0.97 0 0)",
      primary: "oklch(0.13 0 0)",
      border: "oklch(0.88 0 0)",
    },
  },
  {
    id: "darker",
    name: "Darker",
    monacoTheme: "vs-dark",
    preview: {
      bg: "oklch(0.07 0 0)",
      card: "oklch(0.10 0 0)",
      primary: "oklch(0.97 0 0)",
      border: "oklch(0.20 0 0)",
    },
  },
  {
    id: "soft",
    name: "Soft",
    monacoTheme: "vs-dark",
    preview: {
      bg: "oklch(0.17 0.008 50)",
      card: "oklch(0.20 0.008 50)",
      primary: "oklch(0.82 0.04 50)",
      border: "oklch(0.30 0.008 50)",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    monacoTheme: "vs-dark",
    preview: {
      bg: "oklch(0.13 0.018 220)",
      card: "oklch(0.16 0.018 220)",
      primary: "oklch(0.72 0.12 220)",
      border: "oklch(0.28 0.025 220)",
    },
  },
  {
    id: "high-contrast",
    name: "High Contrast",
    monacoTheme: "hc-black",
    preview: {
      bg: "oklch(0.00 0 0)",
      card: "oklch(0.08 0 0)",
      primary: "oklch(1.00 0 0)",
      border: "oklch(0.40 0 0)",
    },
  },
]

/** Theme IDs that should be registered with next-themes */
export const THEME_IDS = THEMES.map((t) => t.id)
