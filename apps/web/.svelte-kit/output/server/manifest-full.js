export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["images/BishopZowa.jpeg","images/camp-video.mp4","images/camp.jpg","images/camp02.mp4","images/comments.png","images/favourites.png","images/image01.jpeg","images/image02.jpg","images/image03.jpeg","images/image04.jpeg","images/image05.jpeg","images/image06.jpeg","images/image07.jpeg","images/image08.jpeg","images/image09.jpeg","images/image10.jpeg","images/image11.jpeg","images/image12.jpeg","images/image13.jpeg","images/image14.jpeg","images/image15.jpeg","images/image16.jpeg","images/image17.jpeg","images/image18.jpeg","images/image19.jpeg","images/image20.jpeg","images/image21.jpeg","images/image22.jpeg","images/image23.jpeg","images/like.png","images/PAOZLOGO.png","images/presiding.jpg","images/profile2.jpg","images/RevMadzima.jpg","images/RevWashie.jpg","images/sermon1.jpg","images/sermon2.jpg","images/slider01.jpeg","images/slider02.jpeg","images/slider03.jpeg","images/slider04.jpeg","images/slider05.jpeg","images/slider06.jpeg","images/slider07.jpeg","images/twitter-x.png","images/wallpaper01.jpg","images/wallpaper02.jpg","images/wallpaper03.jpg","images/wallpaper04.jpg","images/wallpaper05.jpeg","images/wallpaper06.jpg","images/wallpaper07.jpg","robots.txt"]),
	mimeTypes: {".jpeg":"image/jpeg",".mp4":"video/mp4",".jpg":"image/jpeg",".png":"image/png",".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.Cs0iYyWW.js",app:"_app/immutable/entry/app.KMUPpaa5.js",imports:["_app/immutable/entry/start.Cs0iYyWW.js","_app/immutable/chunks/29-ZQM0Q.js","_app/immutable/chunks/B7gP3DQG.js","_app/immutable/chunks/BuIZVVoH.js","_app/immutable/entry/app.KMUPpaa5.js","_app/immutable/chunks/B7gP3DQG.js","_app/immutable/chunks/C0tT2qC0.js","_app/immutable/chunks/BTdYg2-W.js","_app/immutable/chunks/BuIZVVoH.js","_app/immutable/chunks/1CaRCccU.js","_app/immutable/chunks/h_PTWkXA.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js')),
			__memo(() => import('./nodes/10.js')),
			__memo(() => import('./nodes/11.js')),
			__memo(() => import('./nodes/12.js')),
			__memo(() => import('./nodes/13.js')),
			__memo(() => import('./nodes/14.js')),
			__memo(() => import('./nodes/15.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/health",
				pattern: /^\/api\/health\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/health/_server.ts.js'))
			},
			{
				id: "/api/newsletter",
				pattern: /^\/api\/newsletter\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/newsletter/_server.ts.js'))
			},
			{
				id: "/bep-hub",
				pattern: /^\/bep-hub\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/contact",
				pattern: /^\/contact\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/events",
				pattern: /^\/events\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/events/[id]",
				pattern: /^\/events\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/events/[id]/ics",
				pattern: /^\/events\/([^/]+?)\/ics\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/events/_id_/ics/_server.ts.js'))
			},
			{
				id: "/faq",
				pattern: /^\/faq\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/give",
				pattern: /^\/give\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/groups",
				pattern: /^\/groups\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/messages",
				pattern: /^\/messages\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/plan-a-visit",
				pattern: /^\/plan-a-visit\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/robots.txt",
				pattern: /^\/robots\.txt\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/robots.txt/_server.ts.js'))
			},
			{
				id: "/serve",
				pattern: /^\/serve\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/sitemap.xml",
				pattern: /^\/sitemap\.xml\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/sitemap.xml/_server.ts.js'))
			},
			{
				id: "/stories",
				pattern: /^\/stories\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/stories/[id]",
				pattern: /^\/stories\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/watch",
				pattern: /^\/watch\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 15 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
