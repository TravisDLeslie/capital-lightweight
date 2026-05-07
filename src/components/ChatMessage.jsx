import ChatChoicePrompt from './ChatChoicePrompt'
import ChatDeliveryPrompt from './ChatDeliveryPrompt'
import ChatProductOptions from './ChatProductOptions'

function renderMessageText(text, shouldHighlightPrice) {
  if (text.includes('**')) {
    return text.split(/(\*\*[^*]+\*\*)/g).map((segment, index) => {
      if (segment.startsWith('**') && segment.endsWith('**')) {
        return (
          <strong className="font-black text-stone-950" key={`${segment}-${index}`}>
            {segment.slice(2, -2)}
          </strong>
        )
      }

      return segment
    })
  }

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

function getQuoteButtonLabel(lines) {
  if (!lines?.length) {
    return null
  }

  return lines.length > 1 ? 'Add all to quote' : 'Add to quote'
}

function ChatMessage({
  message,
  onAddQuoteLines,
  onChoiceSelect,
  onDeliveryPromptSubmit,
  onProductSelect,
}) {
  const isCustomer = message.role === 'customer'
  const isProductOptions = message.type === 'product-options'
  const quoteButtonLabel = getQuoteButtonLabel(message.quoteLines)

  return (
    <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`${
          isProductOptions ? 'w-full max-w-full' : 'max-w-[92%] sm:max-w-[88%]'
        } rounded-lg px-3 py-3 text-sm leading-6 break-words sm:px-4 ${
          isCustomer
            ? 'bg-stone-700 text-white'
            : 'border border-stone-200 bg-white text-stone-800'
        }`}
      >
        {isProductOptions ? (
          <ChatProductOptions
            onAddQuoteLines={onAddQuoteLines}
            onSelect={onProductSelect}
            products={message.products}
            quoteLines={message.quoteLines}
            showAllInitially={message.showAllInitially}
          />
        ) : (
          <>
            {message.image ? (
              <img
                alt={message.image.alt}
                className="mb-3 max-h-56 w-full rounded-md object-cover"
                src={message.image.src}
              />
            ) : null}
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
            {message.deliveryPrompt ? (
              <ChatDeliveryPrompt onSubmit={onDeliveryPromptSubmit} />
            ) : null}
            {message.fenceChoices ? (
              <ChatChoicePrompt
                choices={message.fenceChoices}
                onSelect={onChoiceSelect}
              />
            ) : null}
            {quoteButtonLabel ? (
              <button
                className="mt-3 inline-flex rounded-md bg-stone-950 px-3 py-2 text-sm font-bold text-white transition hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-red-100 sm:ml-2"
                onClick={() => onAddQuoteLines(message.quoteLines)}
                type="button"
              >
                {quoteButtonLabel}
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export default ChatMessage
