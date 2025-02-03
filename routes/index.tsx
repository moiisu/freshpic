import { FreshContext, Handlers } from "$fresh/server.ts";
import Upload  from "../islands/Upload.tsx";

export const handler: Handlers = {
  async GET(_req: Request, ctx: FreshContext) {
    const resp = await ctx.render();
    return resp;
  },
};

export default function Home() {
  return <Upload />;
}