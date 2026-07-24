import type { Config } from 'tailwindcss';
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
			colors: {
				'brand-primary': '#F95C4B',   // Algerian Coral
				'brand-secondary': '#FF7A6B', // Soft Coral hover
				'brand-dark': '#171616',      // Army Black
				'brand-light': '#F9F9F8',     // Off-white light background
				'brand-gold': '#FFB800'       // PAOZ Yellow/Gold
			},
			backgroundImage: {
				'hero-pattern': "url('/images/wallpaper01.jpg')"
			}
		}
	},
	plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')]
} satisfies Config;
