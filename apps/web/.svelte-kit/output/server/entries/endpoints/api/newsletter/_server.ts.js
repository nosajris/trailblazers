import { s as services } from "../../../../chunks/services.js";
import { error, json, redirect } from "@sveltejs/kit";
const POST = async ({ request }) => {
  let email;
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const body = await request.json().catch(() => null);
    email = typeof body?.email === "string" ? body.email : void 0;
  } else {
    const fd = await request.formData();
    email = fd.get("email")?.toString();
  }
  if (!email?.includes("@")) {
    throw error(400, "Valid email required");
  }
  const local = email.split("@")[0] ?? "Friend";
  await services.inquiries.createGeneral({
    name: local,
    email,
    message: "Newsletter signup",
    type: "NEWSLETTER"
  });
  const wantsJson = ct.includes("application/json") || request.headers.get("accept")?.includes("application/json");
  if (wantsJson) return json({ ok: true });
  return redirect(303, "/?subscribed=1");
};
export {
  POST
};
