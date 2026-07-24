
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
		RouteId(): "/" | "/api" | "/api/health" | "/audit-logs" | "/events" | "/groups" | "/login" | "/logout" | "/sermons" | "/settings" | "/stories" | "/submissions";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/api": Record<string, never>;
			"/api/health": Record<string, never>;
			"/audit-logs": Record<string, never>;
			"/events": Record<string, never>;
			"/groups": Record<string, never>;
			"/login": Record<string, never>;
			"/logout": Record<string, never>;
			"/sermons": Record<string, never>;
			"/settings": Record<string, never>;
			"/stories": Record<string, never>;
			"/submissions": Record<string, never>
		};
		Pathname(): "/" | "/api/health" | "/audit-logs" | "/events" | "/groups" | "/login" | "/logout" | "/sermons" | "/settings" | "/stories" | "/submissions";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}