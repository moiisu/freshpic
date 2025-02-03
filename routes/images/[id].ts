import { FreshContext } from "$fresh/server.ts";
import { getImage } from "../../utils/db.ts";

export const handler = async (
  _req: Request,
  ctx: FreshContext,
): Promise<Response> => {
    const id = ctx.params.id  
    if (id) {
        const {imageMeta,result} = await getImage(id)
        return new Response(result,{
            headers: {
                "content-type": imageMeta.value.type,
              },
        })
    }

  return new Response("error");
};
