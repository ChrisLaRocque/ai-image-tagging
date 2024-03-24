// sanity.js
import { createClient } from "@sanity/client";
// Import using ESM URL imports in environments that supports it:
// import {createClient} from 'https://esm.sh/@sanity/client'

export const client = createClient({
  projectId: process.env.SANITY_PROJECT,
  dataset: "production",
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: "2023-12-31", // use current date (YYYY-MM-DD) to target the latest API version
  token: process.env.SANITY_TOKEN, // Only if you want to update content with the client
});

export async function getTags() {
  const tags = await client.fetch('*[_type == "media.tag"]{name, _id}');
  return tags;
}

export async function createTag(tag) {
  const result = await client.create(tag);
  return result;
}

export async function updateImageTags(_id, tags) {
  const result = client.patch(_id).set({ opt: { media: { tags } } });
  console.log("result", result);
  return result;
}
