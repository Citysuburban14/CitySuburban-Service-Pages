import {defineArrayMember, defineField, defineType} from 'sanity'

export const serviceCluster = defineType({
  name: 'serviceCluster',
  title: 'Service clusters',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Cluster name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', title: 'Cluster slug', type: 'slug', options: {source: 'name', maxLength: 96}, validation: (rule) => rule.required()}),
    defineField({name: 'description', title: 'Public description', type: 'text', rows: 4, validation: (rule) => rule.required()}),
    defineField({name: 'displayOrder', title: 'Display order', type: 'number', validation: (rule) => rule.required().integer().min(1)}),
    defineField({name: 'sourceServiceCount', title: 'Source topic count', type: 'number', validation: (rule) => rule.integer().min(0)}),
    defineField({name: 'monthlySearchVolume', title: 'Combined monthly search volume', type: 'number', validation: (rule) => rule.integer().min(0)}),
    defineField({name: 'chicagoSearchVolume', title: 'Combined Chicago search volume', type: 'number', validation: (rule) => rule.integer().min(0)}),
    defineField({name: 'serviceIds', title: 'Mapped service IDs', type: 'array', of: [defineArrayMember({type: 'number'})]}),
    defineField({name: 'requiresScopeReview', title: 'Requires scope review', type: 'boolean', initialValue: false}),
    defineField({name: 'buildNote', title: 'Internal build note', type: 'text', rows: 3}),
    defineField({name: 'active', title: 'Active', type: 'boolean', initialValue: true}),
  ],
  orderings: [{title: 'Workbook order', name: 'displayOrder', by: [{field: 'displayOrder', direction: 'asc'}]}],
  preview: {
    select: {title: 'name', count: 'sourceServiceCount', active: 'active'},
    prepare: ({title, count, active}) => ({
      title,
      subtitle: `${Number(count || 0)} source topics${active === false ? ' · inactive' : ''}`,
    }),
  },
})
