import {defineField} from 'sanity'

export default {
  type: 'document',
  title: 'Image asset',
  name: 'imageAsset',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      type: 'image',
      title: 'Image',
      name: 'image',
    }),
    defineField({
      name: 'altText',
      title: 'Alt text',
      type: 'string',
    }),
  ],
}
