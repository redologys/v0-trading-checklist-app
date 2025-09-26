"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { StockData, TechnicalIndicators } from "@/lib/stock-api"

interface MarketSentimentProps {
  stockData?: StockData | null
  technicalData?: TechnicalIndicators | null
}

export function MarketSentiment({ stockData, technicalData }: MarketSentimentProps) {
  // Calculate overall sentiment based on multiple factors
  const calculateSentiment = () => {
    if (!stockData || !technicalData) {
      return { sentiment: "neutral", score: 50, label: "Neutral" }
    }

    let bullishSignals = 0
    let totalSignals = 0

    // Price momentum
    if (stockData.change > 0) bullishSignals++
    totalSignals++

    // Technical indicators
    if (technicalData.rsi < 70 && technicalData.rsi > 30) {
      if (technicalData.rsi > 50) bullishSignals++
      totalSignals++
    }

    // Moving averages
    if (stockData.price > technicalData.sma20) bullishSignals++
    totalSignals++

    if (stockData.price > technicalData.ema12) bullishSignals++
    totalSignals++

    // MACD
    if (technicalData.macd > technicalData.macdSignal) bullishSignals++
    totalSignals++

    const score = totalSignals > 0 ? Math.round((bullishSignals / totalSignals) * 100) : 50

    if (score >= 65) return { sentiment: "bullish", score, label: "Bullish" }
    if (score <= 35) return { sentiment: "bearish", score, label: "Bearish" }
    return { sentiment: "neutral", score, label: "Neutral" }
  }

  const { sentiment, score, label } = calculateSentiment()

  const getSentimentIcon = () => {
    switch (sentiment) {
      case "bullish":
        return <TrendingUp className="h-4 w-4" />
      case "bearish":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Minus className="h-4 w-4" />
    }
  }

  const getSentimentColor = () => {
    switch (sentiment) {
      case "bullish":
        return "default"
      case "bearish":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <Card className="bg-gradient-to-r from-background to-muted/20">
      <CardContent className="py-3">
        <div className="flex items-center justify-center gap-3">
          <div className="text-sm text-muted-foreground">Overall Stock Sentiment:</div>
          <Badge variant={getSentimentColor()} className="flex items-center gap-1 px-3 py-1">
            {getSentimentIcon()}
            <span className="font-semibold">{label}</span>
            <span className="text-xs opacity-75">({score}%)</span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
