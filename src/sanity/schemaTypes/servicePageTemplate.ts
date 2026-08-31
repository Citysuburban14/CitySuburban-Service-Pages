import {defineArrayMember, defineField, defineType} from 'sanity'

const sections = [
  'hero', 'types', 'brands', 'trust', 'reviews', 'why', 'workingArea',
  'coverage', 'otherServices', 'pricing', 'faq', 'closingCta', 'guides',
]

export const servicePageTemplate = defineType({
  name: 'servicePageTemplate',
  title: 'Service-page template',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Template name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'version', title: 'Version', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'active', title: 'Active', type: 'boolean', initialValue: true}),
    defineField({
      name: 'presentation', title: 'Shared presentation rules', type: 'object',
      description: 'Reusable design rules applied to every service page that references this template.',
      fields: [
        defineField({name: 'footerColor', title: 'City & Suburban navy', type: 'string', initialValue: '#09263A'}),
        defineField({name: 'accentColor', title: 'City & Suburban red', type: 'string', initialValue: '#DD382B'}),
        defineField({name: 'accentDarkColor', title: 'Red hover color', type: 'string', initialValue: '#B92E23'}),
        defineField({name: 'actionBlueColor', title: 'Schedule-service blue', type: 'string', initialValue: '#0A4265'}),
        defineField({name: 'equalHeightReviewCards', title: 'Equal-height review cards', type: 'boolean', initialValue: true}),
        defineField({name: 'ratingAfterReviewText', title: 'Rating after review text', type: 'boolean', initialValue: true}),
        defineField({name: 'coverageMapFirst', title: 'Coverage map before neighborhoods', type: 'boolean', initialValue: true}),
        defineField({name: 'neighborhoodGrid', title: 'Neighborhood grid without scrollbar', type: 'boolean', initialValue: true}),
        defineField({name: 'brandLogoCards', title: 'Equipment brand logo cards', type: 'boolean', initialValue: true}),
        defineField({name: 'pricingHeadingAsQuestion', title: 'Pricing heading ends with a question mark', type: 'boolean', initialValue: true}),
      ],
    }),
    defineField({
      name: 'sectionOrder', title: 'Section order', type: 'array',
      of: [defineArrayMember({type: 'string', options: {list: sections.map((value) => ({title: value, value}))}})],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {select: {title: 'name', subtitle: 'version'}},
})
