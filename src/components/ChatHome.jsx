import { useEffect, useMemo, useRef, useState } from 'react'
import AppHeader from './AppHeader'
import ChatMessage from './ChatMessage'
import DeliveryEstimator from './DeliveryEstimator'
import ProductCard from './ProductCard'
import QuoteDrawer from './QuoteDrawer'
import SuggestedPrompts from './SuggestedPrompts'
import { getChatReply } from '../chat/replyEngine'
import { products } from '../data/products'

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

function ChatHome() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(starterMessages)
  const [selectedProduct, setSelectedProduct] = useState(products[0])
  const [quoteItems, setQuoteItems] = useState([])
  const [isQuoteOpen, setIsQuoteOpen] = useState(false)
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

  function submitPrompt(prompt) {
    const cleanPrompt = prompt.trim()

    if (!cleanPrompt) {
      return
    }

    clearPendingReplyTimers()
    const reply = getChatReply(cleanPrompt, products)
    const replyMessageId = crypto.randomUUID()
    const nextMessages = [
      ...messages,
      {
        id: crypto.randomUUID(),
        role: 'customer',
        text: cleanPrompt,
      },
    ]

    setSelectedProduct(reply.selectedProduct)
    setMessages([
      ...nextMessages,
      {
        id: replyMessageId,
        role: 'assistant',
        link: reply.link,
        text: '',
      },
    ])
    revealReplyText(replyMessageId, reply.text, () => {
      if (reply.products.length) {
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            type: 'product-options',
            products: reply.products,
            showAllInitially: reply.showAllInitially,
          },
        ])
      }
    })

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
    setSelectedProduct(products[0])
  }

  function selectSuggestedProduct(product) {
    setSelectedProduct(product)
  }

  function addToQuote(product) {
    if (!product.price) {
      return
    }

    setQuoteItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id)

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [...currentItems, { product, quantity: 1 }]
    })
  }

  function addDeliveryToQuote(deliveryProduct) {
    setQuoteItems((currentItems) => [
      ...currentItems.filter((item) => item.product.category !== 'Delivery'),
      { product: deliveryProduct, quantity: 1 },
    ])
    setIsQuoteOpen(true)
  }

  function increaseQuoteItem(productId) {
    setQuoteItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    )
  }

  function decreaseQuoteItem(productId) {
    setQuoteItems((currentItems) =>
      currentItems
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  function removeQuoteItem(productId) {
    setQuoteItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId),
    )
  }

  const selectedQuoteItem = selectedProduct
    ? quoteItems.find((item) => item.product.id === selectedProduct.id)
    : null
  const quoteSubtotal = quoteItems.reduce((total, item) => {
    return total + item.product.price * item.quantity
  }, 0)
  const quoteCount = quoteItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-stone-100 text-stone-950">
      <AppHeader
        catalogCount={catalogCount}
        onQuoteOpen={() => setIsQuoteOpen(true)}
        quoteCount={quoteCount}
        quoteSubtotal={quoteSubtotal}
      />

      <section className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 gap-6 overflow-y-auto px-5 py-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)] lg:overflow-hidden">
        <div className="flex min-h-[560px] flex-col rounded-lg border border-stone-200 bg-stone-50 shadow-sm lg:min-h-0">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-stone-200 p-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                Customer chat
              </p>
              <p className="mt-1 text-lg font-bold text-stone-950">
                Ask for a size, sku, or common jobsite shorthand.
              </p>
            </div>
            <button
              className="shrink-0 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-[#FC2C38] hover:bg-red-50 hover:text-[#FC2C38] focus:outline-none focus:ring-4 focus:ring-red-100"
              onClick={clearChat}
              type="button"
            >
              Clear chat
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col p-5">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 pb-5">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onProductSelect={selectSuggestedProduct}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="sticky bottom-0 shrink-0 space-y-4 border-t border-stone-200 bg-stone-50 pt-4">
              <SuggestedPrompts prompts={suggestedPrompts} onSelect={submitPrompt} />
              <form className="flex gap-3" onSubmit={handleSubmit}>
                <input
                  className="min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-4 py-3 text-base outline-none transition placeholder:text-stone-400 focus:border-stone-950 focus:ring-4 focus:ring-amber-200"
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about 2x4-8, 2x4x8, OSB..."
                  type="text"
                  value={input}
                />
                <button
                  className="rounded-md bg-[#FC2C38] px-5 py-3 text-sm font-black text-white transition hover:bg-[#de1f2b] focus:outline-none focus:ring-4 focus:ring-red-200"
                  type="submit"
                >
                  Ask
                </button>
              </form>
            </div>
          </div>
        </div>

        <aside className="min-h-0 space-y-4 lg:overflow-y-auto lg:pr-1">
          {selectedProduct ? (
            <>
              <ProductCard
                onAddToQuote={addToQuote}
                product={selectedProduct}
                quoteQuantity={selectedQuoteItem?.quantity}
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
        isOpen={isQuoteOpen}
        items={quoteItems}
        onClose={() => setIsQuoteOpen(false)}
        onDecrease={decreaseQuoteItem}
        onIncrease={increaseQuoteItem}
        onRemove={removeQuoteItem}
      />
    </main>
  )
}

export default ChatHome
