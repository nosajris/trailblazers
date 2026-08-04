import type { Config } from 'tailwindcss';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		path.join(__dirname, '../../packages/ui/src/**/*.{html,js,svelte,ts}')
	],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'Montserrat', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
				mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace']
			},
			colors: {
				brand: {
					primary: '#F95C4B',
					secondary: '#FF7A6B',
					dark: '#18181b',
					light: '#fafafa',
					gold: '#FFB800',
					fg: '#ffffff'
				},
				// Linear-style zinc grayscale override for consistent tokens
				zinc: {
					50: '#fafafa',
					100: '#f4f4f5',
					200: '#e4e4e7',
					300: '#d4d4d8',
					400: '#a1a1aa',
					500: '#71717a',
					600: '#52525b',
					700: '#3f3f46',
					800: '#27272a',
					900: '#18181b',
					950: '#09090b'
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
