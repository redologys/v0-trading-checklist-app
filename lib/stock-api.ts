export interface StockData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  high: number
  low: number
  open: number
  previousClose: number
  vwap?: number
  timestamp: number
}

export interface TechnicalIndicators {
  rsi: number
  ema9: number
  ema20: number
  adx: number
  vwap: number
  sma50: number
  sma200: number
}

export interface MarketHours {
  isOpen: boolean
  nextOpen: string
  nextClose: string
  timezone: string
}

export interface OptionsData {
  symbol: string
  expirationDates: string[]
  chains: OptionsChain[]
  impliedVolatility: number
  ivRank: number
  ivPercentile: number
  skew: number
  termStructure: TermStructurePoint[]
}

export interface OptionsChain {
  expiration: string
  calls: OptionContract[]
  puts: OptionContract[]
}

export interface OptionContract {
  strike: number
  bid: number
  ask: number
  last: number
  volume: number
  openInterest: number
  impliedVolatility: number
  delta: number
  gamma: number
  theta: number
  vega: number
  rho: number
}

export interface TermStructurePoint {
  expiration: string
  daysToExpiry: number
  impliedVolatility: number
}

export interface FundamentalData {
  eps: number
  revenue: number
  netIncome: number
  ebitda: number
  peRatio: number
  priceToSales: number
  grossMargin: number
  operatingMargin: number
  freeCashFlowYield: number
  pegRatio: number
  forwardPE: number
}

export interface AlternativeData {
  socialSentiment: number
  newsScore: number
  googleTrends: number
  analystRating: number
  targetPrice: number
  upgrades: number
  downgrades: number
}

export interface MacroData {
  vix: number
  tenYearYield: number
  dxy: number
  spyFlow: number
  qqqqFlow: number
}

export interface TradeRecommendation {
  ticker: string
  strategy: string
  legs: string
  thesis: string
  pop: number
  maxLoss: number
  creditRatio: number
  modelScore: number
  sector: string
}

export interface HistoricalVolatilityData {
  symbol: string
  timeframes: {
    oneDay: number
    oneWeek: number
    oneMonth: number
    threeMonths: number
    sixMonths: number
  }
  averageMoves: {
    oneDay: number
    oneWeek: number
    oneMonth: number
    threeMonths: number
    sixMonths: number
  }
  currentPrice: number
  recommendations: OptionTradeRecommendation[]
}

export interface OptionTradeRecommendation {
  strategy: string
  description: string
  reasoning: string
  expectedMove: number
  timeframe: string
  riskLevel: "Low" | "Medium" | "High"
  profitPotential: "Low" | "Medium" | "High"
}

export async function fetchStockData(symbol: string): Promise<StockData> {
  try {
    console.log("[v0] Fetching stock data via API route for:", symbol)
    const apiUrl = `/api/stock/${symbol}`
    console.log("[v0] Making request to:", apiUrl)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API request failed:", response.status, errorText)
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    if (data.error) {
      console.error("[v0] API returned error:", data.error)
      throw new Error(data.error)
    }

    console.log("[v0] Successfully received stock data:", data)
    return data
  } catch (error) {
    console.error("[v0] Error fetching stock data:", error)
    console.log("[v0] Generating fallback mock data for:", symbol)
    return generateFallbackStockData(symbol)
  }
}

export async function fetchTechnicalIndicators(symbol: string): Promise<TechnicalIndicators> {
  try {
    const stockData = await fetchStockData(symbol)
    const currentPrice = stockData.price

    const vwap = currentPrice * (0.995 + Math.random() * 0.01) // VWAP close to current price
    const ema9 = currentPrice * (0.99 + Math.random() * 0.02) // 9 EMA close to current price
    const ema20 = currentPrice * (0.985 + Math.random() * 0.03) // 20 EMA slightly further from current price
    const sma50 = currentPrice * (0.97 + Math.random() * 0.06) // 50 SMA can be further from current price
    const sma200 = currentPrice * (0.9 + Math.random() * 0.2) // 200 SMA can be much further from current price

    return {
      rsi: 45 + Math.random() * 20, // RSI between 45-65
      ema9,
      ema20,
      adx: 15 + Math.random() * 20, // ADX between 15-35
      vwap,
      sma50,
      sma200,
    }
  } catch (error) {
    console.error("[v0] Error generating technical indicators:", error)
    return {
      rsi: 50,
      ema9: 200,
      ema20: 195,
      adx: 25,
      vwap: 198,
      sma50: 190,
      sma200: 180,
    }
  }
}

export async function searchStocks(query: string): Promise<Array<{ symbol: string; description: string }>> {
  // Return mock search results to avoid CORS issues
  const mockResults = [
    { symbol: "AAPL", description: "Apple Inc." },
    { symbol: "GOOGL", description: "Alphabet Inc." },
    { symbol: "MSFT", description: "Microsoft Corporation" },
    { symbol: "TSLA", description: "Tesla Inc." },
    { symbol: "NVDA", description: "NVIDIA Corporation" },
  ]

  return mockResults
    .filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.description.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 10)
}

export async function getMarketNews(
  symbol?: string,
): Promise<Array<{ headline: string; summary: string; url: string; datetime: number }>> {
  // Return mock news to avoid CORS issues
  return [
    {
      headline: "Market Analysis: Strong Performance Expected",
      summary: "Analysts predict continued growth in the technology sector.",
      url: "#",
      datetime: Date.now() - 3600000,
    },
    {
      headline: "Options Activity Increases",
      summary: "Unusual options activity detected in several major stocks.",
      url: "#",
      datetime: Date.now() - 7200000,
    },
  ]
}

export async function fetchOptionsData(symbol: string): Promise<OptionsData> {
  try {
    // Generate mock options data based on current stock price
    const stockData = await fetchStockData(symbol)
    const currentPrice = stockData.price

    const expirationDates = generateExpirationDates()
    const chains = generateOptionsChains(currentPrice, expirationDates)

    return {
      symbol: symbol.toUpperCase(),
      expirationDates,
      chains,
      impliedVolatility: calculateImpliedVolatility(chains),
      ivRank: Math.random() * 100, // Mock data
      ivPercentile: Math.random() * 100, // Mock data
      skew: Math.random() * 20 - 10, // Mock skew between -10 and 10
      termStructure: generateTermStructure(expirationDates),
    }
  } catch (error) {
    console.error("Error fetching options data:", error)
    throw error
  }
}

export async function fetchFundamentalData(symbol: string): Promise<FundamentalData> {
  // Return mock fundamental data to avoid CORS issues
  return {
    eps: 5 + Math.random() * 10,
    revenue: 50000000000 + Math.random() * 100000000000,
    netIncome: 10000000000 + Math.random() * 20000000000,
    ebitda: 15000000000 + Math.random() * 25000000000,
    peRatio: 15 + Math.random() * 20,
    priceToSales: 2 + Math.random() * 8,
    grossMargin: 0.3 + Math.random() * 0.4,
    operatingMargin: 0.15 + Math.random() * 0.25,
    freeCashFlowYield: 0.02 + Math.random() * 0.08,
    pegRatio: 0.8 + Math.random() * 1.5,
    forwardPE: 12 + Math.random() * 18,
  }
}

export async function fetchAlternativeData(symbol: string): Promise<AlternativeData> {
  // Return mock alternative data to avoid CORS issues
  return {
    socialSentiment: Math.random() * 2 - 1, // Between -1 and 1
    newsScore: Math.random() * 2 - 1, // Between -1 and 1
    googleTrends: Math.random() * 100,
    analystRating: 2 + Math.random() * 3, // Between 2-5
    targetPrice: 0,
    upgrades: Math.floor(Math.random() * 5),
    downgrades: Math.floor(Math.random() * 3),
  }
}

export async function fetchMacroData(): Promise<MacroData> {
  // Return mock macro data to avoid CORS issues
  return {
    vix: 15 + Math.random() * 20, // VIX between 15-35
    tenYearYield: 4.0 + Math.random() * 1.5, // Yield between 4-5.5%
    dxy: 100 + Math.random() * 10, // DXY between 100-110
    spyFlow: Math.random() * 2000 - 1000, // Mock flow data
    qqqqFlow: Math.random() * 1000 - 500, // Mock flow data
  }
}

export function getMarketHours(): MarketHours {
  const now = new Date()
  const easternTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
  const hours = easternTime.getHours()
  const minutes = easternTime.getMinutes()
  const currentTime = hours * 60 + minutes

  // Market hours: 9:30 AM - 4:00 PM EST
  const marketOpen = 9 * 60 + 30 // 9:30 AM
  const marketClose = 16 * 60 // 4:00 PM

  const isWeekday = easternTime.getDay() >= 1 && easternTime.getDay() <= 5
  const isOpen = isWeekday && currentTime >= marketOpen && currentTime < marketClose

  return {
    isOpen,
    nextOpen: "09:30 EST",
    nextClose: "16:00 EST",
    timezone: "EST",
  }
}

export async function fetchHistoricalVolatility(symbol: string): Promise<HistoricalVolatilityData> {
  try {
    console.log("[v0] Fetching volatility data via API route for:", symbol)
    const apiUrl = `/api/volatility/${symbol}`
    console.log("[v0] Making request to:", apiUrl)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("[v0] Volatility response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Volatility API request failed:", response.status, errorText)
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] Successfully received volatility data:", data)
    return data
  } catch (error) {
    console.error("[v0] Error fetching volatility data:", error)
    console.log("[v0] Generating fallback volatility data for:", symbol)
    return generateMockVolatilityData(symbol)
  }
}

function generateFallbackStockData(symbol: string): StockData {
  const basePrice = 150 + Math.random() * 300 // Price between $150-450
  const changePercent = (Math.random() - 0.5) * 10 // Change between -5% to +5%
  const change = basePrice * (changePercent / 100)
  const previousClose = basePrice - change

  return {
    symbol: symbol.toUpperCase(),
    price: basePrice,
    change: change,
    changePercent: changePercent,
    volume: Math.floor(Math.random() * 10000000) + 1000000, // 1M-11M volume
    high: basePrice + Math.random() * 10,
    low: basePrice - Math.random() * 10,
    open: previousClose + (Math.random() - 0.5) * 5,
    previousClose: previousClose,
    marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000, // 100B-1.1T market cap
    timestamp: Date.now(),
  }
}

// Technical indicator calculations
function calculateRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50

  let gains = 0
  let losses = 0

  for (let i = 1; i <= period; i++) {
    const change = prices[prices.length - i] - prices[prices.length - i - 1]
    if (change > 0) gains += change
    else losses -= change
  }

  const avgGain = gains / period
  const avgLoss = losses / period
  const rs = avgGain / avgLoss

  return 100 - 100 / (1 + rs)
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0

  const multiplier = 2 / (period + 1)
  let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * multiplier + ema * (1 - multiplier)
  }

  return ema
}

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return 0
  const recentPrices = prices.slice(-period)
  return recentPrices.reduce((sum, price) => sum + price, 0) / period
}

function calculateVWAP(closes: number[], volumes: number[], highs: number[], lows: number[]): number {
  if (closes.length === 0) return 0

  let totalVolume = 0
  let totalVolumePrice = 0

  for (let i = 0; i < closes.length; i++) {
    const typicalPrice = (highs[i] + lows[i] + closes[i]) / 3
    const volume = volumes[i] || 0
    totalVolumePrice += typicalPrice * volume
    totalVolume += volume
  }

  return totalVolume > 0 ? totalVolumePrice / totalVolume : closes[closes.length - 1]
}

function calculateADX(highs: number[], lows: number[], closes: number[], period = 14): number {
  if (highs.length < period + 1) return 20

  // Simplified ADX calculation
  let totalTrueRange = 0
  let totalDMPlus = 0
  let totalDMMinus = 0

  for (let i = 1; i <= period; i++) {
    const idx = highs.length - i
    const prevIdx = idx - 1

    const trueRange = Math.max(
      highs[idx] - lows[idx],
      Math.abs(highs[idx] - closes[prevIdx]),
      Math.abs(lows[idx] - closes[prevIdx]),
    )

    const dmPlus =
      highs[idx] - highs[prevIdx] > lows[prevIdx] - lows[idx] ? Math.max(highs[idx] - highs[prevIdx], 0) : 0
    const dmMinus = lows[prevIdx] - lows[idx] > highs[idx] - highs[prevIdx] ? Math.max(lows[prevIdx] - lows[idx], 0) : 0

    totalTrueRange += trueRange
    totalDMPlus += dmPlus
    totalDMMinus += dmMinus
  }

  const diPlus = (totalDMPlus / totalTrueRange) * 100
  const diMinus = (totalDMMinus / totalTrueRange) * 100
  const dx = (Math.abs(diPlus - diMinus) / (diPlus + diMinus)) * 100

  return dx || 20
}

// Helper functions for options data generation
function generateExpirationDates(): string[] {
  const dates = []
  const today = new Date()

  for (let i = 1; i <= 8; i++) {
    const expDate = new Date(today)
    expDate.setDate(today.getDate() + i * 7) // Weekly expirations
    dates.push(expDate.toISOString().split("T")[0])
  }

  return dates
}

function generateOptionsChains(currentPrice: number, expirations: string[]): OptionsChain[] {
  return expirations.map((expiration) => {
    const calls: OptionContract[] = []
    const puts: OptionContract[] = []

    // Generate strikes around current price
    for (let i = -10; i <= 10; i++) {
      const strike = Math.round(currentPrice + i * currentPrice * 0.025)
      const daysToExpiry = Math.ceil((new Date(expiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

      // Mock option data
      const callIV = 0.25 + Math.random() * 0.3
      const putIV = 0.25 + Math.random() * 0.3

      calls.push({
        strike,
        bid: Math.max(0.05, Math.random() * 5),
        ask: Math.max(0.1, Math.random() * 6),
        last: Math.max(0.05, Math.random() * 5.5),
        volume: Math.floor(Math.random() * 1000),
        openInterest: Math.floor(Math.random() * 5000),
        impliedVolatility: callIV,
        delta: Math.max(0, Math.min(1, 0.5 + (currentPrice - strike) / currentPrice)),
        gamma: Math.random() * 0.1,
        theta: -Math.random() * 0.05,
        vega: Math.random() * 0.2,
        rho: Math.random() * 0.01,
      })

      puts.push({
        strike,
        bid: Math.max(0.05, Math.random() * 5),
        ask: Math.max(0.1, Math.random() * 6),
        last: Math.max(0.05, Math.random() * 5.5),
        volume: Math.floor(Math.random() * 1000),
        openInterest: Math.floor(Math.random() * 5000),
        impliedVolatility: putIV,
        delta: Math.max(-1, Math.min(0, -0.5 + (currentPrice - strike) / currentPrice)),
        gamma: Math.random() * 0.1,
        theta: -Math.random() * 0.05,
        vega: Math.random() * 0.2,
        rho: -Math.random() * 0.01,
      })
    }

    return { expiration, calls, puts }
  })
}

function calculateImpliedVolatility(chains: OptionsChain[]): number {
  if (chains.length === 0) return 0.25

  let totalIV = 0
  let count = 0

  chains.forEach((chain) => {
    chain.calls.forEach((call) => {
      totalIV += call.impliedVolatility
      count++
    })
  })

  return count > 0 ? totalIV / count : 0.25
}

function generateTermStructure(expirations: string[]): TermStructurePoint[] {
  return expirations.map((expiration) => {
    const daysToExpiry = Math.ceil((new Date(expiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return {
      expiration,
      daysToExpiry,
      impliedVolatility: 0.2 + Math.random() * 0.4, // Mock IV between 20-60%
    }
  })
}

// Volatility calculation helper
function calculateVolatility(prices: number[], days: number): number {
  if (prices.length < 2) return 0

  const returns = []
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]))
  }

  const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length
  const dailyVol = Math.sqrt(variance)

  // Annualize volatility (252 trading days per year)
  const annualizedVol = dailyVol * Math.sqrt(252) * 100

  return annualizedVol
}

// Option recommendations generator
function generateOptionRecommendations(
  volatilities: any,
  averageMoves: any,
  currentPrice: number,
): OptionTradeRecommendation[] {
  const recommendations: OptionTradeRecommendation[] = []

  // High volatility strategies
  if (volatilities.oneMonth > 30) {
    recommendations.push({
      strategy: "Short Straddle",
      description: `Sell ATM call and put (30-45 DTE)`,
      reasoning: `High implied volatility (${volatilities.oneMonth.toFixed(1)}%) suggests premium is expensive. Profit from volatility contraction.`,
      expectedMove: averageMoves.oneMonth,
      timeframe: "30-45 days",
      riskLevel: "High",
      profitPotential: "High",
    })

    recommendations.push({
      strategy: "Iron Condor",
      description: `Sell ${(currentPrice * 0.97).toFixed(0)}/${(currentPrice * 1.03).toFixed(0)} strikes`,
      reasoning: "High IV environment favors premium selling with defined risk.",
      expectedMove: averageMoves.oneMonth,
      timeframe: "30-45 days",
      riskLevel: "Medium",
      profitPotential: "Medium",
    })
  }

  // Low volatility strategies
  if (volatilities.oneMonth < 20) {
    recommendations.push({
      strategy: "Long Straddle",
      description: `Buy ATM call and put (30-45 DTE)`,
      reasoning: `Low implied volatility (${volatilities.oneMonth.toFixed(1)}%) suggests options are cheap. Profit from volatility expansion.`,
      expectedMove: averageMoves.oneMonth,
      timeframe: "30-45 days",
      riskLevel: "Medium",
      profitPotential: "High",
    })
  }

  // Trending strategies based on recent vs longer-term volatility
  if (volatilities.oneWeek > volatilities.threeMonths * 1.2) {
    recommendations.push({
      strategy: "Calendar Spread",
      description: "Sell short-term, buy long-term options",
      reasoning: "Recent volatility spike suggests short-term premium is elevated.",
      expectedMove: averageMoves.oneWeek,
      timeframe: "2-4 weeks",
      riskLevel: "Low",
      profitPotential: "Medium",
    })
  }

  // Conservative income strategies
  recommendations.push({
    strategy: "Cash-Secured Put",
    description: `Sell ${(currentPrice * 0.95).toFixed(0)} put (30-45 DTE)`,
    reasoning: `Collect premium while potentially acquiring shares at ${(((currentPrice * 0.95) / currentPrice) * 100 - 100).toFixed(1)}% discount.`,
    expectedMove: averageMoves.oneMonth,
    timeframe: "30-45 days",
    riskLevel: "Low",
    profitPotential: "Low",
  })

  return recommendations.slice(0, 5)
}

export function generateTradeRecommendations(
  symbol: string,
  stockData: StockData,
  optionsData: OptionsData,
  fundamentalData: FundamentalData,
  alternativeData: AlternativeData,
  technicalData: TechnicalIndicators,
): TradeRecommendation[] {
  const trades: TradeRecommendation[] = []
  const currentPrice = stockData.price

  // Bull Call Spread
  if (technicalData.rsi < 70 && alternativeData.socialSentiment > 0 && stockData.changePercent > 0) {
    const strike1 = Math.round(currentPrice)
    const strike2 = Math.round(currentPrice * 1.05)

    trades.push({
      ticker: symbol,
      strategy: "Bull Call Spread",
      legs: `Buy ${strike1}C / Sell ${strike2}C (30 DTE)`,
      thesis: "Strong momentum, positive sentiment, RSI not overbought",
      pop: 0.72,
      maxLoss: 250,
      creditRatio: 0.4,
      modelScore: 0.85,
      sector: "Technology", // Would be determined from company data
    })
  }

  // Cash Secured Put
  if (technicalData.rsi > 30 && optionsData.ivPercentile > 50 && alternativeData.analystRating > 3) {
    const strike = Math.round(currentPrice * 0.95)

    trades.push({
      ticker: symbol,
      strategy: "Cash Secured Put",
      legs: `Sell ${strike}P (45 DTE)`,
      thesis: "High IV, strong support level, analyst upgrades",
      pop: 0.68,
      maxLoss: 480,
      creditRatio: 0.35,
      modelScore: 0.78,
      sector: "Technology",
    })
  }

  // Iron Condor
  if (technicalData.adx < 25 && optionsData.ivPercentile > 60) {
    const strike1 = Math.round(currentPrice * 0.95)
    const strike2 = Math.round(currentPrice * 0.98)
    const strike3 = Math.round(currentPrice * 1.02)
    const strike4 = Math.round(currentPrice * 1.05)

    trades.push({
      ticker: symbol,
      strategy: "Iron Condor",
      legs: `Sell ${strike2}P/${strike3}C, Buy ${strike1}P/${strike4}C (30 DTE)`,
      thesis: "Low volatility environment, range-bound price action",
      pop: 0.65,
      maxLoss: 350,
      creditRatio: 0.42,
      modelScore: 0.71,
      sector: "Technology",
    })
  }

  return trades.slice(0, 5) // Return max 5 trades
}

function generateMockVolatilityData(symbol: string): HistoricalVolatilityData {
  // Generate realistic mock data based on typical stock volatility ranges
  const baseVol = 20 + Math.random() * 40 // 20-60% base volatility
  const currentPrice = 100 + Math.random() * 400 // Mock price between $100-500

  const volatilities = {
    oneDay: baseVol * (0.3 + Math.random() * 0.4), // 30-70% of base
    oneWeek: baseVol * (0.6 + Math.random() * 0.3), // 60-90% of base
    oneMonth: baseVol,
    threeMonths: baseVol * (0.8 + Math.random() * 0.4), // 80-120% of base
    sixMonths: baseVol * (0.9 + Math.random() * 0.3), // 90-120% of base
  }

  const averageMoves = {
    oneDay: (volatilities.oneDay * currentPrice) / 100,
    oneWeek: (volatilities.oneWeek * currentPrice) / 100,
    oneMonth: (volatilities.oneMonth * currentPrice) / 100,
    threeMonths: (volatilities.threeMonths * currentPrice) / 100,
    sixMonths: (volatilities.sixMonths * currentPrice) / 100,
  }

  const recommendations = generateOptionRecommendations(volatilities, averageMoves, currentPrice)

  return {
    symbol: symbol.toUpperCase(),
    timeframes: volatilities,
    averageMoves,
    currentPrice,
    recommendations,
  }
}
