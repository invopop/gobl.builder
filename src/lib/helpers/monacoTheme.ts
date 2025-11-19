import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api.js'

// Convert rgba/rgb/hsl to hex color
function colorToHex(color: string): string {
  if (!color || color === '') return '#000000'

  // If already hex, return as is
  if (color.startsWith('#')) return color

  // Create a temporary element to compute the color
  const temp = document.createElement('div')
  temp.style.color = color
  document.body.appendChild(temp)
  const computed = getComputedStyle(temp).color
  document.body.removeChild(temp)

  // Parse rgb/rgba
  const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (!match) return '#000000'

  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])
  const a = match[4] ? parseFloat(match[4]) : 1

  // If there's alpha and it's not 1, we need to blend with white background
  if (a < 1) {
    const blendedR = Math.round((1 - a) * 255 + a * r)
    const blendedG = Math.round((1 - a) * 255 + a * g)
    const blendedB = Math.round((1 - a) * 255 + a * b)
    return `#${blendedR.toString(16).padStart(2, '0')}${blendedG.toString(16).padStart(2, '0')}${blendedB.toString(16).padStart(2, '0')}`
  }

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Get computed CSS variable values with dark mode support
function getComputedVar(varName: string, darkMode: boolean = false): string {
  let value: string

  if (darkMode) {
    // Create a temporary element with dark class to get dark mode values
    const temp = document.createElement('div')
    temp.className = 'dark'
    document.body.appendChild(temp)
    value = getComputedStyle(temp).getPropertyValue(varName).trim()
    document.body.removeChild(temp)
  } else {
    value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  }

  if (!value || value === '') {
    console.warn(`CSS variable ${varName} is empty or not found (darkMode: ${darkMode})`)
    return '#000000'
  }
  return colorToHex(value)
}

// Build theme colors object from CSS variables
function buildThemeColors(darkMode: boolean = false): Record<string, string> {
  return {
    foreground: getComputedVar('--color-foreground-default-default', darkMode),
    'icon.foreground': getComputedVar('--color-icon-default-default', darkMode),
    focusBorder: getComputedVar('--color-border-selected-default', darkMode),
    'textLink.foreground': getComputedVar('--color-foreground-accent-default', darkMode),
    'textLink.activeForeground': getComputedVar('--color-foreground-accent-default', darkMode),
    'editor.background': getComputedVar('--color-background-default-default', darkMode),
    'editor.foreground': getComputedVar('--color-foreground-default-default', darkMode),
    'editor.selectionBackground': getComputedVar(
      '--color-background-default-tertiary-hover',
      darkMode
    ),
    'editor.inactiveSelectionBackground': getComputedVar(
      '--color-background-default-secondary',
      darkMode
    ),
    'editor.selectionHighlightBackground': getComputedVar(
      '--color-background-default-tertiary',
      darkMode
    ),
    'editor.findMatchBackground': getComputedVar(
      '--color-background-default-tertiary-hover',
      darkMode
    ),
    'editor.findMatchHighlightBackground': getComputedVar(
      '--color-background-warning-default',
      darkMode
    ),
    'editor.findRangeHighlightBackground': getComputedVar(
      '--color-background-default-tertiary-hover',
      darkMode
    ),
    'editor.hoverHighlightBackground': getComputedVar(
      '--color-background-default-tertiary',
      darkMode
    ),
    'editorWidget.background': getComputedVar('--color-background-default-tertiary', darkMode),
    'editorWidget.foreground': getComputedVar('--color-foreground-default-secondary', darkMode),
    'editorWidget.border': getComputedVar('--color-border-default-secondary', darkMode),
    'editorHoverWidget.background': getComputedVar('--color-background-default-tertiary', darkMode),
    'editorHoverWidget.foreground': getComputedVar(
      '--color-foreground-default-secondary',
      darkMode
    ),
    'editorHoverWidget.border': getComputedVar('--color-border-default-secondary', darkMode),
    'editorHoverWidget.statusBarBackground': getComputedVar(
      '--color-background-default-tertiary',
      darkMode
    ),
    'editorError.foreground': getComputedVar('--color-foreground-critical-default', darkMode),
    'editorWarning.foreground': getComputedVar('--color-foreground-warning-default', darkMode),
    'editorInfo.foreground': getComputedVar('--color-foreground-info-default', darkMode),
    'editorHint.foreground': getComputedVar('--color-foreground-default-secondary', darkMode),
    'editorLink.activeForeground': getComputedVar('--color-foreground-info-default', darkMode),
    'editorInlayHint.foreground': getComputedVar('--color-foreground-default-secondary', darkMode),
    'editorInlayHint.background': getComputedVar('--color-background-default-secondary', darkMode),
    'editorInlayHint.typeForeground': getComputedVar(
      '--color-foreground-default-secondary',
      darkMode
    ),
    'editorInlayHint.typeBackground': getComputedVar(
      '--color-background-default-secondary',
      darkMode
    ),
    'editorStickyScroll.background': getComputedVar('--color-background-default-default', darkMode),
    'editorStickyScrollHover.background': getComputedVar(
      '--color-background-default-tertiary',
      darkMode
    ),
    'scrollbar.shadow': getComputedVar('--color-background-default-tertiary-hover', darkMode),
    'scrollbarSlider.background': getComputedVar(
      '--color-background-default-tertiary-hover',
      darkMode
    ),
    'scrollbarSlider.hoverBackground': getComputedVar(
      '--color-background-default-tertiary-press',
      darkMode
    ),
    'scrollbarSlider.activeBackground': getComputedVar(
      '--color-background-default-tertiary-press',
      darkMode
    ),
    'badge.background': getComputedVar('--color-background-default-tertiary-hover', darkMode),
    'badge.foreground': getComputedVar('--color-foreground-default-default', darkMode)
  }
}

// Define all Monaco themes
export function defineMonacoThemes(monaco: typeof Monaco) {
  const themeColors = buildThemeColors(false)
  const darkThemeColors = buildThemeColors(true)

  console.log('Light theme colors:', themeColors)
  console.log('Dark theme colors:', darkThemeColors)

  monaco.editor.defineTheme('editableTheme', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: themeColors
  })

  monaco.editor.defineTheme('editableDarkTheme', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: darkThemeColors
  })

  monaco.editor.defineTheme('readOnlyTheme', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      ...themeColors,
      'editor.background': '#F8F8FA'
    }
  })

  monaco.editor.defineTheme('readOnlyDarkTheme', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      ...darkThemeColors,
      'editor.background': getComputedVar('var(--color-background-default-bold)', true)
    }
  })

  // Set the initial theme
  monaco.editor.setTheme('editableTheme')
}

// Get the appropriate theme name based on state
export function getMonacoThemeName(isReadOnly: boolean, isDarkMode: boolean): string {
  if (isReadOnly) {
    return isDarkMode ? 'readOnlyDarkTheme' : 'readOnlyTheme'
  } else {
    return isDarkMode ? 'editableDarkTheme' : 'editableTheme'
  }
}
