const directionsUrl =
  'https://www.google.com/maps/dir/?api=1&destination=Capital%20Lumber%20Co.%2C%203105%20W.%20State%20St.%20Boise%2C%20ID%2083703'

function AppHeader({
  catalogCount,
  quoteAnimationKey,
  quoteCount,
  quoteSubtotal,
  onQuoteOpen,
}) {
  return (
    <section className="shrink-0 border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5">
        <div className="min-w-0">
          <img
            alt="Capital Lumber Co"
            className="h-10 w-auto max-w-[240px] sm:h-12 sm:max-w-[320px]"
            src="/site-logo.svg"
          />
          <h1 className="mt-3 text-lg font-black sm:text-3xl">
            Product answers at the counter speed.
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="hidden text-right text-sm xl:block">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
              <span className="text-[#FC2C38]">★★★★★</span>
              <span>4.8 Google rating</span>
              <span className="text-stone-400">·</span>
              <span>120+ reviews</span>
            </div>
            <p className="mt-1 text-stone-500">
              <a
                className="font-semibold text-stone-700 underline-offset-4 transition hover:text-[#FC2C38] hover:underline"
                href="tel:2083435481"
              >
                208-343-5481
              </a>
              <span className="mx-2 text-stone-300">|</span>
              <span>M-F 7:30-5 · Sat 9-4</span>
              <span className="mx-2 text-stone-300">|</span>
              <a
                className="font-semibold text-stone-700 underline-offset-4 transition hover:text-[#FC2C38] hover:underline"
                href={directionsUrl}
                rel="noreferrer"
                target="_blank"
              >
                Directions
              </a>
            </p>
          </div>

          <div className="text-right">
            <p className="mb-1 hidden text-xs font-semibold text-stone-500 sm:block">
              {catalogCount} items stocked
            </p>
            <button
              className={`rounded-lg border border-stone-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-[#FC2C38] hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 ${
                quoteAnimationKey ? 'animate-quote-pop' : ''
              }`}
              key={quoteAnimationKey || 'quote-button'}
              onClick={onQuoteOpen}
              type="button"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-[#FC2C38]">
                Quote
              </p>
              <p className="mt-1 text-sm font-black text-stone-950">
                {quoteCount
                  ? `${quoteCount} items · $${quoteSubtotal.toFixed(2)}`
                  : 'Empty'}
              </p>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppHeader
