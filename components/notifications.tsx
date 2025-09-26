"use client"

import { useState, useEffect } from "react"
import { X, AlertTriangle, TrendingUp, TrendingDown, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { StockData, TechnicalIndicators } from "@/lib/stock-api"

interface Notification {
  id: string
  type: "alert" | "signal" | "warning" | "info"
  title: string
  message: string
  timestamp: Date
  symbol?: string
}

interface NotificationsProps {
  stockData: StockData | null
  technicalData: TechnicalIndicators | null
  enabled: boolean
}

export function Notifications({ stockData, technicalData, enabled }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!enabled || !stockData || !technicalData) return

    const newNotifications: Notification[] = []

    // RSI Overbought/Oversold alerts
    if (technicalData.rsi > 70) {
      newNotifications.push({
        id: `rsi-overbought-${Date.now()}`,
        type: "warning",
        title: "RSI Overbought",
        message: `${stockData.symbol} RSI at ${technicalData.rsi.toFixed(1)} - Consider taking profits`,
        timestamp: new Date(),
        symbol: stockData.symbol,
      })
    } else if (technicalData.rsi < 30) {
      newNotifications.push({
        id: `rsi-oversold-${Date.now()}`,
        type: "signal",
        title: "RSI Oversold",
        message: `${stockData.symbol} RSI at ${technicalData.rsi.toFixed(1)} - Potential bounce opportunity`,
        timestamp: new Date(),
        symbol: stockData.symbol,
      })
    }

    // VWAP breakout alerts
    const vwapDistance = Math.abs(stockData.price - technicalData.vwap)
    if (vwapDistance < stockData.price * 0.002) {
      newNotifications.push({
        id: `vwap-touch-${Date.now()}`,
        type: "signal",
        title: "VWAP Touch",
        message: `${stockData.symbol} touching VWAP at $${technicalData.vwap.toFixed(2)} - Watch for bounce`,
        timestamp: new Date(),
        symbol: stockData.symbol,
      })
    }

    // Volume spike alerts
    if (stockData.volume > 2000000) {
      newNotifications.push({
        id: `volume-spike-${Date.now()}`,
        type: "alert",
        title: "High Volume",
        message: `${stockData.symbol} volume spike: ${stockData.volume.toLocaleString()} - Breakout potential`,
        timestamp: new Date(),
        symbol: stockData.symbol,
      })
    }

    // Price movement alerts
    if (Math.abs(stockData.changePercent) > 5) {
      newNotifications.push({
        id: `price-move-${Date.now()}`,
        type: "alert",
        title: "Large Price Movement",
        message: `${stockData.symbol} moved ${stockData.changePercent.toFixed(2)}% - Monitor for continuation`,
        timestamp: new Date(),
        symbol: stockData.symbol,
      })
    }

    // EMA crossover alerts
    if (technicalData.ema9 > technicalData.ema20) {
      const spread = ((technicalData.ema9 - technicalData.ema20) / technicalData.ema20) * 100
      if (spread > 0.1 && spread < 0.5) {
        newNotifications.push({
          id: `ema-cross-${Date.now()}`,
          type: "signal",
          title: "EMA Crossover",
          message: `${stockData.symbol} 9 EMA crossing above 20 EMA - Bullish signal`,
          timestamp: new Date(),
          symbol: stockData.symbol,
        })
      }
    }

    // Add new notifications (avoid duplicates)
    setNotifications((prev) => {
      const existingTypes = prev.map((n) => n.type + n.title)
      const filtered = newNotifications.filter((n) => !existingTypes.includes(n.type + n.title))
      return [...prev, ...filtered].slice(-10) // Keep only last 10
    })
  }, [stockData, technicalData, enabled])

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "signal":
        return <Target className="h-4 w-4 text-blue-600" />
      case "warning":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <TrendingUp className="h-4 w-4 text-green-600" />
    }
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "alert":
        return "border-yellow-500/20 bg-yellow-500/5"
      case "signal":
        return "border-blue-500/20 bg-blue-500/5"
      case "warning":
        return "border-red-500/20 bg-red-500/5"
      default:
        return "border-green-500/20 bg-green-500/5"
    }
  }

  if (!enabled || notifications.length === 0) return null

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <Card key={notification.id} className={`${getNotificationColor(notification.type)} border`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                {getNotificationIcon(notification.type)}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    {notification.symbol && (
                      <Badge variant="outline" className="text-xs">
                        {notification.symbol}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <div className="text-xs text-muted-foreground">{notification.timestamp.toLocaleTimeString()}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(notification.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
