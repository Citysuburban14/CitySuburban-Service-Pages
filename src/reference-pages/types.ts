export type ReferenceSnapshot = {
  style: string
  html: string
  schema: string
  mainAttributes: Record<string, string>
  wrapperAttributes: Record<string, string>
  sections: Array<{_key: string; module: string; html: string; contentFields?: ReferenceContentField[]}>
}
import type {ReferenceContentField} from '@/lib/reference-content-fields'
