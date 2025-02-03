/// <reference lib="deno.unstable" />
import { ImageMeta, ImageSlice } from "./types.ts";

const kv = await Deno.openKv();

const chunkSize = 60 * 1024;

export const setImage = async (data: File, md5: string) => {
  const id = md5;
  const domain = Deno.env.get("DOMAIN")?.toString()
  const url = `https://${domain}/images/${id}`;
  const imageMeta: ImageMeta = {
    id,
    url,
    size: data.size,
    type: data.type,
    createdAt: new Date(),
    name: data.name
  };
  await kv.set(["image", "meta", id], imageMeta);

  let offset = 0;
  const chunks: Uint8Array[] = [];
  while (offset < data.size) {
    const end = offset + chunkSize;
    const chunkBlob = data.slice(offset, Math.min(end, data.size));

    const chunk = await readChunk(chunkBlob);
    chunks.push(chunk);

    offset = end;
  }

  chunks.forEach(async (v, k) => {
    const imageSilce: ImageSlice = {
      data: v,
    };
    await kv.set(["image", "slice", id, k], imageSilce);
  });
  return url;
};

function readChunk(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error("读取失败"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

export const getImage = async (id: string) => {
  const imageMeta = await kv.get<ImageMeta>(["image", "meta", id]);
  const imageSlices = await kv.list<ImageSlice>({
    prefix: ["image", "slice", id],
  });
  if (!imageMeta.value) {
    throw new Error("image don`t exited");
  }
  const result = new Uint8Array(imageMeta.value.size);
  let offset = 0;
  for await (const imageSlice of imageSlices) {
    result.set(imageSlice.value.data, offset);
    offset += imageSlice.value.data.length;
  }

  return { imageMeta, result };
};

export const getImageMeta = (id: string) => {
  return kv.get(["image", "meta", id]).then((e)=>e.value as ImageMeta);
};
