import { useState } from 'react'

function ChatDeliveryPrompt({ onSubmit }) {
  const [value, setValue] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const cleanValue = value.trim()

    if (!cleanValue) {
      return
    }

    onSubmit(`delivery to ${cleanValue}`)
    setValue('')
  }

  return (
    <form
      className="mt-3 rounded-lg border border-stone-200 bg-stone-50 p-3"
      onSubmit={handleSubmit}
    >
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wide text-stone-500">
          Delivery ZIP or city
        </span>
        <div className="mt-2 flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-semibold outline-none transition placeholder:font-normal placeholder:text-stone-400 focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
            onChange={(event) => setValue(event.target.value)}
            placeholder="83703 or Meridian"
            type="text"
            value={value}
          />
          <button
            className="shrink-0 rounded-md bg-[#FC2C38] px-3 py-2 text-sm font-black text-white transition hover:bg-[#de1f2b] focus:outline-none focus:ring-4 focus:ring-red-200"
            type="submit"
          >
            Check
          </button>
        </div>
      </label>
    </form>
  )
}

export default ChatDeliveryPrompt
