const directionsUrl =
  'https://www.google.com/maps/dir/?api=1&destination=Capital%20Lumber%20Co.%2C%203105%20W.%20State%20St.%20Boise%2C%20ID%2083703'

function Footer() {
  return (
    <footer className="shrink-0 border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2 text-xs text-stone-600 sm:px-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-black text-stone-950">Capital Lumber Co.</p>
          <p className="mt-0.5">M-F 7:30-5 · Sat 9-4</p>
        </div>

        <div className="flex flex-col gap-1 md:items-end">
          <a
            className="font-semibold text-stone-700 underline-offset-4 transition hover:text-[#FC2C38] hover:underline"
            href={directionsUrl}
            rel="noreferrer"
            target="_blank"
          >
            3105 W. State St. Boise, ID 83703
          </a>
          <a
            className="font-semibold text-stone-700 underline-offset-4 transition hover:text-[#FC2C38] hover:underline"
            href="tel:2083435481"
          >
            208-343-5481
          </a>
        </div>

        <a
          className="inline-flex w-fit rounded-full border border-stone-200 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-stone-500 transition hover:border-[#FC2C38] hover:bg-red-50 hover:text-[#FC2C38] focus:outline-none focus:ring-4 focus:ring-red-100"
          href="/admin"
        >
          Admin
        </a>
      </div>
    </footer>
  )
}

export default Footer
