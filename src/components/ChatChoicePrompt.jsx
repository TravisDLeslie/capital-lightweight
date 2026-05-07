function ChatChoicePrompt({ choices, onSelect }) {
  if (!choices?.length) {
    return null
  }

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {choices.map((choice) => (
        <button
          className="rounded-md border border-stone-200 bg-stone-50 p-2 text-left text-sm font-bold text-stone-800 transition hover:border-[#FC2C38] hover:bg-red-50 hover:text-[#FC2C38] focus:outline-none focus:ring-4 focus:ring-red-100"
          key={choice.value}
          onClick={() => onSelect(choice.label)}
          type="button"
        >
          <span className="flex items-center gap-3">
            {choice.image ? (
              <img
                alt=""
                className="h-14 w-16 shrink-0 rounded bg-white object-contain p-1 ring-1 ring-stone-200"
                src={choice.image}
              />
            ) : null}
            <span>
              <span className="block">{choice.label}</span>
              {choice.description ? (
                <span className="mt-0.5 block text-xs font-semibold text-stone-500">
                  {choice.description}
                </span>
              ) : null}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}

export default ChatChoicePrompt
