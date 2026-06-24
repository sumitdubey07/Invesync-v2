import { useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'

export default function StockChart({ data, type = 'line', prediction = null }) {
  const chartRef = useRef(null)

  useEffect(() => {
    if (!chartRef.current || !data?.length) return

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 340,
      layout: {
        background: { color: '#1a1a1a' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#2a2a2a' },
        horzLines: { color: '#2a2a2a' },
      },
      rightPriceScale: { borderColor: '#2a2a2a' },
      timeScale: {
        borderColor: '#2a2a2a',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    try {
      if (type === 'candlestick') {
        const series = chart.addCandlestickSeries({
          upColor: '#22c55e',
          downColor: '#ef4444',
          borderUpColor: '#22c55e',
          borderDownColor: '#ef4444',
          wickUpColor: '#22c55e',
          wickDownColor: '#ef4444',
        })
        series.setData(data)
      } else {
        const isUp = data[data.length - 1]?.close >= data[0]?.close
        const series = chart.addAreaSeries({
          lineColor: isUp ? '#22c55e' : '#ef4444',
          topColor: isUp ? '#22c55e22' : '#ef444422',
          bottomColor: 'transparent',
          lineWidth: 2,
        })
        series.setData(data.map((d) => ({ time: d.time, value: d.close })))
      }

      // Add prediction dotted line
      if (prediction?.length) {
        const predSeries = chart.addLineSeries({
          color: '#f59e0b',
          lineWidth: 2,
          lineStyle: 2, // dotted
          lastValueVisible: true,
          priceLineVisible: false,
          title: 'AI Forecast',
        })
        predSeries.setData(prediction)
      }

      chart.timeScale().fitContent()
    } catch (err) {
      console.error('Chart error:', err)
    }

    const observer = new ResizeObserver(() => {
      if (chartRef.current) {
        chart.applyOptions({ width: chartRef.current.clientWidth })
      }
    })
    observer.observe(chartRef.current)

    return () => {
      observer.disconnect()
      try { chart.remove() } catch (e) {}
    }
  }, [data, type, prediction])

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[340px] flex items-center justify-center">
        <p className="text-gray-500 text-sm">No chart data available</p>
      </div>
    )
  }

  return <div ref={chartRef} className="w-full" />
}