function SuggestedPrompts({ prompts, onSelect }) {
  return (
    <div className="rounded-md bg-red-50/70 p-2 ring-1 ring-red-100">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {prompts.map((prompt) => (
          <button
            className="shrink-0 rounded-full border border-red-100 bg-white px-3 py-2 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-[#FC2C38] hover:bg-red-50 hover:text-[#FC2C38] focus:outline-none focus:ring-4 focus:ring-red-100"
            key={prompt}
            onClick={() => onSelect(prompt)}
            type="button"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SuggestedPrompts
