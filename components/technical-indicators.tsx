"use client"

import { Activity, BarChart3, TrendingUp, TrendingDown, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import type { StockData, TechnicalIndicators } from "@/lib/stock-api"

interface TechnicalIndicatorsProps {
  stockData: StockData
  technicalData: TechnicalIndicators
}

interface IndicatorReading {
  name: string
  value: number
  signal: "bullish" | "bearish" | "neutral"
  strength: "strong" | "moderate" | "weak"
  description: string
  range: { min: number; max: number; optimal?: { min: number; max: number } }
}

export function TechnicalIndicatorsDashboard({ stockData, technicalData }: TechnicalIndicatorsProps) {
  // Generate sample price data for mini charts (in real app, this would come from API)
  const generatePriceData = () => {
    const data = []
    const basePrice = stockData.price
    for (let i = 0; i < 20; i++) {
      data.push({
        time: i,
        price: basePrice + (Math.random() - 0.5) * basePrice * 0.02,
        vwap: technicalData.vwap + (Math.random() - 0.5) * technicalData.vwap * 0.01,
        ema9: technicalData.ema9 + (Math.random() - 0.5) * technicalData.ema9 * 0.01,
        ema20: technicalData.ema20 + (Math.random() - 0.5) * technicalData.ema20 * 0.01,
      })
    }
    return data
  }

  const priceData = generatePriceData()

  // Calculate indicator readings
  const indicators: IndicatorReading[] = [
    {
      name: "RSI (14)",
      value: technicalData.rsi,
      signal: technicalData.rsi > 70 ? "bearish" : technicalData.rsi < 30 ? "bullish" : "neutral",
      strength:
        Math.abs(technicalData.rsi - 50) > 20 ? "strong" : Math.abs(technicalData.rsi - 50) > 10 ? "moderate" : "weak",
      description:
        technicalData.rsi > 70
          ? "Overbought - potential reversal"
          : technicalData.rsi < 30
            ? "Oversold - potential bounce"
            : "Neutral momentum",
      range: { min: 0, max: 100, optimal: { min: 30, max: 70 } },
    },
    {
      name: "ADX (14)",
      value: technicalData.adx,
      signal: technicalData.adx > 25 ? "bullish" : technicalData.adx < 20 ? "bearish" : "neutral",
      strength: technicalData.adx > 40 ? "strong" : technicalData.adx > 25 ? "moderate" : "weak",
      description: technicalData.adx > 25 ? "Strong trending market" : "Weak trend, choppy conditions",
      range: { min: 0, max: 100, optimal: { min: 25, max: 100 } },
    },
    {
      name: "VWAP Distance",
      value: ((stockData.price - technicalData.vwap) / technicalData.vwap) * 100,
      signal: stockData.price > technicalData.vwap ? "bullish" : "bearish",
      strength:
        Math.abs(((stockData.price - technicalData.vwap) / technicalData.vwap) * 100) > 2
          ? "strong"
          : Math.abs(((stockData.price - technicalData.vwap) / technicalData.vwap) * 100) > 1
            ? "moderate"
            : "weak",
      description: stockData.price > technicalData.vwap ? "Price above VWAP - bullish" : "Price below VWAP - bearish",
      range: { min: -5, max: 5 },
    },
    {
      name: "EMA Spread",
      value: ((technicalData.ema9 - technicalData.ema20) / technicalData.ema20) * 100,
      signal: technicalData.ema9 > technicalData.ema20 ? "bullish" : "bearish",
      strength:
        Math.abs(((technicalData.ema9 - technicalData.ema20) / technicalData.ema20) * 100) > 1
          ? "strong"
          : Math.abs(((technicalData.ema9 - technicalData.ema20) / technicalData.ema20) * 100) > 0.5
            ? "moderate"
            : "weak",
      description:
        technicalData.ema9 > technicalData.ema20 ? "9 EMA above 20 EMA - uptrend" : "9 EMA below 20 EMA - downtrend",
      range: { min: -3, max: 3 },
    },
  ]

  const getSignalColor = (signal: "bullish" | "bearish" | "neutral") => {
    switch (signal) {
      case "bullish":
        return "text-green-600 dark:text-green-400"
      case "bearish":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-yellow-600 dark:text-yellow-400"
    }
  }

  const getSignalIcon = (signal: "bullish" | "bearish" | "neutral") => {
    switch (signal) {
      case "bullish":
        return <TrendingUp className="h-4 w-4" />
      case "bearish":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStrengthColor = (strength: "strong" | "moderate" | "weak") => {
    switch (strength) {
      case "strong":
        return "bg-primary"
      case "moderate":
        return "bg-yellow-500"
      default:
        return "bg-muted"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Technical Indicators Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Indicator Readings */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Indicator Readings</h4>

          {indicators.map((indicator, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getSignalIcon(indicator.signal)}
                  <span className="text-sm font-medium">{indicator.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{indicator.value.toFixed(2)}</span>
                  <Badge
                    variant={indicator.signal === "neutral" ? "outline" : "default"}
                    className={getSignalColor(indicator.signal)}
                  >
                    {indicator.signal}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {indicator.strength}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{indicator.range.min}</span>
                  <span>{indicator.description}</span>
                  <span>{indicator.range.max}</span>
                </div>

                <div className="relative">
                  <Progress
                    value={
                      ((indicator.value - indicator.range.min) / (indicator.range.max - indicator.range.min)) * 100
                    }
                    className="h-2"
                  />
                  {indicator.range.optimal && (
                    <div
                      className="absolute top-0 h-2 bg-green-500/20 rounded"
                      style={{
                        left: `${((indicator.range.optimal.min - indicator.range.min) / (indicator.range.max - indicator.range.min)) * 100}%`,
                        width: `${((indicator.range.optimal.max - indicator.range.optimal.min) / (indicator.range.max - indicator.range.min)) * 100}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Key Levels Summary */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Key Technical Levels</h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-green-600">Support Levels</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">VWAP</span>
                  <span className="font-mono text-sm">${technicalData.vwap.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">20 EMA</span>
                  <span className="font-mono text-sm">${technicalData.ema20.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">50 SMA</span>
                  <span className="font-mono text-sm">${technicalData.sma50.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Day Low</span>
                  <span className="font-mono text-sm">${stockData.low.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-sm font-medium text-red-600">Resistance Levels</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Day High</span>
                  <span className="font-mono text-sm">${stockData.high.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">9 EMA</span>
                  <span className="font-mono text-sm">${technicalData.ema9.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">200 SMA</span>
                  <span className="font-mono text-sm">${technicalData.sma200.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Prev Close</span>
                  <span className="font-mono text-sm">${stockData.previousClose.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Volume Analysis */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Volume Analysis
          </h4>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-lg font-bold">{stockData.volume.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Current Volume</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold">
                {stockData.volume > 1000000 ? (
                  <span className="text-green-600">High</span>
                ) : stockData.volume > 500000 ? (
                  <span className="text-yellow-600">Medium</span>
                ) : (
                  <span className="text-red-600">Low</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">Volume Level</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold">{stockData.volume > 1000000 ? "✓" : "⚠"}</div>
              <div className="text-xs text-muted-foreground">Breakout Ready</div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            {stockData.volume > 1000000
              ? "High volume supports breakout moves"
              : "Low volume - wait for volume confirmation"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
