function QuoteDrawer({ isOpen, items, onClose, onDecrease, onIncrease, onRemove }) {
  const subtotal = items.reduce((total, item) => {
    return total + item.product.price * item.quantity
  }, 0)

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/50" role="presentation">
      <aside className="ml-auto flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-stone-200 p-5">
          <div>
            <h2 className="text-2xl font-black text-stone-950">Quote</h2>
            <p className="mt-1 text-sm text-stone-600">
              {items.length
                ? `${items.length} line ${items.length === 1 ? 'item' : 'items'}`
                : 'No items added yet'}
            </p>
          </div>
          <button
            className="rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-[#FC2C38] hover:bg-red-50 hover:text-[#FC2C38] focus:outline-none focus:ring-4 focus:ring-red-100"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {items.length ? (
            <div className="space-y-3">
              {items.map((item) => {
                const isDelivery = item.product.category === 'Delivery'

                return (
                  <div
                    className="rounded-lg border border-stone-200 p-4"
                    key={item.product.id}
                  >
                  <div className="flex items-start gap-4">
                    <img
                      alt=""
                      className="h-16 w-16 rounded-md bg-stone-100 object-contain p-2"
                      src={item.product.image}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-stone-950">{item.product.name}</p>
                      <p className="mt-1 text-sm text-stone-600">
                        ${item.product.price.toFixed(2)} / {item.product.unit}
                      </p>
                      {isDelivery ? (
                        <p className="mt-1 text-xs font-semibold text-stone-500">
                          {item.product.deliveryMethod}
                        </p>
                      ) : null}
                    </div>
                    <button
                      className="text-sm font-semibold text-stone-500 transition hover:text-[#FC2C38]"
                      onClick={() => onRemove(item.product.id)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    {isDelivery ? (
                      <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-[#FC2C38]">
                        Delivery charge
                      </p>
                    ) : (
                      <div className="inline-flex items-center overflow-hidden rounded-md border border-stone-300">
                        <button
                          className="px-3 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-100"
                          onClick={() => onDecrease(item.product.id)}
                          type="button"
                        >
                          -
                        </button>
                        <span className="min-w-12 border-x border-stone-300 px-4 py-2 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          className="px-3 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-100"
                          onClick={() => onIncrease(item.product.id)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    )}
                    <p className="text-lg font-black text-stone-950">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-stone-300 p-8 text-center">
              <p className="font-bold text-stone-950">Your quote is empty.</p>
              <p className="mt-2 text-sm text-stone-600">
                Search for a product and click Add to quote.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-stone-200 p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Subtotal
            </p>
            <p className="text-3xl font-black text-stone-950">
              ${subtotal.toFixed(2)}
            </p>
          </div>
          <button
            className="mt-4 w-full rounded-md bg-[#FC2C38] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#de1f2b] focus:outline-none focus:ring-4 focus:ring-red-200"
            type="button"
          >
            Send quote request
          </button>
        </div>
      </aside>
    </div>
  )
}

export default QuoteDrawer
