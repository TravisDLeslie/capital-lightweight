export const deliveryZones = {
  83702: { city: 'Boise', dumped: 40, forklift: 50, hand: 60, handTwo: 100 },
  83703: { city: 'Boise', dumped: 40, forklift: 50, hand: 60, handTwo: 100 },
  83704: { city: 'Boise', dumped: 40, forklift: 50, hand: 60, handTwo: 100 },
  83705: { city: 'Boise', dumped: 45, forklift: 60, hand: 75, handTwo: 115 },
  83706: { city: 'Boise', dumped: 45, forklift: 60, hand: 75, handTwo: 115 },
  83709: { city: 'Boise', dumped: 50, forklift: 65, hand: 80, handTwo: 120 },
  83712: { city: 'Boise', dumped: 45, forklift: 60, hand: 75, handTwo: 115 },
  83713: { city: 'Boise / Meridian', dumped: 50, forklift: 65, hand: 80, handTwo: 120 },
  83714: { city: 'Boise / Eagle', dumped: 60, forklift: 75, hand: 95, handTwo: 135 },
  83716: { city: 'Boise', dumped: 60, forklift: 80, hand: 100, handTwo: 140 },
  83616: { city: 'Eagle / Star', dumped: 60, forklift: 75, hand: 95, handTwo: 135 },
  83634: { city: 'Kuna', dumped: 70, forklift: 90, hand: 115, handTwo: 155 },
  83642: { city: 'Meridian / Kuna', dumped: 50, forklift: 65, hand: 80, handTwo: 120 },
  83646: { city: 'Meridian / Nampa / Eagle / Star', dumped: 50, forklift: 65, hand: 80, handTwo: 120 },
  83669: { city: 'Star', dumped: 65, forklift: 85, hand: 105, handTwo: 145 },
  83680: { city: 'Meridian', dumped: 40, forklift: 50, hand: 60, handTwo: 100 },
  83687: { city: 'Nampa / Meridian', dumped: 65, forklift: 85, hand: 105, handTwo: 145 },
  83651: { city: 'Nampa', dumped: 65, forklift: 85, hand: 105, handTwo: 145 },
  83652: { city: 'Nampa', dumped: 65, forklift: 85, hand: 105, handTwo: 145 },
  83653: { city: 'Nampa', dumped: 65, forklift: 85, hand: 105, handTwo: 145 },
  83686: { city: 'Nampa', dumped: 65, forklift: 85, hand: 105, handTwo: 145 },
  83605: { city: 'Caldwell', dumped: 80, forklift: 105, hand: 130, handTwo: 170 },
  83606: { city: 'Caldwell', dumped: 80, forklift: 105, hand: 130, handTwo: 170 },
  83607: { city: 'Caldwell', dumped: 80, forklift: 105, hand: 130, handTwo: 170 },
  83644: { city: 'Middleton', dumped: 75, forklift: 95, hand: 120, handTwo: 160 },
  83622: { city: 'Garden Valley', dumped: 190, forklift: 230, hand: 290, handTwo: 330 },
  83631: { city: 'Idaho City', dumped: 175, forklift: 215, hand: 270, handTwo: 310 },
  83638: { city: 'McCall', dumped: 225, forklift: 275, hand: 340, handTwo: 380 },
  83615: { city: 'Donnelly', dumped: 240, forklift: 295, hand: 360, handTwo: 400 },
  83611: { city: 'Cascade', dumped: 210, forklift: 260, hand: 320, handTwo: 360 },
}

export const primaryUnloadMethods = [
  { id: 'dumped', label: 'Dumped' },
  { id: 'forklift', label: 'Forklift' },
]

export const handUnloadMethods = [
  { id: 'hand', label: '1 person' },
  { id: 'handTwo', label: '2 people' },
]

export const methodLabels = {
  dumped: 'Dumped',
  forklift: 'Forklift',
  hand: 'Hand unload, 1 person',
  handTwo: 'Hand unload, 2 people',
}

const deliveryCities = [
  { name: 'Boise', aliases: ['boise'] },
  { name: 'Meridian', aliases: ['meridian'] },
  { name: 'Kuna', aliases: ['kuna', 'kunda'] },
  { name: 'Nampa', aliases: ['nampa'] },
  { name: 'Caldwell', aliases: ['caldwell'] },
  { name: 'Star', aliases: ['star'] },
  { name: 'Eagle', aliases: ['eagle'] },
  { name: 'Middleton', aliases: ['middleton'] },
  { name: 'Garden Valley', aliases: ['gardenvalley'] },
  { name: 'Idaho City', aliases: ['idahocity'] },
  { name: 'McCall', aliases: ['mccall', 'mccal'] },
  { name: 'Donnelly', aliases: ['donnelly'] },
  { name: 'Cascade', aliases: ['cascade'] },
]

const freeStandardDeliveryZips = ['83702', '83703']

export function getDeliveryZone(zipCode) {
  return deliveryZones[String(zipCode).replace(/\D/g, '')] || null
}

export function findDeliveryZip(prompt) {
  return prompt.match(/\b\d{5}\b/)?.[0] || null
}

export function findDeliveryCity(prompt, normalizeQuery) {
  const normalizedPrompt = normalizeQuery(prompt)

  return (
    deliveryCities.find((city) =>
      city.aliases.some((alias) => normalizedPrompt.includes(alias)),
    ) || null
  )
}

export function getDeliveryCityEstimate(cityName) {
  const cityZones = Object.values(deliveryZones).filter((zone) =>
    zone.city.toLowerCase().includes(cityName.toLowerCase()),
  )

  if (!cityZones.length) {
    return null
  }

  return cityZones.reduce((lowest, zone) =>
    zone.dumped < lowest.dumped ? zone : lowest,
  )
}

export function getDeliveryPriceText(zone) {
  return `starting at $${zone.dumped} for dumped delivery. Forklift unload is $${zone.forklift}, hand unload is $${zone.hand} with 1 person, or $${zone.handTwo} with 2 people.`
}

export function getFreeStandardDeliveryNote(zipCode) {
  if (!zipCode || freeStandardDeliveryZips.includes(String(zipCode))) {
    return '**If your ZIP code is 83702 or 83703, standard delivery is FREE on orders over $750.**'
  }

  return ''
}
