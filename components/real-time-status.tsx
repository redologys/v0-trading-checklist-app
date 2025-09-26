"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff, RefreshCw, Bell, BellOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { getMarketHours } from "@/lib/stock-api"

interface RealTimeStatusProps {
  isConnected: boolean
  lastUpdate: Date | null
  autoRefresh: boolean
  onToggleAutoRefresh: (enabled: boolean) => void
  onManualRefresh: () => void
  notifications: boolean
  onToggleNotifications: (enabled: boolean) => void
}

export function RealTimeStatus({
  isConnected,
  lastUpdate,
  autoRefresh,
  onToggleAutoRefresh,
  onManualRefresh,
  notifications,
  onToggleNotifications,
}: RealTimeStatusProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleManualRefresh = async () => {
    setRefreshing(true)
    await onManualRefresh()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const marketHours = getMarketHours()
  const timeSinceUpdate = lastUpdate ? Math.floor((currentTime.getTime() - lastUpdate.getTime()) / 1000) : null

  const formatTimeSince = (seconds: number) => {
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            {isConnected ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}
            Real-time Data
          </div>
          <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Last Update:</span>
          <span className="font-mono">{lastUpdate ? formatTimeSince(timeSinceUpdate!) : "Never"}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            <span className="text-xs">Auto</span>
          </div>
          <Switch checked={autoRefresh} onCheckedChange={onToggleAutoRefresh} className="scale-75" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {notifications ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
            <span className="text-xs">Alerts</span>
          </div>
          <Switch checked={notifications} onCheckedChange={onToggleNotifications} className="scale-75" />
        </div>

        <Button
          onClick={handleManualRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="w-full h-7 text-xs bg-transparent"
        >
          {refreshing ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              Manual Refresh
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
