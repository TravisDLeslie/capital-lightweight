import { useMemo, useState } from 'react'

const deliveryZones = {
  83702: { city: 'Boise', dumped: 40, forklift: 50, hand: 60, handTwo: 100 },
  83703: { city: 'Boise', dumped: 40, forklift: 50, hand: 60, handTwo: 100 },
  83704: { city: 'Boise', dumped: 40, forklift: 50, hand: 60, handTwo: 100 },
  83709: { city: 'Boise', dumped: 50, forklift: 65, hand: 80, handTwo: 120 },
  83642: { city: 'Meridian', dumped: 50, forklift: 65, hand: 80, handTwo: 120 },
  83646: { city: 'Meridian', dumped: 50, forklift: 65, hand: 80, handTwo: 120 },
  83616: { city: 'Eagle', dumped: 60, forklift: 75, hand: 95, handTwo: 135 },
  83651: { city: 'Nampa', dumped: 65, forklift: 85, hand: 105, handTwo: 145 },
  83686: { city: 'Nampa', dumped: 65, forklift: 85, hand: 105, handTwo: 145 },
  83644: { city: 'Middleton', dumped: 75, forklift: 95, hand: 120, handTwo: 160 },
  83605: { city: 'Caldwell', dumped: 80, forklift: 105, hand: 130, handTwo: 170 },
  83607: { city: 'Caldwell', dumped: 80, forklift: 105, hand: 130, handTwo: 170 },
  83634: { city: 'Kuna', dumped: 70, forklift: 90, hand: 115, handTwo: 155 },
  83638: { city: 'McCall', dumped: 225, forklift: 275, hand: 340, handTwo: 380 },
}

const primaryUnloadMethods = [
  { id: 'dumped', label: 'Dumped' },
  { id: 'forklift', label: 'Forklift' },
]

const handUnloadMethods = [
  { id: 'hand', label: '1 person' },
  { id: 'handTwo', label: '2 people' },
]

const methodLabels = {
  dumped: 'Dumped',
  forklift: 'Forklift',
  hand: 'Hand unload, 1 person',
  handTwo: 'Hand unload, 2 people',
}

function DeliveryEstimator({ onAddDeliveryToQuote }) {
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
  }

  function clearDeliveryEstimate() {
    setZipCode('')
    setMethod('dumped')
    setIsExpanded(true)
  }

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-950">Need delivery?</h2>
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
          <span className="rounded bg-red-50 px-2 py-1 text-xs font-bold text-[#FC2C38]">
            Estimate
          </span>
        </div>
      </div>

      <label className="mt-3 block">
        <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Delivery ZIP
        </span>
        <input
          className="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-base outline-none transition placeholder:text-stone-400 focus:border-[#FC2C38] focus:ring-4 focus:ring-red-100"
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
              className={`min-h-[74px] rounded-md border px-2 py-2 text-center transition focus:outline-none focus:ring-4 focus:ring-red-100 ${
                method === option.id
                  ? 'border-[#FC2C38] bg-red-50'
                  : 'border-stone-200 bg-white hover:border-[#FC2C38]'
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
          <div className="rounded-md border border-stone-200 bg-white p-1.5">
            <p className="px-1 pb-1 text-center text-xs font-semibold text-stone-700">
              Hand unload
            </p>
            <div className="grid gap-1">
              {handUnloadMethods.map((option) => (
                <button
                  className={`rounded px-2 py-1 text-center transition focus:outline-none focus:ring-2 focus:ring-red-100 ${
                    method === option.id
                      ? 'bg-red-50 text-[#FC2C38] ring-1 ring-[#FC2C38]'
                      : 'bg-stone-50 text-stone-700 hover:bg-red-50 hover:text-[#FC2C38]'
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
                  {methodLabels[method]} · fake delivery pricing
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
              Boise, Meridian, Eagle, Nampa, Middleton, Caldwell, Kuna, McCall.
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
