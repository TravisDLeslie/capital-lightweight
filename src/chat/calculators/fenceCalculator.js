const fencePrices = {
  japaneseNoHolePicket: 4.71,
  cedarPost: 22.5,
  pressureTreatedPost: 14.75,
  roundMetalPost: 27.95,
  postMasterPost: 39.95,
  cedarRunner: 9.85,
  firRunner: 6.95,
  fb24zClip: 1.28,
  pgtClip: 2.35,
  postMasterBracket: 2.95,
  concrete80: 7.98,
  concrete60: 5.98,
}

const choiceSets = {
  picketType: [
    {
      label: 'Japanese #1 3/4 in No Hole Pickets',
      value: 'japanese-no-hole',
      description: '$4.71 each | 880 in stock',
      image: '/product-images/fence-pickets.svg',
      aliases: ['yes', 'use those', 'use it', 'pickets', 'japanese'],
    },
  ],
  postMaterial: [
    {
      label: 'Cedar posts',
      value: 'cedar',
      image: '/product-images/fence-cedar-posts.svg',
      aliases: ['cedar'],
    },
    {
      label: 'PT posts',
      value: 'pressure-treated',
      image: '/product-images/fence-pt-posts.svg',
      aliases: ['pt', 'treated', 'pressure treated'],
    },
    {
      label: 'Metal posts',
      value: 'metal',
      image: '/product-images/fence-metal-posts.svg',
      aliases: ['metal'],
    },
  ],
  metalPostType: [
    {
      label: 'Round metal posts',
      value: 'round-metal',
      image: '/product-images/fence-metal-posts.svg',
      aliases: ['round', 'round metal'],
    },
    {
      label: 'PostMaster posts',
      value: 'postmaster',
      image: '/product-images/fence-postmaster-posts.svg',
      aliases: ['postmaster', 'post master'],
    },
  ],
  runnerCount: [
    {
      label: '2 runners',
      value: 2,
      image: '/product-images/fence-2-runners.svg',
      aliases: ['2', 'two'],
    },
    {
      label: '3 runners',
      value: 3,
      image: '/product-images/fence-3-runners.svg',
      aliases: ['3', 'three'],
    },
  ],
  runnerMaterial: [
    {
      label: 'Cedar runners',
      value: 'cedar',
      image: '/product-images/fence-cedar-runners.svg',
      aliases: ['cedar'],
    },
    {
      label: 'Fir runners',
      value: 'fir',
      image: '/product-images/fence-fir-runners.svg',
      aliases: ['fir'],
    },
  ],
  concreteType: [
    {
      label: '80 lb concrete, 1 bag per post',
      value: '80lb',
      image: '/product-images/fence-concrete.svg',
      aliases: ['80', '80lb', '80 lbs'],
    },
    {
      label: '60 lb concrete, 1.5 bags per post',
      value: '60lb',
      image: '/product-images/fence-concrete.svg',
      aliases: ['60', '60lb', '60 lbs'],
    },
  ],
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function formatCurrency(value) {
  return `$${value.toFixed(2)}`
}

function getFenceLength(prompt) {
  const footMatch =
    prompt.match(/(\d+(?:\.\d+)?)\s*(?:'|ft|feet|foot)\b/i) ||
    prompt.match(/\b(\d+(?:\.\d+)?)\b/)

  return footMatch ? Number(footMatch[1]) : null
}

function getChoiceValue(prompt, choices) {
  const normalizedPrompt = normalize(prompt)

  return choices.find((choice) => {
    const normalizedLabel = normalize(choice.label)
    const normalizedValue = normalize(String(choice.value))
    const aliasMatch = choice.aliases?.some((alias) =>
      normalizedPrompt.includes(normalize(alias)),
    )

    return (
      normalizedPrompt.includes(normalizedLabel) ||
      normalizedPrompt.includes(normalizedValue) ||
      aliasMatch
    )
  })?.value
}

function makeFenceProduct({ id, image, name, price, stock = 999, unit = 'each' }) {
  return {
    id: `fence-calc-${id}`,
    stockSku: `FENCE-${id.toUpperCase()}`,
    name,
    category: 'Fence Calculator',
    dimensions: 'Fence estimate line item',
    grade: 'Estimate',
    gradeNote:
      'Fence calculator items are rough estimating lines. Confirm final layout, height, gates, pickets, and jobsite conditions before ordering.',
    gradeTooltip:
      'This calculator assumes fence sections are 8 ft or less and rounds material quantities up for estimating.',
    price,
    unit,
    stock,
    location: 'Estimate',
    image: image || '/product-images/fence-runners.svg',
    aliases: [name],
  }
}

export function isFenceCalculatorStart(prompt) {
  const normalizedPrompt = normalize(prompt)

  return (
    normalizedPrompt.includes('fence') &&
    (normalizedPrompt.includes('cost') ||
      normalizedPrompt.includes('price') ||
      normalizedPrompt.includes('estimate') ||
      normalizedPrompt.includes('howmuch') ||
      /\d/.test(normalizedPrompt))
  )
}

export function startFenceCalculator(prompt) {
  const length = getFenceLength(prompt)

  return {
    reply: {
      kind: 'fence-calculator',
      text: length
        ? `I can rough that out for a ${length} ft fence. First, this is the picket option we have stocked right now. Do you want to use it?`
        : 'I can rough out a fence material estimate. How many linear feet of fence are you building?',
      fenceChoices: length ? choiceSets.picketType : [],
      products: [],
      quoteLines: [],
      selectedProduct: null,
      showAllInitially: false,
    },
    state: {
      length,
      step: length ? 'picketType' : 'length',
    },
  }
}

function getPostLine(state, postCount) {
  if (state.postMaterial === 'cedar') {
    return {
      product: makeFenceProduct({
        id: 'cedar-post',
        image: '/product-images/fence-cedar-posts.svg',
        name: 'Cedar fence post',
        price: fencePrices.cedarPost,
      }),
      quantity: postCount,
    }
  }

  if (state.postMaterial === 'pressure-treated') {
    return {
      product: makeFenceProduct({
        id: 'pt-post',
        image: '/product-images/fence-pt-posts.svg',
        name: 'Pressure treated fence post',
        price: fencePrices.pressureTreatedPost,
      }),
      quantity: postCount,
    }
  }

  if (state.metalPostType === 'postmaster') {
    return {
      product: makeFenceProduct({
        id: 'postmaster-post',
        image: '/product-images/fence-postmaster-posts.svg',
        name: 'PostMaster fence post',
        price: fencePrices.postMasterPost,
      }),
      quantity: postCount,
    }
  }

  return {
    product: makeFenceProduct({
      id: 'round-metal-post',
      image: '/product-images/fence-metal-posts.svg',
      name: 'Round metal fence post',
      price: fencePrices.roundMetalPost,
    }),
    quantity: postCount,
  }
}

function getClipLine(state, clipCount) {
  if (state.postMaterial === 'metal' && state.metalPostType === 'round-metal') {
    return {
      product: makeFenceProduct({
        id: 'pgt15zr',
        image: '/product-images/fence-runners.svg',
        name: 'Simpson PGT1.5Z-R metal runner clip',
        price: fencePrices.pgtClip,
      }),
      quantity: clipCount,
    }
  }

  if (state.postMaterial === 'metal' && state.metalPostType === 'postmaster') {
    return {
      product: makeFenceProduct({
        id: 'postmaster-bracket',
        image: '/product-images/fence-runners.svg',
        name: 'PostMaster runner bracket',
        price: fencePrices.postMasterBracket,
      }),
      quantity: clipCount,
    }
  }

  return {
    product: makeFenceProduct({
      id: 'fb24z',
      image: '/product-images/fence-runners.svg',
      name: 'Simpson FB24Z fence rail bracket',
      price: fencePrices.fb24zClip,
    }),
    quantity: clipCount,
  }
}

function calculateFenceEstimate(state) {
  const sections = Math.ceil(state.length / 8)
  const postCount = sections + 1
  const picketCount = Math.ceil(state.length * 2.5)
  const runnerCount = sections * state.runnerCount
  const clipCount = runnerCount * 2
  const concreteBags =
    state.concreteType === '80lb' ? postCount : Math.ceil(postCount * 1.5)
  const lines = [
    {
      product: makeFenceProduct({
        id: 'japanese-no-hole-picket',
        image: '/product-images/fence-pickets.svg',
        name: 'Japanese #1 3/4 in No Hole Fence Picket',
        price: fencePrices.japaneseNoHolePicket,
        stock: 880,
      }),
      quantity: picketCount,
    },
    getPostLine(state, postCount),
    {
      product: makeFenceProduct({
        id: `${state.runnerMaterial}-runner`,
        image:
          state.runnerMaterial === 'cedar'
            ? '/product-images/fence-cedar-runners.svg'
            : '/product-images/fence-fir-runners.svg',
        name:
          state.runnerMaterial === 'cedar'
            ? 'Cedar fence runner'
            : 'Fir fence runner',
        price:
          state.runnerMaterial === 'cedar'
            ? fencePrices.cedarRunner
            : fencePrices.firRunner,
      }),
      quantity: runnerCount,
    },
    getClipLine(state, clipCount),
    {
      product: makeFenceProduct({
        id: state.concreteType === '80lb' ? '80lb-concrete' : '60lb-concrete',
        image: '/product-images/fence-concrete.svg',
        name:
          state.concreteType === '80lb'
            ? '80 lb ready mix concrete'
            : '60 lb ready mix concrete',
        price:
          state.concreteType === '80lb'
            ? fencePrices.concrete80
            : fencePrices.concrete60,
      }),
      quantity: concreteBags,
    },
  ]
  const total = lines.reduce(
    (sum, line) => sum + line.quantity * line.product.price,
    0,
  )

  return {
    sections,
    postCount,
    picketCount,
    runnerCount,
    clipCount,
    concreteBags,
    lines,
    total,
  }
}

function getSummaryText(state, estimate) {
  const postText =
    state.postMaterial === 'metal'
      ? state.metalPostType === 'postmaster'
        ? 'PostMaster posts'
        : 'round metal posts'
      : state.postMaterial === 'cedar'
        ? 'cedar posts'
        : 'PT posts'
  const runnerText = state.runnerMaterial === 'cedar' ? 'cedar' : 'fir'
  const concreteText =
    state.concreteType === '80lb'
      ? '80 lb concrete at 1 bag per post'
      : '60 lb concrete at 1.5 bags per post'

  return `Here is a rough fence estimate for a ${state.length} ft fence using Japanese #1 3/4 in no-hole pickets, ${postText}, ${state.runnerCount} ${runnerText} runners per section, and ${concreteText}. I figured ${estimate.sections} sections, ${estimate.picketCount} pickets, ${estimate.postCount} posts, ${estimate.runnerCount} runners, ${estimate.clipCount} clips, and ${estimate.concreteBags} bags of concrete. Estimated material total: **${formatCurrency(estimate.total)}**. This does not include gates, stain, extra fasteners beyond the brackets, or labor yet.`
}

export function continueFenceCalculator(prompt, currentState) {
  if (!currentState) {
    return null
  }

  if (currentState.step === 'length') {
    const length = getFenceLength(prompt)

    if (!length) {
      return {
        reply: {
          kind: 'fence-calculator',
          text: 'How many linear feet of fence are you building? For example, 50 ft.',
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
        kind: 'fence-calculator',
        text: `Got it, ${length} ft. First, this is the picket option we have stocked right now. Do you want to use it?`,
        fenceChoices: choiceSets.picketType,
        products: [],
        quoteLines: [],
        selectedProduct: null,
        showAllInitially: false,
      },
      state: { ...currentState, length, step: 'picketType' },
    }
  }

  if (currentState.step === 'picketType') {
    const picketType = getChoiceValue(prompt, choiceSets.picketType)

    if (!picketType) {
      return {
        reply: {
          kind: 'fence-calculator',
          text: 'Right now, the stocked picket option is Japanese #1 3/4 in No Hole Pickets at $4.71 each, with 880 in stock. Do you want to use those?',
          fenceChoices: choiceSets.picketType,
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
        kind: 'fence-calculator',
        text: 'Great. What kind of posts do you want to use?',
        fenceChoices: choiceSets.postMaterial,
        products: [],
        quoteLines: [],
        selectedProduct: null,
        showAllInitially: false,
      },
      state: { ...currentState, picketType, step: 'postMaterial' },
    }
  }

  if (currentState.step === 'postMaterial') {
    const postMaterial = getChoiceValue(prompt, choiceSets.postMaterial)

    if (!postMaterial) {
      return {
        reply: {
          kind: 'fence-calculator',
          text: 'Do you want cedar posts, PT posts, or metal posts?',
          fenceChoices: choiceSets.postMaterial,
          products: [],
          quoteLines: [],
          selectedProduct: null,
          showAllInitially: false,
        },
        state: currentState,
      }
    }

    if (postMaterial === 'metal') {
      return {
        reply: {
          kind: 'fence-calculator',
          text: 'For metal posts, do you want round metal posts or PostMaster posts?',
          fenceChoices: choiceSets.metalPostType,
          products: [],
          quoteLines: [],
          selectedProduct: null,
          showAllInitially: false,
        },
        state: { ...currentState, postMaterial, step: 'metalPostType' },
      }
    }

    return {
      reply: {
        kind: 'fence-calculator',
        text: 'How many runners per fence section do you want, 2 or 3?',
        fenceChoices: choiceSets.runnerCount,
        products: [],
        quoteLines: [],
        selectedProduct: null,
        showAllInitially: false,
      },
      state: { ...currentState, postMaterial, step: 'runnerCount' },
    }
  }

  if (currentState.step === 'metalPostType') {
    const metalPostType = getChoiceValue(prompt, choiceSets.metalPostType)

    if (!metalPostType) {
      return {
        reply: {
          kind: 'fence-calculator',
          text: 'Do you want round metal posts or PostMaster posts?',
          fenceChoices: choiceSets.metalPostType,
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
        kind: 'fence-calculator',
        text: 'How many runners per fence section do you want, 2 or 3?',
        fenceChoices: choiceSets.runnerCount,
        products: [],
        quoteLines: [],
        selectedProduct: null,
        showAllInitially: false,
      },
      state: { ...currentState, metalPostType, step: 'runnerCount' },
    }
  }

  if (currentState.step === 'runnerCount') {
    const runnerCount = getChoiceValue(prompt, choiceSets.runnerCount)

    if (!runnerCount) {
      return {
        reply: {
          kind: 'fence-calculator',
          text: 'Do you want 2 runners or 3 runners per section?',
          fenceChoices: choiceSets.runnerCount,
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
        kind: 'fence-calculator',
        text: 'What kind of runners do you want to use?',
        fenceChoices: choiceSets.runnerMaterial,
        products: [],
        quoteLines: [],
        selectedProduct: null,
        showAllInitially: false,
      },
      state: { ...currentState, runnerCount, step: 'runnerMaterial' },
    }
  }

  if (currentState.step === 'runnerMaterial') {
    const runnerMaterial = getChoiceValue(prompt, choiceSets.runnerMaterial)

    if (!runnerMaterial) {
      return {
        reply: {
          kind: 'fence-calculator',
          text: 'Do you want cedar runners or fir runners?',
          fenceChoices: choiceSets.runnerMaterial,
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
        kind: 'fence-calculator',
        text: 'What kind of concrete should I figure?',
        fenceChoices: choiceSets.concreteType,
        products: [],
        quoteLines: [],
        selectedProduct: null,
        showAllInitially: false,
      },
      state: { ...currentState, runnerMaterial, step: 'concreteType' },
    }
  }

  if (currentState.step === 'concreteType') {
    const concreteType = getChoiceValue(prompt, choiceSets.concreteType)

    if (!concreteType) {
      return {
        reply: {
          kind: 'fence-calculator',
          text: 'Should I figure 80 lb concrete at 1 bag per post, or 60 lb concrete at 1.5 bags per post?',
          fenceChoices: choiceSets.concreteType,
          products: [],
          quoteLines: [],
          selectedProduct: null,
          showAllInitially: false,
        },
        state: currentState,
      }
    }

    const state = { ...currentState, concreteType, step: 'complete' }
    const estimate = calculateFenceEstimate(state)

    return {
      reply: {
        kind: 'fence-calculator',
        text: getSummaryText(state, estimate),
        products: estimate.lines.map((line) => line.product),
        quoteLines: estimate.lines,
        selectedProduct: null,
        showAllInitially: true,
      },
      state: null,
    }
  }

  return null
}
