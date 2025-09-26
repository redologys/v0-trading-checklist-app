"use client"

import { BarChart3, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import type { StockData, TechnicalIndicators } from "@/lib/stock-api"

interface TrendAnalysisProps {
  stockData: StockData
  technicalData: TechnicalIndicators
}

interface TrendSignal {
  name: string
  value: string
  signal: "bullish" | "bearish" | "neutral"
  strength: number // 0-100
  description: string
}

export function TrendAnalysis({ stockData, technicalData }: TrendAnalysisProps) {
  // Calculate trend signals
  const signals: TrendSignal[] = [
    {
      name: "Price vs VWAP",
      value: stockData.price > technicalData.vwap ? "Above" : "Below",
      signal: stockData.price > technicalData.vwap ? "bullish" : "bearish",
      strength: Math.abs(((stockData.price - technicalData.vwap) / technicalData.vwap) * 100) * 10,
      description:
        stockData.price > technicalData.vwap
          ? "Price trading above VWAP indicates bullish sentiment"
          : "Price trading below VWAP indicates bearish sentiment",
    },
    {
      name: "EMA Crossover",
      value: technicalData.ema9 > technicalData.ema20 ? "Bullish" : "Bearish",
      signal: technicalData.ema9 > technicalData.ema20 ? "bullish" : "bearish",
      strength: Math.abs(((technicalData.ema9 - technicalData.ema20) / technicalData.ema20) * 100) * 20,
      description:
        technicalData.ema9 > technicalData.ema20
          ? "9 EMA above 20 EMA suggests upward momentum"
          : "9 EMA below 20 EMA suggests downward momentum",
    },
    {
      name: "ADX Trend Strength",
      value: technicalData.adx.toFixed(1),
      signal: technicalData.adx > 25 ? "bullish" : technicalData.adx < 20 ? "bearish" : "neutral",
      strength: Math.min(technicalData.adx * 2, 100),
      description:
        technicalData.adx > 25
          ? "Strong trending market"
          : technicalData.adx < 20
            ? "Weak trend, choppy market"
            : "Moderate trend strength",
    },
    {
      name: "Price vs 50 SMA",
      value: stockData.price > technicalData.sma50 ? "Above" : "Below",
      signal: stockData.price > technicalData.sma50 ? "bullish" : "bearish",
      strength: Math.abs(((stockData.price - technicalData.sma50) / technicalData.sma50) * 100) * 15,
      description:
        stockData.price > technicalData.sma50
          ? "Price above 50 SMA indicates medium-term uptrend"
          : "Price below 50 SMA indicates medium-term downtrend",
    },
    {
      name: "Price vs 200 SMA",
      value: stockData.price > technicalData.sma200 ? "Above" : "Below",
      signal: stockData.price > technicalData.sma200 ? "bullish" : "bearish",
      strength: Math.abs(((stockData.price - technicalData.sma200) / technicalData.sma200) * 100) * 10,
      description:
        stockData.price > technicalData.sma200
          ? "Price above 200 SMA indicates long-term uptrend"
          : "Price below 200 SMA indicates long-term downtrend",
    },
  ]

  // Calculate overall trend bias
  const bullishSignals = signals.filter((s) => s.signal === "bullish").length
  const bearishSignals = signals.filter((s) => s.signal === "bearish").length
  const neutralSignals = signals.filter((s) => s.signal === "neutral").length

  const overallBias =
    bullishSignals > bearishSignals ? "bullish" : bearishSignals > bullishSignals ? "bearish" : "neutral"
  const biasStrength = (Math.abs(bullishSignals - bearishSignals) / signals.length) * 100

  const getSignalIcon = (signal: "bullish" | "bearish" | "neutral") => {
    switch (signal) {
      case "bullish":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "bearish":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-yellow-600" />
    }
  }

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Trend & Bias Analysis
          </div>
          <Badge
            variant={overallBias === "bullish" ? "default" : overallBias === "bearish" ? "destructive" : "secondary"}
            className="flex items-center gap-1"
          >
            {getSignalIcon(overallBias)}
            {overallBias.charAt(0).toUpperCase() + overallBias.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Bias Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Overall Market Bias</h4>
            <Badge variant="outline">{biasStrength.toFixed(0)}% Confidence</Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">{bullishSignals}</div>
              <div className="text-xs text-muted-foreground">Bullish Signals</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-yellow-600">{neutralSignals}</div>
              <div className="text-xs text-muted-foreground">Neutral Signals</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-red-600">{bearishSignals}</div>
              <div className="text-xs text-muted-foreground">Bearish Signals</div>
            </div>
          </div>

          <Progress value={biasStrength} className="h-2" />
        </div>

        <Separator />

        {/* Individual Trend Signals */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Individual Trend Signals</h4>

          {signals.map((signal, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getSignalIcon(signal.signal)}
                  <span className="text-sm font-medium">{signal.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getSignalColor(signal.signal)}`}>{signal.value}</span>
                  <Badge variant="outline" className="text-xs">
                    {Math.min(signal.strength, 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Progress value={Math.min(signal.strength, 100)} className="flex-1 h-1" />
              </div>

              <p className="text-xs text-muted-foreground pl-6">{signal.description}</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Key Levels */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Key Technical Levels</h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">VWAP</span>
                <span className="font-mono text-sm">${technicalData.vwap.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">9 EMA</span>
                <span className="font-mono text-sm">${technicalData.ema9.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">20 EMA</span>
                <span className="font-mono text-sm">${technicalData.ema20.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">50 SMA</span>
                <span className="font-mono text-sm">${technicalData.sma50.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">200 SMA</span>
                <span className="font-mono text-sm">${technicalData.sma200.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ADX</span>
                <span className="font-mono text-sm">{technicalData.adx.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Recommendations */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Trading Recommendations
          </h4>

          <div className="text-sm space-y-1">
            {overallBias === "bullish" && (
              <>
                <div className="text-green-600 dark:text-green-400">• Look for long opportunities on pullbacks</div>
                <div className="text-green-600 dark:text-green-400">• Use VWAP and EMAs as dynamic support</div>
                <div className="text-green-600 dark:text-green-400">• Consider breakout trades above resistance</div>
              </>
            )}

            {overallBias === "bearish" && (
              <>
                <div className="text-red-600 dark:text-red-400">• Look for short opportunities on bounces</div>
                <div className="text-red-600 dark:text-red-400">• Use VWAP and EMAs as dynamic resistance</div>
                <div className="text-red-600 dark:text-red-400">• Consider breakdown trades below support</div>
              </>
            )}

            {overallBias === "neutral" && (
              <>
                <div className="text-yellow-600 dark:text-yellow-400">• Range-bound market - trade the range</div>
                <div className="text-yellow-600 dark:text-yellow-400">• Wait for clear directional breakout</div>
                <div className="text-yellow-600 dark:text-yellow-400">• Use smaller position sizes</div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
