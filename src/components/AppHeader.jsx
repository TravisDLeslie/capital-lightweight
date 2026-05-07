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
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-4 px-4 py-4 sm:px-5 sm:py-5 lg:grid-cols-[minmax(220px,1fr)_minmax(320px,1.2fr)_auto]">
        <div className="min-w-0 text-center lg:text-left">
          <img
            alt="Capital Lumber Co"
            className="mx-auto h-10 w-auto max-w-[240px] sm:h-12 sm:max-w-[320px] lg:mx-0"
            src="/site-logo.svg"
          />
          <h1 className="mt-3 text-sm font-black sm:text-sm">
            The Highest Quality Lumber & Building Materials
          </h1>
          <h2 className="mt-3 text-sm font-bold sm:text-sm">
            Truck and Trailer Drive Through Yard!
          </h2>
        </div>

        <div className="contents">
          <div className="text-center text-sm">
            <div className="group relative mb-2 inline-flex">
              <button
                className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-black text-[#FC2C38] shadow-sm transition hover:border-[#FC2C38] hover:bg-white focus:outline-none focus:ring-4 focus:ring-red-100"
                type="button"
              >
                Boise's Specialty Lumber Yard
              </button>
              <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-stone-200 bg-white p-4 text-left text-xs text-stone-600 opacity-0 shadow-xl transition group-hover:opacity-100 group-focus-within:opacity-100">
                <p className="font-bold text-stone-950">
                  We go the extra mile to find the material you need.
                </p>
                <p className="mt-2 leading-relaxed">
                  Fire rated? Check. Custom ran siding? Check. Specialty lumber, decking, beams, and oddball asks? We will help track it down.
                </p>
              </div>
            </div>
            <div className="mb-2 inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
              <span className="text-[#FC2C38]">★★★★★</span>
              <span>4.8 Google rating</span>
              <span className="text-stone-400">·</span>
              <span>120+ reviews</span>
            </div>
            <p className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-stone-500">
              <a
                className="font-semibold text-stone-700 underline-offset-4 transition hover:text-[#FC2C38] hover:underline"
                href="tel:2083435481"
              >
                208-343-5481
              </a>
              <span className="hidden text-stone-300 sm:inline">|</span>
              <span>M-F 7:30-5 · Sat 9-4</span>
              <span className="hidden text-stone-300 sm:inline">|</span>
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

          <div className="justify-self-center text-center lg:justify-self-end lg:text-right">
            <p className="mb-1 hidden text-xs font-semibold text-stone-500 sm:block">
              {catalogCount} items stocked
            </p>
            <button
              className={`min-w-[10rem] rounded-lg border border-stone-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-[#FC2C38] hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 ${
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
