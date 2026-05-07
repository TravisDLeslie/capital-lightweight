import { useState } from 'react'
import { getAvailability } from '../utils/availability'
import { getPriceVerificationLabel } from '../utils/priceVerification'

function getQuoteButtonLabel(lines) {
  if (!lines?.length) {
    return null
  }

  return lines.length > 1 ? 'Add all to quote' : 'Add to quote'
}

function ChatProductOptions({
  products,
  onAddQuoteLines,
  onSelect,
  quoteLines,
  showAllInitially = false,
}) {
  const [showAll, setShowAll] = useState(showAllInitially)
  const [isAddAnimating, setIsAddAnimating] = useState(false)
  const visibleProducts = showAll ? products : products.slice(0, 4)
  const hiddenCount = products.length - visibleProducts.length
  const quoteButtonLabel = getQuoteButtonLabel(quoteLines)
  const allOrderOnly = products.every(
    (product) => getAvailability(product).type !== 'in-stock',
  )
  const isSheetGoods = products.every((product) => product.category === 'Sheet Goods')
  const isEngineered = products.every(
    (product) => product.category === 'Engineered Lumber',
  )
  const isBeams = products.every((product) => product.category === 'Timbers & Beams')
  const isDecking = products.every((product) => product.category === 'Decking')
  const isHardware = products.every(
    (product) => product.category === 'Structural Hardware',
  )
  const isFenceEstimate = products.every(
    (product) => product.category === 'Fence Calculator',
  )
  const isTwoByFour = products.every((product) =>
    product.name.toLowerCase().startsWith('2x4'),
  )
  const optionLabel = isSheetGoods
    ? 'OSB options'
    : isTwoByFour
      ? "2x4's"
      : isEngineered
      ? 'engineered lumber options'
      : isBeams
      ? 'beam and timber options'
      : isDecking
      ? 'decking options'
      : isHardware
      ? 'Simpson options'
      : isFenceEstimate
      ? 'fence estimate lines'
      : 'matching options'
  const helperText = isFenceEstimate
    ? 'Tap a line item to see estimate details, or add the full estimate to your quote below.'
    : 'Tap a size or panel type to see details.'

  function handleAddQuoteLines() {
    if (!quoteLines?.length) {
      return
    }

    setIsAddAnimating(true)
    window.setTimeout(() => setIsAddAnimating(false), 540)
    onAddQuoteLines(quoteLines)
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-semibold text-stone-950">
          {allOrderOnly ? 'We can get this for you:' : 'Here are the matching options:'}
        </p>
        <p className="mt-1 text-sm text-stone-600">
          {helperText}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {visibleProducts.map((product) => {
          const availability = getAvailability(product)
          const priceVerificationLabel = getPriceVerificationLabel(product)

          return (
            <button
            className="min-h-36 rounded-md border border-stone-200 bg-white p-3 text-left shadow-[0_1px_1px_rgb(0_0_0/0.03)] transition hover:border-stone-300 hover:bg-stone-50 focus:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-50 sm:p-4"
            key={product.id}
            onClick={() => onSelect(product)}
            type="button"
          >
            <div className="flex gap-3">
              <img
                alt=""
                className="h-14 w-14 shrink-0 rounded-md bg-stone-50 object-contain p-1 ring-1 ring-stone-100 sm:h-16 sm:w-16"
                src={product.image}
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-bold leading-5 text-stone-950">
                  {product.name}
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  {availability.listText}
                </p>
                {product.specSheet ? (
                  <p className="mt-2 inline-flex rounded bg-stone-100 px-2 py-1 text-[11px] font-bold text-stone-600">
                    Spec sheet available
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-4 border-t border-stone-100 pt-3">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <p className="text-base font-black text-stone-950">
                  {product.price
                    ? `$${product.price.toFixed(2)}`
                    : availability.priceFallback}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-bold ${
                      availability.badgeClass
                    }`}
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span
                        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${
                          availability.pingClass
                        }`}
                      />
                      <span
                        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                          availability.dotClass
                        }`}
                      />
                    </span>
                    {availability.label}
                  </span>
                  <span className="text-2xl leading-none text-stone-300">›</span>
                </div>
              </div>
              <p className="mt-2 text-[11px] font-semibold text-slate-500">
                {priceVerificationLabel}
              </p>
            </div>
            </button>
          )
        })}
      </div>

      {hiddenCount > 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-[#FC2C38] hover:bg-red-50 hover:text-[#FC2C38] focus:outline-none focus:ring-4 focus:ring-stone-100"
            onClick={() => setShowAll(true)}
            type="button"
          >
            Show all {optionLabel}
          </button>
          <p className="text-sm text-stone-600">
            {hiddenCount} more options.
          </p>
        </div>
      ) : products.length > 4 ? (
        <button
          className="rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-[#FC2C38] hover:bg-red-50 hover:text-[#FC2C38] focus:outline-none focus:ring-4 focus:ring-red-100"
          onClick={() => setShowAll(false)}
          type="button"
        >
          Show fewer
        </button>
      ) : null}

      {quoteButtonLabel ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-stone-950">
                Ready to build this into your quote?
              </p>
              <p className="mt-0.5 text-xs font-semibold text-stone-600">
                Adds the quantities from this estimate.
              </p>
            </div>
            <button
              className={`rounded-md bg-[#FC2C38] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#de1f2b] focus:outline-none focus:ring-4 focus:ring-red-200 ${
                isAddAnimating ? 'animate-quote-pop' : ''
              }`}
              onClick={handleAddQuoteLines}
              type="button"
            >
              {isAddAnimating ? 'Added to quote' : quoteButtonLabel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ChatProductOptions
