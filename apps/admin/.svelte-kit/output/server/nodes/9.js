import * as server from '../entries/pages/settings/_page.server.ts.js';

export const index = 9;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/settings/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/settings/+page.server.ts";
export const imports = ["_app/immutable/nodes/9.nQAjZ4c-.js","_app/immutable/chunks/DCCVTP3Q.js","_app/immutable/chunks/BkQjlgfs.js","_app/immutable/chunks/DbU_RvPP.js"];
export const stylesheets = [];
export const fonts = [];
