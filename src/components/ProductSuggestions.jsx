function ProductSuggestions({ products, onSelect }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-950">Which one did you mean?</h2>
          <p className="mt-1 text-sm text-stone-600">
            We stock a few sizes and panel types that match that request.
          </p>
        </div>
        <span className="rounded bg-red-50 px-2 py-1 text-xs font-bold text-[#FC2C38]">
          {products.length} options
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {products.map((product) => (
          <button
            className="w-full rounded-md border border-stone-200 bg-white p-3 text-left transition hover:border-[#FC2C38] hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100"
            key={product.id}
            onClick={() => onSelect(product)}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-950">{product.name}</p>
                <p className="mt-1 text-sm text-stone-600">
                  {product.dimensions} | {product.grade}
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold text-stone-950">
                {product.price ? `$${product.price.toFixed(2)}` : 'Ask'}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProductSuggestions
