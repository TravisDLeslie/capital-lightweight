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

  normalized = normalized
    .replace(/tounge\s*(?:and|&)\s*groove/g, 'tg')
    .replace(/tongue\s*(?:and|&)\s*groove/g, 'tg')
    .replace(/t\s*&\s*g/g, 'tg')

  return normalized
    .replace(/\bby\b/g, 'x')
    .replace(/\s+/g, '')
    .replace(/[–—-]/g, 'x')
    .replace(/[^a-z0-9/x]/g, '')
}

function getProductSku(product) {
  return String(product.stockSku || product.modelNumber || product.id || '').toLowerCase()
}

function isTreatedPrompt(normalizedQuery) {
  return (
    normalizedQuery.includes('treated') ||
    normalizedQuery.includes('pressuretreated') ||
    normalizedQuery.includes('ptlumber') ||
    normalizedQuery.includes('pt')
  )
}

function isTreatedProduct(product) {
  const normalizedName = normalizeQuery(product.name)
  const normalizedCategory = normalizeQuery(product.category)

  return (
    normalizedName.includes('treated') ||
    normalizedCategory.includes('pressuretreated')
  )
}

function getMatchPreferenceScore(product, normalizedQuery) {
  const wantsTreated = isTreatedPrompt(normalizedQuery)
  let score = 0

  if (wantsTreated && isTreatedProduct(product)) score += 40
  if (!wantsTreated && !isTreatedProduct(product)) score += 20
  if (product.stockSku === '01' || product.id === '01') score += 30
  if (product.category === 'Dimensional Lumber') score += 8

  return score
}

function getSearchableProductText(product) {
  return [
    product.name,
    product.category,
    product.dimensions,
    product.grade,
    product.modelNumber,
    product.upc,
    ...(product.aliases || []),
  ]
    .map((value) => normalizeQuery(String(value || '')))
    .join(' ')
}

function getDiabloMatchesByTerms(products, terms) {
  return products.filter((product) => {
    if (product.category !== 'Diablo Tools') {
      return false
    }

    const searchableText = getSearchableProductText(product)

    return terms.some((term) => searchableText.includes(term))
  })
}

function findSkuProduct(query, products) {
  const trimmedQuery = query.trim().toLowerCase()
  const skuPromptMatch = trimmedQuery.match(/\bsku\s*#?\s*([a-z0-9-]+)/i)
  const requestedSku = skuPromptMatch?.[1]?.replace(/[^a-z0-9-]/gi, '').toLowerCase()

  if (requestedSku) {
    return products.find((product) => getProductSku(product) === requestedSku)
  }

  const normalizedQuery = normalizeQuery(query)

  return products.find((product) => normalizeQuery(getProductSku(product)) === normalizedQuery)
}

export function findProduct(query, products) {
  const skuProduct = findSkuProduct(query, products)

  if (skuProduct) {
    return skuProduct
  }

  const normalizedQuery = normalizeQuery(query)

  return products
    .flatMap((product) =>
      product.aliases
        .map((alias) => ({
          product,
          score:
            normalizeQuery(alias).length +
            getMatchPreferenceScore(product, normalizedQuery),
          normalizedAlias: normalizeQuery(alias),
        }))
        .filter(({ normalizedAlias }) => {
          return (
            normalizedQuery.includes(normalizedAlias) ||
            normalizedAlias.includes(normalizedQuery)
          )
        }),
    )
    .sort((first, second) => second.score - first.score)[0]?.product
}

export function findProductMatches(query, products) {
  const skuProduct = findSkuProduct(query, products)

  if (skuProduct) {
    return [skuProduct]
  }

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
  const broadHoldownTerms = [
    'holdown',
    'holdowns',
    'holddown',
    'holddowns',
    'holddownsandtensionties',
    'hdue',
    'hdu',
    'htt',
    'htth',
    'dtt',
    'ltt',
    'lttp',
    'sthd',
    'lsthd',
    'holdownandtensiontie',
    'holdownsandtensionties',
    'hold down',
    'hold downs',
    'tensiontie',
    'tensionties',
    'tensionties',
    'decktensiontie',
    'strap tie',
    'straptie',
    'purlinanchor',
    'purlinanchors',
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
  const broadConcreteTerms = [
    'concrete',
    'readymix',
    'sackedgoods',
    'bagconcrete',
    'baggedconcrete',
  ]
  const broadDiabloTerms = ['diablo', 'diablotools']
  const broadTerms = [
    ...broadSheetGoodsTerms,
    ...broadHardwareTerms,
    ...broadHoldownTerms,
    ...broadEngineeredTerms,
    ...broadBeamTerms,
    ...broadDeckingTerms,
    ...broadConcreteTerms,
    ...broadDiabloTerms,
  ]
  const isBroadHardwareQuery = broadHardwareTerms.some((term) =>
    normalizedQuery.includes(term),
  )
  const isBroadHoldownQuery = broadHoldownTerms.some((term) =>
    normalizedQuery.includes(term),
  )
  const isBroadDiabloQuery = broadDiabloTerms.some((term) =>
    normalizedQuery.includes(term),
  )

  if (
    isBroadDiabloQuery &&
    ['diablo', 'diablotools'].includes(normalizedQuery)
  ) {
    return products.filter((product) => product.category === 'Diablo Tools')
  }

  if (normalizedQuery.includes('holesaw') || normalizedQuery.includes('holesaws')) {
    const holeSawMatches = getDiabloMatchesByTerms(products, [
      'holesaw',
      'holesaws',
    ])

    if (holeSawMatches.length) {
      return holeSawMatches
    }
  }

  if (isBroadHoldownQuery) {
    const genericHoldownAliases = new Set([
      ...broadHoldownTerms.map((term) => normalizeQuery(term)),
      'simpsonholdown',
      'simpsonholddown',
      'simpsontensiontie',
      'loadpathconnector',
    ])
    const exactHoldownMatches = products.flatMap((product) => {
      if (product.category !== 'Holdowns & Tension Ties') {
        return []
      }

      return product.aliases
        .map((alias) => ({
          product,
          normalizedAlias: normalizeQuery(alias),
        }))
        .filter(({ normalizedAlias }) => {
          return (
            !genericHoldownAliases.has(normalizedAlias) &&
            normalizedQuery.includes(normalizedAlias)
          )
        })
    })

    exactHoldownMatches.sort(
      (first, second) =>
        second.normalizedAlias.length - first.normalizedAlias.length,
    )

    const exactHoldownProduct = exactHoldownMatches[0]?.product

    if (exactHoldownProduct) {
      return [exactHoldownProduct]
    }

    return products.filter((product) => product.category === 'Holdowns & Tension Ties')
  }

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
          (normalizedQuery.includes(normalizedAlias) ||
            normalizedAlias.includes(normalizedQuery))
        )
      })
  })

  exactProductMatches.sort(
    (first, second) => {
      const firstScore =
        first.normalizedAlias.length +
        getMatchPreferenceScore(first.product, normalizedQuery)
      const secondScore =
        second.normalizedAlias.length +
        getMatchPreferenceScore(second.product, normalizedQuery)

      return secondScore - firstScore
    },
  )

  const exactProduct = exactProductMatches[0]?.product

  if (exactProduct) {
    if (normalizedQuery.includes('zip')) {
      const relatedZipProducts = products.filter((product) => {
        const normalizedName = normalizeQuery(product.name)
        return normalizedName.includes('zip') || normalizedName.includes('advantech')
      })

      return [
        exactProduct,
        ...relatedZipProducts.filter((product) => product.id !== exactProduct.id),
      ]
    }

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

  const isBroadConcreteQuery = broadConcreteTerms.some((term) =>
    normalizedQuery.includes(term),
  )

  if (isBroadConcreteQuery) {
    return products.filter((product) => product.category === 'Concrete & Sacked Goods')
  }

  if (isBroadDiabloQuery) {
    return products.filter((product) => product.category === 'Diablo Tools')
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
