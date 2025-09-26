"use client"

import { useState, useEffect, useCallback } from "react"
import { StockSearch } from "@/components/stock-search"
import { MarketStatus } from "@/components/market-status"
import { MarketPrep } from "@/components/market-prep"
import { TrendAnalysis } from "@/components/trend-analysis"
import { EntryTriggers } from "@/components/entry-triggers"
import { TechnicalIndicatorsDashboard } from "@/components/technical-indicators"
import { RealTimeStatus } from "@/components/real-time-status"
import { Notifications } from "@/components/notifications"
import { MarketSentiment } from "@/components/market-sentiment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import {
  fetchStockData,
  fetchTechnicalIndicators,
  getMarketHours,
  type StockData,
  type TechnicalIndicators,
} from "@/lib/stock-api"

export default function TradingChecklist() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("")
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [technicalData, setTechnicalData] = useState<TechnicalIndicators | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [isConnected, setIsConnected] = useState(true)

  const handleSymbolSelect = useCallback(async (symbol: string) => {
    setSelectedSymbol(symbol)
    setLoading(true)
    setError(null)

    try {
      const [stock, technical] = await Promise.all([fetchStockData(symbol), fetchTechnicalIndicators(symbol)])

      setStockData(stock)
      setTechnicalData(technical)
      setLastUpdate(new Date())
      setIsConnected(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stock data")
      setStockData(null)
      setTechnicalData(null)
      setIsConnected(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleManualRefresh = useCallback(async () => {
    if (selectedSymbol) {
      await handleSymbolSelect(selectedSymbol)
    }
  }, [selectedSymbol, handleSymbolSelect])

  // Auto-refresh logic with dynamic intervals
  useEffect(() => {
    if (!selectedSymbol || !autoRefresh) return

    const marketHours = getMarketHours()
    const interval = marketHours.isOpen ? 15000 : 60000 // 15s during market hours, 60s after hours

    const timer = setInterval(() => {
      handleSymbolSelect(selectedSymbol)
    }, interval)

    return () => clearInterval(timer)
  }, [selectedSymbol, autoRefresh, handleSymbolSelect])

  // Connection status monitoring
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(navigator.onLine)
    }

    window.addEventListener("online", checkConnection)
    window.addEventListener("offline", checkConnection)

    return () => {
      window.removeEventListener("online", checkConnection)
      window.removeEventListener("offline", checkConnection)
    }
  }, [])

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("[v0] Unhandled promise rejection:", event.reason)
      event.preventDefault() // Prevent the error from being logged to console

      // Set a generic error message if it's related to our app
      if (event.reason && typeof event.reason === "string" && event.reason.includes("Failed to connect")) {
        setError("Connection error - using fallback data")
        setIsConnected(false)
      }
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-balance">Trading Checklist</h1>
          <p className="text-muted-foreground text-pretty">
            Professional stock analysis with live market data and technical indicators
          </p>
        </div>

        {/* Market Sentiment Indicator */}
        <MarketSentiment stockData={stockData} technicalData={technicalData} />

        {/* Stock Search */}
        <Card>
          <CardHeader>
            <CardTitle>Select Stock Symbol</CardTitle>
          </CardHeader>
          <CardContent>
            <StockSearch onSymbolSelect={handleSymbolSelect} currentSymbol={selectedSymbol} />
          </CardContent>
        </Card>

        {/* Notifications */}
        <Notifications stockData={stockData} technicalData={technicalData} enabled={notifications} />

        {loading && (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading market data...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                <p className="font-medium">Error loading data</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {stockData && technicalData && !loading && (
          <>
            {/* Stock Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{stockData.symbol}</span>
                  <Badge
                    variant={stockData.change >= 0 ? "default" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    {stockData.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stockData.changePercent.toFixed(2)}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Current Price</div>
                    <div className="text-2xl font-bold">${stockData.price.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Change</div>
                    <div
                      className={`text-lg font-semibold ${stockData.change >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {stockData.change >= 0 ? "+" : ""}${stockData.change.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Volume</div>
                    <div className="text-lg font-semibold">{stockData.volume.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Day Range</div>
                    <div className="text-sm">
                      ${stockData.low.toFixed(2)} - ${stockData.high.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trading Checklist Sections */}
            <div className="grid gap-6">
              <MarketPrep stockData={stockData} />
              <TrendAnalysis stockData={stockData} technicalData={technicalData} />
              <EntryTriggers stockData={stockData} technicalData={technicalData} />
              <TechnicalIndicatorsDashboard stockData={stockData} technicalData={technicalData} />
            </div>
          </>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <MarketStatus />
          <RealTimeStatus
            isConnected={isConnected}
            lastUpdate={lastUpdate}
            autoRefresh={autoRefresh}
            onToggleAutoRefresh={setAutoRefresh}
            onManualRefresh={handleManualRefresh}
            notifications={notifications}
            onToggleNotifications={setNotifications}
          />
        </div>
      </div>
    </div>
  )
}
