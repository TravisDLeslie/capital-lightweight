import { useState } from 'react'
import { getAvailability } from '../utils/availability'
import { getPriceVerificationLabel } from '../utils/priceVerification'

function ProductCard({
  onAddToQuote,
  onDeliveryEstimate,
  product,
  quoteQuantity = 0,
}) {
  const [isAddAnimating, setIsAddAnimating] = useState(false)
  const [isGradeOpen, setIsGradeOpen] = useState(false)
  const [isImageOpen, setIsImageOpen] = useState(false)
  const internalSku = product.stockSku || product.id.toUpperCase()
  const availability = getAvailability(product)
  const priceVerificationLabel = getPriceVerificationLabel(product)

  function handleAddToQuote() {
    if (!product.price) {
      onAddToQuote(product)
      return
    }

    setIsAddAnimating(true)
    window.setTimeout(() => setIsAddAnimating(false), 540)
    onAddToQuote(product)
  }

  return (
    <article className="rounded-lg border border-stone-200 bg-white shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
      <div className="space-y-4 p-4">
        <div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              aria-label={`View larger image of ${product.name}`}
              className="group flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-md bg-stone-50 ring-1 ring-stone-100 transition hover:scale-[1.02] hover:ring-stone-200 focus:outline-none focus:ring-4 focus:ring-stone-100 sm:h-32 sm:w-32 sm:hover:scale-[1.04]"
              onClick={() => setIsImageOpen(true)}
              type="button"
            >
              <img
                alt={product.name}
                className="h-full w-full object-contain p-2 transition duration-200 group-hover:scale-110"
                src={product.image}
              />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-600">
                  {product.category}
                </span>
                <span
                  className={`rounded px-2 py-1 text-xs font-semibold ${availability.chipClass}`}
                >
                  {availability.type === 'in-stock'
                    ? `${product.stock} in stock`
                    : availability.label}
                </span>
                <button
                  aria-expanded={isGradeOpen}
                  className="inline-flex items-center gap-1.5 rounded bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800 transition hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-200"
                  onClick={() => setIsGradeOpen((current) => !current)}
                  type="button"
                >
                  Grade {product.grade}
                  <span
                    className={`text-[10px] leading-none transition ${
                      isGradeOpen ? 'rotate-180' : ''
                    }`}
                  >
                    ▼
                  </span>
                </button>
              </div>
              <h2 className="mt-3 text-lg font-bold leading-6 text-stone-950">
                {product.name}
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                {product.dimensions} | {product.grade}
              </p>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-stone-400">
                Internal SKU: {internalSku}
              </p>
              {product.specSheet ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    className="inline-flex rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-bold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 focus:outline-none focus:ring-4 focus:ring-stone-100"
                    href={product.specSheet.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    View spec sheet
                  </a>
                  <a
                    className="inline-flex rounded-md bg-stone-100 px-2.5 py-1.5 text-xs font-bold text-stone-700 transition hover:bg-stone-200 focus:outline-none focus:ring-4 focus:ring-stone-100"
                    download
                    href={product.specSheet.href}
                  >
                    Download PDF
                  </a>
                </div>
              ) : null}
            </div>
          </div>

          {isGradeOpen ? (
            <div className="mt-3 rounded-md bg-stone-50 p-3 text-sm leading-5 text-stone-700 ring-1 ring-stone-200">
              <p className="font-semibold text-stone-950">About {product.grade}</p>
              <p className="mt-1">{product.gradeNote}</p>
              <p className="mt-2 border-t border-stone-200 pt-2">
                {product.gradeTooltip}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-stone-100 pt-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Current price
            </p>
            <p className="text-2xl font-bold text-stone-950">
              {product.price
                ? `$${product.price.toFixed(2)}`
                : availability.priceFallback}
              <span className="text-sm font-semibold text-stone-500">
                {' '}
                / {product.unit}
              </span>
            </p>
            <p className="mt-2 inline-flex rounded bg-stone-100 px-2.5 py-1.5 text-xs font-bold text-stone-600 ring-1 ring-stone-200">
              {priceVerificationLabel}
            </p>
          </div>
          <div className="text-left text-sm text-stone-600 sm:text-right">
            <p className="font-semibold text-stone-900">
              {availability.detailTitle}
            </p>
            <p>{availability.detailText}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            className={`rounded-md bg-[#FC2C38] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#de1f2b] focus:outline-none focus:ring-4 focus:ring-red-200 ${
              isAddAnimating ? 'animate-quote-pop' : ''
            }`}
            onClick={handleAddToQuote}
            type="button"
          >
            {isAddAnimating
              ? 'Added to quote'
              : quoteQuantity
                ? `Added (${quoteQuantity})`
                : 'Add to quote'}
          </button>
          <a
            className="rounded-md border border-stone-300 px-4 py-2.5 text-center text-sm font-semibold text-stone-700 transition hover:border-[#FC2C38] hover:bg-red-50 hover:text-[#FC2C38] focus:outline-none focus:ring-4 focus:ring-stone-100"
            href="tel:2083435481"
          >
            Call 208-343-5481
          </a>
          <button
            className="rounded-md border border-stone-300 px-4 py-2.5 text-center text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:bg-stone-50 hover:text-stone-950 focus:outline-none focus:ring-4 focus:ring-stone-100"
            onClick={onDeliveryEstimate}
            type="button"
          >
            Estimate delivery
          </button>
        </div>
      </div>
      {isImageOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-6"
          onClick={() => setIsImageOpen(false)}
          role="presentation"
        >
          <div
            className="relative max-h-[88vh] w-full max-w-3xl rounded-lg bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="presentation"
          >
            <button
              className="absolute right-3 top-3 rounded-md bg-stone-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-red-200"
              onClick={() => setIsImageOpen(false)}
              type="button"
            >
              Close
            </button>
            <img
              alt={product.name}
              className="max-h-[76vh] w-full object-contain pt-10"
              src={product.image}
            />
          </div>
        </div>
      ) : null}
    </article>
  )
}

export default ProductCard
