function LumberGraphic({ product }) {
  const isSheetGood = product.category === 'Sheet Goods'
  const isTreated = product.category === 'Treated Lumber'
  const isWideBoard = product.name.includes('2x6')

  if (product.image) {
    return (
      <div className="relative h-44 w-full overflow-hidden bg-stone-100">
        <img
          alt={product.name}
          className="h-full w-full object-contain p-4"
          src={product.image}
        />
      </div>
    )
  }

  if (isSheetGood) {
    return (
      <div className="relative h-28 w-full overflow-hidden rounded-md bg-stone-200">
        <div className="absolute inset-x-7 bottom-4 h-17 skew-x-[-12deg] rounded-sm border border-amber-900/15 bg-gradient-to-br from-yellow-500 via-orange-400 to-amber-700 shadow-xl">
          <div className="h-full bg-[radial-gradient(circle_at_20%_30%,rgba(120,53,15,.45)_0_1px,transparent_2px),radial-gradient(circle_at_70%_55%,rgba(120,53,15,.35)_0_1px,transparent_2px),radial-gradient(circle_at_45%_75%,rgba(120,53,15,.3)_0_1px,transparent_2px)] bg-[length:18px_18px]" />
        </div>
        <div className="absolute inset-x-10 bottom-8 h-px bg-amber-950/30" />
        <div className="absolute inset-x-10 bottom-12 h-px bg-amber-950/25" />
        <div className="absolute inset-x-10 bottom-16 h-px bg-amber-950/20" />
        <div className="absolute left-5 top-5 rounded bg-stone-950 px-2 py-1 text-xs font-semibold text-white">
          Sheet good
        </div>
      </div>
    )
  }

  if (isTreated) {
    return (
      <div className="relative h-28 w-full overflow-hidden rounded-md bg-stone-200">
        {[0, 1].map((post) => (
          <div
            className="absolute left-8 right-8 h-8 rounded-sm border border-emerald-950/20 bg-gradient-to-r from-lime-700 via-emerald-600 to-lime-800 shadow-md"
            key={post}
            style={{
              bottom: `${28 + post * 24}px`,
              transform: `translateX(${post * 18}px) skewX(-18deg)`,
            }}
          >
            <div className="h-full rounded-sm bg-[repeating-linear-gradient(90deg,rgba(20,83,45,.45)_0,rgba(20,83,45,.45)_1px,transparent_1px,transparent_22px)]" />
          </div>
        ))}
        <div className="absolute right-10 bottom-6 h-16 w-9 skew-x-[-18deg] rounded-sm border border-emerald-950/20 bg-emerald-700 shadow-md" />
        <div className="absolute left-5 top-5 rounded bg-emerald-950 px-2 py-1 text-xs font-semibold text-white">
          Treated post
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-28 w-full overflow-hidden rounded-md bg-stone-200">
      {[0, 1, 2].map((board) => (
        <div
          className="absolute left-5 right-5 rounded-sm border border-amber-900/10 bg-gradient-to-r from-amber-300 via-orange-300 to-amber-500 shadow-md"
          key={board}
          style={{
            height: isWideBoard ? '26px' : '20px',
            bottom: `${24 + board * 17}px`,
            transform: `translateX(${board * 12}px) skewX(-18deg)`,
          }}
        >
          <div className="h-full rounded-sm bg-[repeating-linear-gradient(90deg,rgba(120,53,15,.22)_0,rgba(120,53,15,.22)_1px,transparent_1px,transparent_26px)]" />
        </div>
      ))}
      <div className="absolute left-5 top-5 rounded bg-stone-950 px-2 py-1 text-xs font-semibold text-white">
        {product.dimensions}
      </div>
    </div>
  )
}

export default LumberGraphic
