export default function StockCard({ stock, onClick }) {
  const isUp = stock.changePercent >= 0

  return (
    <div
      onClick={() => onClick && onClick(stock)}
      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 cursor-pointer hover:border-[#3a3a3a] transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-medium text-sm">
            {stock.symbol.replace('.NS', '')}
          </p>
          <p className="text-gray-500 text-xs mt-0.5 truncate max-w-[140px]">
            {stock.name}
          </p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            isUp
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {isUp ? '+' : ''}{stock.changePercent}%
        </span>
      </div>
      <p className="text-white text-lg font-bold">
        ₹{stock.price?.toLocaleString('en-IN')}
      </p>
      <p className={`text-xs mt-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
        {isUp ? '▲' : '▼'} ₹{Math.abs(stock.change)}
      </p>
    </div>
  )
}