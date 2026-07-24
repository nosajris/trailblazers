import * as server from '../entries/pages/groups/_page.server.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/groups/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/groups/+page.server.ts";
export const imports = ["_app/immutable/nodes/5.Cp12CL0x.js","_app/immutable/chunks/DCCVTP3Q.js","_app/immutable/chunks/BkQjlgfs.js","_app/immutable/chunks/CvhFVXHT.js","_app/immutable/chunks/lNdkYH_X.js","_app/immutable/chunks/Dvcw_EIZ.js"];
export const stylesheets = [];
export const fonts = [];
