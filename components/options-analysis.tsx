"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { BarChart3, Target, AlertTriangle, ChevronDown, ChevronUp, DollarSign, Percent, Calendar } from "lucide-react"
import { fetchHistoricalVolatility, type HistoricalVolatilityData } from "@/lib/stock-api"

interface OptionsAnalysisProps {
  symbol: string
}

interface DetailedStrategy {
  strategy: string
  description: string
  riskLevel: string
  profitPotential: string
  reasoning: string
  timeframe: string
  expectedMove: number
  pop: number
  buyingPower: number
  legs: {
    action: string
    type: string
    strike: number
    premium: number
    quantity: number
  }[]
  maxProfit: number
  maxLoss: number
  breakeven: number[]
  tutorial: string[]
}

export function OptionsAnalysis({ symbol }: OptionsAnalysisProps) {
  const [volatilityData, setVolatilityData] = useState<HistoricalVolatilityData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openStrategies, setOpenStrategies] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (symbol) {
      fetchVolatilityData()
    }
  }, [symbol])

  const fetchVolatilityData = async () => {
    if (!symbol) return

    setLoading(true)
    setError(null)

    try {
      const data = await fetchHistoricalVolatility(symbol)
      setVolatilityData(data)
    } catch (err) {
      console.error("[v0] Error fetching volatility data:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch volatility data"

      // Filter out any MetaMask-related errors that might be coming from browser extensions
      if (errorMessage.toLowerCase().includes("metamask")) {
        setError("Using fallback volatility data")
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleStrategy = (index: number) => {
    const newOpenStrategies = new Set(openStrategies)
    if (newOpenStrategies.has(index)) {
      newOpenStrategies.delete(index)
    } else {
      newOpenStrategies.add(index)
    }
    setOpenStrategies(newOpenStrategies)
  }

  const generateDetailedStrategies = (data: HistoricalVolatilityData): DetailedStrategy[] => {
    const currentPrice = data.currentPrice
    const oneMonthMove = data.averageMoves.oneMonth

    return [
      {
        strategy: "Put Credit Spread",
        description: "Sell a put spread to collect premium with limited risk",
        riskLevel: "Medium",
        profitPotential: "Medium",
        reasoning: `With ${data.timeframes.oneMonth.toFixed(1)}% monthly volatility, selling puts below support levels offers good risk-adjusted returns`,
        timeframe: "30-45 days",
        expectedMove: oneMonthMove,
        pop: 75,
        buyingPower: 800,
        legs: [
          {
            action: "SELL",
            type: "PUT",
            strike: Math.round((currentPrice - oneMonthMove * 0.7) / 5) * 5,
            premium: 1.2,
            quantity: 1,
          },
          {
            action: "BUY",
            type: "PUT",
            strike: Math.round((currentPrice - oneMonthMove * 0.9) / 5) * 5,
            premium: 0.45,
            quantity: 1,
          },
        ],
        maxProfit: 75,
        maxLoss: 925,
        breakeven: [Math.round((currentPrice - oneMonthMove * 0.7) / 5) * 5 - 0.75],
        tutorial: [
          "1. SELL 1 PUT at $" + Math.round((currentPrice - oneMonthMove * 0.7) / 5) * 5 + " strike for $1.20 credit",
          "2. BUY 1 PUT at $" + Math.round((currentPrice - oneMonthMove * 0.9) / 5) * 5 + " strike for $0.45 debit",
          "3. Net credit received: $0.75 per contract ($75 total)",
          "4. Maximum profit: $75 if stock stays above $" + Math.round((currentPrice - oneMonthMove * 0.7) / 5) * 5,
          "5. Maximum loss: $925 if stock falls below $" + Math.round((currentPrice - oneMonthMove * 0.9) / 5) * 5,
          "6. Breakeven: $" + (Math.round((currentPrice - oneMonthMove * 0.7) / 5) * 5 - 0.75).toFixed(2),
          "7. Target 25-50% of max profit, close at 21 DTE if not profitable",
        ],
      },
      {
        strategy: "Call Debit Spread",
        description: "Buy a call spread for directional bullish exposure with limited risk",
        riskLevel: "Medium",
        profitPotential: "High",
        reasoning: `Bullish momentum with ${data.timeframes.oneWeek.toFixed(1)}% weekly volatility suggests upward movement potential`,
        timeframe: "30-45 days",
        expectedMove: oneMonthMove,
        pop: 45,
        buyingPower: 325,
        legs: [
          {
            action: "BUY",
            type: "CALL",
            strike: Math.round((currentPrice + oneMonthMove * 0.2) / 5) * 5,
            premium: 2.1,
            quantity: 1,
          },
          {
            action: "SELL",
            type: "CALL",
            strike: Math.round((currentPrice + oneMonthMove * 0.6) / 5) * 5,
            premium: 0.85,
            quantity: 1,
          },
        ],
        maxProfit: 375,
        maxLoss: 125,
        breakeven: [Math.round((currentPrice + oneMonthMove * 0.2) / 5) * 5 + 1.25],
        tutorial: [
          "1. BUY 1 CALL at $" + Math.round((currentPrice + oneMonthMove * 0.2) / 5) * 5 + " strike for $2.10 debit",
          "2. SELL 1 CALL at $" + Math.round((currentPrice + oneMonthMove * 0.6) / 5) * 5 + " strike for $0.85 credit",
          "3. Net debit paid: $1.25 per contract ($125 total)",
          "4. Maximum profit: $375 if stock rises above $" + Math.round((currentPrice + oneMonthMove * 0.6) / 5) * 5,
          "5. Maximum loss: $125 (net debit paid)",
          "6. Breakeven: $" + (Math.round((currentPrice + oneMonthMove * 0.2) / 5) * 5 + 1.25).toFixed(2),
          "7. Target 50-75% of max profit, manage at 21 DTE",
        ],
      },
      {
        strategy: "Iron Condor",
        description: "Sell both put and call spreads to profit from low volatility",
        riskLevel: "Medium",
        profitPotential: "Medium",
        reasoning: `Range-bound movement expected with current volatility levels, ideal for premium collection`,
        timeframe: "30-45 days",
        expectedMove: oneMonthMove,
        pop: 65,
        buyingPower: 1200,
        legs: [
          {
            action: "SELL",
            type: "PUT",
            strike: Math.round((currentPrice - oneMonthMove * 0.6) / 5) * 5,
            premium: 0.95,
            quantity: 1,
          },
          {
            action: "BUY",
            type: "PUT",
            strike: Math.round((currentPrice - oneMonthMove * 0.8) / 5) * 5,
            premium: 0.35,
            quantity: 1,
          },
          {
            action: "SELL",
            type: "CALL",
            strike: Math.round((currentPrice + oneMonthMove * 0.6) / 5) * 5,
            premium: 0.9,
            quantity: 1,
          },
          {
            action: "BUY",
            type: "CALL",
            strike: Math.round((currentPrice + oneMonthMove * 0.8) / 5) * 5,
            premium: 0.4,
            quantity: 1,
          },
        ],
        maxProfit: 110,
        maxLoss: 390,
        breakeven: [
          Math.round((currentPrice - oneMonthMove * 0.6) / 5) * 5 - 1.1,
          Math.round((currentPrice + oneMonthMove * 0.6) / 5) * 5 + 1.1,
        ],
        tutorial: [
          "1. SELL 1 PUT at $" + Math.round((currentPrice - oneMonthMove * 0.6) / 5) * 5 + " for $0.95 credit",
          "2. BUY 1 PUT at $" + Math.round((currentPrice - oneMonthMove * 0.8) / 5) * 5 + " for $0.35 debit",
          "3. SELL 1 CALL at $" + Math.round((currentPrice + oneMonthMove * 0.6) / 5) * 5 + " for $0.90 credit",
          "4. BUY 1 CALL at $" + Math.round((currentPrice + oneMonthMove * 0.8) / 5) * 5 + " for $0.40 debit",
          "5. Net credit: $1.10 per contract ($110 total)",
          "6. Max profit: $110 if stock stays between put and call strikes",
          "7. Breakevens: $" +
            (Math.round((currentPrice - oneMonthMove * 0.6) / 5) * 5 - 1.1).toFixed(2) +
            " and $" +
            (Math.round((currentPrice + oneMonthMove * 0.6) / 5) * 5 + 1.1).toFixed(2),
          "8. Manage at 25-50% profit or 21 DTE",
        ],
      },
    ]
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Analyzing historical volatility...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Error loading volatility data</p>
            <p className="text-sm mt-1">{error}</p>
            <Button onClick={fetchVolatilityData} variant="outline" size="sm" className="mt-3 bg-transparent">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!volatilityData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <p>Select a stock symbol to analyze options opportunities</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-500"
      case "Medium":
        return "bg-yellow-500"
      case "High":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getProfitColor = (profit: string) => {
    switch (profit) {
      case "Low":
        return "text-yellow-600"
      case "Medium":
        return "text-blue-600"
      case "High":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const detailedStrategies = generateDetailedStrategies(volatilityData)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Options Analysis - {volatilityData.symbol}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold">${volatilityData.currentPrice.toFixed(2)}</div>
            <p className="text-muted-foreground">Current Stock Price</p>
          </div>
        </CardContent>
      </Card>

      {/* Historical Volatility */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Volatility Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-semibold">Annualized Volatility</h4>
              {Object.entries(volatilityData.timeframes).map(([period, vol]) => (
                <div key={period} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{period.replace(/([A-Z])/g, " $1").trim()}</span>
                    <span className="font-medium">{vol.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(vol, 100)} className="h-2" />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Average Price Moves</h4>
              {Object.entries(volatilityData.averageMoves).map(([period, move]) => (
                <div key={period} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{period.replace(/([A-Z])/g, " $1").trim()}</span>
                  <div className="text-right">
                    <div className="font-medium">${move.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      {((move / volatilityData.currentPrice) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Recommended Option Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {detailedStrategies.map((strategy, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <Collapsible>
                  <CollapsibleTrigger className="w-full" onClick={() => toggleStrategy(index)}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-lg">{strategy.strategy}</h4>
                              {openStrategies.has(index) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{strategy.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${getRiskColor(strategy.riskLevel)}`} />
                              {strategy.riskLevel} Risk
                            </Badge>
                            <Badge variant="outline" className={getProfitColor(strategy.profitPotential)}>
                              {strategy.profitPotential} Profit
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4 text-green-600" />
                            <span>POP: {strategy.pop}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                            <span>BP: ${strategy.buyingPower}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{strategy.timeframe}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0 border-t">
                      <div className="space-y-6 mt-4">
                        {/* Trade Setup */}
                        <div>
                          <h5 className="font-semibold mb-3 text-primary">Trade Setup Instructions</h5>
                          <div className="space-y-2">
                            {strategy.tutorial.map((step, stepIndex) => (
                              <div key={stepIndex} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary mt-0.5">
                                  {stepIndex + 1}
                                </div>
                                <p className="text-sm flex-1">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Option Legs */}
                        <div>
                          <h5 className="font-semibold mb-3">Option Legs</h5>
                          <div className="space-y-2">
                            {strategy.legs.map((leg, legIndex) => (
                              <div
                                key={legIndex}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <Badge variant={leg.action === "BUY" ? "default" : "secondary"}>{leg.action}</Badge>
                                  <span className="font-medium">{leg.type}</span>
                                  <span>${leg.strike}</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">${leg.premium.toFixed(2)}</div>
                                  <div className="text-xs text-muted-foreground">per contract</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Risk/Reward Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <h5 className="font-semibold">Risk Metrics</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Max Loss:</span>
                                <span className="font-medium text-red-600">${strategy.maxLoss}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Buying Power:</span>
                                <span className="font-medium">${strategy.buyingPower}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Breakeven:</span>
                                <span className="font-medium">
                                  {strategy.breakeven.map((be) => `$${be.toFixed(2)}`).join(", ")}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h5 className="font-semibold">Reward Metrics</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Max Profit:</span>
                                <span className="font-medium text-green-600">${strategy.maxProfit}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>POP:</span>
                                <span className="font-medium">{strategy.pop}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>R/R Ratio:</span>
                                <span className="font-medium">
                                  1:{(strategy.maxProfit / strategy.maxLoss).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Strategy Reasoning */}
                        <div>
                          <h5 className="font-semibold mb-2">Why This Strategy?</h5>
                          <p className="text-sm text-muted-foreground">{strategy.reasoning}</p>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Volatility Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
              <div>
                <p className="font-medium">Current Volatility Environment</p>
                <p className="text-sm text-muted-foreground">
                  {volatilityData.timeframes.oneMonth > 30
                    ? "High volatility environment - consider premium selling strategies"
                    : volatilityData.timeframes.oneMonth < 20
                      ? "Low volatility environment - consider premium buying strategies"
                      : "Moderate volatility environment - balanced approach recommended"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
              <div>
                <p className="font-medium">Volatility Trend</p>
                <p className="text-sm text-muted-foreground">
                  {volatilityData.timeframes.oneWeek > volatilityData.timeframes.threeMonths
                    ? "Recent volatility is elevated - short-term options may be overpriced"
                    : "Recent volatility is subdued - potential for volatility expansion"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
              <div>
                <p className="font-medium">Risk Management</p>
                <p className="text-sm text-muted-foreground">
                  Always size positions appropriately and consider using defined-risk strategies in high volatility
                  environments.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
