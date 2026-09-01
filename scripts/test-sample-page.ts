async function main() {
  const baseUrl = (process.argv[2] || process.env.SAMPLE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')
  const pathname = '/services/furnace/lincoln-park'
  const response = await fetch(`${baseUrl}${pathname}`)
  const html = await response.text()

  const failures: string[] = []
  const expect = (condition: unknown, message: string) => {
    if (!condition) failures.push(message)
  }

  expect(response.status === 200, `${pathname} returned ${response.status}`)
  for (const required of [
    'Furnace Repair in Lincoln Park',
    'Greystones with retrofitted ductwork',
    'Furnace repair in Lincoln Park typically costs $150 to $600',
    'Carrier',
    'Comfortmaker',
    'Did you calculate the load, or match the old nameplate?',
    'Is my block in a landmark district?',
    'DePaul &amp; Sheffield Neighbors',
    'Lincoln Park homes and furnace access',
  ]) expect(html.includes(required), `Sample page is missing ${JSON.stringify(required)}`)

  expect(html.includes('/services/images/services/furnace-repair.png'), 'Sample page is missing the authentic furnace image')
  expect((html.match(/class="rev-card"/g) || []).length === 2, 'Sample page must render the two supplied reviews')
  expect((html.match(/class="photo-slot-label"/g) || []).length >= 4, 'Sample page must expose the supplied photo placeholders')
  expect(!html.includes('local sample? in Lincoln Park?'), 'Sample page has a duplicated question mark in the brand heading')

  if (failures.length) {
    console.error(`Sample page test failed with ${failures.length} failure(s):\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
    process.exit(1)
  }

  console.log('Sample page test passed: equipment, area, and page-specific content are merged into the shared L4 design.')
}

void main()
