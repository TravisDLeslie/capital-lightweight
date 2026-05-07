import { useState } from 'react'
import { getAvailability } from '../utils/availability'
import { getPriceVerificationLabel } from '../utils/priceVerification'

function ChatProductOptions({ products, onSelect, showAllInitially = false }) {
  const [showAll, setShowAll] = useState(showAllInitially)
  const visibleProducts = showAll ? products : products.slice(0, 4)
  const hiddenCount = products.length - visibleProducts.length
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
      : 'matching options'

  return (
    <div className="space-y-4">
      <div>
        <p className="font-semibold text-stone-950">
          {allOrderOnly ? 'We can get this for you:' : 'Here are the matching options:'}
        </p>
        <p className="mt-1 text-sm text-stone-600">
          Tap a size or panel type to see details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {visibleProducts.map((product) => {
          const availability = getAvailability(product)
          const priceVerificationLabel = getPriceVerificationLabel(product)

          return (
            <button
            className="min-h-36 rounded-md border border-stone-200 bg-white p-3 text-left transition hover:border-[#FC2C38] hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 sm:p-4"
            key={product.id}
            onClick={() => onSelect(product)}
            type="button"
          >
            <div className="flex gap-3">
              <img
                alt=""
                className="h-14 w-14 shrink-0 rounded-md bg-stone-100 object-contain p-1 sm:h-16 sm:w-16"
                src={product.image}
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-bold leading-5 text-stone-950">
                  {product.name}
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  {availability.listText}
                </p>
              </div>
            </div>
            <div className="mt-4 border-t border-stone-200 pt-3">
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
                  <span className="text-2xl leading-none text-stone-500">›</span>
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
            className="rounded-md border border-[#FC2C38] px-3 py-2 text-sm font-semibold text-[#FC2C38] transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100"
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
    </div>
  )
}

export default ChatProductOptions
