import { useState } from 'react'
import { downloadMaterialListPdf } from '../utils/materialListPdf'
import {
  getQuoteSubtotal,
  getQuoteTax,
  getQuoteTotal,
  getSalesTaxLabel,
} from '../utils/quoteTotals'

function QuoteDrawer({
  activeSectionId,
  isOpen,
  items,
  onAddSection,
  onAnalyticsEvent,
  onActiveSectionChange,
  onChangeItemSection,
  onClearQuote,
  onClose,
  onDecrease,
  onIncrease,
  onRemove,
  onTitleChange,
  sections,
  title,
}) {
  const [sectionName, setSectionName] = useState('')
  const [isConfirmingClear, setIsConfirmingClear] = useState(false)
  const subtotal = getQuoteSubtotal(items)
  const salesTax = getQuoteTax(subtotal)
  const total = getQuoteTotal(subtotal)
  const groupedSections = sections
    .map((section) => ({
      ...section,
      items: items.filter(
        (item) => (item.sectionId || sections[0]?.id) === section.id,
      ),
    }))
    .filter((section) => section.items.length)

  function handleAddSection(event) {
    event.preventDefault()
    onAddSection(sectionName)
    setSectionName('')
  }

  async function handleDownloadMaterialList() {
    onAnalyticsEvent({
      eventType: 'download_pdf',
      downloadedPdf: true,
      matchedProducts: items.map((item) => `${item.quantity} ${item.product.name}`),
      quoteTitle: title,
      quoteTotal: total,
    })
    await downloadMaterialListPdf(items, sections, title)
  }

  function handleClearQuote() {
    if (!isConfirmingClear) {
      setIsConfirmingClear(true)
      return
    }

    onAnalyticsEvent({
      eventType: 'clear_quote',
      matchedProducts: items.map((item) => `${item.quantity} ${item.product.name}`),
      quoteTitle: title,
      quoteTotal: total,
    })
    onClearQuote()
    setSectionName('')
    setIsConfirmingClear(false)
  }

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
          <div className="flex items-center gap-2">
            {items.length ? (
              <button
                className={`rounded-md border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-red-100 ${
                  isConfirmingClear
                    ? 'border-[#FC2C38] bg-red-50 text-[#FC2C38]'
                    : 'border-stone-300 text-stone-600 hover:border-[#FC2C38] hover:bg-red-50 hover:text-[#FC2C38]'
                }`}
                onBlur={() => setIsConfirmingClear(false)}
                onClick={handleClearQuote}
                type="button"
              >
                {isConfirmingClear ? 'Confirm clear' : 'Clear quote'}
              </button>
            ) : null}
            <button
              className="rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-[#FC2C38] hover:bg-red-50 hover:text-[#FC2C38] focus:outline-none focus:ring-4 focus:ring-red-100"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <label className="block text-xs font-bold uppercase tracking-wide text-stone-500">
            Project / list title
          </label>
          <input
            className="mt-1 mb-5 w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-sm font-semibold text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-950 focus:ring-4 focus:ring-red-100"
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Building C, Lot 3"
            type="text"
            value={title}
          />
          {items.length ? (
            <div className="space-y-5">
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                <form className="flex gap-2" onSubmit={handleAddSection}>
                  <input
                    className="min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-950 focus:ring-4 focus:ring-red-100"
                    onChange={(event) => setSectionName(event.target.value)}
                    placeholder="Add section: Walls, Floor..."
                    type="text"
                    value={sectionName}
                  />
                  <button
                    className="rounded-md bg-stone-950 px-3 py-2 text-sm font-bold text-white transition hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-red-100"
                    type="submit"
                  >
                    Add
                  </button>
                </form>
                <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-stone-500">
                  Add new items to
                </label>
                <select
                  className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-800 outline-none focus:border-stone-950 focus:ring-4 focus:ring-red-100"
                  onChange={(event) => onActiveSectionChange(event.target.value)}
                  value={activeSectionId}
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>

              {groupedSections.map((section) => {
                const sectionSubtotal = section.items.reduce((total, item) => {
                  return total + item.product.price * item.quantity
                }, 0)

                return (
                  <section className="space-y-3" key={section.id}>
                    <div className="flex items-end justify-between gap-3 border-b border-stone-200 pb-2">
                      <h3 className="text-lg font-black text-stone-950">
                        {section.name}
                      </h3>
                      <p className="text-sm font-bold text-stone-500">
                        ${sectionSubtotal.toFixed(2)}
                      </p>
                    </div>

                    {section.items.map((item) => {
                      const isDelivery = item.product.category === 'Delivery'
                      const internalSku =
                        item.product.stockSku || item.product.id.toUpperCase()

                      return (
                        <div
                          className="rounded-lg border border-stone-200 p-4"
                          key={item.id}
                        >
                          <div className="flex items-start gap-4">
                            <img
                              alt=""
                              className="h-16 w-16 rounded-md bg-stone-100 object-contain p-2"
                              src={item.product.image}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-stone-950">
                                {item.product.name}
                              </p>
                              <p className="mt-1 text-sm text-stone-600">
                                ${item.product.price.toFixed(2)} / {item.product.unit}
                              </p>
                              {!isDelivery ? (
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                                  SKU: {internalSku}
                                </p>
                              ) : null}
                              {isDelivery ? (
                                <p className="mt-1 text-xs font-semibold text-stone-500">
                                  {item.product.deliveryMethod}
                                </p>
                              ) : null}
                              <select
                                className="mt-3 w-full rounded-md border border-stone-300 bg-white px-2 py-1.5 text-xs font-semibold text-stone-700 outline-none focus:border-stone-950 focus:ring-4 focus:ring-red-100"
                                onChange={(event) =>
                                  onChangeItemSection(
                                    item.id,
                                    event.target.value,
                                  )
                                }
                                value={item.sectionId || sections[0]?.id}
                              >
                                {sections.map((currentSection) => (
                                  <option
                                    key={currentSection.id}
                                    value={currentSection.id}
                                  >
                                    {currentSection.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button
                              className="text-sm font-semibold text-stone-500 transition hover:text-[#FC2C38]"
                              onClick={() => onRemove(item.id)}
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
                                  onClick={() => onDecrease(item.id)}
                                  type="button"
                                >
                                  -
                                </button>
                                <span className="min-w-12 border-x border-stone-300 px-4 py-2 text-center text-sm font-bold">
                                  {item.quantity}
                                </span>
                                <button
                                  className="px-3 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-100"
                                  onClick={() => onIncrease(item.id)}
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
                  </section>
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
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                Subtotal
              </p>
              <p className="text-base font-bold text-stone-950">
                ${subtotal.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-stone-500">
                {getSalesTaxLabel()}
              </p>
              <p className="text-base font-bold text-stone-950">
                ${salesTax.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-stone-200 pt-3">
              <p className="text-sm font-black uppercase tracking-wide text-stone-700">
                Total
              </p>
              <p className="text-3xl font-black text-stone-950">
                ${total.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            className="mt-4 w-full rounded-md bg-[#FC2C38] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#de1f2b] focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:bg-stone-300"
            disabled={!items.length}
            onClick={handleDownloadMaterialList}
            type="button"
          >
            Download Material List
          </button>
          <p className="mt-2 text-center text-xs text-stone-500">
            Creates an 8.5 x 11 PDF you can email, print, or bring to the counter.
          </p>
        </div>
      </aside>
    </div>
  )
}

export default QuoteDrawer
