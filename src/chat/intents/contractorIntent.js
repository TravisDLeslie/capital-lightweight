import { servicesInfo } from '../data/servicesInfo.js'
import { storeInfo } from '../data/storeInfo.js'

export const contractorIntent = {
  name: 'contractor',
  strongKeywords: [
    'contractor account',
    'builder account',
    'pro account',
    'contractor pricing',
    'builder pricing',
  ],
  keywords: [
    'contractor',
    'contractors',
    'builder',
    'builders',
    'special pricing',
    'pro pricing',
  ],
  getReply() {
    return {
      kind: 'general',
      text: `Yes, we work heavily with contractors. We can help with material lists, takeoffs, delivery, and job pricing. Approved contractors can get special pricing, Net 30 day terms, and contractor account support. To get set up, call ${storeInfo.phone} or email ${servicesInfo.accountingEmail}.`,
      link: {
        label: 'Email accounting',
        url: `mailto:${servicesInfo.accountingEmail}?subject=Contractor%20Account%20Setup`,
      },
    }
  },
}
