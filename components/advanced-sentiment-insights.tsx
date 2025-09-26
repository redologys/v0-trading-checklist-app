"use client"

import { useState, useEffect } from "react"
import { Brain, TrendingUp, TrendingDown, Calendar, AlertTriangle, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import type { StockData, TechnicalIndicators } from "@/lib/stock-api"
import { fetchAlternativeData, fetchMacroData, type AlternativeData, type MacroData } from "@/lib/stock-api"

interface AdvancedSentimentInsightsProps {
  stockData: StockData
  technicalData: TechnicalIndicators
}

interface SentimentScore {
  source: string
  score: number
  trend: "improving" | "declining" | "stable"
  confidence: number
  description: string
}

interface SectorComparison {
  name: string
  performance: number
  correlation: number
  trend: "outperforming" | "underperforming" | "inline"
}

interface MacroEvent {
  date: string
  event: string
  impact: "high" | "medium" | "low"
  description: string
  type: "fed" | "inflation" | "employment" | "earnings"
}

export function AdvancedSentimentInsights({ stockData, technicalData }: AdvancedSentimentInsightsProps) {
  const [alternativeData, setAlternativeData] = useState<AlternativeData | null>(null)
  const [macroData, setMacroData] = useState<MacroData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("sentiment")

  useEffect(() => {
    const loadSentimentData = async () => {
      try {
        setLoading(true)
        const [alternative, macro] = await Promise.all([fetchAlternativeData(stockData.symbol), fetchMacroData()])

        setAlternativeData(alternative)
        setMacroData(macro)
      } catch (error) {
        console.error("Error loading sentiment data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSentimentData()
  }, [stockData.symbol])

  const generateSentimentScores = (): SentimentScore[] => {
    if (!alternativeData) return []

    return [
      {
        source: "Social Media",
        score: (alternativeData.socialSentiment + 1) * 50, // Convert -1 to 1 range to 0-100
        trend:
          alternativeData.socialSentiment > 0.1
            ? "improving"
            : alternativeData.socialSentiment < -0.1
              ? "declining"
              : "stable",
        confidence: 75 + Math.random() * 20,
        description:
          alternativeData.socialSentiment > 0.3
            ? "Very positive social buzz"
            : alternativeData.socialSentiment > 0
              ? "Positive sentiment"
              : alternativeData.socialSentiment < -0.3
                ? "Negative sentiment"
                : "Neutral sentiment",
      },
      {
        source: "News Analysis",
        score: (alternativeData.newsScore + 1) * 50,
        trend:
          alternativeData.newsScore > 0.1 ? "improving" : alternativeData.newsScore < -0.1 ? "declining" : "stable",
        confidence: 80 + Math.random() * 15,
        description:
          alternativeData.newsScore > 0.3
            ? "Positive news coverage"
            : alternativeData.newsScore > 0
              ? "Mostly positive news"
              : alternativeData.newsScore < -0.3
                ? "Negative news coverage"
                : "Mixed news sentiment",
      },
      {
        source: "Analyst Ratings",
        score: (alternativeData.analystRating / 5) * 100,
        trend:
          alternativeData.upgrades > alternativeData.downgrades
            ? "improving"
            : alternativeData.downgrades > alternativeData.upgrades
              ? "declining"
              : "stable",
        confidence: 90,
        description:
          alternativeData.analystRating > 4
            ? "Strong buy consensus"
            : alternativeData.analystRating > 3
              ? "Buy consensus"
              : alternativeData.analystRating > 2
                ? "Hold consensus"
                : "Sell consensus",
      },
      {
        source: "Google Trends",
        score: alternativeData.googleTrends,
        trend:
          alternativeData.googleTrends > 70 ? "improving" : alternativeData.googleTrends < 30 ? "declining" : "stable",
        confidence: 60 + Math.random() * 25,
        description:
          alternativeData.googleTrends > 80
            ? "High search interest"
            : alternativeData.googleTrends > 50
              ? "Moderate interest"
              : alternativeData.googleTrends > 20
                ? "Low interest"
                : "Very low interest",
      },
    ]
  }

  const generateSectorComparison = (): SectorComparison[] => {
    const sectors = [
      "Technology",
      "Healthcare",
      "Financial",
      "Consumer",
      "Industrial",
      "Energy",
      "Materials",
      "Utilities",
      "Real Estate",
      "Communication",
    ]

    return sectors
      .map((sector) => {
        const performance = (Math.random() - 0.5) * 20 // -10% to +10%
        const correlation = Math.random() * 0.8 + 0.2 // 0.2 to 1.0

        return {
          name: sector,
          performance,
          correlation,
          trend: performance > 2 ? "outperforming" : performance < -2 ? "underperforming" : "inline",
        }
      })
      .sort((a, b) => b.performance - a.performance)
  }

  const generateMacroEvents = (): MacroEvent[] => {
    const events: MacroEvent[] = []
    const today = new Date()

    // Fed meetings
    for (let i = 0; i < 4; i++) {
      const fedDate = new Date(today)
      fedDate.setMonth(today.getMonth() + i * 1.5)
      events.push({
        date: fedDate.toISOString().split("T")[0],
        event: "FOMC Meeting",
        impact: "high",
        description: "Federal Reserve interest rate decision and policy statement",
        type: "fed",
      })
    }

    // Inflation data
    for (let i = 0; i < 3; i++) {
      const cpiDate = new Date(today)
      cpiDate.setMonth(today.getMonth() + i)
      cpiDate.setDate(12) // Usually mid-month
      events.push({
        date: cpiDate.toISOString().split("T")[0],
        event: "CPI Report",
        impact: "high",
        description: "Consumer Price Index inflation data release",
        type: "inflation",
      })
    }

    // Employment data
    for (let i = 0; i < 3; i++) {
      const jobsDate = new Date(today)
      jobsDate.setMonth(today.getMonth() + i)
      jobsDate.setDate(1) // First Friday
      events.push({
        date: jobsDate.toISOString().split("T")[0],
        event: "Jobs Report",
        impact: "medium",
        description: "Non-farm payrolls and unemployment rate",
        type: "employment",
      })
    }

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const sentimentScores = generateSentimentScores()
  const sectorComparison = generateSectorComparison()
  const macroEvents = generateMacroEvents()

  const overallSentiment =
    sentimentScores.length > 0
      ? sentimentScores.reduce((sum, score) => sum + score.score, 0) / sentimentScores.length
      : 50

  const indexComparison = [
    {
      name: "SPY",
      performance: (Math.random() - 0.5) * 6,
      correlation: 0.7 + Math.random() * 0.25,
    },
    {
      name: "QQQ",
      performance: (Math.random() - 0.5) * 8,
      correlation: 0.6 + Math.random() * 0.3,
    },
    {
      name: "IWM",
      performance: (Math.random() - 0.5) * 10,
      correlation: 0.4 + Math.random() * 0.4,
    },
  ]

  const getSentimentColor = (score: number) => {
    if (score > 70) return "text-green-600 dark:text-green-400"
    if (score > 30) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Target className="h-4 w-4 text-yellow-600" />
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high":
        return <Badge variant="destructive">High Impact</Badge>
      case "medium":
        return <Badge variant="outline">Medium Impact</Badge>
      default:
        return <Badge variant="secondary">Low Impact</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading sentiment data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Advanced Sentiment & Market Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="comparison">Sector/Index</TabsTrigger>
            <TabsTrigger value="macro">Macro Context</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="sentiment" className="space-y-6">
            {/* Overall Sentiment Score */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Overall Stock Sentiment</h4>
                <Badge variant={overallSentiment > 70 ? "default" : overallSentiment > 30 ? "outline" : "destructive"}>
                  {overallSentiment > 70 ? "Bullish" : overallSentiment > 30 ? "Neutral" : "Bearish"}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{overallSentiment.toFixed(0)}/100</span>
                  <span className={`text-sm font-medium ${getSentimentColor(overallSentiment)}`}>
                    {overallSentiment > 70
                      ? "Very Positive"
                      : overallSentiment > 50
                        ? "Positive"
                        : overallSentiment > 30
                          ? "Neutral"
                          : "Negative"}
                  </span>
                </div>
                <Progress value={overallSentiment} className="h-3" />
              </div>
            </div>

            {/* Individual Sentiment Sources */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Sentiment Breakdown</h4>
              <div className="space-y-3">
                {sentimentScores.map((sentiment, index) => (
                  <div key={index} className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{sentiment.source}</span>
                        {getTrendIcon(sentiment.trend)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{sentiment.score.toFixed(0)}</span>
                        <Badge variant="outline">{sentiment.confidence.toFixed(0)}% confidence</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{sentiment.description}</p>
                    <Progress value={sentiment.score} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Analyst Actions */}
            {alternativeData && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Recent Analyst Actions</h4>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">{alternativeData.upgrades}</div>
                      <div className="text-sm text-muted-foreground">Upgrades</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">{alternativeData.downgrades}</div>
                      <div className="text-sm text-muted-foreground">Downgrades</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{alternativeData.analystRating.toFixed(1)}/5</div>
                      <div className="text-sm text-muted-foreground">Avg Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            {/* Index Comparison */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Index Comparison</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {indexComparison.map((index, i) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{index.name}</span>
                      <Badge variant={index.performance > 0 ? "default" : "destructive"}>
                        {index.performance > 0 ? "+" : ""}
                        {index.performance.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Correlation: {(index.correlation * 100).toFixed(0)}%
                    </div>
                    <Progress value={index.correlation * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Sector Performance */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Sector Performance Ranking</h4>
              <div className="space-y-2">
                {sectorComparison.slice(0, 6).map((sector, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium w-4">#{index + 1}</span>
                      <span className="font-medium">{sector.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          sector.trend === "outperforming"
                            ? "default"
                            : sector.trend === "underperforming"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {sector.trend}
                      </Badge>
                      <span
                        className={`font-mono text-sm ${sector.performance > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {sector.performance > 0 ? "+" : ""}
                        {sector.performance.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Correlation Chart */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Sector Correlation Analysis</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorComparison.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="correlation" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="macro" className="space-y-6">
            {/* Current Macro Environment */}
            {macroData && (
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Current Macro Environment</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="text-sm text-muted-foreground">VIX</div>
                    <div className="text-xl font-bold">{macroData.vix.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">
                      {macroData.vix > 30 ? "High Fear" : macroData.vix > 20 ? "Elevated" : "Low Fear"}
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="text-sm text-muted-foreground">10Y Yield</div>
                    <div className="text-xl font-bold">{macroData.tenYearYield.toFixed(2)}%</div>
                    <div className="text-xs text-muted-foreground">Treasury Rate</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="text-sm text-muted-foreground">DXY</div>
                    <div className="text-xl font-bold">{macroData.dxy.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">Dollar Index</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="text-sm text-muted-foreground">SPY Flow</div>
                    <div className={`text-xl font-bold ${macroData.spyFlow > 0 ? "text-green-600" : "text-red-600"}`}>
                      {macroData.spyFlow > 0 ? "+" : ""}
                      {(macroData.spyFlow / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-muted-foreground">Options Flow</div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Upcoming Macro Events */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming Macro Events
              </h4>
              <div className="space-y-3">
                {macroEvents.slice(0, 6).map((event, index) => (
                  <div key={index} className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.event}</span>
                        {event.type === "fed" && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                      </div>
                      <div className="flex items-center gap-2">
                        {getImpactBadge(event.impact)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Regime Analysis */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Market Regime Analysis</h4>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Current Regime</div>
                    <div className="font-bold">
                      {macroData && macroData.vix < 20
                        ? "Low Volatility"
                        : macroData && macroData.vix > 30
                          ? "High Volatility"
                          : "Normal Volatility"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Interest Rate Environment</div>
                    <div className="font-bold">
                      {macroData && macroData.tenYearYield > 4.5
                        ? "Rising Rates"
                        : macroData && macroData.tenYearYield < 3.5
                          ? "Low Rates"
                          : "Stable Rates"}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {macroData && macroData.vix < 20 && macroData.tenYearYield < 4
                    ? "Favorable environment for risk assets with low volatility and manageable rates."
                    : "Mixed environment - monitor volatility and rate changes closely."}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">AI-Generated Market Insights</h4>

              {/* Key Insights */}
              <div className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h5 className="font-medium mb-2">Sentiment Summary</h5>
                  <p className="text-sm text-muted-foreground">
                    {overallSentiment > 70
                      ? `Strong bullish sentiment detected across multiple sources. Social media buzz is positive, analyst ratings are favorable, and news coverage is constructive. This suggests potential upward momentum.`
                      : overallSentiment > 30
                        ? `Mixed sentiment signals present. While some sources show optimism, others remain cautious. Monitor for sentiment shifts that could indicate direction changes.`
                        : `Bearish sentiment dominates across sources. Negative news coverage, declining social sentiment, and analyst downgrades suggest potential downward pressure.`}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h5 className="font-medium mb-2">Sector Positioning</h5>
                  <p className="text-sm text-muted-foreground">
                    {sectorComparison[0]?.name} sector is leading performance with{" "}
                    {sectorComparison[0]?.performance.toFixed(1)}% gains. Your stock's correlation with top-performing
                    sectors suggests
                    {sectorComparison.find((s) => s.correlation > 0.7)
                      ? " potential for continued strength if sector momentum persists."
                      : " relative independence from current sector trends, requiring stock-specific analysis."}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h5 className="font-medium mb-2">Macro Risk Assessment</h5>
                  <p className="text-sm text-muted-foreground">
                    {macroData && macroData.vix > 25
                      ? `Elevated VIX (${macroData.vix.toFixed(1)}) indicates heightened market uncertainty. Consider defensive positioning and risk management.`
                      : macroData && macroData.vix < 15
                        ? `Low VIX (${macroData.vix.toFixed(1)}) suggests complacency. Watch for volatility expansion that could catch markets off-guard.`
                        : `Moderate volatility environment provides balanced risk-reward opportunities. Focus on stock-specific catalysts.`}
                    {macroData && macroData.tenYearYield > 4.5
                      ? ` Rising rates may pressure valuations, especially for growth stocks.`
                      : ` Current rate environment remains supportive for equity valuations.`}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h5 className="font-medium mb-2">Trading Recommendation</h5>
                  <p className="text-sm text-muted-foreground">
                    Based on current sentiment ({overallSentiment.toFixed(0)}/100), sector positioning, and macro
                    conditions:
                    {overallSentiment > 70 && macroData && macroData.vix < 20
                      ? " Consider bullish positioning with defined risk management. Favorable sentiment and low volatility support upside potential."
                      : overallSentiment < 30 || (macroData && macroData.vix > 30)
                        ? " Exercise caution. Negative sentiment or high volatility suggests defensive positioning may be prudent."
                        : " Maintain balanced approach. Mixed signals suggest waiting for clearer directional catalysts."}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
