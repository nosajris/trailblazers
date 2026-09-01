import type { Config } from 'tailwindcss';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		path.join(__dirname, '../../packages/ui/src/**/*.{html,js,svelte,ts}')
	],
	// `darkMode: 'class'` was set here with no dark mode implemented anywhere —
	// no toggle, no `dark:` variants, no stored preference. It only suggested a
	// feature that did not exist. Re-add it alongside an actual implementation.
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'Montserrat', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
				mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace']
			},
			// Read from packages/ui/src/tokens.css, the single definition of
			// colour. The channel variables (not the hex ones) are used so that
			// opacity modifiers like `ring-brand-primary/20` keep working.
			//
			// The `zinc` scale is no longer overridden here: the values were
			// identical to Tailwind's own, so the override only created another
			// copy to keep in sync. Hand-written CSS uses var(--zinc-*) from the
			// token file; utility classes use Tailwind's built-in scale.
			colors: {
				brand: {
					primary: 'rgb(var(--brand-primary-rgb) / <alpha-value>)',
					secondary: 'rgb(var(--brand-secondary-rgb) / <alpha-value>)',
					dark: 'rgb(var(--brand-dark-rgb) / <alpha-value>)',
					light: 'rgb(var(--brand-light-rgb) / <alpha-value>)',
					gold: 'rgb(var(--brand-gold-rgb) / <alpha-value>)',
					fg: 'rgb(var(--brand-fg-rgb) / <alpha-value>)'
				}
			},
			boxShadow: {
				'linear-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
				'linear-card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
				'linear-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
				'brand-glow': '0 0 20px rgba(249, 92, 75, 0.35)'
			},
			borderRadius: {
				'xl': '0.75rem',
				'2xl': '1rem',
				'3xl': '1.5rem'
			}
		}
	},
	plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')]
} satisfies Config;
