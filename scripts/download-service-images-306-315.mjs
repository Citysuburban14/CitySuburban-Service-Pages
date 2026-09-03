import fs from 'node:fs/promises'
import path from 'node:path'

const outputDirectory = path.resolve('public/images/services/city-suburban/306-315')
const metadataPath = path.resolve('data/media-sources-306-315.json')

const files = [
  {key: 'licensed-unit-heater', title: 'File:Hydronic Unit Heater.jpg', filename: 'hydronic-unit-heater.jpg', alt: 'Hydronic fan unit heater used for fixed-space heating'},
  {key: 'licensed-ductwork', title: 'File:HVAC ductwork in the chiller plant room of the future LIRR passenger concourse. (CM014B, 01-09-2019) (31760231797).jpg', filename: 'hvac-ductwork.jpg', alt: 'Large sheet-metal HVAC ductwork and fittings'},
  {key: 'licensed-boiler', title: 'File:Gas boiler Junkers.jpg', filename: 'gas-boiler.jpg', alt: 'Wall-mounted gas boiler with visible service connections', credit: 'Pavel Ševela / Wikimedia Commons (CC BY-SA 3.0)'},
  {key: 'licensed-radiator', title: 'File:Einrohrheizung.JPG', filename: 'hot-water-radiator.jpg', alt: 'Hot-water radiator with a single-pipe connection'},
  {key: 'licensed-mechanical-room', title: 'File:Mechanical room.jpg', filename: 'mechanical-room.jpg', alt: 'Heating and cooling equipment and piping in a mechanical room'},
  {key: 'licensed-gas-fireplace', title: 'File:NT Typical gas log fireplace (5114230942).jpg', filename: 'gas-log-fireplace.jpg', alt: 'Gas-log fireplace appliance'},
  {key: 'licensed-fireplace-heater', title: 'File:Gas heater at fireplace in house in Carrollton New Orleans.jpg', filename: 'fireplace-gas-heater.jpg', alt: 'Gas heater installed in a residential fireplace'},
  {key: 'licensed-mini-split', title: 'File:Mini-Split AC (52120570875).jpg', filename: 'mini-split-ac.jpg', alt: 'Ductless mini-split air-conditioning unit'},
  {key: 'licensed-thermostat', title: 'File:Smart heating control unit displayed on a wall with power indicator lights showing status in a home setting.jpg', filename: 'smart-heating-control.jpg', alt: 'Smart wall-mounted heating control in a home'},
  {key: 'licensed-smart-thermostat', title: 'File:Nest Learning Thermostat (cropped).JPG', filename: 'smart-thermostat.jpg', alt: 'Smart learning thermostat with a digital temperature display'},
  {key: 'licensed-thermostat-wiring', title: 'File:Digital thermostat wall.JPG', filename: 'digital-thermostat-wall-plate.jpg', alt: 'Digital thermostat wall plate with its cover removed'},
  {key: 'licensed-pellet-stove', title: 'File:Pellet stove.jpg', filename: 'pellet-stove.jpg', alt: 'Freestanding pellet stove appliance'},
  {key: 'licensed-pellet-heater', title: 'File:Wood-pellet heater.jpg', filename: 'wood-pellet-heater-interior.jpg', alt: 'Interior burn pot and mechanism of a wood-pellet heater'},
  {key: 'licensed-chimney-sweep', title: 'File:Chimney sweep modern.jpg', filename: 'modern-chimney-sweep.jpg', alt: 'Modern chimney-sweeping equipment in use'},
  {key: 'licensed-chimney-brushes', title: 'File:Depictions of the brushes of a chimney sweep. Coloured engra Wellcome V0039426.jpg', filename: 'chimney-sweep-brushes.jpg', alt: 'Illustrated chimney-sweeping brushes and tools', credit: 'Wellcome Collection / Wikimedia Commons (CC BY 4.0)'},
  {key: 'licensed-window-ac', title: 'File:Modern window-type air conditioner at a school.jpg', filename: 'window-air-conditioner.jpg', alt: 'Modern window-type air conditioner installed in an opening'},
  {key: 'licensed-portable-ac', title: 'File:Air Conditioner Hoses in Window (54273679109).jpg', filename: 'portable-ac-window-hoses.jpg', alt: 'Portable air-conditioner exhaust hoses routed through a window'},
  {key: 'licensed-air-purifier', title: 'File:Air Purifier (Levoit LV-H133) (49318569587).jpg', filename: 'air-purifier-hepa.jpg', alt: 'Portable air purifier with its HEPA filter exposed'},
  {key: 'licensed-hepa-filter', title: 'File:Circular HEPA air filter & activated carbon filter (1).jpg', filename: 'hepa-carbon-filter.jpg', alt: 'Circular HEPA and activated-carbon air-purifier filter'},
]

const stripHtml = (value = '') => value
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ')
  .trim()

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
const fetchWithRetry = async (url, options, label) => {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(url, options)
    if (response.ok) return response
    if (response.status !== 429 || attempt === 5) throw new Error(`${label}: ${response.status}`)
    await wait(attempt * 5000)
  }
  throw new Error(`${label}: retry limit reached`)
}

await fs.mkdir(outputDirectory, {recursive: true})
const existingMetadata = await fs.readFile(metadataPath, 'utf8').then(JSON.parse).catch(() => ({assets: {}}))
const assets = {...existingMetadata.assets}

for (const entry of files) {
  const destination = path.join(outputDirectory, entry.filename)
  if (assets[entry.key] && await fs.stat(destination).then(() => true).catch(() => false)) {
    console.log(`Kept ${entry.key}`)
    continue
  }
  const apiUrl = new URL('https://commons.wikimedia.org/w/api.php')
  apiUrl.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    prop: 'imageinfo',
    titles: entry.title,
    iiprop: 'url|extmetadata',
    iiurlwidth: '1600',
    origin: '*',
  }).toString()

  const response = await fetchWithRetry(apiUrl, {headers: {'User-Agent': 'CitySuburbanServicePages/1.0 (licensed-media-import)'}}, `Commons metadata request failed for ${entry.title}`)
  const json = await response.json()
  const page = json.query?.pages?.[0]
  const info = page?.imageinfo?.[0]
  if (!info?.thumburl) throw new Error(`No downloadable image found for ${entry.title}`)

  const imageResponse = await fetchWithRetry(info.thumburl, {headers: {'User-Agent': 'CitySuburbanServicePages/1.0 (licensed-media-import)'}}, `Image download failed for ${entry.title}`)
  await fs.writeFile(destination, Buffer.from(await imageResponse.arrayBuffer()))

  const metadata = info.extmetadata || {}
  const author = stripHtml(metadata.Artist?.value) || 'Wikimedia Commons contributor'
  const license = stripHtml(metadata.LicenseShortName?.value) || 'See source page'
  assets[entry.key] = {
    path: path.relative(process.cwd(), destination).replaceAll('\\', '/'),
    alt: entry.alt,
    credit: entry.credit || `${author} / Wikimedia Commons (${license})`,
    sourceUrl: info.descriptionurl,
    licenseUrl: metadata.LicenseUrl?.value || '',
  }
  console.log(`Downloaded ${entry.key}`)
  await wait(1500)
}

await fs.writeFile(metadataPath, `${JSON.stringify({assets}, null, 2)}\n`, 'utf8')
console.log(`Wrote ${metadataPath}`)
