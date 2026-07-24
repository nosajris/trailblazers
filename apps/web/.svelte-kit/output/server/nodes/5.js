import * as server from '../entries/pages/events/_page.server.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/events/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/events/+page.server.ts";
export const imports = ["_app/immutable/nodes/5.RtgxLiub.js","_app/immutable/chunks/BTdYg2-W.js","_app/immutable/chunks/B7gP3DQG.js","_app/immutable/chunks/1CaRCccU.js","_app/immutable/chunks/h_PTWkXA.js","_app/immutable/chunks/BuIZVVoH.js","_app/immutable/chunks/C0tT2qC0.js","_app/immutable/chunks/DN45eQqq.js","_app/immutable/chunks/BkTPFGVB.js","_app/immutable/chunks/ftufW1Mk.js"];
export const stylesheets = [];
export const fonts = [];
