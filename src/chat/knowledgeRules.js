import { getAvailability } from '../utils/availability.js'
import { normalizeQuery } from '../utils/productSearch.js'

function getRedwoodProducts(products) {
  return products.filter((product) => normalizeQuery(product.name).includes('redwood'))
}

function getRedwoodGradeReply(products) {
  const redwoodProducts = getRedwoodProducts(products)
  const stockedProducts = redwoodProducts.filter(
    (product) => getAvailability(product).type === 'in-stock',
  )
  const orderProducts = redwoodProducts.filter(
    (product) => getAvailability(product).type !== 'in-stock',
  )

  const stockedText = stockedProducts.length
    ? `We stock ${stockedProducts.map((product) => product.name).join(', ')}.`
    : 'We do not currently show stocked Con Heart Redwood in this sample catalog.'
  const orderText = orderProducts.length
    ? ` We can also get ${orderProducts
        .map((product) => `${product.name} with a ${getAvailability(product).label}`)
        .join(', ')}.`
    : ''

  return {
    products: redwoodProducts,
    text: `Con Heart Redwood is mostly heartwood, so it has better natural decay resistance and is the better choice for exposed exterior work. Con Common Redwood can include sapwood and more visual variation, so it is usually the more economical choice when appearance or decay resistance is less critical. ${stockedText}${orderText}`,
  }
}

function getProductsByCategory(products, category) {
  return products.filter((product) => product.category === category)
}

function getProductsByGrade(products, gradeText) {
  const normalizedGradeText = normalizeQuery(gradeText)

  return products.filter((product) =>
    normalizeQuery(product.grade).includes(normalizedGradeText),
  )
}

const knowledgeRules = [
  {
    id: 'hanger-mount-types',
    matches(normalizedPrompt) {
      return (
        normalizedPrompt.includes('hanger') &&
        (normalizedPrompt.includes('facemount') ||
          normalizedPrompt.includes('sidemount') ||
          normalizedPrompt.includes('topflange') ||
          normalizedPrompt.includes('concealed') ||
          normalizedPrompt.includes('difference') ||
          normalizedPrompt.includes('vs'))
      )
    },
    getReply(products) {
      return {
        products: getProductsByCategory(products, 'Structural Hardware').slice(0, 6),
        text: 'When customers say side-mount hanger, they usually mean a face-mount hanger: the hanger fastens to the face of the header, ledger, or beam and can often be installed after the joist is in place. A top-flange hanger bears over the top of the supporting member and needs access to the top, often before the joist is set. Concealed-flange hangers turn the flanges inward for cleaner visible lines or tighter end conditions. The right choice depends on member size, load, access, fasteners, and finish.',
      }
    },
  },
  {
    id: 'select-structural-vs-number-two',
    matches(normalizedPrompt) {
      return (
        (normalizedPrompt.includes('selectstruct') ||
          normalizedPrompt.includes('selectstructural')) &&
        (normalizedPrompt.includes('2') ||
          normalizedPrompt.includes('number2') ||
          normalizedPrompt.includes('no2') ||
          normalizedPrompt.includes('difference') ||
          normalizedPrompt.includes('vs'))
      )
    },
    getReply(products) {
      return {
        products: getProductsByGrade(products, 'Select Structural').slice(0, 6),
        text: 'Select Structural is a higher structural lumber grade than #2. It is selected for stronger, cleaner pieces with tighter limits on defects, so it is used when the design calls for higher structural capacity or a better piece of lumber. #2 is a common framing grade and works for many normal framing uses, but it allows more knots, wane, and visual defects than Select Structural. We stock several Select Structural Fir sizes.',
      }
    },
  },
  {
    id: 'timber-number-one-vs-number-two',
    matches(normalizedPrompt) {
      return (
        (normalizedPrompt.includes('timber') ||
          normalizedPrompt.includes('beam') ||
          normalizedPrompt.includes('post')) &&
        (normalizedPrompt.includes('1') ||
          normalizedPrompt.includes('number1') ||
          normalizedPrompt.includes('2') ||
          normalizedPrompt.includes('number2') ||
          normalizedPrompt.includes('grade') ||
          normalizedPrompt.includes('why'))
      )
    },
    getReply(products) {
      return {
        products: getProductsByCategory(products, 'Timbers & Beams').slice(0, 6),
        text: '#2 beams and timbers can be the right choice when the plan allows the lower design value and the customer wants a more economical structural member. #1 is usually cleaner, has tighter limits on strength-reducing characteristics, and is easier to recommend for exposed work, posts, pergolas, and jobs where customers care about both strength and appearance. Some timber sizes are stocked only in #1 because larger timbers are sold in specific size/species/grade combinations by mills and distributors, so availability is not always the same as regular 2x framing. For a structural substitution, the plans or engineer should control the final grade.',
      }
    },
  },
  {
    id: 'screw-corrosion-ratings',
    matches(normalizedPrompt) {
      return (
        (normalizedPrompt.includes('screw') || normalizedPrompt.includes('fastener')) &&
        (normalizedPrompt.includes('1000') ||
          normalizedPrompt.includes('100hr') ||
          normalizedPrompt.includes('100hour') ||
          normalizedPrompt.includes('saltspray') ||
          normalizedPrompt.includes('corrosion') ||
          normalizedPrompt.includes('rated'))
      )
    },
    getReply() {
      return {
        products: [],
        text: 'A 1000-hour screw rating usually refers to accelerated salt-spray corrosion testing, so it generally indicates a more corrosion-resistant coating than a 100-hour screw. It is best used as a comparison between related fasteners, not as a promise that the screw will last exactly 1000 hours in the real world. For treated lumber, exterior work, wet areas, or corrosive environments, use the fastener coating or stainless option specified for that application.',
      }
    },
  },
  {
    id: 'decking-materials',
    matches(normalizedPrompt) {
      const mentionsSpecificDeckingLine =
        normalizedPrompt.includes('trex') ||
        normalizedPrompt.includes('timbertech') ||
        normalizedPrompt.includes('sylvanix') ||
        normalizedPrompt.includes('slyvanix') ||
        normalizedPrompt.includes('thermory') ||
        normalizedPrompt.includes('redwood') ||
        normalizedPrompt.includes('cedar')

      if (mentionsSpecificDeckingLine) {
        return false
      }

      return (
        normalizedPrompt.includes('decking') ||
        normalizedPrompt.includes('deckboards') ||
        normalizedPrompt.includes('deckmaterial')
      )
    },
    getReply(products) {
      return {
        products: getProductsByCategory(products, 'Decking'),
        text: 'We stock decking material options including Trex, TimberTech, Sylvanix, Redwood, Cedar, Thermory, and Alaskan Yellow Cedar. Composite lines are a good fit when the customer wants lower maintenance and color consistency. Natural wood decking is a better fit when they want real wood character, species-specific appearance, and a more traditional feel. The next step is usually color, profile, length, and fastener style.',
      }
    },
  },
  {
    id: 'zip-vs-osb',
    matches(normalizedPrompt) {
      return (
        normalizedPrompt.includes('zip') &&
        normalizedPrompt.includes('osb') &&
        (normalizedPrompt.includes('difference') ||
          normalizedPrompt.includes('vs') ||
          normalizedPrompt.includes('better'))
      )
    },
    getReply(products) {
      return {
        products: products.filter((product) => {
          const normalizedName = normalizeQuery(product.name)
          return normalizedName.includes('zip') || normalizedName.includes('osb')
        }),
        text: 'Regular OSB sheathing is a structural panel for walls, roofs, or subfloors depending on rating and thickness. Zip panels are structural sheathing with an integrated water-resistive barrier on the face, designed to work with Zip tape as part of a weather barrier system. So the simple difference is: OSB is the panel, Zip is the panel plus the weather-barrier system.',
      }
    },
  },
  {
    id: 'ground-contact-treated',
    matches(normalizedPrompt) {
      return (
        normalizedPrompt.includes('treated') &&
        (normalizedPrompt.includes('groundcontact') ||
          normalizedPrompt.includes('aboveground') ||
          normalizedPrompt.includes('difference') ||
          normalizedPrompt.includes('post'))
      )
    },
    getReply(products) {
      return {
        products: products.filter((product) => product.category === 'Treated Lumber'),
        text: 'Ground-contact treated lumber is made for tougher exposure: posts, soil contact, or places that can stay damp. Above-ground treated lumber is for exterior use where the board can dry out and is not touching the ground. For posts or anything that may sit in soil or stay wet, ground-contact treatment is the safer recommendation.',
      }
    },
  },
  {
    id: 'tji-lvl-vs-solid-sawn',
    matches(normalizedPrompt) {
      return (
        (normalizedPrompt.includes('tji') ||
          normalizedPrompt.includes('lvl') ||
          normalizedPrompt.includes('microllam') ||
          normalizedPrompt.includes('ijoist')) &&
        (normalizedPrompt.includes('solidsawn') ||
          normalizedPrompt.includes('regularlumber') ||
          normalizedPrompt.includes('difference') ||
          normalizedPrompt.includes('vs') ||
          normalizedPrompt.includes('better'))
      )
    },
    getReply(products) {
      return {
        products: getProductsByCategory(products, 'Engineered Lumber').slice(0, 6),
        text: 'TJI joists and Microllam/LVL are engineered lumber products. They are manufactured for predictable strength, straighter pieces, and better dimensional stability than typical solid-sawn framing lumber. TJI is commonly used for floor joists and long spans, while LVL/Microllam is commonly used for beams, headers, and built-up structural members. They are sold by the foot in this catalog.',
      }
    },
  },
]

export function getKnowledgeReply(prompt, products) {
  const normalizedPrompt = normalizeQuery(prompt)
  const isRedwoodGradeQuestion =
    (normalizedPrompt.includes('conheart') ||
      normalizedPrompt.includes('constructionheart') ||
      normalizedPrompt.includes('concommon') ||
      normalizedPrompt.includes('constructioncommon')) &&
    (normalizedPrompt.includes('difference') ||
      normalizedPrompt.includes('diff') ||
      normalizedPrompt.includes('vs') ||
      normalizedPrompt.includes('redwood'))

  if (isRedwoodGradeQuestion) {
    return getRedwoodGradeReply(products)
  }

  const matchingRule = knowledgeRules.find((rule) => rule.matches(normalizedPrompt))

  if (matchingRule) {
    return matchingRule.getReply(products)
  }

  return null
}
