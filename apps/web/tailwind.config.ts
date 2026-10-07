import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		path.join(__dirname, '../../packages/ui/src/**/*.{html,js,svelte,ts}')
	],
	theme: {
		extend: {
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px'
			},
			fontFamily: {
				sans: ['Montserrat', 'sans-serif'],
				serif: ['Playfair Display', 'serif']
			},
			// Read from packages/ui/src/tokens.css, the single definition of
			// colour. The channel variables (not the hex ones) are used so that
			// opacity modifiers like `text-brand-dark/75` keep working.
			colors: {
				'brand-primary': 'rgb(var(--brand-primary-rgb) / <alpha-value>)',
				'brand-secondary': 'rgb(var(--brand-secondary-rgb) / <alpha-value>)',
				'brand-dark': 'rgb(var(--brand-dark-rgb) / <alpha-value>)',
				'brand-light': 'rgb(var(--brand-light-rgb) / <alpha-value>)',
				'brand-gold': 'rgb(var(--brand-gold-rgb) / <alpha-value>)'
			},
			backgroundImage: {
				'hero-pattern': "url('/images/wallpaper01.jpg')"
			}
		}
	},
	plugins: [typography, forms]
} satisfies Config;
