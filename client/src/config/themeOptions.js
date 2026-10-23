// client/src/config/themeOptions.js
export const DEFAULT_THEME = 'default'

const DARK_HALF = '#0f172a'

// Diagonal split: dark bottom-left, theme color top-right (used for some swatches only)
const split = (color) => `linear-gradient(to top right, ${DARK_HALF} 50%, ${color} 50%)`

// Solid swatch: plain color
const solid = (color) => color

export const THEME_OPTIONS = [
  { id: 'white', label: 'White', swatch: solid('#F8FAFC') },
  { id: 'orange', label: 'Orange', swatch: solid('#EA580C') },
  { id: 'rose', label: 'Rose', swatch: solid('#E11D48') },
  { id: 'cyan', label: 'Cyan', swatch: solid('#0891B2') },
  { id: 'lime', label: 'Lime', swatch: solid('#65A30D') },
  { id: 'emerald', label: 'Emerald', swatch: solid('#059669') },
  { id: 'violet', label: 'Violet', swatch: solid('#7C3AED') },
  { id: 'violet-half', label: 'Violet Half', swatch: solid('#A78BFA') },
  { id: 'amber', label: 'Amber', swatch: solid('#B45309') },
  { id: 'amber-half', label: 'Amber Half', swatch: solid('#F59E0B') },
  { id: 'teal', label: 'Teal', swatch: solid('#0F766E') },
  { id: 'teal-half', label: 'Teal Half', swatch: solid('#14B8A6') },
  { id: 'purple', label: 'Purple', swatch: split('#9333EA') },
  { id: 'magenta', label: 'Magenta', swatch: split('#C026D3') },
  { id: 'graphite', label: 'Graphite', swatch: split('#334155') },
  { id: 'default', label: 'Red', swatch: split('#E31837') },
  { id: 'blue', label: 'Blue', swatch: split('#2563EB') },
]

export const THEME_IDS = THEME_OPTIONS.map((t) => t.id)
