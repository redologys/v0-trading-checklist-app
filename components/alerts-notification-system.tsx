"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Bell,
  Plus,
  Trash2,
  Settings,
  Mail,
  Smartphone,
  Globe,
  TrendingUp,
  TrendingDown,
  Volume2,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { StockData, TechnicalIndicators } from "@/lib/stock-api"

interface AlertsNotificationSystemProps {
  stockData: StockData
  technicalData: TechnicalIndicators
}

interface Alert {
  id: string
  symbol: string
  type: "price" | "technical" | "volume" | "news"
  condition: "above" | "below" | "crosses_above" | "crosses_below" | "equals"
  value: number
  indicator?: string
  message: string
  isActive: boolean
  triggered: boolean
  createdAt: Date
  triggeredAt?: Date
  deliveryMethods: ("email" | "push" | "webhook")[]
}

interface NotificationSettings {
  email: {
    enabled: boolean
    address: string
  }
  push: {
    enabled: boolean
  }
  webhook: {
    enabled: boolean
    url: string
  }
  dailyDigest: {
    enabled: boolean
    time: string
  }
  soundEnabled: boolean
}

interface TriggeredAlert {
  id: string
  alert: Alert
  currentValue: number
  timestamp: Date
  acknowledged: boolean
}

export function AlertsNotificationSystem({ stockData, technicalData }: AlertsNotificationSystemProps) {
  const [activeTab, setActiveTab] = useState("alerts")
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggeredAlert[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)

  // New alert form state
  const [newAlert, setNewAlert] = useState({
    type: "price" as Alert["type"],
    condition: "above" as Alert["condition"],
    value: "",
    indicator: "rsi",
    message: "",
    deliveryMethods: ["push"] as Alert["deliveryMethods"],
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: {
      enabled: false,
      address: "",
    },
    push: {
      enabled: true,
    },
    webhook: {
      enabled: false,
      url: "",
    },
    dailyDigest: {
      enabled: true,
      time: "09:00",
    },
    soundEnabled: true,
  })

  // Check alerts against current data
  useEffect(() => {
    checkAlerts()
  }, [stockData, technicalData, alerts])

  const checkAlerts = useCallback(() => {
    const newTriggeredAlerts: TriggeredAlert[] = []

    alerts.forEach((alert) => {
      if (!alert.isActive || alert.triggered) return

      let currentValue: number
      let shouldTrigger = false

      // Get current value based on alert type
      switch (alert.type) {
        case "price":
          currentValue = stockData.price
          break
        case "volume":
          currentValue = stockData.volume
          break
        case "technical":
          switch (alert.indicator) {
            case "rsi":
              currentValue = technicalData.rsi
              break
            case "sma20":
              currentValue = technicalData.sma20
              break
            case "sma50":
              currentValue = technicalData.sma50
              break
            case "atr":
              currentValue = technicalData.atr
              break
            default:
              currentValue = 0
          }
          break
        default:
          currentValue = 0
      }

      // Check condition
      switch (alert.condition) {
        case "above":
          shouldTrigger = currentValue > alert.value
          break
        case "below":
          shouldTrigger = currentValue < alert.value
          break
        case "equals":
          shouldTrigger = Math.abs(currentValue - alert.value) < alert.value * 0.01 // Within 1%
          break
        case "crosses_above":
          // This would require historical data to implement properly
          shouldTrigger = currentValue > alert.value
          break
        case "crosses_below":
          // This would require historical data to implement properly
          shouldTrigger = currentValue < alert.value
          break
      }

      if (shouldTrigger) {
        // Mark alert as triggered
        setAlerts((prev) =>
          prev.map((a) => (a.id === alert.id ? { ...a, triggered: true, triggeredAt: new Date() } : a)),
        )

        // Add to triggered alerts
        newTriggeredAlerts.push({
          id: Date.now().toString() + Math.random(),
          alert,
          currentValue,
          timestamp: new Date(),
          acknowledged: false,
        })

        // Play sound if enabled
        if (notificationSettings.soundEnabled) {
          // In a real app, you'd play an actual sound
          console.log("🔔 Alert triggered sound")
        }
      }
    })

    if (newTriggeredAlerts.length > 0) {
      setTriggeredAlerts((prev) => [...newTriggeredAlerts, ...prev])
    }
  }, [stockData, technicalData, alerts, notificationSettings.soundEnabled])

  const createAlert = () => {
    if (!newAlert.value || !newAlert.message) return

    const alert: Alert = {
      id: Date.now().toString(),
      symbol: stockData.symbol,
      type: newAlert.type,
      condition: newAlert.condition,
      value: Number.parseFloat(newAlert.value),
      indicator: newAlert.type === "technical" ? newAlert.indicator : undefined,
      message: newAlert.message,
      isActive: true,
      triggered: false,
      createdAt: new Date(),
      deliveryMethods: newAlert.deliveryMethods,
    }

    setAlerts((prev) => [...prev, alert])
    setNewAlert({
      type: "price",
      condition: "above",
      value: "",
      indicator: "rsi",
      message: "",
      deliveryMethods: ["push"],
    })
    setIsCreateDialogOpen(false)
  }

  const deleteAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId))
  }

  const toggleAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, isActive: !a.isActive, triggered: false } : a)))
  }

  const acknowledgeAlert = (triggeredAlertId: string) => {
    setTriggeredAlerts((prev) => prev.map((ta) => (ta.id === triggeredAlertId ? { ...ta, acknowledged: true } : ta)))
  }

  const clearTriggeredAlert = (triggeredAlertId: string) => {
    setTriggeredAlerts((prev) => prev.filter((ta) => ta.id !== triggeredAlertId))
  }

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "price":
        return <TrendingUp className="h-4 w-4" />
      case "technical":
        return <TrendingDown className="h-4 w-4" />
      case "volume":
        return <Volume2 className="h-4 w-4" />
      case "news":
        return <Globe className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getConditionText = (condition: Alert["condition"]) => {
    switch (condition) {
      case "above":
        return "goes above"
      case "below":
        return "goes below"
      case "equals":
        return "equals"
      case "crosses_above":
        return "crosses above"
      case "crosses_below":
        return "crosses below"
      default:
        return condition
    }
  }

  const getAlertDescription = (alert: Alert) => {
    const indicator = alert.type === "technical" ? ` ${alert.indicator?.toUpperCase()}` : ""
    return `${alert.symbol}${indicator} ${getConditionText(alert.condition)} ${alert.value}`
  }

  const unacknowledgedCount = triggeredAlerts.filter((ta) => !ta.acknowledged).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alerts & Notifications
            {unacknowledgedCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unacknowledgedCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Notification Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <Switch
                        id="email-notifications"
                        checked={notificationSettings.email.enabled}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            email: { ...prev.email, enabled: checked },
                          }))
                        }
                      />
                    </div>
                    {notificationSettings.email.enabled && (
                      <Input
                        placeholder="Email address"
                        value={notificationSettings.email.address}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            email: { ...prev.email, address: e.target.value },
                          }))
                        }
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <Switch
                      id="push-notifications"
                      checked={notificationSettings.push.enabled}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          push: { ...prev.push, enabled: checked },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="webhook-notifications">Webhook</Label>
                      <Switch
                        id="webhook-notifications"
                        checked={notificationSettings.webhook.enabled}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            webhook: { ...prev.webhook, enabled: checked },
                          }))
                        }
                      />
                    </div>
                    {notificationSettings.webhook.enabled && (
                      <Input
                        placeholder="Webhook URL"
                        value={notificationSettings.webhook.url}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            webhook: { ...prev.webhook, url: e.target.value },
                          }))
                        }
                      />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="daily-digest">Daily Digest</Label>
                      <Switch
                        id="daily-digest"
                        checked={notificationSettings.dailyDigest.enabled}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            dailyDigest: { ...prev.dailyDigest, enabled: checked },
                          }))
                        }
                      />
                    </div>
                    {notificationSettings.dailyDigest.enabled && (
                      <Input
                        type="time"
                        value={notificationSettings.dailyDigest.time}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            dailyDigest: { ...prev.dailyDigest, time: e.target.value },
                          }))
                        }
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-enabled">Sound Alerts</Label>
                    <Switch
                      id="sound-enabled"
                      checked={notificationSettings.soundEnabled}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          soundEnabled: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New Alert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Alert</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="alert-type">Alert Type</Label>
                      <Select
                        value={newAlert.type}
                        onValueChange={(value: Alert["type"]) => setNewAlert((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="price">Price Alert</SelectItem>
                          <SelectItem value="technical">Technical Indicator</SelectItem>
                          <SelectItem value="volume">Volume Alert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="alert-condition">Condition</Label>
                      <Select
                        value={newAlert.condition}
                        onValueChange={(value: Alert["condition"]) =>
                          setNewAlert((prev) => ({ ...prev, condition: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="above">Goes Above</SelectItem>
                          <SelectItem value="below">Goes Below</SelectItem>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="crosses_above">Crosses Above</SelectItem>
                          <SelectItem value="crosses_below">Crosses Below</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {newAlert.type === "technical" && (
                    <div>
                      <Label htmlFor="indicator">Technical Indicator</Label>
                      <Select
                        value={newAlert.indicator}
                        onValueChange={(value) => setNewAlert((prev) => ({ ...prev, indicator: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rsi">RSI</SelectItem>
                          <SelectItem value="sma20">20-day SMA</SelectItem>
                          <SelectItem value="sma50">50-day SMA</SelectItem>
                          <SelectItem value="atr">ATR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="alert-value">Target Value</Label>
                    <Input
                      id="alert-value"
                      type="number"
                      step="0.01"
                      placeholder="Enter target value"
                      value={newAlert.value}
                      onChange={(e) => setNewAlert((prev) => ({ ...prev, value: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="alert-message">Custom Message</Label>
                    <Textarea
                      id="alert-message"
                      placeholder="Enter alert message"
                      value={newAlert.message}
                      onChange={(e) => setNewAlert((prev) => ({ ...prev, message: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Delivery Methods</Label>
                    <div className="flex gap-2 mt-2">
                      {["push", "email", "webhook"].map((method) => (
                        <Button
                          key={method}
                          variant={newAlert.deliveryMethods.includes(method as any) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const methods = newAlert.deliveryMethods.includes(method as any)
                              ? newAlert.deliveryMethods.filter((m) => m !== method)
                              : [...newAlert.deliveryMethods, method as any]
                            setNewAlert((prev) => ({ ...prev, deliveryMethods: methods }))
                          }}
                        >
                          {method === "push" && <Smartphone className="h-3 w-3 mr-1" />}
                          {method === "email" && <Mail className="h-3 w-3 mr-1" />}
                          {method === "webhook" && <Globe className="h-3 w-3 mr-1" />}
                          {method.charAt(0).toUpperCase() + method.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={createAlert} className="w-full">
                    Create Alert
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alerts">Active Alerts ({alerts.filter((a) => a.isActive).length})</TabsTrigger>
            <TabsTrigger value="triggered">Triggered ({unacknowledgedCount})</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2" />
                  <p>No alerts configured</p>
                  <p className="text-sm">Create your first alert to get notified of market movements</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.type)}
                        <div>
                          <h5 className="font-medium text-sm">{getAlertDescription(alert)}</h5>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.isActive ? "default" : "secondary"}>
                          {alert.isActive ? "Active" : "Paused"}
                        </Badge>
                        {alert.triggered && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Triggered
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Created {alert.createdAt.toLocaleDateString()}
                        </span>
                        <div className="flex gap-1">
                          {alert.deliveryMethods.map((method) => (
                            <Badge key={method} variant="outline" className="text-xs">
                              {method === "push" && <Smartphone className="h-2 w-2 mr-1" />}
                              {method === "email" && <Mail className="h-2 w-2 mr-1" />}
                              {method === "webhook" && <Globe className="h-2 w-2 mr-1" />}
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => toggleAlert(alert.id)}>
                          {alert.isActive ? "Pause" : "Resume"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteAlert(alert.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="triggered" className="space-y-4">
            <div className="space-y-3">
              {triggeredAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No triggered alerts</p>
                  <p className="text-sm">Alerts will appear here when conditions are met</p>
                </div>
              ) : (
                triggeredAlerts.map((triggeredAlert) => (
                  <div
                    key={triggeredAlert.id}
                    className={`rounded-lg p-4 space-y-3 ${
                      triggeredAlert.acknowledged
                        ? "bg-muted/30 border border-muted"
                        : "bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`h-4 w-4 ${
                            triggeredAlert.acknowledged ? "text-muted-foreground" : "text-red-600"
                          }`}
                        />
                        <div>
                          <h5 className="font-medium text-sm">{getAlertDescription(triggeredAlert.alert)}</h5>
                          <p className="text-xs text-muted-foreground">{triggeredAlert.alert.message}</p>
                          <p className="text-xs text-muted-foreground">
                            Current value: {triggeredAlert.currentValue.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={triggeredAlert.acknowledged ? "outline" : "destructive"}>
                          {triggeredAlert.acknowledged ? "Acknowledged" : "New"}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => clearTriggeredAlert(triggeredAlert.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {triggeredAlert.timestamp.toLocaleString()}
                      </span>
                      {!triggeredAlert.acknowledged && (
                        <Button variant="outline" size="sm" onClick={() => acknowledgeAlert(triggeredAlert.id)}>
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Alert History</h4>

              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {alerts.filter((a) => a.triggered).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p>No alert history</p>
                      <p className="text-sm">Triggered alerts will be logged here</p>
                    </div>
                  ) : (
                    alerts
                      .filter((a) => a.triggered)
                      .sort((a, b) => (b.triggeredAt?.getTime() || 0) - (a.triggeredAt?.getTime() || 0))
                      .map((alert) => (
                        <div key={alert.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getAlertIcon(alert.type)}
                              <span className="font-medium text-sm">{getAlertDescription(alert)}</span>
                            </div>
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Triggered
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                          <div className="text-xs text-muted-foreground">
                            Triggered: {alert.triggeredAt?.toLocaleString()}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
