import * as server from '../entries/pages/audit-logs/_page.server.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/audit-logs/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/audit-logs/+page.server.ts";
export const imports = ["_app/immutable/nodes/3.B8bwQEcy.js","_app/immutable/chunks/DCCVTP3Q.js","_app/immutable/chunks/BkQjlgfs.js","_app/immutable/chunks/CvhFVXHT.js","_app/immutable/chunks/lNdkYH_X.js","_app/immutable/chunks/Dvcw_EIZ.js"];
export const stylesheets = [];
export const fonts = [];
