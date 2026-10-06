/**
 * Pre-generated WebP variants of the photos in apps/web/static/images.
 *
 * Format: file name -> [original width, variant widths]. Variants live in
 * /images/w/<name>-<width>.webp. Regenerate with the snippet in
 * docs/adr/0007-responsive-images.md after adding or replacing a photo.
 * Images not listed here (CMS uploads, icons) simply use their plain `src`.
 */
const VARIANTS: Record<string, [number, number[]]> = {
	'RevWashie.jpg': [1315, [480, 960]],
	'camp.jpg': [1000, [480]],
	'image01.jpeg': [1920, [480, 960]],
	'image02.jpg': [1920, [480, 960]],
	'image03.jpeg': [1920, [480, 960]],
	'image04.jpeg': [1920, [480, 960]],
	'image05.jpeg': [1920, [480, 960]],
	'image06.jpeg': [1920, [480, 960]],
	'image07.jpeg': [1920, [480, 960]],
	'image08.jpeg': [1920, [480, 960]],
	'image09.jpeg': [1920, [480, 960]],
	'image10.jpeg': [1920, [480, 960]],
	'image11.jpeg': [1920, [480, 960]],
	'image12.jpeg': [1920, [480, 960]],
	'image13.jpeg': [1920, [480, 960]],
	'image14.jpeg': [1920, [480, 960]],
	'image15.jpeg': [1920, [480, 960]],
	'image16.jpeg': [1920, [480, 960]],
	'image17.jpeg': [1920, [480, 960]],
	'image18.jpeg': [1920, [480, 960]],
	'image19.jpeg': [1279, [480, 960]],
	'image20.jpeg': [1279, [480, 960]],
	'image21.jpeg': [1279, [480, 960]],
	'image22.jpeg': [1920, [480, 960]],
	'image23.jpeg': [1280, [480, 960]],
	'presiding.jpg': [1280, [480, 960]],
	'slider01.jpeg': [1920, [480, 960]],
	'slider02.jpeg': [1440, [480, 960]],
	'slider07.jpeg': [1279, [480, 960]],
	'wallpaper01.jpg': [1920, [480, 960]],
	'wallpaper02.jpg': [1920, [480, 960]],
	'wallpaper03.jpg': [1920, [480, 960]],
	'wallpaper04.jpg': [1920, [480, 960]],
	'wallpaper05.jpeg': [1920, [480, 960]],
	'wallpaper06.jpg': [1920, [480, 960]],
	'wallpaper07.jpg': [1920, [480, 960]],
};

/** `srcset` for a local `/images/...` URL, or undefined when no variants exist for it. */
export function responsiveSrcset(src: string | null | undefined): string | undefined {
	if (!src || !src.startsWith('/images/')) return undefined;
	const file = src.slice('/images/'.length);
	const entry = Object.hasOwn(VARIANTS, file) ? VARIANTS[file] : undefined;
	if (!entry) return undefined;
	const [width, widths] = entry;
	const base = file.replace(/\.[^.]+$/, '');
	const sets = widths.map((w) => `/images/w/${base}-${w}.webp ${w}w`);
	sets.push(`${src} ${width}w`);
	return sets.join(', ');
}

export const RESPONSIVE_FILES = Object.keys(VARIANTS);
export const RESPONSIVE_VARIANTS = VARIANTS;
