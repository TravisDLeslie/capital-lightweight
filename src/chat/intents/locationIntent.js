import { servicesInfo } from '../data/servicesInfo.js'
import { storeInfo } from '../data/storeInfo.js'

export const locationIntent = {
  name: 'location',
  strongKeywords: [
    'where are you located',
    'what is your address',
    'get directions',
    'directions to',
    'where are you',
    'where you at',
    'about us',
    'our story',
    'company history',
    'when were you founded',
    'how long have you been around',
    'capital history',
  ],
  keywords: [
    'directions',
    'direction',
    'located',
    'location',
    'address',
    'map',
    'about',
    'story',
    'history',
    'founded',
    '1905',
  ],
  getReply(prompt) {
    const isAboutQuestion =
      prompt.includes('about') ||
      prompt.includes('history') ||
      prompt.includes('story') ||
      prompt.includes('founded') ||
      prompt.includes('1905')

    if (isAboutQuestion) {
      return {
        kind: 'general',
        text: 'Capital Lumber has been building Boise since 1905. What started as a small yard on Main Street has grown into one of Idaho’s trusted names in lumber and building materials. Today, the Perrin family is carrying the yard into its next chapter with the same old-school values: hard work, integrity, community, and genuine connection.',
        image: {
          alt: 'Historic Capital Lumber storefront',
          src: '/capital-history.avif',
        },
        link: {
          label: 'Read our story',
          url: servicesInfo.storyUrl,
        },
      }
    }

    return {
      kind: 'general',
      text: `We are located at ${storeInfo.address}. Tap below for directions.`,
      link: {
        label: 'Get directions',
        url: storeInfo.directionsUrl,
      },
    }
  },
}
