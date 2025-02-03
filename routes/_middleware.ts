import { FreshContext } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";

export function handler(
  req: Request,
  ctx: FreshContext,
) {
  const cookies = getCookies(req.headers);
  const url = new URL(req.url);
  const token = Deno.env.get("TOKEN")
  if ((url.pathname === "/" || url.pathname.includes("/api") ) && cookies.token !== token) {
      return new Response("", {
        status: 307,
        headers: { Location: "/login" },
      });
  }
  if (url.pathname === "/login" && cookies.token === token) {
    return new Response("", {
        status: 307,
        headers: { Location: "/" },
      });
  }
  return ctx.next();
}
