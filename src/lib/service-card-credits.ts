import newMedia from '../../data/service-card-new-media.json'
import media306 from '../../data/media-sources-306-315.json'
import media316 from '../../data/media-sources-316-325.json'

const existingMedia = [...Object.values(media306.assets), ...Object.values(media316.assets)].map(asset => ({
  image: asset.path.replace(/^public\//, '/services/'),
  source: asset.sourceUrl,
  author: asset.credit.split(' / Wikimedia')[0],
  license: asset.credit.match(/\(([^)]+)\)/)?.[1] || 'See source',
  licenseUrl: asset.licenseUrl,
}))

export function serviceCardCredits(images: Array<string | null | undefined>) {
  return [...newMedia, ...existingMedia].filter((asset, index, rows) => images.includes(asset.image) &&
    rows.findIndex(row => row.image === asset.image) === index)
}
