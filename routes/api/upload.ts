import { FreshContext } from "$fresh/server.ts";
import { crypto } from "jsr:@std/crypto";
import { getImageMeta, setImage } from "../../utils/db.ts";
import { encodeHex } from "jsr:@std/encoding/hex";

export const handler = async (
  req: Request,
  _ctx: FreshContext,
): Promise<Response> => {
  const form = await req.formData();
  const file = form.get("file") as File;
  const readableStream = await file.arrayBuffer()
  const fileHashBuffer = await crypto.subtle.digest("MD5",readableStream);
  const fileHash = encodeHex(fileHashBuffer);

  const oldImageMeta = await getImageMeta(fileHash)
  if (oldImageMeta !== null) {
    return new Response(oldImageMeta.url)
  }
  

  const url = await setImage(file,fileHash)

  return new Response(url);
};
