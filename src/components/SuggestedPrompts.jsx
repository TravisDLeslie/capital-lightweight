function SuggestedPrompts({ prompts, onSelect }) {
  return (
    <div className="rounded-md bg-stone-50 p-2 ring-1 ring-stone-100">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {prompts.map((prompt) => (
          <button
            className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-950 focus:outline-none focus:ring-4 focus:ring-stone-100"
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
