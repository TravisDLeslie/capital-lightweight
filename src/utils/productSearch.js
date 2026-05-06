const numberWords = [
  ['two', '2'],
  ['four', '4'],
  ['six', '6'],
  ['eight', '8'],
]

export function normalizeQuery(value) {
  let normalized = value.toLowerCase()

  numberWords.forEach(([word, number]) => {
    normalized = normalized.replaceAll(word, number)
  })

  return normalized
    .replace(/\bby\b/g, 'x')
    .replace(/\s+/g, '')
    .replace(/[–—-]/g, 'x')
    .replace(/[^a-z0-9/x]/g, '')
}

export function findProduct(query, products) {
  const normalizedQuery = normalizeQuery(query)

  return products.find((product) => {
    return product.aliases.some((alias) => {
      const normalizedAlias = normalizeQuery(alias)
      return (
        normalizedQuery.includes(normalizedAlias) ||
        normalizedAlias.includes(normalizedQuery)
      )
    })
  })
}

export function findProductMatches(query, products) {
  const normalizedQuery = normalizeQuery(query)

  if (!normalizedQuery) {
    return []
  }

  const broadSheetGoodsTerms = ['osb', 'sheathing', 'sheetgoods', 'subfloor']
  const broadHardwareTerms = [
    'simpson',
    'strongtie',
    'hanger',
    'hangers',
    'joisthanger',
    'joisthangers',
    'structuralhardware',
  ]
  const broadEngineeredTerms = [
    'tji',
    'tji110',
    'trusjoist',
    'ijoist',
    'microllam',
    'microlam',
    'lvl',
    'engineeredlumber',
  ]
  const broadBeamTerms = ['beam', 'beams', 'timber', 'timbers', 'postandbeam']
  const broadDeckingTerms = [
    'decking',
    'deckboards',
    'deckboard',
    'deckmaterial',
    'deckmaterials',
  ]
  const broadTerms = [
    ...broadSheetGoodsTerms,
    ...broadHardwareTerms,
    ...broadEngineeredTerms,
    ...broadBeamTerms,
    ...broadDeckingTerms,
  ]
  const isBroadHardwareQuery = broadHardwareTerms.some((term) =>
    normalizedQuery.includes(term),
  )

  if (isBroadHardwareQuery) {
    const exactHardwareMatches = products.flatMap((product) => {
      if (product.category !== 'Structural Hardware') {
        return []
      }

      return product.aliases
        .map((alias) => ({
          product,
          normalizedAlias: normalizeQuery(alias),
        }))
        .filter(({ normalizedAlias }) => {
          return (
            !broadHardwareTerms.includes(normalizedAlias) &&
            normalizedQuery.includes(normalizedAlias)
          )
        })
    })

    exactHardwareMatches.sort(
      (first, second) =>
        second.normalizedAlias.length - first.normalizedAlias.length,
    )

    const exactHardwareProduct = exactHardwareMatches[0]?.product

    if (exactHardwareProduct) {
      return [exactHardwareProduct]
    }

    return products.filter((product) => product.category === 'Structural Hardware')
  }

  if (
    normalizedQuery.includes('redwood') &&
    !/\d+x\d/.test(normalizedQuery)
  ) {
    return products.filter((product) => normalizeQuery(product.name).includes('redwood'))
  }

  const exactProductMatches = products.flatMap((product) => {
    return product.aliases
      .map((alias) => ({
        product,
        normalizedAlias: normalizeQuery(alias),
      }))
      .filter(({ normalizedAlias }) => {
        return (
          !broadTerms.includes(normalizedAlias) &&
          normalizedQuery.includes(normalizedAlias)
        )
      })
  })

  exactProductMatches.sort(
    (first, second) => second.normalizedAlias.length - first.normalizedAlias.length,
  )

  const exactProduct = exactProductMatches[0]?.product

  if (exactProduct) {
    return [exactProduct]
  }

  const isBroadDeckingQuery = broadDeckingTerms.some((term) =>
    normalizedQuery.includes(term),
  )

  if (isBroadDeckingQuery) {
    return products.filter((product) => product.category === 'Decking')
  }

  const isBroadBeamQuery = broadBeamTerms.some((term) =>
    normalizedQuery.includes(term),
  )

  if (isBroadBeamQuery) {
    return products.filter((product) => product.category === 'Timbers & Beams')
  }

  if (normalizedQuery.includes('zip')) {
    return products.filter((product) => {
      const normalizedName = normalizeQuery(product.name)
      return normalizedName.includes('zip') || normalizedName.includes('advantech')
    })
  }

  if (normalizedQuery.includes('2x4')) {
    const twoByFourProducts = products.filter((product) =>
      normalizeQuery(product.name).startsWith('2x4'),
    )

    if (
      normalizedQuery.includes('stud') ||
      normalizedQuery.includes('nps') ||
      normalizedQuery.includes('nopriorselect')
    ) {
      return twoByFourProducts.filter((product) => product.grade === 'NPS')
    }

    return twoByFourProducts
  }

  const isBroadSheetGoodsQuery = broadSheetGoodsTerms.some((term) =>
    normalizedQuery.includes(term),
  )

  if (isBroadSheetGoodsQuery) {
    return products.filter((product) => product.category === 'Sheet Goods')
  }

  if (normalizedQuery.includes('tji110') || normalizedQuery.includes('trusjoist')) {
    return products.filter((product) => product.grade === 'TJI 110')
  }

  if (
    normalizedQuery.includes('microllam') ||
    normalizedQuery.includes('microlam') ||
    normalizedQuery.includes('lvl')
  ) {
    return products.filter((product) => product.grade === 'Microllam LVL')
  }

  const isBroadEngineeredQuery = broadEngineeredTerms.some((term) =>
    normalizedQuery.includes(term),
  )

  if (isBroadEngineeredQuery) {
    return products.filter((product) => product.category === 'Engineered Lumber')
  }

  return products.filter((product) => {
    const searchableValues = [
      product.name,
      product.category,
      product.dimensions,
      product.grade,
      ...product.aliases,
    ]

    return searchableValues.some((value) => {
      const normalizedValue = normalizeQuery(value)
      return (
        normalizedValue.includes(normalizedQuery) ||
        normalizedQuery.includes(normalizedValue)
      )
    })
  })
}
