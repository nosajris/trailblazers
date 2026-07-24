
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/health" | "/api/newsletter" | "/bep-hub" | "/contact" | "/events" | "/events/[id]" | "/events/[id]/ics" | "/faq" | "/give" | "/groups" | "/messages" | "/plan-a-visit" | "/robots.txt" | "/serve" | "/sitemap.xml" | "/stories" | "/stories/[id]" | "/watch";
		RouteParams(): {
			"/events/[id]": { id: string };
			"/events/[id]/ics": { id: string };
			"/stories/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/api": Record<string, never>;
			"/api/health": Record<string, never>;
			"/api/newsletter": Record<string, never>;
			"/bep-hub": Record<string, never>;
			"/contact": Record<string, never>;
			"/events": { id?: string };
			"/events/[id]": { id: string };
			"/events/[id]/ics": { id: string };
			"/faq": Record<string, never>;
			"/give": Record<string, never>;
			"/groups": Record<string, never>;
			"/messages": Record<string, never>;
			"/plan-a-visit": Record<string, never>;
			"/robots.txt": Record<string, never>;
			"/serve": Record<string, never>;
			"/sitemap.xml": Record<string, never>;
			"/stories": { id?: string };
			"/stories/[id]": { id: string };
			"/watch": Record<string, never>
		};
		Pathname(): "/" | "/api/health" | "/api/newsletter" | "/bep-hub" | "/contact" | "/events" | `/events/${string}` & {} | `/events/${string}/ics` & {} | "/faq" | "/give" | "/groups" | "/messages" | "/plan-a-visit" | "/robots.txt" | "/serve" | "/sitemap.xml" | "/stories" | `/stories/${string}` & {} | "/watch";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/images/BishopZowa.jpeg" | "/images/camp-video.mp4" | "/images/camp.jpg" | "/images/camp02.mp4" | "/images/comments.png" | "/images/favourites.png" | "/images/image01.jpeg" | "/images/image02.jpg" | "/images/image03.jpeg" | "/images/image04.jpeg" | "/images/image05.jpeg" | "/images/image06.jpeg" | "/images/image07.jpeg" | "/images/image08.jpeg" | "/images/image09.jpeg" | "/images/image10.jpeg" | "/images/image11.jpeg" | "/images/image12.jpeg" | "/images/image13.jpeg" | "/images/image14.jpeg" | "/images/image15.jpeg" | "/images/image16.jpeg" | "/images/image17.jpeg" | "/images/image18.jpeg" | "/images/image19.jpeg" | "/images/image20.jpeg" | "/images/image21.jpeg" | "/images/image22.jpeg" | "/images/image23.jpeg" | "/images/like.png" | "/images/PAOZLOGO.png" | "/images/presiding.jpg" | "/images/profile2.jpg" | "/images/RevMadzima.jpg" | "/images/RevWashie.jpg" | "/images/sermon1.jpg" | "/images/sermon2.jpg" | "/images/slider01.jpeg" | "/images/slider02.jpeg" | "/images/slider03.jpeg" | "/images/slider04.jpeg" | "/images/slider05.jpeg" | "/images/slider06.jpeg" | "/images/slider07.jpeg" | "/images/twitter-x.png" | "/images/wallpaper01.jpg" | "/images/wallpaper02.jpg" | "/images/wallpaper03.jpg" | "/images/wallpaper04.jpg" | "/images/wallpaper05.jpeg" | "/images/wallpaper06.jpg" | "/images/wallpaper07.jpg" | "/robots.txt" | string & {};
	}
}