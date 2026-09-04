import fs from 'node:fs/promises'
import path from 'node:path'

const sourcePath = path.resolve('data/media-sources-316-325.json')
const sources = JSON.parse(await fs.readFile(sourcePath, 'utf8'))

function extension(contentType) {
  if (contentType.includes('png')) return '.png'
  if (contentType.includes('webp')) return '.webp'
  return '.jpg'
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

async function download(url, key) {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(url, {redirect: 'follow', headers: {'user-agent': 'CitySuburbanContentImporter/1.0 (content@maximuslabs.ai)'}})
    if (response.ok) return response
    if (response.status !== 429 || attempt === 4) throw new Error(`${key}: download failed with ${response.status}`)
    await wait(attempt * 10_000)
  }
  throw new Error(`${key}: download failed`)
}

for (const [key, asset] of Object.entries(sources.assets)) {
  const existingPath = path.resolve(asset.path)
  try {
    const existing = await fs.stat(existingPath)
    if (existing.size >= 10_000) {
      console.log(`${key}: reused ${asset.path} (${Math.round(existing.size / 1024)} KB)`)
      continue
    }
  } catch {}
  const response = await download(asset.downloadUrl, key)
  if (!response.ok) throw new Error(`${key}: download failed with ${response.status}`)
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.startsWith('image/')) throw new Error(`${key}: expected image, received ${contentType}`)
  const finalPath = asset.path.endsWith('.jpg') || asset.path.endsWith('.png') || asset.path.endsWith('.webp')
    ? asset.path
    : `${asset.path}${extension(contentType)}`
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length < 10_000) throw new Error(`${key}: image is unexpectedly small (${buffer.length} bytes)`)
  await fs.mkdir(path.dirname(path.resolve(finalPath)), {recursive: true})
  await fs.writeFile(path.resolve(finalPath), buffer)
  asset.path = finalPath
  console.log(`${key}: ${finalPath} (${Math.round(buffer.length / 1024)} KB)`)
  await wait(4_000)
}

await fs.writeFile(sourcePath, `${JSON.stringify(sources, null, 2)}\n`)
