import api from './axios'

export const getHoldings = () => api.get('/trades/holdings')
export const getTrades = () => api.get('/trades')
export const getMarket = () => api.get('/stocks/market')
export const getQuote = (symbol) => api.get(`/stocks/quote/${symbol}`)
export const searchStocks = (q) => api.get(`/stocks/search?q=${q}`)
export const getPrediction = (symbol) => api.get(`/predict/${symbol}`)
export const getHistory = (symbol, range = '1mo') =>
  api.get(`/stocks/history/${symbol}?range=${range}`)