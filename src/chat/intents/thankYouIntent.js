export const thankYouIntent = {
  name: 'thank-you',
  strongKeywords: ['thanks', 'thank you', 'perfect', 'awesome', 'appreciate it'],
  keywords: ['great', 'sounds good'],
  getReply() {
    return {
      kind: 'general',
      text: 'You bet. Glad to help.',
      deliveryPrompt: false,
      image: null,
      link: null,
      products: [],
      quoteLines: [],
      selectedProduct: null,
    }
  },
}
