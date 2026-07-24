import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.Ce6Fi3rF.js","_app/immutable/chunks/BTdYg2-W.js","_app/immutable/chunks/B7gP3DQG.js","_app/immutable/chunks/BkTPFGVB.js","_app/immutable/chunks/h_PTWkXA.js","_app/immutable/chunks/Cx81TylJ.js"];
export const stylesheets = ["_app/immutable/assets/0.DeIM_v_6.css"];
export const fonts = [];
