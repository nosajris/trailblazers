import * as server from '../entries/pages/faq/_page.server.ts.js';

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/faq/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/faq/+page.server.ts";
export const imports = ["_app/immutable/nodes/7.0jIBDcfF.js","_app/immutable/chunks/BTdYg2-W.js","_app/immutable/chunks/B7gP3DQG.js","_app/immutable/chunks/Cx81TylJ.js","_app/immutable/chunks/DN45eQqq.js","_app/immutable/chunks/BkTPFGVB.js","_app/immutable/chunks/h_PTWkXA.js","_app/immutable/chunks/BuIZVVoH.js","_app/immutable/chunks/C0tT2qC0.js","_app/immutable/chunks/1CaRCccU.js","_app/immutable/chunks/iow1fbYq.js"];
export const stylesheets = [];
export const fonts = [];
