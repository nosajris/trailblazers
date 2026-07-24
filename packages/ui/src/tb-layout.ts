/** Elevation-style layout primitives (wide container, vertical rhythm, mobile scroll rails). */
export const container =
	'mx-auto w-full max-w-[min(100%,88rem)] px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16';

export const sectionY = 'py-16 md:py-[4.5rem] lg:py-24';

export const headline =
	'font-sans text-[1.75rem] font-bold leading-[1.15] tracking-tight text-brand-dark sm:text-3xl md:text-4xl lg:text-[2.75rem]';

export const headlineLight =
	'font-sans text-[1.75rem] font-bold leading-[1.15] tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[2.75rem]';

export const eyebrow = 'text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary';

export const eyebrowGoldOnDark = 'text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold';

/** Events / cards: horizontal rail on small screens, grid from md. */
export const railRow =
	'flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:pb-0 lg:grid-cols-3 lg:gap-10 [&::-webkit-scrollbar]:hidden';

export const railItem =
	'min-w-[min(22rem,calc(100vw-2.5rem))] shrink-0 snap-start md:min-w-0 md:snap-none';
