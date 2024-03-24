import { NextRequest } from "next/server";
import { createTag, getTags, updateImageTags } from "@/lib/sanity";
import { uuid } from "@sanity/uuid";

export async function POST(req: NextRequest, res) {
  const {
    url,
    _id,
    opt: {
      media: { tags },
    },
  } = await req.json();
  console.log("tagz", tags);
  const allTags = await getTags();
  console.log("allTags", allTags);
  const aiTags = tags
    ? [
        ...tags.map((tag) => {
          return {
            _ref: tag._id,
            _type: "reference",
            _weak: true,
          };
        }),
      ]
    : [];
  // Azure Computer Vision API endpoint and API key
  const endpoint = process.env.AZURE_ENDPOINT;
  const apiKey = process.env.AZURE_KEY;

  // URL of the image you want to analyze
  // const imageUrl =
  //   "https://portal.vision.cognitive.azure.com/dist/assets/ImageTaggingSample0-276aeff6.jpg";

  // Define the parameters for the API request
  const params = new URLSearchParams({
    visualFeatures: "Categories,Description,Tags",
    language: "en",
  });
  // const example = {
  //   _ref: "yes",
  //   _weak: true,
  //   _type: "reference",
  // };
  // Set up the headers with the API key
  const headers = {
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": apiKey,
  };

  // 1. Get all tags
  // 2. Foreach AI tag check if its already on the image, if not check if it exists in allTags
  // 3. If tag exists, push to aiTags
  // 4. If tag doesn't exist, create
  // 5. Push new tag to aiTags
  // 6. Set aiTags

  // Make the API request to analyze the image
  fetch(`${endpoint}?${params.toString()}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ url }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`HTTP error! Status: ${response.statusText}`);
      }
    })
    .then(async (data) => {
      console.log("data", data);
      // Extract and display the tags from the response
      for (let i = 0; i < data.tags.length; i++) {
        console.log("i", i);
        const tagName = data.tags[i].name;
        // if this tag is already on our image return
        if (tags && tags.map((tag) => tag.name.current).includes(tagName)) {
          console.log("tags");
          continue;
        }
        // Tag exists but isn't linked to image
        if (allTags.map((tag) => tag.name.current).includes(tagName)) {
          console.log("here 2");
          const thisTag = allTags.filter(
            (tag) => tag.name.current == tagName
          )[0];
          console.log("thisTag", thisTag);
          aiTags.push({
            _ref: thisTag._id,
            _weak: true,
            _type: "reference",
          });
          continue;
        }
        const id = uuid();
        const newTag = await createTag({
          _type: "media.tag",
          _id: id,
          name: { current: data.tags[i].name, _type: "slug" },
        });
        console.log("newTag", newTag);

        aiTags.push({
          _ref: newTag._id,
          _weak: true,
          _type: "reference",
        });
        continue;
      }
      // tags.forEach((tag) => {
      //   console.log(tag.name);
      // });
      return await updateImageTags(_id, aiTags);
    })
    .catch((error) => {
      console.error("Error analyzing the image:", error);
    });
  return Response.json({ yes: true });
}
