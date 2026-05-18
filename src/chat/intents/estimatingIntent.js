import { servicesInfo } from '../data/servicesInfo.js'

export const estimatingIntent = {
  name: 'estimating',
  strongKeywords: [
    'can you estimate',
    'do you estimate',
    'material list',
    'material lists',
    'takeoff',
    'takeoffs',
    'quote from plans',
    'quote from drawings',
    'pdf plans',
    'blueprints',
  ],
  keywords: [
    'estimate',
    'estimating',
    'drawing',
    'drawings',
    'sketch',
    'measurements',
    'plans',
    'prints',
    'takeoff',
    'takeoffs',
    'material list',
    'materials list',
    'blueprints',
  ],
  getReply() {
    return {
      kind: 'general',
      text: `Yes, we can help price materials from drawings, sketches, measurements, or plans. Send PDFs/plans with structurals if you have them to ${servicesInfo.estimatingEmail}, or call us for simpler measurements and quick pricing.`,
      link: {
        label: 'Email plans to Dane',
        url: `mailto:${servicesInfo.estimatingEmail}?subject=Plans%20for%20Material%20List`,
      },
    }
  },
}
