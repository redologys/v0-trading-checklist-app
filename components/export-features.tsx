"use client"

import { useState } from "react"
import { Download, FileText, ImageIcon, Share2, Copy, Mail, Printer, BarChart3, Settings, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import type { StockData, TechnicalIndicators } from "@/lib/stock-api"

interface ExportFeaturesProps {
  stockData: StockData
  technicalData: TechnicalIndicators
}

interface ExportSettings {
  format: "pdf" | "csv" | "json" | "png"
  includeCharts: boolean
  includeAnalysis: boolean
  includeTechnicals: boolean
  includeAlerts: boolean
  dateRange: "today" | "week" | "month" | "custom"
  customStartDate?: string
  customEndDate?: string
}

export function ExportFeatures({ stockData, technicalData }: ExportFeaturesProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: "pdf",
    includeCharts: true,
    includeAnalysis: true,
    includeTechnicals: true,
    includeAlerts: false,
    dateRange: "today",
  })
  const [isExporting, setIsExporting] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [copied, setCopied] = useState(false)

  const generateReport = async () => {
    setIsExporting(true)

    try {
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const reportData = {
        symbol: stockData.symbol,
        timestamp: new Date().toISOString(),
        price: stockData.price,
        change: stockData.change,
        changePercent: stockData.changePercent,
        volume: stockData.volume,
        technicalIndicators: exportSettings.includeTechnicals
          ? {
              rsi: technicalData.rsi,
              sma20: technicalData.sma20,
              sma50: technicalData.sma50,
              atr: technicalData.atr,
            }
          : undefined,
        analysis: exportSettings.includeAnalysis
          ? {
              trend: technicalData.rsi > 50 ? "Bullish" : "Bearish",
              momentum: technicalData.rsi > 70 ? "Overbought" : technicalData.rsi < 30 ? "Oversold" : "Neutral",
              support: (stockData.price * 0.95).toFixed(2),
              resistance: (stockData.price * 1.05).toFixed(2),
            }
          : undefined,
      }

      // In a real app, this would generate actual files
      switch (exportSettings.format) {
        case "pdf":
          downloadFile(
            `data:application/pdf;base64,${btoa("PDF Report Content")}`,
            `${stockData.symbol}_report_${new Date().toISOString().split("T")[0]}.pdf`,
          )
          break
        case "csv":
          const csvContent = generateCSV(reportData)
          downloadFile(
            `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`,
            `${stockData.symbol}_data_${new Date().toISOString().split("T")[0]}.csv`,
          )
          break
        case "json":
          downloadFile(
            `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(reportData, null, 2))}`,
            `${stockData.symbol}_data_${new Date().toISOString().split("T")[0]}.json`,
          )
          break
        case "png":
          // In a real app, this would capture a screenshot
          downloadFile(
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            `${stockData.symbol}_chart_${new Date().toISOString().split("T")[0]}.png`,
          )
          break
      }

      setIsExportDialogOpen(false)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const generateCSV = (data: any) => {
    const headers = ["Symbol", "Price", "Change", "Change%", "Volume", "RSI", "SMA20", "SMA50", "ATR"]
    const values = [
      data.symbol,
      data.price,
      data.change,
      data.changePercent,
      data.volume,
      data.technicalIndicators?.rsi || "",
      data.technicalIndicators?.sma20 || "",
      data.technicalIndicators?.sma50 || "",
      data.technicalIndicators?.atr || "",
    ]
    return [headers.join(","), values.join(",")].join("\n")
  }

  const downloadFile = (dataUrl: string, filename: string) => {
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generateShareUrl = () => {
    const params = new URLSearchParams({
      symbol: stockData.symbol,
      price: stockData.price.toString(),
      change: stockData.changePercent.toFixed(2),
    })
    const url = `${window.location.origin}?${params.toString()}`
    setShareUrl(url)
    return url
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const shareViaEmail = () => {
    const subject = `Trading Analysis: ${stockData.symbol}`
    const body = `Check out this trading analysis for ${stockData.symbol}:

Current Price: $${stockData.price.toFixed(2)}
Change: ${stockData.change >= 0 ? "+" : ""}${stockData.change.toFixed(2)} (${stockData.changePercent.toFixed(2)}%)
Volume: ${stockData.volume.toLocaleString()}

RSI: ${technicalData.rsi.toFixed(1)}
20-day SMA: $${technicalData.sma20.toFixed(2)}
50-day SMA: $${technicalData.sma50.toFixed(2)}

View full analysis: ${generateShareUrl()}`

    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  const printReport = () => {
    window.print()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export & Share
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Quick Export Buttons */}
          <Button
            variant="outline"
            onClick={() => {
              setExportSettings({ ...exportSettings, format: "csv" })
              generateReport()
            }}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setExportSettings({ ...exportSettings, format: "json" })
              generateReport()
            }}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Export JSON
          </Button>

          <Button variant="outline" onClick={printReport} className="flex items-center gap-2 bg-transparent">
            <Printer className="h-4 w-4" />
            Print
          </Button>

          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Analysis</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Share URL</Label>
                  <div className="flex gap-2">
                    <Input value={generateShareUrl()} readOnly />
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(generateShareUrl())}
                      className="flex items-center gap-2"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={shareViaEmail} className="flex items-center gap-2 bg-transparent">
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `Trading Analysis: ${stockData.symbol}`,
                          text: `${stockData.symbol} is at $${stockData.price.toFixed(2)} (${stockData.changePercent.toFixed(2)}%)`,
                          url: generateShareUrl(),
                        })
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Native Share
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Quick Share Text</Label>
                  <Textarea
                    value={`${stockData.symbol}: $${stockData.price.toFixed(2)} (${stockData.changePercent >= 0 ? "+" : ""}${stockData.changePercent.toFixed(2)}%) | RSI: ${technicalData.rsi.toFixed(1)} | Volume: ${stockData.volume.toLocaleString()}`}
                    readOnly
                    rows={3}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-4">
          <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Advanced Export
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Export Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="export-format">Export Format</Label>
                  <Select
                    value={exportSettings.format}
                    onValueChange={(value: ExportSettings["format"]) =>
                      setExportSettings({ ...exportSettings, format: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="csv">CSV Data</SelectItem>
                      <SelectItem value="json">JSON Data</SelectItem>
                      <SelectItem value="png">PNG Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date-range">Date Range</Label>
                  <Select
                    value={exportSettings.dateRange}
                    onValueChange={(value: ExportSettings["dateRange"]) =>
                      setExportSettings({ ...exportSettings, dateRange: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {exportSettings.dateRange === "custom" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={exportSettings.customStartDate || ""}
                        onChange={(e) => setExportSettings({ ...exportSettings, customStartDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={exportSettings.customEndDate || ""}
                        onChange={(e) => setExportSettings({ ...exportSettings, customEndDate: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label>Include in Export</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-charts">Charts & Visuals</Label>
                      <Switch
                        id="include-charts"
                        checked={exportSettings.includeCharts}
                        onCheckedChange={(checked) => setExportSettings({ ...exportSettings, includeCharts: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-analysis">Analysis & Insights</Label>
                      <Switch
                        id="include-analysis"
                        checked={exportSettings.includeAnalysis}
                        onCheckedChange={(checked) =>
                          setExportSettings({ ...exportSettings, includeAnalysis: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-technicals">Technical Indicators</Label>
                      <Switch
                        id="include-technicals"
                        checked={exportSettings.includeTechnicals}
                        onCheckedChange={(checked) =>
                          setExportSettings({ ...exportSettings, includeTechnicals: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-alerts">Alerts & Notifications</Label>
                      <Switch
                        id="include-alerts"
                        checked={exportSettings.includeAlerts}
                        onCheckedChange={(checked) => setExportSettings({ ...exportSettings, includeAlerts: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={generateReport} disabled={isExporting} className="w-full">
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate Export
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Export History */}
        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-sm">Recent Exports</h4>
          <div className="space-y-2">
            {[
              {
                name: `${stockData.symbol}_report_${new Date().toISOString().split("T")[0]}.pdf`,
                type: "PDF",
                size: "2.3 MB",
                date: new Date(),
              },
              {
                name: `${stockData.symbol}_data_${new Date(Date.now() - 86400000).toISOString().split("T")[0]}.csv`,
                type: "CSV",
                size: "45 KB",
                date: new Date(Date.now() - 86400000),
              },
            ].map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded">
                    {file.type === "PDF" ? (
                      <FileText className="h-4 w-4" />
                    ) : file.type === "CSV" ? (
                      <BarChart3 className="h-4 w-4" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {file.size} • {file.date.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{file.type}</Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
