"use client"

import { useState, useEffect } from "react"
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import type { StockData } from "@/lib/stock-api"

interface MarketPrepProps {
  stockData: StockData
}

interface PrepItem {
  id: string
  label: string
  completed: boolean
  priority: "high" | "medium" | "low"
}

export function MarketPrep({ stockData }: MarketPrepProps) {
  const [prepItems, setPrepItems] = useState<PrepItem[]>([
    {
      id: "market-hours",
      label: "Mark market open (09:30 EST) and close (16:00 EST)",
      completed: false,
      priority: "high",
    },
    { id: "orb", label: "Highlight first 30-min opening range (ORB)", completed: false, priority: "high" },
    { id: "pdh-pdl", label: "Mark previous day high/low (PDH/PDL)", completed: false, priority: "high" },
    { id: "premarket", label: "Note premarket high/low if available", completed: false, priority: "medium" },
    { id: "news", label: "Check news/events (FOMC, earnings, CPI, etc.)", completed: false, priority: "high" },
    { id: "support-resistance", label: "Identify key support/resistance levels", completed: false, priority: "medium" },
    { id: "volume-profile", label: "Review volume profile from previous session", completed: false, priority: "low" },
  ])

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const togglePrepItem = (id: string) => {
    setPrepItems((items) => items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const completedItems = prepItems.filter((item) => item.completed).length
  const totalItems = prepItems.length
  const completionPercentage = Math.round((completedItems / totalItems) * 100)

  // Calculate opening range (first 30 minutes)
  const marketOpen = new Date()
  marketOpen.setHours(9, 30, 0, 0)
  const orbEnd = new Date(marketOpen)
  orbEnd.setMinutes(orbEnd.getMinutes() + 30)

  const easternTime = currentTime.toLocaleString("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
  })

  const isInORB = currentTime >= marketOpen && currentTime <= orbEnd
  const orbComplete = currentTime > orbEnd

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Market Prep
          </div>
          <Badge variant={completionPercentage === 100 ? "default" : "outline"}>
            {completedItems}/{totalItems} Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Market Levels */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            Key Market Levels
            <Badge variant="outline" className="text-xs">
              {stockData.symbol}
            </Badge>
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Previous Close</span>
                <span className="font-mono text-sm">${stockData.previousClose.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Day High (PDH)</span>
                <span className="font-mono text-sm">${stockData.high.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Day Low (PDL)</span>
                <span className="font-mono text-sm">${stockData.low.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Price</span>
                <span className="font-mono text-sm font-semibold">${stockData.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Opening Price</span>
                <span className="font-mono text-sm">${stockData.open.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Day Range</span>
                <span className="font-mono text-xs">
                  ${stockData.low.toFixed(2)} - ${stockData.high.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Opening Range Breakout (ORB) */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            Opening Range Breakout (ORB)
            <Badge variant={isInORB ? "default" : orbComplete ? "secondary" : "outline"}>
              {isInORB ? "Active" : orbComplete ? "Complete" : "Pending"}
            </Badge>
          </h4>

          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Market Open Time</span>
              <span className="font-mono text-sm">09:30 EST</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">ORB Period End</span>
              <span className="font-mono text-sm">10:00 EST</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Current Time (EST)</span>
              <span className="font-mono text-sm font-semibold">{easternTime}</span>
            </div>
          </div>

          {orbComplete && (
            <div className="bg-primary/10 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                ORB Levels Established
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">ORB High: </span>
                  <span className="font-mono">${stockData.high.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ORB Low: </span>
                  <span className="font-mono">${stockData.low.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {isInORB && (
            <div className="bg-yellow-500/10 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-yellow-700 dark:text-yellow-400">
                <AlertCircle className="h-4 w-4" />
                ORB Period Active - Monitor for breakout setup
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Prep Checklist */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Pre-Market Checklist</h4>

          <div className="space-y-3">
            {prepItems.map((item) => (
              <div key={item.id} className="flex items-start space-x-3">
                <Checkbox
                  id={item.id}
                  checked={item.completed}
                  onCheckedChange={() => togglePrepItem(item.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <label
                    htmlFor={item.id}
                    className={`text-sm cursor-pointer ${item.completed ? "line-through text-muted-foreground" : ""}`}
                  >
                    {item.label}
                  </label>
                  <Badge
                    variant={
                      item.priority === "high" ? "destructive" : item.priority === "medium" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {item.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Preparation Progress</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {completionPercentage === 100 && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              Market preparation complete! Ready to trade.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
