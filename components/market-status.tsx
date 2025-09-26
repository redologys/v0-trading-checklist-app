"use client"

import { useEffect, useState } from "react"
import { Clock, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getMarketHours, type MarketHours } from "@/lib/stock-api"

export function MarketStatus() {
  const [marketHours, setMarketHours] = useState<MarketHours | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const updateMarketStatus = () => {
      setMarketHours(getMarketHours())
      setCurrentTime(new Date())
    }

    updateMarketStatus()
    const interval = setInterval(updateMarketStatus, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!marketHours) return null

  const easternTime = currentTime.toLocaleString("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  return (
    <Card className="h-fit">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Market Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Status:</span>
          <Badge variant={marketHours.isOpen ? "default" : "secondary"} className="flex items-center gap-1 text-xs">
            {marketHours.isOpen ? (
              <>
                <TrendingUp className="h-3 w-3" />
                Open
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3" />
                Closed
              </>
            )}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">EST:</span>
          <span className="font-mono text-xs">{easternTime}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Hours:</span>
          <span className="font-mono">
            {marketHours.nextOpen} - {marketHours.nextClose}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
