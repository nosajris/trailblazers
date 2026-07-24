import { s as services } from "../chunks/services.js";
const SESSION_COOKIE = "tb_session";
const handle = async ({ event, resolve }) => {
  const token = event.cookies.get(SESSION_COOKIE);
  if (token) {
    event.locals.user = await services.iam.validateSession(token);
  } else {
    event.locals.user = null;
  }
  return resolve(event);
};
export {
  handle
};
