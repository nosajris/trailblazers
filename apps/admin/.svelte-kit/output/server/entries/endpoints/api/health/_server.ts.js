import { json } from "@sveltejs/kit";
import { s as sql } from "../../../../chunks/db.js";
const GET = async () => {
  try {
    await sql`SELECT 1`;
    return json({
      status: "ok",
      app: "admin",
      database: "connected",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    return json(
      {
        status: "error",
        app: "admin",
        database: "disconnected",
        error: err.message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      },
      { status: 500 }
    );
  }
};
export {
  GET
};
