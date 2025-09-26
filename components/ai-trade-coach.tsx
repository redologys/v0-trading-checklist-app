"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Bot, MessageSquare, Lightbulb, TrendingUp, AlertCircle, CheckCircle, Send, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { StockData, TechnicalIndicators } from "@/lib/stock-api"
import { generateText } from "ai"

interface AITradeCoachProps {
  stockData: StockData
  technicalData: TechnicalIndicators
}

interface CoachingInsight {
  id: string
  type: "opportunity" | "warning" | "education" | "strategy"
  title: string
  message: string
  confidence: number
  actionable: boolean
  timestamp: Date
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface PatternRecognition {
  pattern: string
  confidence: number
  description: string
  implications: string
  historicalSuccess: number
}

export function AITradeCoach({ stockData, technicalData }: AITradeCoachProps) {
  const [activeTab, setActiveTab] = useState("insights")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [coachingInsights, setCoachingInsights] = useState<CoachingInsight[]>([])
  const [patterns, setPatterns] = useState<PatternRecognition[]>([])
  const [loading, setLoading] = useState(true)

  const isMountedRef = useRef(true)
  const updateTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    updateTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        generateCoachingInsights()
        recognizePatterns()
        setLoading(false)
      }
    }, 300) // 300ms debounce

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [stockData.symbol, stockData.price, technicalData.rsi]) // Only depend on specific values that matter

  const generateCoachingInsights = useCallback(() => {
    if (!isMountedRef.current) return

    const insights: CoachingInsight[] = []

    // Technical analysis insights
    if (technicalData.rsi > 70) {
      insights.push({
        id: "rsi-overbought",
        type: "warning",
        title: "Overbought Conditions Detected",
        message: `RSI at ${technicalData.rsi.toFixed(1)} suggests the stock may be overbought. Consider waiting for a pullback or taking profits if you're already long.`,
        confidence: 85,
        actionable: true,
        timestamp: new Date(),
      })
    } else if (technicalData.rsi < 30) {
      insights.push({
        id: "rsi-oversold",
        type: "opportunity",
        title: "Oversold Opportunity",
        message: `RSI at ${technicalData.rsi.toFixed(1)} indicates oversold conditions. This could present a buying opportunity if other factors align.`,
        confidence: 80,
        actionable: true,
        timestamp: new Date(),
      })
    }

    // Moving average insights
    if (stockData.price > technicalData.sma20 && technicalData.sma20 > technicalData.sma50) {
      insights.push({
        id: "bullish-ma",
        type: "opportunity",
        title: "Bullish Moving Average Setup",
        message:
          "Price is above both 20-day and 50-day SMAs, with 20-day above 50-day. This suggests a bullish trend continuation.",
        confidence: 75,
        actionable: true,
        timestamp: new Date(),
      })
    }

    // Volume insights
    if (stockData.volume > (stockData.avgVolume || 0) * 1.5) {
      insights.push({
        id: "high-volume",
        type: "opportunity",
        title: "Unusual Volume Activity",
        message: `Volume is ${((stockData.volume / (stockData.avgVolume || 1)) * 100).toFixed(0)}% of average. High volume often confirms price movements.`,
        confidence: 70,
        actionable: true,
        timestamp: new Date(),
      })
    }

    // Educational insights
    insights.push({
      id: "education-support",
      type: "education",
      title: "Understanding Support Levels",
      message: `The nearest support level appears to be around $${(stockData.price * 0.95).toFixed(2)}. Support levels are price points where buying interest typically emerges.`,
      confidence: 60,
      actionable: false,
      timestamp: new Date(),
    })

    // Strategy insights
    const riskReward = Math.abs((stockData.price * 1.1 - stockData.price) / (stockData.price - stockData.price * 0.95))
    insights.push({
      id: "strategy-rr",
      type: "strategy",
      title: "Risk-Reward Analysis",
      message: `Based on current levels, a potential trade setup offers approximately 1:${riskReward.toFixed(1)} risk-reward ratio. Look for setups with at least 1:2 ratio.`,
      confidence: 65,
      actionable: true,
      timestamp: new Date(),
    })

    setCoachingInsights(insights)
  }, [stockData, technicalData])

  const recognizePatterns = useCallback(() => {
    if (!isMountedRef.current) return

    const recognizedPatterns: PatternRecognition[] = []

    // Bullish patterns
    if (technicalData.rsi > 30 && technicalData.rsi < 70 && stockData.price > technicalData.sma20) {
      recognizedPatterns.push({
        pattern: "Bullish Momentum",
        confidence: 75,
        description: "Price above 20-day SMA with healthy RSI levels",
        implications: "Potential continuation of upward trend",
        historicalSuccess: 68,
      })
    }

    // Reversal patterns
    if (technicalData.rsi < 30 && stockData.changePercent < -2) {
      recognizedPatterns.push({
        pattern: "Oversold Bounce Setup",
        confidence: 70,
        description: "Oversold RSI combined with significant daily decline",
        implications: "Potential short-term bounce opportunity",
        historicalSuccess: 62,
      })
    }

    // Breakout patterns
    if (stockData.volume > (stockData.avgVolume || 0) * 1.5 && Math.abs(stockData.changePercent) > 3) {
      recognizedPatterns.push({
        pattern: "Volume Breakout",
        confidence: 80,
        description: "High volume accompanying significant price movement",
        implications: "Strong conviction behind the move",
        historicalSuccess: 72,
      })
    }

    // Consolidation patterns
    if (technicalData.atr < stockData.price * 0.02) {
      recognizedPatterns.push({
        pattern: "Low Volatility Consolidation",
        confidence: 65,
        description: "Tight trading range with low volatility",
        implications: "Potential for volatility expansion",
        historicalSuccess: 58,
      })
    }

    setPatterns(recognizedPatterns)
  }, [stockData, technicalData])

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isGenerating || !isMountedRef.current) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: currentMessage,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setCurrentMessage("")
    setIsGenerating(true)

    try {
      // Create context for AI
      const context = `
        Stock: ${stockData.symbol}
        Current Price: $${stockData.price}
        Change: ${stockData.changePercent.toFixed(2)}%
        Volume: ${stockData.volume.toLocaleString()}
        RSI: ${technicalData.rsi.toFixed(1)}
        20-day SMA: $${technicalData.sma20.toFixed(2)}
        50-day SMA: $${technicalData.sma50.toFixed(2)}
        ATR: ${technicalData.atr.toFixed(2)}
      `

      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt: `You are an expert trading coach. Based on this stock data: ${context}
        
        User question: ${currentMessage}
        
        Provide helpful, actionable trading advice. Be specific about entry/exit levels when appropriate. Keep responses concise but informative. Focus on risk management and proper trading principles.`,
      })

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: text,
        timestamp: new Date(),
      }

      setChatMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error generating AI response:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble generating a response right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "education":
        return <Lightbulb className="h-4 w-4 text-blue-600" />
      case "strategy":
        return <CheckCircle className="h-4 w-4 text-purple-600" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getInsightBadge = (type: string) => {
    switch (type) {
      case "opportunity":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Opportunity</Badge>
      case "warning":
        return <Badge variant="destructive">Warning</Badge>
      case "education":
        return <Badge variant="outline">Education</Badge>
      case "strategy":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Strategy</Badge>
      default:
        return <Badge variant="secondary">Insight</Badge>
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Analyzing market data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Trade Coach
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights">Smart Insights</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
            <TabsTrigger value="coaching">Coaching</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">AI-Generated Trading Insights</h4>

              <div className="space-y-3">
                {coachingInsights.map((insight) => (
                  <div key={insight.id} className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.type)}
                        <h5 className="font-medium text-sm">{insight.title}</h5>
                      </div>
                      <div className="flex items-center gap-2">
                        {getInsightBadge(insight.type)}
                        <Badge variant="outline" className={getConfidenceColor(insight.confidence)}>
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">{insight.message}</p>

                    {insight.actionable && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">Actionable insight</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Quick Actions */}
            <div className="space-y-3">
              <h5 className="font-medium text-sm">Recommended Actions</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="font-medium text-sm">Entry Strategy</div>
                  <div className="text-xs text-muted-foreground">
                    {technicalData.rsi < 50
                      ? "Consider dollar-cost averaging on weakness"
                      : "Wait for pullback to key support levels"}
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="font-medium text-sm">Risk Management</div>
                  <div className="text-xs text-muted-foreground">
                    Set stop loss at ${(stockData.price * 0.95).toFixed(2)} (5% below current price)
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Pattern Recognition Analysis</h4>

              <div className="space-y-3">
                {patterns.map((pattern, index) => (
                  <div key={index} className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">{pattern.pattern}</h5>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            pattern.confidence > 75 ? "default" : pattern.confidence > 60 ? "outline" : "secondary"
                          }
                        >
                          {pattern.confidence}% match
                        </Badge>
                        <Badge variant="outline">{pattern.historicalSuccess}% success rate</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Description: </span>
                        <span className="text-sm text-muted-foreground">{pattern.description}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Implications: </span>
                        <span className="text-sm text-muted-foreground">{pattern.implications}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Pattern Confidence</span>
                        <span>{pattern.confidence}%</span>
                      </div>
                      <Progress value={pattern.confidence} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>

              {patterns.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-8 w-8 mx-auto mb-2" />
                  <p>No clear patterns detected at this time</p>
                  <p className="text-sm">Check back as market conditions evolve</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Chat with AI Trading Coach</h4>

              {/* Chat Messages */}
              <ScrollArea className="h-96 w-full border rounded-lg p-4">
                <div className="space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Bot className="h-8 w-8 mx-auto mb-2" />
                      <p>Ask me anything about trading {stockData.symbol}</p>
                      <p className="text-sm">I can help with technical analysis, risk management, and strategy</p>
                    </div>
                  )}

                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}

                  {isGenerating && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Ask about entry points, risk management, or market analysis..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isGenerating}
                />
                <Button onClick={handleSendMessage} disabled={isGenerating || !currentMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="coaching" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Personalized Trading Coaching</h4>

              {/* Trading Score */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-sm">Current Setup Score</h5>
                  <Badge
                    variant={
                      coachingInsights.filter((i) => i.type === "opportunity").length >
                      coachingInsights.filter((i) => i.type === "warning").length
                        ? "default"
                        : "outline"
                    }
                  >
                    {coachingInsights.filter((i) => i.type === "opportunity").length >
                    coachingInsights.filter((i) => i.type === "warning").length
                      ? "Favorable"
                      : "Cautious"}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {coachingInsights.filter((i) => i.type === "opportunity").length}
                    </div>
                    <div className="text-xs text-muted-foreground">Opportunities</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">
                      {coachingInsights.filter((i) => i.type === "warning").length}
                    </div>
                    <div className="text-xs text-muted-foreground">Warnings</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">{patterns.length}</div>
                    <div className="text-xs text-muted-foreground">Patterns</div>
                  </div>
                </div>
              </div>

              {/* Learning Modules */}
              <div className="space-y-3">
                <h5 className="font-medium text-sm">Recommended Learning</h5>
                <div className="space-y-2">
                  {[
                    {
                      title: "Understanding RSI Divergence",
                      description: "Learn to spot when price and RSI move in opposite directions",
                      relevance: technicalData.rsi > 70 || technicalData.rsi < 30 ? "High" : "Medium",
                    },
                    {
                      title: "Volume Analysis Techniques",
                      description: "How to use volume to confirm price movements",
                      relevance: stockData.volume > (stockData.avgVolume || 0) * 1.2 ? "High" : "Low",
                    },
                    {
                      title: "Support and Resistance Levels",
                      description: "Identifying key price levels for entry and exit",
                      relevance: "High",
                    },
                  ].map((module, index) => (
                    <div key={index} className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{module.title}</div>
                        <div className="text-xs text-muted-foreground">{module.description}</div>
                      </div>
                      <Badge
                        variant={
                          module.relevance === "High"
                            ? "default"
                            : module.relevance === "Medium"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {module.relevance} relevance
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trading Checklist */}
              <div className="space-y-3">
                <h5 className="font-medium text-sm">Pre-Trade Checklist</h5>
                <div className="space-y-2">
                  {[
                    { item: "Defined entry price", checked: true },
                    { item: "Stop loss level set", checked: true },
                    { item: "Target price identified", checked: false },
                    { item: "Position size calculated", checked: false },
                    { item: "Risk/reward ratio > 1:2", checked: false },
                    {
                      item: "Market conditions favorable",
                      checked: coachingInsights.filter((i) => i.type === "opportunity").length > 0,
                    },
                  ].map((checkItem, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${checkItem.checked ? "text-green-600" : "text-gray-400"}`} />
                      <span className={`text-sm ${checkItem.checked ? "text-foreground" : "text-muted-foreground"}`}>
                        {checkItem.item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
