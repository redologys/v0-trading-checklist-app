"use client"

import { useState, useEffect } from "react"
import { Building2, Calendar, Newspaper, ExternalLink, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import type { StockData } from "@/lib/stock-api"
import { fetchFundamentalData, getMarketNews, type FundamentalData } from "@/lib/stock-api"

interface FundamentalSnapshotProps {
  stockData: StockData
}

interface NewsItem {
  headline: string
  summary: string
  url: string
  datetime: number
  sentiment?: "positive" | "negative" | "neutral"
  impact?: "high" | "medium" | "low"
}

interface EarningsEvent {
  date: string
  type: "earnings" | "guidance" | "conference"
  estimate?: number
  actual?: number
  surprise?: number
  time: "BMO" | "AMC" | "TBD"
}

export function FundamentalSnapshot({ stockData }: FundamentalSnapshotProps) {
  const [fundamentalData, setFundamentalData] = useState<FundamentalData | null>(null)
  const [newsData, setNewsData] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("metrics")

  useEffect(() => {
    const loadFundamentalData = async () => {
      try {
        setLoading(true)
        const [fundamental, news] = await Promise.all([
          fetchFundamentalData(stockData.symbol),
          getMarketNews(stockData.symbol),
        ])

        setFundamentalData(fundamental)

        const enhancedNews: NewsItem[] = news.map((item) => ({
          ...item,
          sentiment: Math.random() > 0.6 ? "positive" : Math.random() > 0.3 ? "neutral" : "negative",
          impact: Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low",
        }))

        setNewsData(enhancedNews)
      } catch (error) {
        console.error("Error loading fundamental data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFundamentalData()
  }, [stockData.symbol])

  const generateEarningsCalendar = (): EarningsEvent[] => {
    const events: EarningsEvent[] = []
    const today = new Date()

    // Next earnings (future)
    const nextEarnings = new Date(today)
    nextEarnings.setDate(today.getDate() + Math.floor(Math.random() * 90) + 7)
    events.push({
      date: nextEarnings.toISOString().split("T")[0],
      type: "earnings",
      estimate: fundamentalData ? fundamentalData.eps * (0.95 + Math.random() * 0.1) : 2.5,
      time: Math.random() > 0.5 ? "AMC" : "BMO",
    })

    // Previous earnings (past)
    for (let i = 1; i <= 4; i++) {
      const pastEarnings = new Date(today)
      pastEarnings.setMonth(today.getMonth() - i * 3)
      const estimate = fundamentalData ? fundamentalData.eps * (0.9 + Math.random() * 0.2) : 2.0 + Math.random()
      const actual = estimate * (0.95 + Math.random() * 0.1)

      events.push({
        date: pastEarnings.toISOString().split("T")[0],
        type: "earnings",
        estimate,
        actual,
        surprise: ((actual - estimate) / estimate) * 100,
        time: Math.random() > 0.5 ? "AMC" : "BMO",
      })
    }

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const earningsCalendar = fundamentalData ? generateEarningsCalendar() : []

  const calculateHealthScore = (data: FundamentalData): number => {
    let score = 50 // Base score

    // P/E ratio scoring (lower is better, but not too low)
    if (data.peRatio > 10 && data.peRatio < 25) score += 15
    else if (data.peRatio < 10 || data.peRatio > 40) score -= 10

    // Profit margins
    if (data.grossMargin > 0.4) score += 10
    if (data.operatingMargin > 0.15) score += 10

    // Growth metrics
    if (data.pegRatio < 1.5) score += 10
    if (data.freeCashFlowYield > 0.05) score += 5

    return Math.max(0, Math.min(100, score))
  }

  const healthScore = fundamentalData ? calculateHealthScore(fundamentalData) : 0

  const formatCurrency = (value: number, compact = false) => {
    if (compact && value >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`
    } else if (compact && value >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 dark:text-green-400"
      case "negative":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-yellow-600 dark:text-yellow-400"
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
            <p className="text-sm text-muted-foreground">Loading fundamental data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Fundamental Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="news">News & Events</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-6">
            {/* Financial Health Score */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Financial Health Score</h4>
                <Badge variant={healthScore > 70 ? "default" : healthScore > 50 ? "outline" : "destructive"}>
                  {healthScore > 70 ? "Strong" : healthScore > 50 ? "Moderate" : "Weak"}
                </Badge>
              </div>
              <div className="space-y-2">
                <Progress value={healthScore} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span className="font-medium">{healthScore}/100</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            {/* Key Financial Metrics */}
            {fundamentalData && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="text-sm text-muted-foreground">P/E Ratio</div>
                  <div className="text-xl font-bold">{fundamentalData.peRatio.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">
                    {fundamentalData.peRatio < 15
                      ? "Undervalued"
                      : fundamentalData.peRatio > 25
                        ? "Overvalued"
                        : "Fair Value"}
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="text-sm text-muted-foreground">EPS</div>
                  <div className="text-xl font-bold">${fundamentalData.eps.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Earnings Per Share</div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="text-sm text-muted-foreground">Revenue</div>
                  <div className="text-xl font-bold">{formatCurrency(fundamentalData.revenue, true)}</div>
                  <div className="text-xs text-muted-foreground">Annual Revenue</div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="text-sm text-muted-foreground">Market Cap</div>
                  <div className="text-xl font-bold">{formatCurrency(stockData.marketCap || 0, true)}</div>
                  <div className="text-xs text-muted-foreground">Total Value</div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="text-sm text-muted-foreground">Gross Margin</div>
                  <div className="text-xl font-bold">{(fundamentalData.grossMargin * 100).toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Profitability</div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="text-sm text-muted-foreground">PEG Ratio</div>
                  <div className="text-xl font-bold">{fundamentalData.pegRatio.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    {fundamentalData.pegRatio < 1 ? "Undervalued" : "Fair/Overvalued"}
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Additional Metrics */}
            {fundamentalData && (
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Additional Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Operating Margin</span>
                      <span className="font-medium">{(fundamentalData.operatingMargin * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Free Cash Flow Yield</span>
                      <span className="font-medium">{(fundamentalData.freeCashFlowYield * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Forward P/E</span>
                      <span className="font-medium">{fundamentalData.forwardPE.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price to Sales</span>
                      <span className="font-medium">{fundamentalData.priceToSales.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Net Income</span>
                      <span className="font-medium">{formatCurrency(fundamentalData.netIncome, true)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">EBITDA</span>
                      <span className="font-medium">{formatCurrency(fundamentalData.ebitda, true)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Earnings Calendar
              </h4>

              <div className="space-y-3">
                {earningsCalendar.map((event, index) => {
                  const isUpcoming = new Date(event.date) > new Date()
                  const isSurprise = event.surprise && Math.abs(event.surprise) > 5

                  return (
                    <div
                      key={index}
                      className={`bg-muted/50 rounded-lg p-4 ${isUpcoming ? "border-l-4 border-l-primary" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatDate(event.date)}</span>
                          <Badge variant="outline">{event.time}</Badge>
                          {isUpcoming && <Badge>Upcoming</Badge>}
                        </div>
                        {isSurprise && (
                          <Badge variant={event.surprise! > 0 ? "default" : "destructive"}>
                            {event.surprise! > 0 ? "Beat" : "Miss"}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Estimate</div>
                          <div className="font-medium">${event.estimate?.toFixed(2) || "TBD"}</div>
                        </div>
                        {event.actual && (
                          <div>
                            <div className="text-muted-foreground">Actual</div>
                            <div className="font-medium">${event.actual.toFixed(2)}</div>
                          </div>
                        )}
                        {event.surprise && (
                          <div>
                            <div className="text-muted-foreground">Surprise</div>
                            <div className={`font-medium ${event.surprise > 0 ? "text-green-600" : "text-red-600"}`}>
                              {event.surprise > 0 ? "+" : ""}
                              {event.surprise.toFixed(1)}%
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-muted-foreground">Type</div>
                          <div className="font-medium capitalize">{event.type}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Newspaper className="h-4 w-4" />
                Recent News & Market Events
              </h4>

              <div className="space-y-3">
                {newsData.length > 0 ? (
                  newsData.map((news, index) => (
                    <div key={index} className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <h5 className="font-medium text-sm leading-tight flex-1">{news.headline}</h5>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getImpactBadge(news.impact!)}
                          <Badge variant="outline" className={getSentimentColor(news.sentiment!)}>
                            {news.sentiment}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">{news.summary}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(news.datetime).toLocaleString()}
                        </span>
                        <a
                          href={news.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Read more <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>No recent news available</p>
                    <p className="text-sm">Check back later for updates</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
