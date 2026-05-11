import { useEffect, useMemo, useState } from 'react'
import {
  downloadInvoiceReaderPdf,
  extractPdfText,
  formatMoney,
  getStatementSummary,
} from '../utils/invoiceReader'
import { products } from '../data/products'

const vendors = ['Rugby Holdings LLC', 'Boise Cascade', 'OrePac', 'Capital Lumber Co.']
const inventoryCoverageStorageKey = 'capital-inventory-coverage'
const salesMonths = [
  { key: 'jan', label: 'Jan' },
  { key: 'feb', label: 'Feb' },
  { key: 'mar', label: 'Mar' },
  { key: 'apr', label: 'Apr' },
  { key: 'may', label: 'May' },
  { key: 'jun', label: 'Jun' },
  { key: 'jul', label: 'Jul' },
  { key: 'aug', label: 'Aug' },
  { key: 'sep', label: 'Sep' },
  { key: 'oct', label: 'Oct' },
  { key: 'nov', label: 'Nov' },
  { key: 'dec', label: 'Dec' },
]
const adminTools = [
  {
    id: 'invoice-reader',
    label: 'Invoice Reader',
    description: 'Vendor PDFs to QuickBooks rows',
  },
  {
    id: 'inventory-churn',
    label: 'Inventory Churn',
    description: '30-60 day stocking needs',
  },
]
const inventoryCategoryFilters = [
  { id: 'All', label: 'All SKUs' },
  { id: '2x4s', label: '2x4s' },
  { id: 'Pressure Treated', label: 'Pressure Treated' },
]

function getProductSku(product) {
  return product.stockSku || product.id
}

function formatNumber(value) {
  return value.toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })
}

function formatDecimal(value) {
  return value.toLocaleString('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  })
}

function getCoverageStatus(qtyOnHand, need30, need60) {
  if (qtyOnHand < need30) {
    return 'Low'
  }

  if (qtyOnHand > need60) {
    return 'Overstocked'
  }

  return 'Good'
}

function getStatusStyles(status) {
  if (status === 'Low') {
    return 'bg-red-50 text-[#FC2C38] ring-red-100'
  }

  if (status === 'Overstocked') {
    return 'bg-amber-50 text-amber-700 ring-amber-100'
  }

  return 'bg-emerald-50 text-emerald-700 ring-emerald-100'
}

function getRecommendation(status) {
  if (status === 'Low') {
    return 'Buy now'
  }

  if (status === 'Overstocked') {
    return 'Reduce/stop buying'
  }

  return 'Hold'
}

function getMockAverageMonthlySales(product, index) {
  const stock = Number(product.stock || 0)
  const baseline = Math.max(4, Math.round(stock * (0.35 + (index % 5) * 0.08)))

  return baseline
}

function matchesInventoryCategory(row, categoryFilter) {
  if (categoryFilter === 'All') {
    return true
  }

  if (categoryFilter === '2x4s') {
    return (
      row.name.toLowerCase().includes('2x4') ||
      row.dimensions?.toLowerCase().includes('2 in x 4')
    )
  }

  if (categoryFilter === 'Pressure Treated') {
    return row.category === 'Pressure Treated Lumber'
  }

  return true
}

function getSavedInventoryCoverage() {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    return JSON.parse(window.localStorage.getItem(inventoryCoverageStorageKey)) || {}
  } catch {
    return {}
  }
}

function AdminPage() {
  const [activeTool, setActiveTool] = useState('invoice-reader')
  const [documentType, setDocumentType] = useState('Statement')
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [rows, setRows] = useState([])
  const [username, setUsername] = useState('')
  const [vendor, setVendor] = useState(vendors[0])

  const extractedTotal = useMemo(
    () => rows.reduce((total, row) => total + row.grossAmount, 0),
    [rows],
  )

  function handleLogin(event) {
    event.preventDefault()

    if (username.trim().toLowerCase() === 'all' && password === 'Oregon') {
      setIsAuthenticated(true)
      setError('')
      return
    }

    setError('That login did not work. Use all / Oregon for now.')
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setError('')
    setFileName(file.name)
    setIsReading(true)

    try {
      const text = await extractPdfText(file)
      const summary = getStatementSummary(text)

      setRows(summary.rows)

      if (!summary.rows.length) {
        setError(
          'I could read the PDF, but I could not find invoice rows yet. Try a clearer invoice or statement PDF.',
        )
      }
    } catch {
      setError('I could not read that PDF yet. Try another file or re-export it as a text-based PDF.')
      setRows([])
    } finally {
      setIsReading(false)
    }
  }

  async function handleDownloadPdf() {
    if (!rows.length) {
      return
    }

    await downloadInvoiceReaderPdf({
      documentType,
      rows,
      sourceFileName: fileName,
      vendor,
    })
  }

  function handleToolChange(toolId) {
    setActiveTool(toolId)
    setIsMenuOpen(false)
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4 py-10 text-stone-950">
        <form
          className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
          onSubmit={handleLogin}
        >
          <a
            className="text-sm font-bold text-[#FC2C38] underline-offset-4 hover:underline"
            href="/"
          >
            Back to chat
          </a>
          <h1 className="mt-6 text-2xl font-black">Admin Login</h1>
          <p className="mt-2 text-sm font-semibold text-stone-600">
            Temporary access for the invoice reader.
          </p>

          <label className="mt-6 block text-sm font-black text-stone-700">
            User
            <input
              className="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-base font-semibold outline-none transition focus:border-[#FC2C38] focus:ring-4 focus:ring-red-100"
              onChange={(event) => setUsername(event.target.value)}
              value={username}
            />
          </label>

          <label className="mt-4 block text-sm font-black text-stone-700">
            Password
            <input
              className="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-base font-semibold outline-none transition focus:border-[#FC2C38] focus:ring-4 focus:ring-red-100"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>

          {error ? (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-[#FC2C38]">
              {error}
            </p>
          ) : null}

          <button
            className="mt-6 w-full rounded-md bg-[#FC2C38] px-4 py-3 text-sm font-black text-white transition hover:bg-[#de1f2b] focus:outline-none focus:ring-4 focus:ring-red-200"
            type="submit"
          >
            Login
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-6 text-stone-950 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <a
              className="text-sm font-bold text-[#FC2C38] underline-offset-4 hover:underline"
              href="/"
            >
              Back to chat
            </a>
            <h1 className="mt-4 text-3xl font-black">Admin</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold text-stone-600">
              Internal tools for invoices, purchasing, inventory, and the yard.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-black text-stone-800 shadow-sm transition hover:border-[#FC2C38] hover:text-[#FC2C38] lg:hidden"
              onClick={() => setIsMenuOpen(true)}
              type="button"
            >
              Menu
            </button>
            <button
              className="rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-black text-stone-700 transition hover:border-[#FC2C38] hover:text-[#FC2C38]"
              onClick={() => setIsAuthenticated(false)}
              type="button"
            >
              Log out
            </button>
          </div>
        </div>

        {isMenuOpen ? (
          <div className="fixed inset-0 z-50 bg-stone-950/35 p-4 lg:hidden">
            <div className="ml-auto h-full w-full max-w-xs rounded-lg bg-white p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-wide text-stone-500">
                  Admin menu
                </p>
                <button
                  className="rounded-md border border-stone-200 px-3 py-2 text-sm font-black text-stone-700"
                  onClick={() => setIsMenuOpen(false)}
                  type="button"
                >
                  Close
                </button>
              </div>
              <AdminMenu activeTool={activeTool} onToolChange={handleToolChange} />
            </div>
          </div>
        ) : null}

        <section className="mt-6 grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="hidden rounded-lg border border-stone-200 bg-white p-3 shadow-sm lg:block">
            <AdminMenu activeTool={activeTool} onToolChange={handleToolChange} />
          </aside>

          {activeTool === 'invoice-reader' ? (
            <InvoiceReaderTool
              documentType={documentType}
              error={error}
              extractedTotal={extractedTotal}
              fileName={fileName}
              isReading={isReading}
              onDocumentTypeChange={setDocumentType}
              onDownloadPdf={handleDownloadPdf}
              onFileChange={handleFileChange}
              onVendorChange={setVendor}
              rows={rows}
              vendor={vendor}
            />
          ) : (
            <InventoryChurnTool />
          )}
        </section>
      </div>
    </main>
  )
}

function AdminMenu({ activeTool, onToolChange }) {
  return (
    <nav className="mt-4 space-y-2 lg:mt-0">
      {adminTools.map((tool) => {
        const isActive = tool.id === activeTool

        return (
          <button
            className={`w-full rounded-md border px-3 py-3 text-left transition ${
              isActive
                ? 'border-red-200 bg-red-50 text-[#FC2C38]'
                : 'border-transparent text-stone-700 hover:border-stone-200 hover:bg-stone-50'
            }`}
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            type="button"
          >
            <span className="block text-sm font-black">{tool.label}</span>
            <span className="mt-1 block text-xs font-bold text-stone-500">
              {tool.description}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

function InvoiceReaderTool({
  documentType,
  error,
  extractedTotal,
  fileName,
  isReading,
  onDocumentTypeChange,
  onDownloadPdf,
  onFileChange,
  onVendorChange,
  rows,
  vendor,
}) {
  return (
    <div>
      <div className="mb-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-black">Invoice Reader</h2>
        <p className="mt-1 max-w-2xl text-sm font-semibold text-stone-600">
          Upload a vendor invoice or statement, review the extracted rows, then
          download a summary PDF for QuickBooks entry.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">Upload PDF</h2>

            <label className="mt-5 block text-sm font-black text-stone-700">
              Vendor
              <select
                className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-sm font-bold outline-none focus:border-[#FC2C38] focus:ring-4 focus:ring-red-100"
                onChange={(event) => onVendorChange(event.target.value)}
                value={vendor}
              >
                {vendors.map((vendorOption) => (
                  <option key={vendorOption}>{vendorOption}</option>
                ))}
              </select>
            </label>

            <label className="mt-4 block text-sm font-black text-stone-700">
              Document type
              <select
                className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-sm font-bold outline-none focus:border-[#FC2C38] focus:ring-4 focus:ring-red-100"
                onChange={(event) => onDocumentTypeChange(event.target.value)}
                value={documentType}
              >
                <option>Statement</option>
                <option>Invoice</option>
              </select>
            </label>

            <label className="mt-4 block rounded-lg border border-dashed border-stone-300 bg-stone-50 p-4 text-sm font-bold text-stone-700 transition hover:border-[#FC2C38] hover:bg-red-50">
              <span className="block">Choose invoice or statement PDF</span>
              <input
                accept="application/pdf"
                className="mt-3 block w-full text-sm"
                onChange={onFileChange}
                type="file"
              />
            </label>

            {fileName ? (
              <p className="mt-3 text-sm font-semibold text-stone-600">
                File: {fileName}
              </p>
            ) : null}

            {isReading ? (
              <p className="mt-4 rounded-md bg-stone-100 px-3 py-2 text-sm font-bold text-stone-700">
                Reading PDF...
              </p>
            ) : null}

            {error ? (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-[#FC2C38]">
                {error}
              </p>
            ) : null}

            <button
              className="mt-5 w-full rounded-md bg-[#FC2C38] px-4 py-3 text-sm font-black text-white transition hover:bg-[#de1f2b] disabled:cursor-not-allowed disabled:bg-stone-300"
              disabled={!rows.length}
              onClick={onDownloadPdf}
              type="button"
            >
              Download summary PDF
            </button>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-stone-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-black">Extracted Rows</h2>
                <p className="mt-1 text-sm font-semibold text-stone-600">
                  Date, invoice number, and amount.
                </p>
              </div>
              <div className="rounded-md bg-stone-100 px-3 py-2 text-sm font-black text-stone-800">
                Total: {formatMoney(extractedTotal)}
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
                    <th className="py-3 pr-4">Invoice date</th>
                    <th className="py-3 pr-4">Invoice number</th>
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? (
                    rows.map((row) => (
                      <tr
                        className="border-b border-stone-100 font-semibold text-stone-800"
                        key={`${row.invoiceNumber}-${row.invoiceDate}`}
                      >
                        <td className="py-3 pr-4">{row.invoiceDate}</td>
                        <td className="py-3 pr-4">{row.invoiceNumber}</td>
                        <td className="py-3 pr-4">{row.type}</td>
                        <td className="py-3 text-right">{formatMoney(row.grossAmount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="py-8 text-center font-semibold text-stone-500"
                        colSpan={4}
                      >
                        Upload a PDF to see extracted invoice rows.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
    </div>
  )
}

function InventoryChurnTool() {
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [coverageBySku, setCoverageBySku] = useState(getSavedInventoryCoverage)
  const [selectedSku, setSelectedSku] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const inventoryRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return products
      .filter((product) => Number.isFinite(product.stock))
      .map((product, index) => {
        const sku = getProductSku(product)
        const skuData = coverageBySku[sku] || {}
        const qtyOnHand = Number(skuData.qtyOnHand || product.stock || 0)
        const buyUnitSize = Math.max(Number(skuData.buyUnitSize || 1), 1)
        const monthlySales = salesMonths.map((month) =>
          Number(skuData[month.key] || 0),
        )
        const totalMonthlySales = monthlySales.reduce(
          (total, monthQty) => total + monthQty,
          0,
        )
        const monthsWithSales = monthlySales.filter((monthQty) => monthQty > 0).length
        const avgMonthlySales =
          monthsWithSales > 0
            ? totalMonthlySales / monthsWithSales
            : Number(
                skuData.avgMonthlySales || getMockAverageMonthlySales(product, index),
              )
        const avgDailySales = avgMonthlySales / 30
        const need30 = avgDailySales * 30
        const need60 = avgDailySales * 60
        const excess30 = qtyOnHand - need30
        const excess60 = qtyOnHand - need60
        const shortage30 = Math.max(need30 - qtyOnHand, 0)
        const shortage60 = Math.max(need60 - qtyOnHand, 0)
        const buyUnits30 = Math.ceil(shortage30 / buyUnitSize)
        const buyUnits60 = Math.ceil(shortage60 / buyUnitSize)
        const currentDaysCoverage =
          avgDailySales > 0 ? qtyOnHand / avgDailySales : Infinity
        const unitCost = Number.isFinite(product.price) ? product.price : null
        const excessQtyOver60 = Math.max(qtyOnHand - need60, 0)
        const excessCashOver60 =
          unitCost !== null ? excessQtyOver60 * unitCost : null
        const status = getCoverageStatus(qtyOnHand, need30, need60)

        return {
          ...product,
          avgDailySales,
          avgMonthlySales,
          buyUnitSize,
          buyUnits30,
          buyUnits60,
          currentDaysCoverage,
          excess30,
          excess60,
          excessCashOver60,
          excessQtyOver60,
          monthlySales,
          monthsWithSales,
          need30,
          need60,
          qtyOnHand,
          recommendation: getRecommendation(status),
          sku,
          status,
          unitCost,
        }
      })
      .filter((row) => {
        if (!normalizedSearch) {
          return true
        }

        return `${row.sku} ${row.name} ${row.category}`
          .toLowerCase()
          .includes(normalizedSearch)
      })
      .sort((first, second) => {
        return first.sku.localeCompare(second.sku, undefined, {
          numeric: true,
          sensitivity: 'base',
        })
      })
  }, [coverageBySku, search])

  useEffect(() => {
    window.localStorage.setItem(
      inventoryCoverageStorageKey,
      JSON.stringify(coverageBySku),
    )
  }, [coverageBySku])

  const selectedRow = inventoryRows.find((row) => row.sku === selectedSku)
  const categoryRows = inventoryRows.filter((row) =>
    matchesInventoryCategory(row, categoryFilter),
  )
  const lowCount = categoryRows.filter((row) => row.status === 'Low').length
  const goodCount = categoryRows.filter((row) => row.status === 'Good').length
  const overstockedCount = categoryRows.filter(
    (row) => row.status === 'Overstocked',
  ).length
  const overstockedCashTotal = categoryRows
    .filter((row) => row.status === 'Overstocked')
    .reduce((total, row) => total + (row.excessCashOver60 || 0), 0)
  const visibleRows =
    statusFilter === 'All'
      ? categoryRows
      : categoryRows.filter((row) => row.status === statusFilter)

  function updateCoverage(sku, field, value) {
    setCoverageBySku((currentCoverage) => ({
      ...currentCoverage,
      [sku]: {
        ...currentCoverage[sku],
        [field]: value,
      },
    }))
  }

  return (
    <div>
      <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-black">Inventory Churn</h2>
            <p className="mt-1 max-w-2xl text-sm font-semibold text-stone-600">
              Inventory coverage by SKU. Adjust quantity on hand and average
              monthly sales, or click a SKU to enter monthly sales history for a
              calculated average.
            </p>
          </div>
          <label className="block text-sm font-black text-stone-700 lg:w-72">
            Search SKU or product
            <input
              className="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm font-semibold outline-none transition focus:border-[#FC2C38] focus:ring-4 focus:ring-red-100"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="2x4, 894, OSB..."
              value={search}
            />
          </label>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <button
            className={`rounded-lg p-4 text-left transition ${
              statusFilter === 'Low'
                ? 'bg-red-50 ring-2 ring-red-200'
                : 'bg-stone-100 hover:bg-red-50'
            }`}
            onClick={() => setStatusFilter(statusFilter === 'Low' ? 'All' : 'Low')}
            type="button"
          >
            <p className="text-xs font-black uppercase tracking-wide text-stone-500">
              Low
            </p>
            <p className="mt-2 text-2xl font-black text-[#FC2C38]">{lowCount}</p>
          </button>
          <button
            className={`rounded-lg p-4 text-left transition ${
              statusFilter === 'Good'
                ? 'bg-emerald-50 ring-2 ring-emerald-200'
                : 'bg-emerald-50 hover:bg-emerald-100'
            }`}
            onClick={() => setStatusFilter(statusFilter === 'Good' ? 'All' : 'Good')}
            type="button"
          >
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
              Good
            </p>
            <p className="mt-2 text-2xl font-black text-emerald-700">
              {goodCount}
            </p>
          </button>
          <button
            className={`rounded-lg p-4 text-left transition ${
              statusFilter === 'Overstocked'
                ? 'bg-amber-50 ring-2 ring-amber-200'
                : 'bg-amber-50 hover:bg-amber-100'
            }`}
            onClick={() =>
              setStatusFilter(
                statusFilter === 'Overstocked' ? 'All' : 'Overstocked',
              )
            }
            type="button"
          >
            <p className="text-xs font-black uppercase tracking-wide text-amber-700">
              Overstocked
            </p>
            <p className="mt-2 text-2xl font-black text-amber-700">
              {overstockedCount}
            </p>
            <p className="mt-1 text-xs font-bold text-amber-800">
              60+ days inventory
            </p>
          </button>
        </div>

        <p className="mt-4 rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-bold text-stone-700">
          Our sweet spot is 30-60 days. It keeps inventory fresh and cash flow good.
        </p>

        <div className="mt-3 rounded-md border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">
            Overstocked cash in this view
          </p>
          <p className="mt-1 text-xl font-black text-stone-950">
            {formatMoney(overstockedCashTotal)}
          </p>
          <p className="mt-1 text-xs font-bold text-stone-600">
            Based on inventory above the 60-day target for the selected category.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {inventoryCategoryFilters.map((filter) => {
            const isActive = categoryFilter === filter.id

            return (
              <button
                className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                  isActive
                    ? 'border-[#FC2C38] bg-red-50 text-[#FC2C38]'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-[#FC2C38] hover:text-[#FC2C38]'
                }`}
                key={filter.id}
                onClick={() => {
                  setCategoryFilter(filter.id)
                  setStatusFilter('All')
                }}
                type="button"
              >
                {filter.label}
              </button>
            )
          })}
        </div>

        {statusFilter !== 'All' ? (
          <button
            className="mt-4 text-sm font-black text-[#FC2C38] underline-offset-4 hover:underline"
            onClick={() => setStatusFilter('All')}
            type="button"
          >
            Showing {statusFilter.toLowerCase()} items. Clear filter.
          </button>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 bg-stone-50 px-4 py-3">
          <div className="grid gap-3 text-xs font-black uppercase tracking-wide text-stone-500 lg:grid-cols-[minmax(220px,1.7fr)_repeat(5,minmax(110px,1fr))_minmax(120px,.8fr)]">
            <span>SKU / Item</span>
            <span className="lg:text-right">On hand</span>
            <span className="lg:text-right">Avg/mo</span>
            <span className="lg:text-right">Coverage</span>
            <span className="lg:text-right">30 / 60 gap</span>
            <span className="lg:text-right">Buy units</span>
            <span className="lg:text-right">Status</span>
          </div>
        </div>

        <div className="divide-y divide-stone-100">
          {visibleRows.map((row) => (
            <button
              className="block w-full px-4 py-4 text-left transition hover:bg-stone-50"
              key={row.id}
              onClick={() => setSelectedSku(row.sku)}
              type="button"
            >
              <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.7fr)_repeat(5,minmax(110px,1fr))_minmax(120px,.8fr)] lg:items-center">
                <div>
                  <span className="flex flex-wrap items-center gap-2 font-black text-stone-900">
                    {row.sku}
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${getStatusStyles(row.status)}`}
                    >
                      {row.status}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm font-bold text-stone-700">
                    {row.name}
                  </span>
                  <span className="mt-1 block text-xs font-bold text-stone-500">
                    {row.category}
                  </span>
                </div>

                <OverviewMetric
                  label="On hand"
                  value={formatNumber(row.qtyOnHand)}
                  subValue={`${formatNumber(row.buyUnitSize)} pcs/unit`}
                />
                <OverviewMetric
                  label="Avg/mo"
                  value={formatDecimal(row.avgMonthlySales)}
                  subValue={`${formatDecimal(row.avgDailySales)} per day`}
                />
                <OverviewMetric
                  label="Coverage"
                  value={`${formatNumber(row.currentDaysCoverage)} days`}
                  subValue={`${formatNumber(row.need30)} / ${formatNumber(row.need60)} need`}
                />
                <OverviewMetric
                  emphasis={row.excess30 < 0 || row.excess60 < 0}
                  label="30 / 60 gap"
                  value={`${formatNumber(row.excess30)} / ${formatNumber(row.excess60)}`}
                  subValue="pcs vs target"
                />
                <OverviewMetric
                  label="Buy units"
                  value={
                    <BuyUnitSplit
                      isShortage={row.status === 'Low'}
                      buyUnits30={row.buyUnits30}
                      buyUnits60={row.buyUnits60}
                    />
                  }
                />

                <div className="flex items-center justify-between gap-3 lg:justify-end">
                  <span className="text-xs font-black uppercase tracking-wide text-stone-500 lg:hidden">
                    Status
                  </span>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${getStatusStyles(row.status)}`}
                  >
                    {row.status}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="border-t border-stone-100 bg-stone-50 px-4 py-3 text-sm font-bold text-stone-600">
          Showing {visibleRows.length} items. Click a SKU to edit on-hand quantity, buy-unit size, and monthly sales history.
        </div>
      </div>

      {selectedRow ? (
        <InventoryCoverageDetail
          coverageData={coverageBySku[selectedRow.sku] || {}}
          onClose={() => setSelectedSku(null)}
          onUpdateCoverage={updateCoverage}
          row={selectedRow}
        />
      ) : null}
    </div>
  )
}

function InventoryCoverageDetail({ coverageData, onClose, onUpdateCoverage, row }) {
  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center overflow-y-auto bg-stone-950/35 p-3 sm:items-center sm:p-4">
      <div className="flex max-h-[calc(100vh-24px)] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl sm:max-h-[calc(100vh-32px)]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-stone-100 bg-white p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-stone-500">
              {row.sku}
            </p>
            <h3 className="mt-1 text-2xl font-black text-stone-950">{row.name}</h3>
          </div>
          <button
            className="rounded-md border border-stone-200 px-3 py-2 text-sm font-black text-stone-700 transition hover:border-[#FC2C38] hover:text-[#FC2C38]"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="overflow-y-auto p-5">
        <div
          className={`rounded-lg p-4 ring-1 ${
            row.status === 'Low'
              ? 'bg-red-50 ring-red-100'
              : row.status === 'Overstocked'
                ? 'bg-amber-50 ring-amber-100'
                : 'bg-emerald-50 ring-emerald-100'
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-stone-600">
                Current move
              </p>
              <p className="mt-1 text-2xl font-black text-stone-950">
                {row.recommendation}
              </p>
            </div>
            <span
              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ring-1 ${getStatusStyles(row.status)}`}
            >
              {row.status}
            </span>
          </div>
          <p className="mt-3 text-sm font-bold text-stone-700">
            {row.status === 'Low'
              ? `Short ${formatNumber(Math.abs(row.excess30))} pcs for 30 days. Buy ${formatNumber(row.buyUnits30)} unit(s) to reach 30 days or ${formatNumber(row.buyUnits60)} unit(s) to reach 60 days.`
              : null}
            {row.status === 'Good'
              ? 'This SKU has enough inventory for 30 days and is within the 60-day target. Hold unless upcoming demand changes.'
              : null}
            {row.status === 'Overstocked'
              ? `Above the 60-day target by ${formatNumber(row.excessQtyOver60)} pcs. Reduce or stop buying for now.`
              : null}
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <DetailMetric label="Qty on hand" value={formatNumber(row.qtyOnHand)} />
          <DetailMetric label="Buy unit size" value={`${formatNumber(row.buyUnitSize)} pcs`} />
          <DetailMetric
            label="Avg monthly sales"
            value={formatDecimal(row.avgMonthlySales)}
          />
          <DetailMetric label="Avg daily sales" value={formatDecimal(row.avgDailySales)} />
          <DetailMetric label="30-day need" value={formatNumber(row.need30)} />
          <DetailMetric label="60-day need" value={formatNumber(row.need60)} />
          <DetailMetric
            label="Buy units needed"
            value={
              <BuyUnitSplit
                isShortage={row.status === 'Low'}
                buyUnits30={row.buyUnits30}
                buyUnits60={row.buyUnits60}
              />
            }
          />
          <DetailMetric
            label="Current coverage"
            value={`${formatNumber(row.currentDaysCoverage)} days`}
          />
        </div>

        <div className="mt-5 rounded-lg border border-stone-200 p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-stone-500">
              Coverage inputs
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-600">
              Update the current count and a fallback monthly average here.
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-black text-stone-700">
              Qty on hand
              <input
                className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-right font-bold outline-none focus:border-[#FC2C38] focus:ring-4 focus:ring-red-100"
                min="0"
                onChange={(event) =>
                  onUpdateCoverage(row.sku, 'qtyOnHand', event.target.value)
                }
                placeholder="0"
                type="number"
                value={coverageData.qtyOnHand ?? row.qtyOnHand}
              />
            </label>
            <label className="block text-sm font-black text-stone-700">
              Average monthly sales
              <input
                className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-right font-bold outline-none focus:border-[#FC2C38] focus:ring-4 focus:ring-red-100"
                min="0"
                onChange={(event) =>
                  onUpdateCoverage(row.sku, 'avgMonthlySales', event.target.value)
                }
                placeholder="0"
                type="number"
                value={coverageData.avgMonthlySales ?? row.avgMonthlySales}
              />
            </label>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-stone-200 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-stone-500">
                Purchasing unit
              </p>
              <p className="mt-1 text-sm font-semibold text-stone-600">
                Use this for bundles, boxes, shelf packs, or any quantity you buy as one unit.
              </p>
            </div>
            <label className="block text-sm font-black text-stone-700 sm:w-40">
              Pcs per unit
              <input
                className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-right font-bold outline-none focus:border-[#FC2C38] focus:ring-4 focus:ring-red-100"
                min="1"
                onChange={(event) =>
                  onUpdateCoverage(row.sku, 'buyUnitSize', event.target.value)
                }
                placeholder="1"
                type="number"
                value={coverageData.buyUnitSize ?? row.buyUnitSize}
              />
            </label>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-stone-200 p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-stone-500">
                Monthly sales history
              </p>
              <p className="mt-1 text-sm font-semibold text-stone-600">
                Enter true sales by month. The average uses months with sales entered.
              </p>
            </div>
            <p className="text-sm font-black text-stone-800">
              {row.monthsWithSales
                ? `${row.monthsWithSales} months counted`
                : 'Using overview average'}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {salesMonths.map((month) => (
              <label
                className="block text-xs font-black uppercase tracking-wide text-stone-500"
                key={month.key}
              >
                {month.label}
                <input
                  className="mt-1 w-full rounded-md border border-stone-300 px-2 py-2 text-right text-sm font-bold text-stone-900 outline-none focus:border-[#FC2C38] focus:ring-4 focus:ring-red-100"
                  min="0"
                  onChange={(event) =>
                    onUpdateCoverage(row.sku, month.key, event.target.value)
                  }
                  placeholder="0"
                  type="number"
                  value={coverageData[month.key] || ''}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-stone-200 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-stone-500">
            Excess over 60 days
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-lg font-black text-stone-950">
              {formatNumber(row.excessQtyOver60)} pcs
            </p>
            <p className="text-sm font-bold text-stone-600">
              {row.excessCashOver60 !== null
                ? `${formatMoney(row.excessCashOver60)} tied up`
                : 'Unit cost not available'}
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

function DetailMetric({ label, value }) {
  return (
    <div className="rounded-lg bg-stone-100 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-stone-500">
        {label}
      </p>
      <div className="mt-2 text-xl font-black text-stone-950">{value}</div>
    </div>
  )
}

function BuyUnitSplit({ buyUnits30, buyUnits60, isShortage = false }) {
  const numberClass = isShortage ? 'text-[#FC2C38]' : 'text-stone-900'

  return (
    <span className="inline-flex gap-3">
      <span className="text-center">
        <span className={`block text-sm font-black ${numberClass}`}>
          {formatNumber(buyUnits30)}
        </span>
        <span className="block text-[10px] font-black uppercase tracking-wide text-stone-500">
          30 days
        </span>
      </span>
      <span className="text-center">
        <span className={`block text-sm font-black ${numberClass}`}>
          {formatNumber(buyUnits60)}
        </span>
        <span className="block text-[10px] font-black uppercase tracking-wide text-stone-500">
          60 days
        </span>
      </span>
    </span>
  )
}

function OverviewMetric({ emphasis = false, label, subValue, value }) {
  return (
    <div className="flex items-center justify-between gap-3 lg:block lg:text-right">
      <span className="text-xs font-black uppercase tracking-wide text-stone-500 lg:hidden">
        {label}
      </span>
      <div>
        <div className={`text-sm font-black ${emphasis ? 'text-[#FC2C38]' : 'text-stone-900'}`}>
          {value}
        </div>
        {subValue ? (
          <p className="mt-0.5 text-xs font-bold text-stone-500">{subValue}</p>
        ) : null}
      </div>
    </div>
  )
}

export default AdminPage
