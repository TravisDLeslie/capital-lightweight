import { useEffect, useMemo, useRef, useState } from 'react'
import AppHeader from './AppHeader'
import ChatMessage from './ChatMessage'
import DeliveryEstimator from './DeliveryEstimator'
import ProductCard from './ProductCard'
import QuoteDrawer from './QuoteDrawer'
import SuggestedPrompts from './SuggestedPrompts'
import {
  continueFenceCalculator,
  isFenceCalculatorStart,
  startFenceCalculator,
} from '../chat/fenceCalculator'
import { getChatReply } from '../chat/replyEngine'
import { products } from '../data/products'
import { getQuoteSubtotal } from '../utils/quoteTotals'
import { trackSessionEvent } from '../utils/sessionAnalytics'

const starterMessages = [
  {
    id: 1,
    role: 'assistant',
    text: 'Ask me what lumber or building materials we carry. Try 2x4-8, 2x4x8, treated 4x4x8, or OSB.',
  },
]

const suggestedPrompts = [
  'Do you guys carry 2x4-8?',
  'Do you stock OSB?',
  'Do you have Zip 7/16?',
  'Do you stock 3/4 T&G?',
]

const replyCharacterDelay = 18
const productRevealDelay = 450
const defaultProduct =
  products.find(
    (product) =>
      product.id === '01' ||
      product.name === '2x4-8 #1 DF-L' ||
      product.aliases?.includes('2x4-8'),
  ) || products[0]
const defaultQuoteSection = { id: 'general', name: 'General Materials' }

function ChatHome() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(starterMessages)
  const [selectedProduct, setSelectedProduct] = useState(defaultProduct)
  const [quoteItems, setQuoteItems] = useState([])
  const [quoteTitle, setQuoteTitle] = useState('')
  const [quoteSections, setQuoteSections] = useState([defaultQuoteSection])
  const [activeQuoteSectionId, setActiveQuoteSectionId] = useState(
    defaultQuoteSection.id,
  )
  const [lastQuoteLines, setLastQuoteLines] = useState([])
  const [fenceCalculatorState, setFenceCalculatorState] = useState(null)
  const [isAwaitingDeliveryLocation, setIsAwaitingDeliveryLocation] =
    useState(false)
  const [isQuoteOpen, setIsQuoteOpen] = useState(false)
  const [quoteAnimationKey, setQuoteAnimationKey] = useState(null)
  const messagesEndRef = useRef(null)
  const pendingReplyTimersRef = useRef([])

  const catalogCount = useMemo(
    () => products.reduce((total, product) => total + product.stock, 0),
    [],
  )

  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      })
    })
  }, [messages])

  useEffect(() => {
    return () => {
      clearPendingReplyTimers()
    }
  }, [])

  function clearPendingReplyTimers() {
    pendingReplyTimersRef.current.forEach((timerId) => {
      window.clearTimeout(timerId)
    })
    pendingReplyTimersRef.current = []
  }

  function scheduleReplyStep(callback, delay) {
    const timerId = window.setTimeout(() => {
      pendingReplyTimersRef.current = pendingReplyTimersRef.current.filter(
        (currentTimerId) => currentTimerId !== timerId,
      )
      callback()
    }, delay)

    pendingReplyTimersRef.current.push(timerId)
  }

  function revealReplyText(messageId, text, onComplete) {
    const stepSize = text.length > 120 ? 3 : 2
    let nextLength = 0

    function revealNextChunk() {
      nextLength = Math.min(nextLength + stepSize, text.length)

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId
            ? { ...message, text: text.slice(0, nextLength) }
            : message,
        ),
      )

      if (nextLength < text.length) {
        scheduleReplyStep(revealNextChunk, replyCharacterDelay)
      } else {
        scheduleReplyStep(onComplete, productRevealDelay)
      }
    }

    scheduleReplyStep(revealNextChunk, 180)
  }

  function isAddLastQuotePrompt(prompt) {
    return (
      /\b(add|put|place)\b/i.test(prompt) &&
      /\b(it|that|them|those|quote|cart|list)\b/i.test(prompt) &&
      /\b(quote|cart|list|it|that|them|those)\b/i.test(prompt)
    )
  }

  function shouldUseDeliveryFollowUp(prompt) {
    const cleanLocation = prompt.trim().toLowerCase()

    return (
      isAwaitingDeliveryLocation &&
      (/^\d{5}$/.test(cleanLocation) ||
        [
          'boise',
          'meridian',
          'kuna',
          'kunda',
          'nampa',
          'caldwell',
          'star',
          'eagle',
          'middleton',
          'garden valley',
          'idaho city',
          'mccall',
          'donnelly',
          'cascade',
        ].includes(cleanLocation))
    )
  }

  function addQuoteLinesToQuote(lines) {
    setQuoteAnimationKey(crypto.randomUUID())
    trackSessionEvent({
      eventType: 'add_to_quote',
      matchedProducts: lines.map((line) => `${line.quantity} ${line.product.name}`),
      addedToQuote: true,
      quoteTitle,
      quoteTotal: quoteSubtotal,
    })
    setQuoteItems((currentItems) => {
      return lines.reduce((nextItems, line) => {
        const existingItem = nextItems.find(
          (item) =>
            item.product.id === line.product.id &&
            (item.sectionId || defaultQuoteSection.id) === activeQuoteSectionId,
        )

        if (existingItem) {
          return nextItems.map((item) =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + line.quantity }
              : item,
          )
        }

        return [
          ...nextItems,
          {
            id: crypto.randomUUID(),
            product: line.product,
            quantity: line.quantity,
            sectionId: activeQuoteSectionId,
          },
        ]
      }, currentItems)
    })
  }

  function getQuoteLineSummary(lines) {
    return lines
      .map((line) => `${line.quantity} ${line.product.unit} of ${line.product.name}`)
      .join(', ')
  }

  function showAssistantReply(nextMessages, reply, nextFenceState) {
    const replyMessageId = crypto.randomUUID()

    setSelectedProduct(reply.selectedProduct)
    setLastQuoteLines(reply.quoteLines || [])
    setMessages([
      ...nextMessages,
      {
        id: replyMessageId,
        role: 'assistant',
        deliveryPrompt: reply.deliveryPrompt,
        fenceChoices: reply.fenceChoices,
        image: reply.image,
        link: reply.link,
        quoteLines: [],
        text: '',
      },
    ])
    revealReplyText(replyMessageId, reply.text, () => {
      if (reply.quoteLines?.length) {
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === replyMessageId
              ? { ...message, quoteLines: reply.quoteLines }
              : message,
          ),
        )
      }

      if (reply.products.length) {
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            type: 'product-options',
            products: reply.products,
            quoteLines: reply.quoteLines || [],
            showAllInitially: reply.showAllInitially,
          },
        ])
      }
    })

    setFenceCalculatorState(nextFenceState)
    setIsAwaitingDeliveryLocation(Boolean(reply.deliveryPrompt))
  }

  function submitPrompt(prompt) {
    const cleanPrompt = prompt.trim()

    if (!cleanPrompt) {
      return
    }

    clearPendingReplyTimers()
    const nextMessages = [
      ...messages,
      {
        id: crypto.randomUUID(),
        role: 'customer',
        text: cleanPrompt,
      },
    ]

    if (isAddLastQuotePrompt(cleanPrompt)) {
      const replyMessageId = crypto.randomUUID()

      if (lastQuoteLines.length) {
        addQuoteLinesToQuote(lastQuoteLines)
        setIsQuoteOpen(true)
        setMessages([
          ...nextMessages,
          {
            id: replyMessageId,
            role: 'assistant',
            text: '',
          },
        ])
        revealReplyText(
          replyMessageId,
          `Done. I added ${getQuoteLineSummary(lastQuoteLines)} to your quote.`,
          () => {},
        )
      } else {
        setMessages([
          ...nextMessages,
          {
            id: replyMessageId,
            role: 'assistant',
            text: '',
          },
        ])
        revealReplyText(
          replyMessageId,
          'I do not have a recent priced item to add yet. Ask me for a price or quantity first, then I can add it to your quote.',
          () => {},
        )
      }

      setInput('')
      return
    }

    const fenceCalculatorResult = fenceCalculatorState
      ? continueFenceCalculator(cleanPrompt, fenceCalculatorState)
      : isFenceCalculatorStart(cleanPrompt)
        ? startFenceCalculator(cleanPrompt)
        : null

    if (fenceCalculatorResult) {
      trackSessionEvent({
        eventType: 'chat_prompt',
        prompt: cleanPrompt,
        responseType: 'fence_calculator',
        matchedProducts: fenceCalculatorResult.reply.products.map(
          (product) => product.name,
        ),
        quoteTitle,
        quoteTotal: quoteSubtotal,
      })
      showAssistantReply(
        nextMessages,
        fenceCalculatorResult.reply,
        fenceCalculatorResult.state,
      )
      setInput('')
      return
    }

    const replyPrompt = shouldUseDeliveryFollowUp(cleanPrompt)
      ? `delivery to ${cleanPrompt}`
      : cleanPrompt
    const reply = getChatReply(replyPrompt, products)

    trackSessionEvent({
      eventType: 'chat_prompt',
      prompt: cleanPrompt,
      responseType: reply.kind,
      matchedProducts: reply.products.map((product) => product.name),
      selectedProduct: reply.selectedProduct?.name,
      quoteTitle,
      quoteTotal: quoteSubtotal,
    })

    showAssistantReply(nextMessages, reply, null)

    setInput('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    submitPrompt(input)
  }

  function clearChat() {
    clearPendingReplyTimers()
    setInput('')
    setMessages(starterMessages)
    setSelectedProduct(defaultProduct)
    setLastQuoteLines([])
    setFenceCalculatorState(null)
    setIsAwaitingDeliveryLocation(false)
  }

  function selectSuggestedProduct(product) {
    setSelectedProduct(product)
    trackSessionEvent({
      eventType: 'product_selected',
      selectedProduct: product.name,
      matchedProducts: [product.name],
      quoteTitle,
      quoteTotal: quoteSubtotal,
    })
  }

  function addToQuote(product) {
    if (!product.price) {
      return
    }

    setQuoteAnimationKey(crypto.randomUUID())
    trackSessionEvent({
      eventType: 'add_to_quote',
      selectedProduct: product.name,
      matchedProducts: [product.name],
      addedToQuote: true,
      quoteTitle,
      quoteTotal: quoteSubtotal,
    })
    setQuoteItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) =>
          item.product.id === product.id &&
          (item.sectionId || defaultQuoteSection.id) === activeQuoteSectionId,
      )

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [
        ...currentItems,
        {
          id: crypto.randomUUID(),
          product,
          quantity: 1,
          sectionId: activeQuoteSectionId,
        },
      ]
    })
  }

  function addDeliveryToQuote(deliveryProduct) {
    trackSessionEvent({
      eventType: 'add_to_quote',
      selectedProduct: deliveryProduct.name,
      matchedProducts: [deliveryProduct.name],
      addedToQuote: true,
      quoteTitle,
      quoteTotal: quoteSubtotal,
    })
    setQuoteItems((currentItems) => [
      ...currentItems.filter((item) => item.product.category !== 'Delivery'),
      {
        id: crypto.randomUUID(),
        product: deliveryProduct,
        quantity: 1,
        sectionId: activeQuoteSectionId,
      },
    ])
    setIsQuoteOpen(true)
  }

  function addQuoteSection(sectionName) {
    const cleanSectionName = sectionName.trim()

    if (!cleanSectionName) {
      return
    }

    const existingSection = quoteSections.find(
      (section) => section.name.toLowerCase() === cleanSectionName.toLowerCase(),
    )

    if (existingSection) {
      setActiveQuoteSectionId(existingSection.id)
      return
    }

    const nextSection = {
      id: crypto.randomUUID(),
      name: cleanSectionName,
    }

    setQuoteSections((currentSections) => [...currentSections, nextSection])
    setActiveQuoteSectionId(nextSection.id)
  }

  function changeQuoteItemSection(itemId, sectionId) {
    setQuoteItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, sectionId } : item,
      ),
    )
  }

  function increaseQuoteItem(itemId) {
    setQuoteItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    )
  }

  function decreaseQuoteItem(itemId) {
    setQuoteItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  function removeQuoteItem(itemId) {
    setQuoteItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    )
  }

  function clearQuoteItems() {
    setQuoteItems([])
    setQuoteTitle('')
    setQuoteSections([defaultQuoteSection])
    setActiveQuoteSectionId(defaultQuoteSection.id)
    setQuoteAnimationKey(null)
  }

  const selectedQuoteQuantity = selectedProduct
    ? quoteItems
        .filter((item) => item.product.id === selectedProduct.id)
        .reduce((total, item) => total + item.quantity, 0)
    : 0
  const quoteSubtotal = getQuoteSubtotal(quoteItems)
  const quoteCount = quoteItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-stone-50 text-stone-950">
      <AppHeader
        catalogCount={catalogCount}
        onQuoteOpen={() => setIsQuoteOpen(true)}
        quoteAnimationKey={quoteAnimationKey}
        quoteCount={quoteCount}
        quoteSubtotal={quoteSubtotal}
      />

      <section className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 gap-4 overflow-y-auto px-3 py-3 sm:gap-5 sm:px-5 sm:py-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,.88fr)] xl:overflow-hidden 2xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)]">
        <div className="flex min-h-[520px] flex-col rounded-lg border border-stone-200 bg-white shadow-[0_1px_2px_rgb(0_0_0/0.04)] sm:min-h-[560px] xl:min-h-0">
          <div className="flex shrink-0 flex-col gap-3 border-b border-stone-100 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-stone-400">
                Customer chat
              </p>
              <p className="mt-1 text-base font-bold text-stone-950 sm:text-lg">
                Ask us anything, hours, address, materials
              </p>
            </div>
            <button
              className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-600 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-950 focus:outline-none focus:ring-4 focus:ring-stone-100 sm:w-auto sm:shrink-0"
              onClick={clearChat}
              type="button"
            >
              Clear chat
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 pb-5">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onAddQuoteLines={(lines) => {
                    addQuoteLinesToQuote(lines)
                    setIsQuoteOpen(true)
                  }}
                  onChoiceSelect={submitPrompt}
                  onDeliveryPromptSubmit={submitPrompt}
                  onProductSelect={selectSuggestedProduct}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="sticky bottom-0 shrink-0 space-y-3 border-t border-stone-100 bg-white/95 pt-4 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-stone-400">
                    Ask the lumber desk
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-stone-700">
                    Type a product, SKU, price question, or delivery ZIP.
                  </p>
                </div>
                <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 sm:inline-flex">
                  Online
                </span>
              </div>
              <form
                className="flex gap-2 rounded-lg border border-stone-200 bg-stone-50 p-2 shadow-[0_1px_2px_rgb(0_0_0/0.04)] focus-within:border-stone-300 focus-within:ring-4 focus-within:ring-stone-100 sm:gap-3"
                onSubmit={handleSubmit}
              >
                <input
                  className="min-w-0 flex-1 rounded-md border-0 bg-transparent px-2 py-2.5 text-base font-semibold outline-none placeholder:font-normal placeholder:text-stone-400 sm:px-3"
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about 2x4-8, SKU 894, Hardie, delivery..."
                  type="text"
                  value={input}
                />
                <button
                  className="shrink-0 rounded-md bg-[#FC2C38] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#de1f2b] focus:outline-none focus:ring-4 focus:ring-red-200 sm:px-5"
                  type="submit"
                >
                  Ask
                </button>
              </form>
              <SuggestedPrompts prompts={suggestedPrompts} onSelect={submitPrompt} />
            </div>
          </div>
        </div>

        <aside className="min-h-0 space-y-4 xl:overflow-y-auto xl:pr-1">
          {selectedProduct ? (
            <>
              <ProductCard
                onAddToQuote={addToQuote}
                product={selectedProduct}
                quoteQuantity={selectedQuoteQuantity}
              />
              <DeliveryEstimator onAddDeliveryToQuote={addDeliveryToQuote} />
            </>
          ) : (
            <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Select an option from chat</h2>
              <p className="mt-2 text-stone-600">
                The matching sizes are listed in the conversation. Choose one there
                to see price, stock, and product details here.
              </p>
            </div>
          )}
        </aside>
      </section>
      <QuoteDrawer
        activeSectionId={activeQuoteSectionId}
        isOpen={isQuoteOpen}
        items={quoteItems}
        onAnalyticsEvent={trackSessionEvent}
        onClearQuote={clearQuoteItems}
        onClose={() => setIsQuoteOpen(false)}
        onAddSection={addQuoteSection}
        onActiveSectionChange={setActiveQuoteSectionId}
        onChangeItemSection={changeQuoteItemSection}
        onDecrease={decreaseQuoteItem}
        onIncrease={increaseQuoteItem}
        onRemove={removeQuoteItem}
        onTitleChange={setQuoteTitle}
        sections={quoteSections}
        title={quoteTitle}
      />
    </main>
  )
}

export default ChatHome
