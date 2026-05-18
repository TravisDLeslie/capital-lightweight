const directionsUrl =
  'https://www.google.com/maps/dir/?api=1&destination=Capital%20Lumber%20Co.%2C%203105%20W.%20State%20St.%20Boise%2C%20ID%2083703'

function AppHeader({
  catalogCount,
  onMenuOpen,
  quoteAnimationKey,
  quoteCount,
  quoteSubtotal,
  onQuoteOpen,
}) {
  const quoteButtonClassName = [
    'flex min-w-[11rem] items-center justify-between gap-4 rounded-lg border border-stone-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-[#FC2C38] hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100',
    quoteAnimationKey ? 'animate-quote-pop' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
    <section className="shrink-0 border-b border-stone-200 bg-white/95 shadow-sm backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          aria-label="Open menu"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-2xl font-bold leading-none text-stone-800 shadow-sm transition hover:bg-stone-100 focus:outline-none focus:ring-4 focus:ring-stone-100"
          onClick={onMenuOpen}
          type="button"
        >
          ≡
        </button>
        <div className="min-w-0 flex-1">
          <button
            className="flex max-w-full items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-left shadow-sm"
            onClick={onMenuOpen}
            type="button"
          >
            <img
              alt=""
              className="h-6 w-auto shrink-0"
              src="/site-logo.svg"
            />
            <span className="truncate text-xs font-black text-stone-950">
              Lumber Assistant
            </span>
          </button>
        </div>
        <button
          className={`flex h-11 min-w-14 shrink-0 items-center justify-center rounded-full bg-[#FC2C38] px-3 text-xs font-black text-white shadow-sm transition focus:outline-none focus:ring-4 focus:ring-red-200 ${
            quoteAnimationKey ? 'animate-quote-pop' : ''
          }`}
          onClick={onQuoteOpen}
          type="button"
        >
          {quoteCount ? quoteCount : 'Quote'}
        </button>
      </div>
    </section>

    <section className="hidden shrink-0 border-b border-stone-200 bg-white/95 shadow-sm backdrop-blur md:block">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-5 xl:flex-row xl:items-center xl:justify-between xl:gap-6">
        <div className="flex min-w-0 flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <img
            alt="Capital Lumber Co"
            className="h-8 w-auto max-w-[250px] shrink-0 sm:h-12 xl:h-12"
            src="/site-logo.svg"
          />
          <div className="min-w-0">
            <h1 className="text-sm font-black leading-tight text-stone-950 sm:text-lg">
              The Highest Quality Lumber & Building Materials
            </h1>
            <p className="mt-1 text-xs font-semibold text-stone-600">
              Truck and trailer drive-through yard in Boise
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col items-center gap-3 xl:items-end">
          <div className="flex max-w-full flex-wrap items-center justify-center gap-2 xl:justify-end">
            <div className="group relative inline-flex">
              <button
                className="rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-black text-[#FC2C38] shadow-sm transition hover:border-[#FC2C38] hover:bg-white focus:outline-none focus:ring-4 focus:ring-red-100"
                type="button"
              >
                Boise's Specialty Lumber Yard
              </button>
              <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-[min(19rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-stone-200 bg-white p-4 text-left text-xs text-stone-600 opacity-0 shadow-xl transition group-hover:opacity-100 group-focus-within:opacity-100 xl:left-auto xl:right-0 xl:translate-x-0">
                <p className="font-bold text-stone-950">
                  We go the extra mile to find the material you need.
                </p>
                <p className="mt-2 leading-relaxed">
                  Fire rated? Check. Custom ran siding? Check. Specialty lumber, decking, beams, and oddball asks? We will help track it down.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-700 ring-1 ring-stone-200">
              <span className="text-[#FC2C38]">★★★★★</span>
              <span>4.8 Google</span>
              <span className="text-stone-400">·</span>
              <span>120+ reviews</span>
            </div>
          </div>

          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center xl:justify-end">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-lg bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700 ring-1 ring-stone-200 sm:justify-start">
              <a
                className="text-stone-950 underline-offset-4 transition hover:text-[#FC2C38] hover:underline"
                href="tel:2083435481"
              >
                208-343-5481
              </a>
              <span className="hidden text-stone-300 sm:inline">|</span>
              <span>M-F 7:30-5 · Sat 9-4</span>
              <span className="hidden text-stone-300 sm:inline">|</span>
              <a
                className="text-stone-950 underline-offset-4 transition hover:text-[#FC2C38] hover:underline"
                href={directionsUrl}
                rel="noreferrer"
                target="_blank"
              >
                Directions
              </a>
            </div>

            <button
              className={quoteButtonClassName}
              key={quoteAnimationKey || 'quote-button'}
              onClick={onQuoteOpen}
              type="button"
            >
              <span className="min-w-0">
                <span className="block text-xs font-bold uppercase tracking-wide text-[#FC2C38]">
                  Quote
                </span>
                <span className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-stone-950">
                  {quoteCount ? (
                    <>
                      <span className="text-sm font-black">
                        {quoteCount} {quoteCount === 1 ? 'item' : 'items'}
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="text-sm font-black">
                        ${quoteSubtotal.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-black">Empty</span>
                  )}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1.5 text-center text-[11px] font-bold leading-tight text-stone-500">
                {catalogCount}
                <span className="block">stocked</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
    </>
  )
}

export default AppHeader
