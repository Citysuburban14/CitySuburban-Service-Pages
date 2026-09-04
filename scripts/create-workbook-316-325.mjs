import fs from 'node:fs/promises'
import path from 'node:path'
import {pathToFileURL} from 'node:url'

const artifactModule = pathToFileURL('C:/Users/muthu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs').href
const {SpreadsheetFile, Workbook} = await import(artifactModule)

const root = path.resolve('.')
const source = JSON.parse(await fs.readFile(path.join(root, 'data/source-content-316-325.json'), 'utf8'))
const outputDir = path.join(root, 'outputs', '01a03de6-5778-7f03-8118-2105877ff2a3')
const outputPath = path.join(outputDir, 'CitySuburban_316-325_Fields.xlsx')

const workbook = Workbook.create()
const specs = [
  {name: '01 Equipment', rows: source.equip, status: false},
  {name: '02 Page', rows: source.page, status: true},
  {name: '03 Area', rows: source.area, status: false},
]

function widthFor(header) {
  if (['C', 'service_id'].includes(header)) return 11
  if (header.includes('url') || header.includes('action')) return 34
  if (header.includes('lede') || header.includes('description') || header.includes('note') || header.includes('body')) return 58
  if (['types', 'why', 'pricing_rows', 'faqs', 'reviews', 'guides', 'sub_areas'].includes(header)) return 72
  if (header.includes('color')) return 14
  if (header.includes('lat') || header.includes('lng') || header.includes('rating') || header.includes('count') || header.includes('pct')) return 14
  if (header.includes('slug') || header.includes('title') || header.includes('heading') || header.includes('name')) return 28
  return 20
}

for (const spec of specs) {
  const sheet = workbook.worksheets.add(spec.name)
  sheet.showGridLines = false
  sheet.tabColor = spec.name.startsWith('01') ? '#D64518' : spec.name.startsWith('02') ? '#07385F' : '#2E7D32'
  const baseHeaders = Object.keys(spec.rows[0])
  const headers = spec.status ? [...baseHeaders, 'publishing_status'] : baseHeaders
  const values = spec.rows.map((row) => headers.map((header) => {
    if (header === 'publishing_status') return 'Draft'
    const value = row[header] ?? ''
    return header === 'phone_e164' && String(value).startsWith('+') ? `'${value}` : value
  }))
  sheet.getRangeByIndexes(0, 0, 1, headers.length).values = [headers]
  sheet.getRangeByIndexes(1, 0, values.length, headers.length).values = values
  const used = sheet.getRangeByIndexes(0, 0, values.length + 1, headers.length)
  used.format.wrapText = true
  used.format.verticalAlignment = 'top'
  used.format.font = {name: 'Aptos', size: 10, color: '#203247'}
  used.format.borders = {preset: 'all', style: 'thin', color: '#D6DEE7'}
  const header = sheet.getRangeByIndexes(0, 0, 1, headers.length)
  header.format.fill = '#07385F'
  header.format.font = {name: 'Aptos Display', size: 10, bold: true, color: '#FFFFFF'}
  header.format.verticalAlignment = 'center'
  header.format.rowHeight = 34
  if (values.length) {
    sheet.getRangeByIndexes(1, 0, values.length, Math.min(3, headers.length)).format.fill = '#E8F1F8'
    sheet.getRangeByIndexes(1, 0, values.length, 1).format.font = {name: 'Aptos', size: 10, bold: true, color: '#A83411'}
    sheet.getRangeByIndexes(1, 0, values.length, headers.length).format.rowHeight = spec.name === '03 Area' ? 120 : 90
  }
  if (spec.status) {
    const statusRange = sheet.getRangeByIndexes(1, headers.length - 1, values.length, 1)
    statusRange.format.fill = '#FFF3E0'
    statusRange.format.font = {name: 'Aptos', size: 10, bold: true, color: '#A83411'}
  }
  headers.forEach((field, index) => {
    sheet.getRangeByIndexes(0, index, values.length + 1, 1).format.columnWidth = widthFor(field)
  })
  sheet.freezePanes.freezeRows(1)
  sheet.freezePanes.freezeColumns(Math.min(3, headers.length))
}

await fs.mkdir(outputDir, {recursive: true})
const output = await SpreadsheetFile.exportXlsx(workbook)
await output.save(outputPath)

const inspection = await workbook.inspect({kind: 'sheet,region', maxChars: 5000, tableMaxRows: 4, tableMaxCols: 8, tableMaxCellChars: 60})
console.log(inspection.ndjson)
for (const sheetName of ['01 Equipment', '02 Page', '03 Area']) {
  const preview = await workbook.render({sheetName, range: sheetName === '03 Area' ? 'A1:O2' : 'A1:J6', scale: 1, format: 'png'})
  await fs.writeFile(path.join(outputDir, `${sheetName.replaceAll(' ', '-').toLowerCase()}-preview.png`), new Uint8Array(await preview.arrayBuffer()))
}
console.log(`Saved ${outputPath}`)
