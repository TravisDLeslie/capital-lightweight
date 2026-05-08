const deckingPrices = {
  redwoodConHeart2x6: 4.85,
  redwoodConCommon2x6: 3.65,
  cedar2x6: 4.95,
  cedarFiveQuarter: 4.35,
  fir2x4: 1.95,
  fir2x6: 2.85,
  trexGrooved: 5.75,
  trexSquare: 5.95,
  sylvanixGrooved: 4.85,
  sylvanixSquare: 5.05,
  timbertechGrooved: 6.45,
  timbertechSquare: 6.7,
  wuiComposite: 7.25,
}

const choiceSets = {
  skinMaterial: [
    {
      label: 'Redwood',
      value: 'redwood',
      description: '2x6 Con Heart or Con Common',
      image: '/product-images/deck-redwood.svg',
      aliases: ['redwood'],
    },
    {
      label: 'Cedar',
      value: 'cedar',
      description: '2x6 or 5/4 cedar',
      image: '/product-images/deck-cedar.svg',
      aliases: ['cedar'],
    },
    {
      label: 'Fir',
      value: 'fir',
      description: '2x4 or 2x6 fir deck boards',
      image: '/product-images/deck-fir.svg',
      aliases: ['fir', 'doug fir', 'douglas fir'],
    },
    {
      label: 'Composite',
      value: 'composite',
      description: 'Trex, Sylvanix, or TimberTech',
      image: '/product-images/deck-composite.svg',
      aliases: ['composite', 'trex', 'timbertech', 'sylvanix', 'slyvanix'],
    },
  ],
  redwoodGrade: [
    {
      label: 'Con Heart 2x6',
      value: 'con-heart',
      description: 'Better natural decay resistance',
      image: '/product-images/deck-redwood.svg',
      aliases: ['con heart', 'heart'],
    },
    {
      label: 'Con Common 2x6',
      value: 'con-common',
      description: 'More economical redwood option',
      image: '/product-images/deck-redwood.svg',
      aliases: ['con common', 'common'],
    },
  ],
  cedarSize: [
    {
      label: '2x6 Cedar',
      value: '2x6',
      image: '/product-images/deck-cedar.svg',
      aliases: ['2x6', '2 x 6'],
    },
    {
      label: '5/4 Cedar',
      value: '5/4',
      image: '/product-images/deck-cedar.svg',
      aliases: ['5/4', 'five quarter', '5 quarter'],
    },
  ],
  firSize: [
    {
      label: '2x4 Fir',
      value: '2x4',
      image: '/product-images/deck-fir.svg',
      aliases: ['2x4', '2 x 4'],
    },
    {
      label: '2x6 Fir',
      value: '2x6',
      image: '/product-images/deck-fir.svg',
      aliases: ['2x6', '2 x 6'],
    },
  ],
  fireRating: [
    {
      label: 'Yes, WUI/fire-rated',
      value: 'yes',
      description: 'Show WUI-friendly color options',
      image: '/product-images/deck-wui.svg',
      aliases: ['yes', 'wui', 'fire rated', 'fire-rated'],
    },
    {
      label: 'No fire rating needed',
      value: 'no',
      description: 'Pick a recommended brand',
      image: '/product-images/deck-composite.svg',
      aliases: ['no', 'not needed', 'regular'],
    },
  ],
  wuiColor: [
    {
      label: 'TimberTech Coastline WUI',
      value: 'timbertech-coastline',
      image: '/product-images/deck-wui.svg',
      aliases: ['coastline', 'timbertech'],
    },
    {
      label: 'TimberTech Dark Hickory WUI',
      value: 'timbertech-dark-hickory',
      image: '/product-images/deck-wui.svg',
      aliases: ['dark hickory', 'hickory'],
    },
    {
      label: 'Trex Lineage Biscayne WUI',
      value: 'trex-biscayne',
      image: '/product-images/deck-wui.svg',
      aliases: ['biscayne', 'trex'],
    },
  ],
  compositeBrand: [
    {
      label: 'Trex',
      value: 'trex',
      description: 'Good default recommendation',
      image: '/product-images/deck-trex.svg',
      aliases: ['trex', 'recommend', 'recommended'],
    },
    {
      label: 'Sylvanix',
      value: 'sylvanix',
      image: '/product-images/deck-sylvanix.svg',
      aliases: ['sylvanix', 'slyvanix'],
    },
    {
      label: 'TimberTech',
      value: 'timbertech',
      image: '/product-images/deck-timbertech.svg',
      aliases: ['timbertech', 'timber tech'],
    },
  ],
  compositeColor: [
    {
      label: 'Trex Saddle',
      value: 'trex-saddle',
      brand: 'trex',
      color: 'Saddle',
      description: 'Warm brown | good default',
      image: '/product-images/deck-trex.svg',
      aliases: ['trex', 'saddle', 'brown', 'recommend', 'recommended'],
    },
    {
      label: 'Trex Winchester Grey',
      value: 'trex-winchester-grey',
      brand: 'trex',
      color: 'Winchester Grey',
      description: 'Classic gray composite',
      image: '/product-images/deck-trex.svg',
      aliases: ['winchester', 'grey', 'gray'],
    },
    {
      label: 'Trex Toasted Sand',
      value: 'trex-toasted-sand',
      brand: 'trex',
      color: 'Toasted Sand',
      description: 'Light warm neutral',
      image: '/product-images/deck-trex.svg',
      aliases: ['toasted', 'sand', 'tan'],
    },
    {
      label: 'Sylvanix Cedar',
      value: 'sylvanix-cedar',
      brand: 'sylvanix',
      color: 'Cedar',
      description: 'Wood-tone composite',
      image: '/product-images/deck-sylvanix.svg',
      aliases: ['sylvanix', 'slyvanix', 'cedar'],
    },
    {
      label: 'Sylvanix Ash Gray',
      value: 'sylvanix-ash-gray',
      brand: 'sylvanix',
      color: 'Ash Gray',
      description: 'Cool gray composite',
      image: '/product-images/deck-sylvanix.svg',
      aliases: ['ash', 'ash gray', 'ash grey'],
    },
    {
      label: 'TimberTech Brown Oak',
      value: 'timbertech-brown-oak',
      brand: 'timbertech',
      color: 'Brown Oak',
      description: 'Premium wood-look brown',
      image: '/product-images/deck-timbertech.svg',
      aliases: ['timbertech', 'timber tech', 'brown oak', 'oak'],
    },
    {
      label: 'TimberTech Slate Gray',
      value: 'timbertech-slate-gray',
      brand: 'timbertech',
      color: 'Slate Gray',
      description: 'Premium gray composite',
      image: '/product-images/deck-timbertech.svg',
      aliases: ['slate', 'slate gray', 'slate grey'],
    },
  ],
  compositeProfile: [
    {
      label: 'Grooved',
      value: 'grooved',
      description: 'For hidden fasteners',
      image: '/product-images/deck-grooved.svg',
      aliases: ['grooved', 'hidden'],
    },
    {
      label: 'Square edge',
      value: 'square',
      description: 'For picture frame or face fastening',
      image: '/product-images/deck-square.svg',
      aliases: ['square', 'square edge'],
    },
  ],
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function formatCurrency(value) {
  return `$${value.toFixed(2)}`
}

function parseFootValue(value) {
  const feetAndInches = value.match(/(\d+(?:\.\d+)?)\s*'\s*(\d+(?:\.\d+)?)?\s*"?/)

  if (feetAndInches) {
    return Number(feetAndInches[1]) + Number(feetAndInches[2] || 0) / 12
  }

  const mixedFraction = value.match(/(\d+)\s*-\s*(\d+)\/(\d+)/)

  if (mixedFraction) {
    return (
      Number(mixedFraction[1]) +
      Number(mixedFraction[2]) / Number(mixedFraction[3])
    )
  }

  const decimal = value.match(/(\d+(?:\.\d+)?)/)
  return decimal ? Number(decimal[1]) : null
}

function getDeckArea(prompt) {
  const squareFootMatch = prompt.match(/(\d+(?:\.\d+)?)\s*(?:sq\s*ft|sqft|sf)\b/i)

  if (squareFootMatch) {
    return {
      area: Number(squareFootMatch[1]),
      depth: null,
      length: null,
      source: `${Number(squareFootMatch[1])} sq ft`,
    }
  }

  const dimensionMatch = prompt.match(
    /((?:\d+\s*'\s*\d*"?|\d+\s*-\s*\d+\/\d+|\d+(?:\.\d+)?))\s*(?:ft|feet|foot|'|")?\s*(?:x|by)\s*((?:\d+\s*'\s*\d*"?|\d+\s*-\s*\d+\/\d+|\d+(?:\.\d+)?))\s*(?:ft|feet|foot|'|")?/i,
  )

  if (!dimensionMatch) {
    return null
  }

  const depth = parseFootValue(dimensionMatch[1])
  const length = parseFootValue(dimensionMatch[2])

  if (!depth || !length) {
    return null
  }

  return {
    area: depth * length,
    depth,
    length,
    source: `${depth.toFixed(2).replace(/\.00$/, '')} ft x ${length
      .toFixed(2)
      .replace(/\.00$/, '')} ft`,
  }
}

function getChoiceValue(prompt, choices) {
  const normalizedPrompt = normalize(prompt)

  const directMatch = choices.find((choice) => {
    const normalizedLabel = normalize(choice.label)
    const normalizedValue = normalize(String(choice.value))

    return (
      normalizedPrompt.includes(normalizedLabel) ||
      normalizedPrompt === normalizedValue
    )
  })

  if (directMatch) {
    return directMatch.value
  }

  return choices.find((choice) =>
    choice.aliases?.some((alias) => normalizedPrompt.includes(normalize(alias))),
  )?.value
}

function getCompositeColorChoice(value) {
  return choiceSets.compositeColor.find((choice) => choice.value === value)
}

function makeDeckingProduct({
  boardLength,
  boardWidth,
  id,
  image,
  name,
  price,
  stock = 999,
}) {
  return {
    id: `deck-calc-${id}`,
    stockSku: `DECK-${id.toUpperCase()}`,
    name,
    category: 'Deck Calculator',
    dimensions: `${boardLength} ft length | ${boardWidth} in board coverage | Estimate line item`,
    grade: 'Estimate',
    gradeNote:
      'Decking calculator items are rough estimating lines. Confirm joist spacing, waste, board direction, color, fasteners, and stair/picture-frame details before ordering.',
    gradeTooltip:
      'This estimate uses board coverage width and adds a small waste factor. Final material counts can change based on layout and board lengths.',
    price,
    unit: 'board',
    stock,
    location: 'Estimate',
    image,
    aliases: [name, 'decking', 'deck boards'],
  }
}

export function isDeckingCalculatorStart(prompt) {
  const normalizedPrompt = normalize(prompt)
  const mentionsDeck =
    normalizedPrompt.includes('deck') || normalizedPrompt.includes('decking')
  const wantsDeckEstimate =
    normalizedPrompt.includes('build') ||
    normalizedPrompt.includes('cost') ||
    normalizedPrompt.includes('price') ||
    normalizedPrompt.includes('quote') ||
    normalizedPrompt.includes('estimate') ||
    normalizedPrompt.includes('rough') ||
    normalizedPrompt.includes('rought') ||
    normalizedPrompt.includes('howmuch') ||
    normalizedPrompt.includes('material') ||
    /\d/.test(normalizedPrompt)

  return mentionsDeck && wantsDeckEstimate
}

export function startDeckingCalculator(prompt) {
  const areaDetails = getDeckArea(prompt)

  return {
    reply: {
      kind: 'decking-calculator',
      text: areaDetails
        ? `I can rough out a decking surface estimate for ${areaDetails.source}, about ${Math.ceil(
            areaDetails.area,
          )} sq ft. What do you want for the top deck boards?`
        : 'I can rough out a decking surface estimate. What is the square footage, or the depth x length? For example, 250 sq ft or 6 ft 6 in x 22 ft.',
      fenceChoices: areaDetails ? choiceSets.skinMaterial : [],
      products: [],
      quoteLines: [],
      selectedProduct: null,
      showAllInitially: false,
    },
    state: {
      areaDetails,
      step: areaDetails ? 'skinMaterial' : 'area',
    },
  }
}

function getAvailableBoardLengths(state) {
  if (state.skinMaterial === 'redwood' || state.skinMaterial === 'cedar') {
    return [12, 16]
  }

  if (state.skinMaterial === 'fir') {
    return [8, 10, 12, 14, 16]
  }

  if (state.compositeProfile === 'square') {
    return [12, 16, 20]
  }

  return [12, 16, 20]
}

function getRecommendedBoardOrder(state) {
  const bareLinearFeet = state.areaDetails.area / (state.boardWidth / 12)
  const availableLengths = getAvailableBoardLengths(state)
  const dimensionOptions =
    state.areaDetails.depth && state.areaDetails.length
      ? [
          {
            crossDimension: state.areaDetails.depth,
            runDimension: state.areaDetails.length,
          },
          {
            crossDimension: state.areaDetails.length,
            runDimension: state.areaDetails.depth,
          },
        ]
      : []
  const dimensionRecommendation = dimensionOptions
    .flatMap((option) =>
      availableLengths
        .filter((boardLength) => boardLength >= option.runDimension)
        .map((boardLength) => {
          const rowCount = Math.ceil((option.crossDimension * 12) / state.boardWidth)
          const boardCountBeforeWaste = rowCount
          const boardCount = Math.ceil(boardCountBeforeWaste * 1.1)
          const orderedLinearFeet = boardCount * boardLength
          const installedLinearFeet = rowCount * option.runDimension

          return {
            boardCount,
            boardCountBeforeWaste,
            boardLength,
            installedLinearFeet,
            orderedLinearFeet,
            runDimension: option.runDimension,
            wasteFeet: orderedLinearFeet - installedLinearFeet,
          }
        }),
    )
    .sort((first, second) => {
      if (first.wasteFeet !== second.wasteFeet) {
        return first.wasteFeet - second.wasteFeet
      }

      return first.boardLength - second.boardLength
    })[0]

  if (dimensionRecommendation) {
    return {
      ...dimensionRecommendation,
      bareLinearFeet,
      linearFeetWithWaste: dimensionRecommendation.orderedLinearFeet,
      wastePercent: Math.round(
        (dimensionRecommendation.wasteFeet /
          dimensionRecommendation.installedLinearFeet) *
          100,
      ),
    }
  }

  const linearFeetWithWaste = Math.ceil(bareLinearFeet * 1.1)
  const recommendation = availableLengths
    .map((boardLength) => {
      const boardCount = Math.ceil(linearFeetWithWaste / boardLength)
      const orderedLinearFeet = boardCount * boardLength

      return {
        boardCount,
        boardLength,
        orderedLinearFeet,
        wasteFeet: orderedLinearFeet - bareLinearFeet,
        extraFeetAfterWaste: orderedLinearFeet - linearFeetWithWaste,
      }
    })
    .sort((first, second) => {
      if (first.extraFeetAfterWaste !== second.extraFeetAfterWaste) {
        return first.extraFeetAfterWaste - second.extraFeetAfterWaste
      }

      return second.boardLength - first.boardLength
    })[0]

  return {
    ...recommendation,
    bareLinearFeet,
    linearFeetWithWaste,
    wastePercent: Math.round((recommendation.wasteFeet / bareLinearFeet) * 100),
  }
}

function getDeckingLine(state) {
  const boardOrder = getRecommendedBoardOrder(state)

  return {
    boardOrder,
    product: makeDeckingProduct({
      boardLength: boardOrder.boardLength,
      boardWidth: state.boardWidth,
      id: `${state.productId}-${boardOrder.boardLength}`,
      image: state.image,
      name: `${state.productName} ${boardOrder.boardLength}'`,
      price: state.price * boardOrder.boardLength,
      stock: state.stock,
    }),
    quantity: boardOrder.boardCount,
  }
}

function getBoardLengthGuidance(state) {
  if (state.skinMaterial === 'redwood') {
    return 'For redwood, the practical board lengths to plan around are 12 ft and 16 ft 2x6 boards.'
  }

  if (state.skinMaterial === 'cedar') {
    return 'For cedar, the practical board lengths to plan around are 12 ft and 16 ft boards.'
  }

  if (state.skinMaterial === 'fir') {
    return 'For fir, the practical board lengths to plan around are 8 ft, 10 ft, 12 ft, 14 ft, and 16 ft boards.'
  }

  if (state.compositeProfile === 'square') {
    return 'For square-edge composite, the practical board lengths to plan around are 12 ft, 16 ft, and 20 ft boards.'
  }

  return 'For grooved composite, the practical board lengths to plan around are 12 ft, 16 ft, and 20 ft boards.'
}

function getSelectedDecking(state) {
  if (state.skinMaterial === 'redwood') {
    return state.redwoodGrade === 'con-heart'
      ? {
          boardWidth: 5.5,
          image: '/product-images/deck-redwood.svg',
          price: deckingPrices.redwoodConHeart2x6,
          productId: 'redwood-con-heart-2x6',
          productName: '2x6 Con Heart Redwood Decking',
          stock: 68,
        }
      : {
          boardWidth: 5.5,
          image: '/product-images/deck-redwood.svg',
          price: deckingPrices.redwoodConCommon2x6,
          productId: 'redwood-con-common-2x6',
          productName: '2x6 Con Common Redwood Decking',
          stock: 84,
        }
  }

  if (state.skinMaterial === 'cedar') {
    return state.cedarSize === '5/4'
      ? {
          boardWidth: 5.5,
          image: '/product-images/deck-cedar.svg',
          price: deckingPrices.cedarFiveQuarter,
          productId: 'cedar-five-quarter',
          productName: '5/4 Cedar Decking',
          stock: 92,
        }
      : {
          boardWidth: 5.5,
          image: '/product-images/deck-cedar.svg',
          price: deckingPrices.cedar2x6,
          productId: 'cedar-2x6',
          productName: '2x6 Cedar Decking',
          stock: 74,
        }
  }

  if (state.skinMaterial === 'fir') {
    return state.firSize === '2x4'
      ? {
          boardWidth: 3.5,
          image: '/product-images/deck-fir.svg',
          price: deckingPrices.fir2x4,
          productId: 'fir-2x4',
          productName: '2x4 Fir Decking',
          stock: 180,
        }
      : {
          boardWidth: 5.5,
          image: '/product-images/deck-fir.svg',
          price: deckingPrices.fir2x6,
          productId: 'fir-2x6',
          productName: '2x6 Fir Decking',
          stock: 140,
        }
  }

  if (state.fireRating === 'yes') {
    const wuiLabel = choiceSets.wuiColor.find(
      (choice) => choice.value === state.wuiColor,
    ).label

    return {
      boardWidth: 5.5,
      image: '/product-images/deck-wui.svg',
      price: deckingPrices.wuiComposite,
      productId: `${state.wuiColor}-${state.compositeProfile}`,
      productName: `${wuiLabel} ${state.compositeProfile} composite decking`,
      stock: 42,
    }
  }

  const compositeColor = getCompositeColorChoice(state.compositeColor)
  const brandLabel = {
    sylvanix: 'Sylvanix',
    timbertech: 'TimberTech',
    trex: 'Trex',
  }[compositeColor.brand]
  const priceKey = `${compositeColor.brand}${state.compositeProfile
    .charAt(0)
    .toUpperCase()}${state.compositeProfile.slice(1)}`

  return {
    boardWidth: 5.5,
    image: compositeColor.image,
    price: deckingPrices[priceKey],
    productId: `${state.compositeColor}-${state.compositeProfile}`,
    productName: `${brandLabel} ${compositeColor.color} ${state.compositeProfile} composite decking`,
    stock: 58,
  }
}

function finishDeckingEstimate(currentState) {
  const selectedDecking = getSelectedDecking(currentState)
  const state = { ...currentState, ...selectedDecking, step: 'complete' }
  const line = getDeckingLine(state)
  const total = line.quantity * line.product.price
  const { boardOrder } = line
  const lengthGuidance = getBoardLengthGuidance(state)
  const materialText =
    state.skinMaterial === 'composite'
      ? `${line.product.name}`
      : `${line.product.name}`

  return {
    reply: {
      kind: 'decking-calculator',
      text: `Here is a rough decking surface estimate for ${state.areaDetails.source}, about ${Math.ceil(
        state.areaDetails.area,
      )} sq ft, using ${materialText}. I added 10% waste and the least-waste layout is to run ${boardOrder.boardLength} ft boards across the ${boardOrder.runDimension} ft direction. That works out to ${boardOrder.boardCountBeforeWaste} deck-board rows, rounded up to ${line.quantity} boards with waste, for ${boardOrder.orderedLinearFeet} ordered linear feet. Estimated decking total: **${formatCurrency(
        total,
      )}**. ${lengthGuidance} This is for the top deck boards only and does not include joists, blocking, railing, stairs, hidden fasteners, fascia, clips, or labor.`,
      products: [line.product],
      quoteLines: [line],
      selectedProduct: line.product,
      showAllInitially: true,
    },
    state: null,
  }
}

export function continueDeckingCalculator(prompt, currentState) {
  if (!currentState) {
    return null
  }

  if (currentState.step === 'area') {
    const areaDetails = getDeckArea(prompt)

    if (!areaDetails) {
      return {
        reply: {
          kind: 'decking-calculator',
          text: 'What is the square footage, or the depth x length? For example, 250 sq ft or 6 ft 6 in x 22 ft.',
          products: [],
          quoteLines: [],
          selectedProduct: null,
          showAllInitially: false,
        },
        state: currentState,
      }
    }

    return {
      reply: {
        kind: 'decking-calculator',
        text: `Got it, ${areaDetails.source}, about ${Math.ceil(
          areaDetails.area,
        )} sq ft. What do you want for the top deck boards?`,
        fenceChoices: choiceSets.skinMaterial,
        products: [],
        quoteLines: [],
        selectedProduct: null,
        showAllInitially: false,
      },
      state: { ...currentState, areaDetails, step: 'skinMaterial' },
    }
  }

  if (currentState.step === 'skinMaterial') {
    const skinMaterial = getChoiceValue(prompt, choiceSets.skinMaterial)

    if (!skinMaterial) {
      return {
        reply: {
          kind: 'decking-calculator',
          text: 'What do you want for the top deck boards: Redwood, Fir, Cedar, or Composite?',
          fenceChoices: choiceSets.skinMaterial,
          products: [],
          quoteLines: [],
          selectedProduct: null,
          showAllInitially: false,
        },
        state: currentState,
      }
    }

    if (skinMaterial === 'redwood') {
      return {
        reply: {
          kind: 'decking-calculator',
          text: 'For redwood decking, do you want 2x6 Con Heart or 2x6 Con Common?',
          fenceChoices: choiceSets.redwoodGrade,
          products: [],
          quoteLines: [],
          selectedProduct: null,
          showAllInitially: false,
        },
        state: { ...currentState, skinMaterial, step: 'redwoodGrade' },
      }
    }

    if (skinMaterial === 'cedar') {
      return {
        reply: {
          kind: 'decking-calculator',
          text: 'For cedar decking, do you want 2x6 cedar or 5/4 cedar?',
          fenceChoices: choiceSets.cedarSize,
          products: [],
          quoteLines: [],
          selectedProduct: null,
          showAllInitially: false,
        },
        state: { ...currentState, skinMaterial, step: 'cedarSize' },
      }
    }

    if (skinMaterial === 'fir') {
      return {
        reply: {
          kind: 'decking-calculator',
          text: 'For fir decking, do you want 2x4 or 2x6?',
          fenceChoices: choiceSets.firSize,
          products: [],
          quoteLines: [],
          selectedProduct: null,
          showAllInitially: false,
        },
        state: { ...currentState, skinMaterial, step: 'firSize' },
      }
    }

    return {
      reply: {
        kind: 'decking-calculator',
        text: 'For composite decking, do you need a WUI or fire-rated option?',
        fenceChoices: choiceSets.fireRating,
        products: [],
        quoteLines: [],
        selectedProduct: null,
        showAllInitially: false,
      },
      state: { ...currentState, skinMaterial, step: 'fireRating' },
    }
  }

  if (currentState.step === 'redwoodGrade') {
    const redwoodGrade = getChoiceValue(prompt, choiceSets.redwoodGrade)

    if (!redwoodGrade) {
      return {
        reply: {
          kind: 'decking-calculator',
          text: 'Do you want Con Heart or Con Common redwood?',
          fenceChoices: choiceSets.redwoodGrade,
          products: [],
          quoteLines: [],
          selectedProduct: null,
          showAllInitially: false,
        },
        state: currentState,
      }
    }

    return finishDeckingEstimate({ ...currentState, redwoodGrade })
  }

  if (currentState.step === 'cedarSize') {
    const cedarSize = getChoiceValue(prompt, choiceSets.cedarSize)

    if (!cedarSize) {
      return {
        reply: {
          kind: 'decking-calculator',
          text: 'Do you want 2x6 cedar or 5/4 cedar?',
          fenceChoices: choiceSets.cedarSize,
          products: [],
          quoteLines: [],
          selectedProduct: null,
          showAllInitially: false,
        },
        state: currentState,
      }
    }

    return finishDeckingEstimate({ ...currentState, cedarSize })
  }

  if (currentState.step === 'firSize') {
    const firSize = getChoiceValue(prompt, choiceSets.firSize)

    if (!firSize) {
      return {
        reply: {
          kind: 'decking-calculator',
          text: 'Do you want 2x4 fir or 2x6 fir?',
          fenceChoices: choiceSets.firSize,
          products: [],
          quoteLines: [],
          selectedProduct: null,
          showAllInitially: false,
        },
        state: currentState,
      }
    }

    return finishDeckingEstimate({ ...currentState, firSize })
  }

  if (currentState.step === 'fireRating') {
    const fireRating = getChoiceValue(prompt, choiceSets.fireRating)

    if (!fireRating) {
      return {
        reply: {
          kind: 'decking-calculator',
          text: 'Do you need a WUI/fire-rated composite option?',
          fenceChoices: choiceSets.fireRating,
          products: [],
          quoteLines: [],
          selectedProduct: null,
          showAllInitially: false,
        },
        state: currentState,
      }
    }

    if (fireRating === 'yes') {
      return {
        reply: {
          kind: 'decking-calculator',
          text: 'Here are a few WUI-style composite color options to start with. Which one should I figure?',
          fenceChoices: choiceSets.wuiColor,
          products: [],
          quoteLines: [],
          selectedProduct: null,
          showAllInitially: false,
        },
        state: { ...currentState, fireRating, step: 'wuiColor' },
      }
    }

    return {
      reply: {
        kind: 'decking-calculator',
        text: 'No problem. Which composite color should I figure? These are sample colors to start the estimate.',
        fenceChoices: choiceSets.compositeColor,
        products: [],
        quoteLines: [],
        selectedProduct: null,
        showAllInitially: false,
      },
      state: { ...currentState, fireRating, step: 'compositeColor' },
    }
  }

  if (currentState.step === 'wuiColor') {
    const wuiColor = getChoiceValue(prompt, choiceSets.wuiColor)

    if (!wuiColor) {
      return {
        reply: {
          kind: 'decking-calculator',
          text: 'Which WUI-style color should I figure?',
          fenceChoices: choiceSets.wuiColor,
          products: [],
          quoteLines: [],
          selectedProduct: null,
          showAllInitially: false,
        },
        state: currentState,
      }
    }

    return {
      reply: {
        kind: 'decking-calculator',
        text: 'Do you want that WUI option in grooved boards for hidden fasteners, or square-edge boards?',
        fenceChoices: choiceSets.compositeProfile,
        products: [],
        quoteLines: [],
        selectedProduct: null,
        showAllInitially: false,
      },
      state: { ...currentState, wuiColor, step: 'compositeProfile' },
    }
  }

  if (currentState.step === 'compositeColor') {
    const compositeColor = getChoiceValue(prompt, choiceSets.compositeColor)

    if (!compositeColor) {
      return {
        reply: {
          kind: 'decking-calculator',
          text: 'Which composite color should I figure? You can pick one of the color cards, or say something like Trex Saddle, Sylvanix Ash Gray, or TimberTech Brown Oak.',
          fenceChoices: choiceSets.compositeColor,
          products: [],
          quoteLines: [],
          selectedProduct: null,
          showAllInitially: false,
        },
        state: currentState,
      }
    }

    return {
      reply: {
        kind: 'decking-calculator',
        text: 'Do you want grooved boards for hidden fasteners, or square-edge boards?',
        fenceChoices: choiceSets.compositeProfile,
        products: [],
        quoteLines: [],
        selectedProduct: null,
        showAllInitially: false,
      },
      state: { ...currentState, compositeColor, step: 'compositeProfile' },
    }
  }

  if (currentState.step === 'compositeProfile') {
    const compositeProfile = getChoiceValue(prompt, choiceSets.compositeProfile)

    if (!compositeProfile) {
      return {
        reply: {
          kind: 'decking-calculator',
          text: 'Do you want grooved boards or square-edge boards?',
          fenceChoices: choiceSets.compositeProfile,
          products: [],
          quoteLines: [],
          selectedProduct: null,
          showAllInitially: false,
        },
        state: currentState,
      }
    }

    return finishDeckingEstimate({ ...currentState, compositeProfile })
  }

  return null
}
