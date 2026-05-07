import { useMemo, useState } from 'react'
import {
  deliveryZones,
  handUnloadMethods,
  methodLabels,
  primaryUnloadMethods,
} from '../utils/deliveryPricing'

function DeliveryEstimator({ onAddDeliveryToQuote, onClose }) {
  const [zipCode, setZipCode] = useState('')
  const [method, setMethod] = useState('dumped')
  const [isExpanded, setIsExpanded] = useState(true)

  const selectedZone = deliveryZones[zipCode]
  const estimate = useMemo(() => {
    if (!selectedZone) {
      return null
    }

    return selectedZone[method]
  }, [method, selectedZone])

  function addDeliveryToQuote() {
    if (!estimate || !selectedZone) {
      return
    }

    onAddDeliveryToQuote({
      id: `delivery-${zipCode}-${method}`,
      name: `Delivery to ${selectedZone.city} ${zipCode}`,
      category: 'Delivery',
      price: estimate,
      unit: 'trip',
      image: '/site-logo.svg',
      deliveryMethod: methodLabels[method],
    })
    onClose?.()
  }

  function clearDeliveryEstimate() {
    setZipCode('')
    setMethod('dumped')
    setIsExpanded(true)
  }

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-950">Need delivery?</h2>
          <p className="mt-1 text-sm text-stone-600">
            Estimate dumped, forklift, or hand unload pricing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {zipCode ? (
            <button
              className="rounded px-2 py-1 text-xs font-bold text-stone-500 transition hover:bg-stone-100 hover:text-[#FC2C38] focus:outline-none focus:ring-2 focus:ring-red-100"
              onClick={clearDeliveryEstimate}
              type="button"
            >
              Clear
            </button>
          ) : null}
          <span className="rounded bg-stone-100 px-2 py-1 text-xs font-bold text-stone-600">
            Estimate
          </span>
          {onClose ? (
            <button
              className="rounded px-2 py-1 text-xs font-bold text-stone-500 transition hover:bg-stone-100 hover:text-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-100"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          ) : null}
        </div>
      </div>

      <label className="mt-3 block">
        <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Delivery ZIP
        </span>
        <input
          className="mt-2 w-full rounded-md border border-stone-200 px-3 py-2.5 text-base outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:ring-4 focus:ring-stone-100"
          inputMode="numeric"
          maxLength={5}
          onChange={(event) => {
            const nextZip = event.target.value.replace(/\D/g, '')
            setZipCode(nextZip)
          }}
          placeholder="83702"
          value={zipCode}
        />
      </label>

      {estimate && !isExpanded ? (
        <div className="mt-3 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
          <button
            className="flex w-full items-center justify-between gap-4 text-left transition hover:text-[#FC2C38] focus:outline-none focus:ring-4 focus:ring-red-100"
            onClick={() => setIsExpanded(true)}
            type="button"
          >
            <div>
              <p className="text-sm font-semibold text-stone-950">
                {selectedZone.city} delivery
              </p>
              <p className="text-xs text-stone-600">
                {zipCode} · {methodLabels[method]}
              </p>
            </div>
            <p className="text-2xl font-black text-stone-950">
              ${estimate.toFixed(2)}
            </p>
          </button>
          <button
            className="mt-3 w-full rounded-md bg-[#FC2C38] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#de1f2b] focus:outline-none focus:ring-4 focus:ring-red-200"
            onClick={addDeliveryToQuote}
            type="button"
          >
            Add delivery to quote
          </button>
        </div>
      ) : null}

      {isExpanded ? (
        <>
          <div className="mt-3 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Unload method
        </p>
        <div className="grid grid-cols-3 gap-2">
          {primaryUnloadMethods.map((option) => (
            <button
              className={`min-h-[74px] rounded-md border px-2 py-2 text-center transition focus:outline-none focus:ring-4 focus:ring-stone-100 ${
                method === option.id
                  ? 'border-stone-900 bg-white shadow-sm'
                  : 'border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50'
              }`}
              key={option.id}
              onClick={() => setMethod(option.id)}
              type="button"
            >
              <span className="block text-sm font-semibold text-stone-950">
                {option.label}
              </span>
              <span className="mt-0.5 block text-xs font-bold text-stone-600">
                {selectedZone ? `$${selectedZone[option.id]}` : 'ZIP'}
              </span>
            </button>
          ))}
          <div className="rounded-md border border-stone-200 bg-white p-1.5 shadow-[0_1px_1px_rgb(0_0_0/0.03)]">
            <p className="px-1 pb-1 text-center text-xs font-semibold text-stone-700">
              Hand unload
            </p>
            <div className="grid gap-1">
              {handUnloadMethods.map((option) => (
                <button
                  className={`rounded px-2 py-1 text-center transition focus:outline-none focus:ring-2 focus:ring-stone-100 ${
                    method === option.id
                      ? 'bg-stone-900 text-white ring-1 ring-stone-900'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100 hover:text-stone-950'
                  }`}
                  key={option.id}
                  onClick={() => setMethod(option.id)}
                  type="button"
                >
                  <span className="block text-xs font-semibold">{option.label}</span>
                  <span className="block text-[11px] font-bold">
                    {selectedZone ? `$${selectedZone[option.id]}` : 'ZIP'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
          </div>

          <div className="mt-3 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
        {estimate ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-stone-600">
                  {selectedZone.city} estimate
                </p>
                <p className="text-xs text-stone-500">
                  {methodLabels[method]} · delivery pricing
                </p>
              </div>
              <p className="text-2xl font-black text-stone-950">
                ${estimate.toFixed(2)}
              </p>
            </div>
            <button
              className="w-full rounded-md bg-[#FC2C38] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#de1f2b] focus:outline-none focus:ring-4 focus:ring-red-200"
              onClick={addDeliveryToQuote}
              type="button"
            >
              Add delivery to quote
            </button>
          </div>
        ) : (
          <>
            <p className="font-semibold text-stone-950">Enter a supported ZIP</p>
            <p className="mt-1 text-sm text-stone-600">
              Boise, Meridian, Kuna, Nampa, Caldwell, Star, Eagle, Middleton, Garden Valley, Idaho City, McCall, Donnelly, Cascade.
            </p>
          </>
        )}
          </div>
        </>
      ) : null}
    </section>
  )
}

export default DeliveryEstimator
