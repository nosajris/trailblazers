import * as server from '../entries/pages/watch/_page.server.ts.js';

export const index = 15;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/watch/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/watch/+page.server.ts";
export const imports = ["_app/immutable/nodes/15.D6cd6-rc.js","_app/immutable/chunks/BTdYg2-W.js","_app/immutable/chunks/B7gP3DQG.js","_app/immutable/chunks/C0tT2qC0.js","_app/immutable/chunks/1CaRCccU.js","_app/immutable/chunks/h_PTWkXA.js","_app/immutable/chunks/BuIZVVoH.js","_app/immutable/chunks/DN45eQqq.js","_app/immutable/chunks/BkTPFGVB.js","_app/immutable/chunks/Cx81TylJ.js"];
export const stylesheets = [];
export const fonts = [];
