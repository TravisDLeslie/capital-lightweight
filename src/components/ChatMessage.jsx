import ChatProductOptions from './ChatProductOptions'

function renderMessageText(text, shouldHighlightPrice) {
  if (!shouldHighlightPrice) {
    return text
  }

  const priceMatches = [...text.matchAll(/\$\d+(?:,\d{3})*(?:\.\d{2})?/g)]
  const totalPriceMatch = priceMatches.at(-1)

  if (!totalPriceMatch) {
    return text
  }

  const start = totalPriceMatch.index
  const price = totalPriceMatch[0]

  return (
    <>
      {text.slice(0, start)}
      <strong className="font-black text-[#FC2C38]">{price}</strong>
      {text.slice(start + price.length)}
    </>
  )
}

function ChatMessage({ message, onProductSelect }) {
  const isCustomer = message.role === 'customer'
  const isProductOptions = message.type === 'product-options'

  return (
    <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-6 ${
          isCustomer
            ? 'bg-stone-950 text-white'
            : 'border border-stone-200 bg-white text-stone-800'
        }`}
      >
        {isProductOptions ? (
          <ChatProductOptions
            onSelect={onProductSelect}
            products={message.products}
            showAllInitially={message.showAllInitially}
          />
        ) : (
          <>
            {renderMessageText(message.text, !isCustomer)}
            {message.link ? (
              <a
                className="mt-3 inline-flex rounded-md bg-[#FC2C38] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#de1f2b] focus:outline-none focus:ring-4 focus:ring-red-200"
                href={message.link.url}
                rel="noreferrer"
                target="_blank"
              >
                {message.link.label}
              </a>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export default ChatMessage
