"use client"

import { useState } from "react"
import { Target, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import type { StockData, TechnicalIndicators } from "@/lib/stock-api"

interface EntryTriggersProps {
  stockData: StockData
  technicalData: TechnicalIndicators
}

interface EntrySetup {
  name: string
  type: "breakout" | "bounce" | "pullback" | "breakdown"
  signal: "long" | "short" | "none"
  strength: number // 0-100
  conditions: string[]
  warnings: string[]
  entry: number | null
  stopLoss: number | null
  target: number | null
  riskReward: number | null
}

export function EntryTriggers({ stockData, technicalData }: EntryTriggersProps) {
  const [selectedSetup, setSelectedSetup] = useState<string>("orb")

  // Calculate entry setups
  const calculateSetups = (): EntrySetup[] => {
    const setups: EntrySetup[] = []

    // ORB Breakout Setup
    const orbHigh = stockData.high
    const orbLow = stockData.low
    const orbRange = orbHigh - orbLow
    const orbBreakoutLong = stockData.price > orbHigh
    const orbBreakoutShort = stockData.price < orbLow

    setups.push({
      name: "ORB Breakout",
      type: "breakout",
      signal: orbBreakoutLong ? "long" : orbBreakoutShort ? "short" : "none",
      strength: orbBreakoutLong || orbBreakoutShort ? 85 : 45,
      conditions: [
        `ORB High: $${orbHigh.toFixed(2)}`,
        `ORB Low: $${orbLow.toFixed(2)}`,
        `Range: $${orbRange.toFixed(2)}`,
        `Volume: ${stockData.volume.toLocaleString()}`,
      ],
      warnings: orbRange < stockData.price * 0.01 ? ["Narrow range - low volatility"] : [],
      entry: orbBreakoutLong ? orbHigh + 0.05 : orbBreakoutShort ? orbLow - 0.05 : null,
      stopLoss: orbBreakoutLong ? orbLow : orbBreakoutShort ? orbHigh : null,
      target: orbBreakoutLong ? orbHigh + orbRange : orbBreakoutShort ? orbLow - orbRange : null,
      riskReward: orbRange > 0 ? orbRange / orbRange : null,
    })

    // VWAP Bounce Setup
    const vwapDistance = Math.abs(stockData.price - technicalData.vwap)
    const vwapBounce = vwapDistance < stockData.price * 0.005 // Within 0.5% of VWAP
    const vwapBullish = stockData.price > technicalData.vwap
    const vwapBearish = stockData.price < technicalData.vwap

    setups.push({
      name: "VWAP Bounce",
      type: "bounce",
      signal: vwapBounce && vwapBullish ? "long" : vwapBounce && vwapBearish ? "short" : "none",
      strength: vwapBounce ? 75 : 30,
      conditions: [
        `VWAP: $${technicalData.vwap.toFixed(2)}`,
        `Distance: ${((vwapDistance / stockData.price) * 100).toFixed(2)}%`,
        `Trend: ${vwapBullish ? "Bullish" : "Bearish"}`,
      ],
      warnings: !vwapBounce ? ["Price not near VWAP"] : [],
      entry: vwapBounce ? stockData.price : null,
      stopLoss: vwapBounce ? (vwapBullish ? technicalData.vwap - 0.1 : technicalData.vwap + 0.1) : null,
      target: vwapBounce
        ? vwapBullish
          ? stockData.price + vwapDistance * 2
          : stockData.price - vwapDistance * 2
        : null,
      riskReward: 2.0,
    })

    // PDH/PDL Break Setup
    const pdhBreak = stockData.price > stockData.high
    const pdlBreak = stockData.price < stockData.low

    setups.push({
      name: "PDH/PDL Break",
      type: "breakout",
      signal: pdhBreak ? "long" : pdlBreak ? "short" : "none",
      strength: pdhBreak || pdlBreak ? 80 : 40,
      conditions: [
        `PDH: $${stockData.high.toFixed(2)}`,
        `PDL: $${stockData.low.toFixed(2)}`,
        `Current: $${stockData.price.toFixed(2)}`,
      ],
      warnings: [],
      entry: pdhBreak ? stockData.high + 0.05 : pdlBreak ? stockData.low - 0.05 : null,
      stopLoss: pdhBreak ? stockData.high - 0.2 : pdlBreak ? stockData.low + 0.2 : null,
      target: pdhBreak
        ? stockData.high + (stockData.high - stockData.low)
        : pdlBreak
          ? stockData.low - (stockData.high - stockData.low)
          : null,
      riskReward: 2.5,
    })

    // First Pullback Setup
    const ema9Above20 = technicalData.ema9 > technicalData.ema20
    const priceNearEma = Math.abs(stockData.price - technicalData.ema9) < stockData.price * 0.01

    setups.push({
      name: "First Pullback",
      type: "pullback",
      signal: ema9Above20 && priceNearEma ? "long" : !ema9Above20 && priceNearEma ? "short" : "none",
      strength: priceNearEma ? 70 : 25,
      conditions: [
        `9 EMA: $${technicalData.ema9.toFixed(2)}`,
        `20 EMA: $${technicalData.ema20.toFixed(2)}`,
        `EMA Trend: ${ema9Above20 ? "Bullish" : "Bearish"}`,
      ],
      warnings: !priceNearEma ? ["Price not near 9 EMA"] : [],
      entry: priceNearEma ? technicalData.ema9 : null,
      stopLoss: priceNearEma ? technicalData.ema20 : null,
      target: priceNearEma
        ? ema9Above20
          ? technicalData.ema9 + Math.abs(technicalData.ema9 - technicalData.ema20) * 2
          : technicalData.ema9 - Math.abs(technicalData.ema9 - technicalData.ema20) * 2
        : null,
      riskReward: 2.0,
    })

    return setups
  }

  const setups = calculateSetups()

  // RSI Warnings
  const rsiOverbought = technicalData.rsi > 70
  const rsiOversold = technicalData.rsi < 30
  const rsiNeutral = technicalData.rsi >= 30 && technicalData.rsi <= 70

  const getSetupIcon = (type: EntrySetup["type"]) => {
    switch (type) {
      case "breakout":
        return <TrendingUp className="h-4 w-4" />
      case "breakdown":
        return <TrendingDown className="h-4 w-4" />
      case "bounce":
        return <Zap className="h-4 w-4" />
      case "pullback":
        return <Target className="h-4 w-4" />
    }
  }

  const getSignalColor = (signal: EntrySetup["signal"]) => {
    switch (signal) {
      case "long":
        return "text-green-600 dark:text-green-400"
      case "short":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Entry Triggers & Setups
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* RSI Warning */}
        {(rsiOverbought || rsiOversold) && (
          <Alert variant={rsiOverbought || rsiOversold ? "destructive" : "default"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {rsiOverbought && "RSI Overbought (>70) - Avoid long positions, consider shorts"}
              {rsiOversold && "RSI Oversold (<30) - Avoid short positions, consider longs"}
            </AlertDescription>
          </Alert>
        )}

        {/* RSI Status */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">RSI Status</span>
            <Badge variant={rsiOverbought || rsiOversold ? "destructive" : "outline"}>
              {rsiOverbought ? "Overbought" : rsiOversold ? "Oversold" : "Neutral"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{technicalData.rsi.toFixed(1)}</span>
            <Progress value={technicalData.rsi} className="w-20 h-2" />
          </div>
        </div>

        {/* Setup Tabs */}
        <Tabs value={selectedSetup} onValueChange={setSelectedSetup}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orb">ORB</TabsTrigger>
            <TabsTrigger value="vwap">VWAP</TabsTrigger>
            <TabsTrigger value="pdh">PDH/PDL</TabsTrigger>
            <TabsTrigger value="pullback">Pullback</TabsTrigger>
          </TabsList>

          {setups.map((setup, index) => (
            <TabsContent key={index} value={["orb", "vwap", "pdh", "pullback"][index]} className="space-y-4">
              <div className="space-y-4">
                {/* Setup Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSetupIcon(setup.type)}
                    <h4 className="font-medium">{setup.name}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={setup.signal !== "none" ? "default" : "outline"}>
                      {setup.signal !== "none" ? setup.signal.toUpperCase() : "No Signal"}
                    </Badge>
                    <Badge variant="outline">{setup.strength}% Strength</Badge>
                  </div>
                </div>

                {/* Setup Conditions */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Current Conditions</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {setup.conditions.map((condition, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground">
                        {condition}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                {setup.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-yellow-600">Warnings</h5>
                    {setup.warnings.map((warning, idx) => (
                      <div key={idx} className="text-sm text-yellow-600 dark:text-yellow-400">
                        • {warning}
                      </div>
                    ))}
                  </div>
                )}

                {/* Trade Plan */}
                {setup.signal !== "none" && setup.entry && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                    <h5 className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Trade Plan - {setup.signal.toUpperCase()}
                    </h5>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Entry</span>
                          <span className="font-mono text-sm">${setup.entry.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Stop Loss</span>
                          <span className="font-mono text-sm">${setup.stopLoss?.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Target</span>
                          <span className="font-mono text-sm">${setup.target?.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">R:R Ratio</span>
                          <span className="font-mono text-sm">{setup.riskReward?.toFixed(1)}:1</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-primary/20">
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>• Confirm with volume surge before entry</div>
                        <div>• Use proper position sizing (1-2% risk)</div>
                        <div>• Monitor for follow-through after entry</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Signal State */}
                {setup.signal === "none" && (
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-sm text-muted-foreground">
                      No {setup.name.toLowerCase()} signal detected. Monitor for setup development.
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Separator />

        {/* General Entry Rules */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">General Entry Rules</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-green-600">Long Entry Conditions</h5>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Price above VWAP (bullish bias)</div>
                <div>• 9 EMA above 20 EMA</div>
                <div>• RSI below 70 (not overbought)</div>
                <div>• Volume surge on breakout</div>
                <div>• Clear break above resistance</div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-sm font-medium text-red-600">Short Entry Conditions</h5>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Price below VWAP (bearish bias)</div>
                <div>• 9 EMA below 20 EMA</div>
                <div>• RSI above 30 (not oversold)</div>
                <div>• Volume surge on breakdown</div>
                <div>• Clear break below support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Management */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risk Management Rules
          </h4>
          <div className="text-sm space-y-1">
            <div>• Never risk more than 1-2% of account per trade</div>
            <div>• Always set stop loss before entry</div>
            <div>• Target minimum 2:1 risk/reward ratio</div>
            <div>• Scale out at targets, let winners run</div>
            <div>• Cut losses quickly, be patient with profits</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
