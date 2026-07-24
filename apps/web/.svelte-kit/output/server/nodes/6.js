import * as server from '../entries/pages/events/_id_/_page.server.ts.js';

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/events/_id_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/events/[id]/+page.server.ts";
export const imports = ["_app/immutable/nodes/6.cgh5I8tu.js","_app/immutable/chunks/BTdYg2-W.js","_app/immutable/chunks/B7gP3DQG.js","_app/immutable/chunks/C0tT2qC0.js","_app/immutable/chunks/1CaRCccU.js","_app/immutable/chunks/h_PTWkXA.js","_app/immutable/chunks/BuIZVVoH.js","_app/immutable/chunks/BkTPFGVB.js","_app/immutable/chunks/DN45eQqq.js"];
export const stylesheets = [];
export const fonts = [];
