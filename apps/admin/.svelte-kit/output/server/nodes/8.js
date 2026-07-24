import * as server from '../entries/pages/sermons/_page.server.ts.js';

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/sermons/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/sermons/+page.server.ts";
export const imports = ["_app/immutable/nodes/8.DBY_q3WH.js","_app/immutable/chunks/DCCVTP3Q.js","_app/immutable/chunks/BkQjlgfs.js","_app/immutable/chunks/CvhFVXHT.js","_app/immutable/chunks/lNdkYH_X.js","_app/immutable/chunks/Dvcw_EIZ.js","_app/immutable/chunks/DbU_RvPP.js","_app/immutable/chunks/CFQbv7IG.js"];
export const stylesheets = [];
export const fonts = [];
