"use client"

import { useState } from "react"
import { Activity, BarChart3, TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import type { StockData, TechnicalIndicators } from "@/lib/stock-api"

interface EnhancedTechnicalAnalysisProps {
  stockData: StockData
  technicalData: TechnicalIndicators
}

interface TechnicalSignal {
  indicator: string
  signal: "BUY" | "SELL" | "HOLD"
  strength: "STRONG" | "MODERATE" | "WEAK"
  description: string
  confidence: number
}

interface MovingAverage {
  period: number
  value: number
  signal: "bullish" | "bearish" | "neutral"
}

export function EnhancedTechnicalAnalysis({ stockData, technicalData }: EnhancedTechnicalAnalysisProps) {
  const [activeTab, setActiveTab] = useState("indicators")

  const generateEnhancedPriceData = () => {
    const data = []
    const basePrice = stockData.price
    const currentPrice = basePrice

    for (let i = 0; i < 50; i++) {
      const time = i
      const price = basePrice + Math.sin(i * 0.2) * basePrice * 0.05 + (Math.random() - 0.5) * basePrice * 0.02

      const sma20 = technicalData.ema20
      const upperBand = sma20 * 1.02
      const lowerBand = sma20 * 0.98

      // MACD calculation (simplified)
      const macd = ((technicalData.ema9 - technicalData.ema20) / technicalData.ema20) * 100
      const signal = macd * 0.8
      const histogram = macd - signal

      data.push({
        time,
        price,
        sma20: technicalData.ema20,
        sma50: technicalData.sma50,
        sma200: technicalData.sma200,
        ema9: technicalData.ema9,
        ema20: technicalData.ema20,
        vwap: technicalData.vwap,
        upperBand,
        lowerBand,
        macd,
        signal,
        histogram,
        volume: Math.floor(Math.random() * 2000000) + 500000,
        rsi: 30 + Math.random() * 40,
      })
    }
    return data
  }

  const priceData = generateEnhancedPriceData()

  const movingAverages: MovingAverage[] = [
    {
      period: 20,
      value: technicalData.ema20,
      signal: stockData.price > technicalData.ema20 ? "bullish" : "bearish",
    },
    {
      period: 50,
      value: technicalData.sma50,
      signal: stockData.price > technicalData.sma50 ? "bullish" : "bearish",
    },
    {
      period: 200,
      value: technicalData.sma200,
      signal: stockData.price > technicalData.sma200 ? "bullish" : "bearish",
    },
  ]

  const generateTechnicalSignals = (): TechnicalSignal[] => {
    const signals: TechnicalSignal[] = []

    // RSI Signal
    if (technicalData.rsi < 30) {
      signals.push({
        indicator: "RSI",
        signal: "BUY",
        strength: technicalData.rsi < 20 ? "STRONG" : "MODERATE",
        description: `Oversold condition (${technicalData.rsi.toFixed(1)})`,
        confidence: Math.min(95, 70 + (30 - technicalData.rsi) * 2),
      })
    } else if (technicalData.rsi > 70) {
      signals.push({
        indicator: "RSI",
        signal: "SELL",
        strength: technicalData.rsi > 80 ? "STRONG" : "MODERATE",
        description: `Overbought condition (${technicalData.rsi.toFixed(1)})`,
        confidence: Math.min(95, 70 + (technicalData.rsi - 70) * 2),
      })
    }

    // Moving Average Crossover
    if (technicalData.ema9 > technicalData.ema20 && technicalData.ema20 > technicalData.sma50) {
      signals.push({
        indicator: "MA Crossover",
        signal: "BUY",
        strength: "STRONG",
        description: "Bullish alignment: 9 EMA > 20 EMA > 50 SMA",
        confidence: 85,
      })
    } else if (technicalData.ema9 < technicalData.ema20 && technicalData.ema20 < technicalData.sma50) {
      signals.push({
        indicator: "MA Crossover",
        signal: "SELL",
        strength: "STRONG",
        description: "Bearish alignment: 9 EMA < 20 EMA < 50 SMA",
        confidence: 85,
      })
    }

    // VWAP Signal
    const vwapDistance = ((stockData.price - technicalData.vwap) / technicalData.vwap) * 100
    if (Math.abs(vwapDistance) > 2) {
      signals.push({
        indicator: "VWAP",
        signal: vwapDistance > 0 ? "SELL" : "BUY",
        strength: Math.abs(vwapDistance) > 3 ? "STRONG" : "MODERATE",
        description: `Price ${Math.abs(vwapDistance).toFixed(1)}% ${vwapDistance > 0 ? "above" : "below"} VWAP`,
        confidence: Math.min(90, 60 + Math.abs(vwapDistance) * 10),
      })
    }

    // Volume Signal
    if (stockData.volume > 2000000) {
      signals.push({
        indicator: "Volume",
        signal: stockData.changePercent > 0 ? "BUY" : "SELL",
        strength: stockData.volume > 5000000 ? "STRONG" : "MODERATE",
        description: `High volume breakout (${(stockData.volume / 1000000).toFixed(1)}M)`,
        confidence: 75,
      })
    }

    return signals
  }

  const technicalSignals = generateTechnicalSignals()

  const bollingerBands = {
    upper: technicalData.ema20 * 1.02,
    middle: technicalData.ema20,
    lower: technicalData.ema20 * 0.98,
    squeeze: Math.abs(technicalData.ema20 * 1.02 - technicalData.ema20 * 0.98) / technicalData.ema20 < 0.03,
  }

  const macd = {
    line: ((technicalData.ema9 - technicalData.ema20) / technicalData.ema20) * 100,
    signal: ((technicalData.ema9 - technicalData.ema20) / technicalData.ema20) * 100 * 0.8,
    histogram: ((technicalData.ema9 - technicalData.ema20) / technicalData.ema20) * 100 * 0.2,
  }

  const getSignalColor = (signal: "BUY" | "SELL" | "HOLD") => {
    switch (signal) {
      case "BUY":
        return "text-green-600 dark:text-green-400"
      case "SELL":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-yellow-600 dark:text-yellow-400"
    }
  }

  const getSignalIcon = (signal: "BUY" | "SELL" | "HOLD") => {
    switch (signal) {
      case "BUY":
        return <TrendingUp className="h-4 w-4" />
      case "SELL":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Enhanced Technical Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="indicators">Indicators</TabsTrigger>
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="chart">Price Chart</TabsTrigger>
            <TabsTrigger value="oscillators">Oscillators</TabsTrigger>
          </TabsList>

          <TabsContent value="indicators" className="space-y-6">
            {/* Moving Averages */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Moving Averages</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {movingAverages.map((ma, index) => (
                  <div key={index} className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">SMA {ma.period}</span>
                      <Badge variant={ma.signal === "bullish" ? "default" : "destructive"}>{ma.signal}</Badge>
                    </div>
                    <div className="text-lg font-bold">${ma.value.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      {(((stockData.price - ma.value) / ma.value) * 100).toFixed(1)}% from current
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Bollinger Bands */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Bollinger Bands</h4>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Upper Band</div>
                    <div className="font-bold">${bollingerBands.upper.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Middle (SMA 20)</div>
                    <div className="font-bold">${bollingerBands.middle.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Lower Band</div>
                    <div className="font-bold">${bollingerBands.lower.toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  {bollingerBands.squeeze && (
                    <Badge variant="outline" className="text-orange-600">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Squeeze Detected
                    </Badge>
                  )}
                  <Badge
                    variant={
                      stockData.price > bollingerBands.upper
                        ? "destructive"
                        : stockData.price < bollingerBands.lower
                          ? "default"
                          : "outline"
                    }
                  >
                    {stockData.price > bollingerBands.upper
                      ? "Above Upper"
                      : stockData.price < bollingerBands.lower
                        ? "Below Lower"
                        : "Within Bands"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* MACD */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">MACD</h4>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">MACD Line</div>
                    <div className={`font-bold ${macd.line > 0 ? "text-green-600" : "text-red-600"}`}>
                      {macd.line.toFixed(3)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Signal Line</div>
                    <div className={`font-bold ${macd.signal > 0 ? "text-green-600" : "text-red-600"}`}>
                      {macd.signal.toFixed(3)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Histogram</div>
                    <div className={`font-bold ${macd.histogram > 0 ? "text-green-600" : "text-red-600"}`}>
                      {macd.histogram.toFixed(3)}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Badge variant={macd.line > macd.signal ? "default" : "destructive"}>
                    {macd.line > macd.signal ? "Bullish Crossover" : "Bearish Crossover"}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="signals" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Active Trading Signals</h4>
              {technicalSignals.length > 0 ? (
                <div className="space-y-3">
                  {technicalSignals.map((signal, index) => (
                    <div key={index} className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getSignalIcon(signal.signal)}
                          <span className="font-medium">{signal.indicator}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={signal.signal === "BUY" ? "default" : "destructive"}>{signal.signal}</Badge>
                          <Badge variant="outline">{signal.strength}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{signal.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Confidence:</span>
                        <Progress value={signal.confidence} className="flex-1 h-2" />
                        <span className="text-xs font-medium">{signal.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2" />
                  <p>No strong signals detected</p>
                  <p className="text-sm">Market conditions appear neutral</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="chart" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Price Chart with Indicators</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={["dataMin - 5", "dataMax + 5"]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} name="Price" />
                    <Line type="monotone" dataKey="sma20" stroke="#16a34a" strokeWidth={1} name="SMA 20" />
                    <Line type="monotone" dataKey="sma50" stroke="#ea580c" strokeWidth={1} name="SMA 50" />
                    <Line type="monotone" dataKey="vwap" stroke="#7c3aed" strokeWidth={1} name="VWAP" />
                    <Line
                      type="monotone"
                      dataKey="upperBand"
                      stroke="#ef4444"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      name="Upper BB"
                    />
                    <Line
                      type="monotone"
                      dataKey="lowerBand"
                      stroke="#ef4444"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      name="Lower BB"
                    />
                    <ReferenceLine y={stockData.price} stroke="#1f2937" strokeDasharray="2 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="oscillators" className="space-y-4">
            <div className="space-y-6">
              {/* RSI */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">RSI (14)</h4>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{technicalData.rsi.toFixed(1)}</span>
                    <Badge
                      variant={technicalData.rsi > 70 ? "destructive" : technicalData.rsi < 30 ? "default" : "outline"}
                    >
                      {technicalData.rsi > 70 ? "Overbought" : technicalData.rsi < 30 ? "Oversold" : "Neutral"}
                    </Badge>
                  </div>
                  <Progress value={technicalData.rsi} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span>30</span>
                    <span>70</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              {/* ADX */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">ADX (14) - Trend Strength</h4>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{technicalData.adx.toFixed(1)}</span>
                    <Badge variant={technicalData.adx > 25 ? "default" : "outline"}>
                      {technicalData.adx > 40 ? "Very Strong" : technicalData.adx > 25 ? "Strong Trend" : "Weak Trend"}
                    </Badge>
                  </div>
                  <Progress value={technicalData.adx} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span>25</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              {/* Volume Analysis */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Volume Analysis</h4>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold">{(stockData.volume / 1000000).toFixed(1)}M</div>
                      <div className="text-sm text-muted-foreground">Current Volume</div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-lg font-bold ${stockData.volume > 2000000 ? "text-green-600" : "text-yellow-600"}`}
                      >
                        {stockData.volume > 5000000
                          ? "Very High"
                          : stockData.volume > 2000000
                            ? "High"
                            : stockData.volume > 1000000
                              ? "Average"
                              : "Low"}
                      </div>
                      <div className="text-sm text-muted-foreground">Volume Level</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
