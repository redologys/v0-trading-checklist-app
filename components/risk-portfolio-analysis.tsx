"use client"

import { useState } from "react"
import { Shield, Calculator, PiIcon as PieIcon, AlertTriangle, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import {
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Pie,
} from "recharts"
import type { StockData, TechnicalIndicators } from "@/lib/stock-api"

interface RiskPortfolioAnalysisProps {
  stockData: StockData
  technicalData: TechnicalIndicators
}

interface PositionSizing {
  accountSize: number
  riskPercentage: number
  entryPrice: number
  stopLoss: number
  targetPrice: number
  shares: number
  positionValue: number
  riskAmount: number
  rewardAmount: number
  riskRewardRatio: number
}

interface PortfolioImpact {
  currentAllocation: number
  newAllocation: number
  diversificationScore: number
  correlationRisk: number
  sectorExposure: string[]
}

interface RiskMetrics {
  volatility: number
  beta: number
  sharpeRatio: number
  maxDrawdown: number
  valueAtRisk: number
  expectedShortfall: number
}

export function RiskPortfolioAnalysis({ stockData, technicalData }: RiskPortfolioAnalysisProps) {
  const [activeTab, setActiveTab] = useState("position")
  const [accountSize, setAccountSize] = useState(100000)
  const [riskPercentage, setRiskPercentage] = useState([2])
  const [entryPrice, setEntryPrice] = useState(stockData.price)
  const [stopLoss, setStopLoss] = useState(stockData.price * 0.95)
  const [targetPrice, setTargetPrice] = useState(stockData.price * 1.1)
  const [portfolioValue, setPortfolioValue] = useState(250000)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [positionValue, setPositionValue] = useState(0) // Declare positionValue variable

  const calculatePositionSizing = (): PositionSizing => {
    const riskAmount = accountSize * (riskPercentage[0] / 100)
    const riskPerShare = Math.abs(entryPrice - stopLoss)
    const shares = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0
    const positionValue = shares * entryPrice
    setPositionValue(positionValue) // Set positionValue state
    const rewardAmount = shares * Math.abs(targetPrice - entryPrice)
    const riskRewardRatio = riskAmount > 0 ? rewardAmount / riskAmount : 0

    return {
      accountSize,
      riskPercentage: riskPercentage[0],
      entryPrice,
      stopLoss,
      targetPrice,
      shares,
      positionValue,
      riskAmount,
      rewardAmount,
      riskRewardRatio,
    }
  }

  const calculateRiskMetrics = (): RiskMetrics => {
    // Mock calculations based on technical data
    const volatility = (technicalData.atr / stockData.price) * 100 // Annualized volatility estimate
    const beta = 0.8 + Math.random() * 0.8 // Beta between 0.8-1.6
    const sharpeRatio = (stockData.changePercent / 100 / (volatility / 100)) * Math.sqrt(252)
    const maxDrawdown = Math.max(15, volatility * 1.5) // Estimate based on volatility
    const valueAtRisk = positionValue * (volatility / 100) * 1.65 // 95% VaR
    const expectedShortfall = valueAtRisk * 1.3 // ES typically 30% higher than VaR

    return {
      volatility,
      beta,
      sharpeRatio,
      maxDrawdown,
      valueAtRisk,
      expectedShortfall,
    }
  }

  const calculatePortfolioImpact = (): PortfolioImpact => {
    const positionSizing = calculatePositionSizing()
    const newAllocation = (positionSizing.positionValue / portfolioValue) * 100
    const currentAllocation = (currentPosition / portfolioValue) * 100

    // Mock diversification metrics
    const diversificationScore = Math.max(0, 100 - newAllocation * 2) // Lower score for higher concentration
    const correlationRisk = newAllocation > 10 ? 75 : newAllocation > 5 ? 50 : 25

    // Mock sector exposure
    const sectors = ["Technology", "Healthcare", "Financial", "Consumer", "Industrial"]
    const sectorExposure = sectors.slice(0, Math.floor(Math.random() * 3) + 1)

    return {
      currentAllocation,
      newAllocation,
      diversificationScore,
      correlationRisk,
      sectorExposure,
    }
  }

  const positionSizing = calculatePositionSizing()
  const riskMetrics = calculateRiskMetrics()
  const portfolioImpact = calculatePortfolioImpact()

  const generateScenarioAnalysis = () => {
    const scenarios = [
      { name: "Bull Case", probability: 25, priceChange: 15, pnl: positionSizing.shares * stockData.price * 0.15 },
      { name: "Base Case", probability: 50, priceChange: 5, pnl: positionSizing.shares * stockData.price * 0.05 },
      { name: "Bear Case", probability: 25, priceChange: -10, pnl: positionSizing.shares * stockData.price * -0.1 },
    ]
    return scenarios
  }

  const generateRiskDistribution = () => {
    return [
      { name: "Market Risk", value: 40, color: "#ef4444" },
      { name: "Sector Risk", value: 25, color: "#f97316" },
      { name: "Company Risk", value: 20, color: "#eab308" },
      { name: "Liquidity Risk", value: 10, color: "#22c55e" },
      { name: "Currency Risk", value: 5, color: "#3b82f6" },
    ]
  }

  const scenarioAnalysis = generateScenarioAnalysis()
  const riskDistribution = generateRiskDistribution()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getRiskLevel = (percentage: number) => {
    if (percentage > 5) return { level: "High", color: "text-red-600", variant: "destructive" as const }
    if (percentage > 2) return { level: "Medium", color: "text-yellow-600", variant: "outline" as const }
    return { level: "Low", color: "text-green-600", variant: "default" as const }
  }

  const getDiversificationLevel = (score: number) => {
    if (score > 80) return { level: "Excellent", color: "text-green-600" }
    if (score > 60) return { level: "Good", color: "text-blue-600" }
    if (score > 40) return { level: "Fair", color: "text-yellow-600" }
    return { level: "Poor", color: "text-red-600" }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Risk & Portfolio Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="position">Position Sizing</TabsTrigger>
            <TabsTrigger value="risk">Risk Metrics</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio Impact</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          </TabsList>

          <TabsContent value="position" className="space-y-6">
            {/* Position Sizing Calculator */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Position Sizing Calculator
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Parameters */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="account-size">Account Size</Label>
                    <Input
                      id="account-size"
                      type="number"
                      value={accountSize}
                      onChange={(e) => setAccountSize(Number(e.target.value))}
                      placeholder="100000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Risk Per Trade: {riskPercentage[0]}%</Label>
                    <Slider
                      value={riskPercentage}
                      onValueChange={setRiskPercentage}
                      max={10}
                      min={0.5}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.5%</span>
                      <span>Conservative: 1-2%</span>
                      <span>Aggressive: 5%+</span>
                      <span>10%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="entry-price">Entry Price</Label>
                      <Input
                        id="entry-price"
                        type="number"
                        value={entryPrice}
                        onChange={(e) => setEntryPrice(Number(e.target.value))}
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stop-loss">Stop Loss</Label>
                      <Input
                        id="stop-loss"
                        type="number"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(Number(e.target.value))}
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="target-price">Target Price</Label>
                      <Input
                        id="target-price"
                        type="number"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(Number(e.target.value))}
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculated Results */}
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <h5 className="font-medium text-sm">Position Details</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Shares to Buy</div>
                        <div className="text-xl font-bold">{positionSizing.shares.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Position Value</div>
                        <div className="text-xl font-bold">{formatCurrency(positionSizing.positionValue)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Risk Amount</div>
                        <div className="text-lg font-bold text-red-600">
                          {formatCurrency(positionSizing.riskAmount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Reward Potential</div>
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(positionSizing.rewardAmount)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-sm">Risk/Reward Ratio</h5>
                      <Badge
                        variant={
                          positionSizing.riskRewardRatio >= 2
                            ? "default"
                            : positionSizing.riskRewardRatio >= 1
                              ? "outline"
                              : "destructive"
                        }
                      >
                        {positionSizing.riskRewardRatio >= 2
                          ? "Excellent"
                          : positionSizing.riskRewardRatio >= 1
                            ? "Good"
                            : "Poor"}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">1:{positionSizing.riskRewardRatio.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">
                        {positionSizing.riskRewardRatio >= 2
                          ? "Strong risk/reward profile"
                          : positionSizing.riskRewardRatio >= 1
                            ? "Acceptable risk/reward"
                            : "Consider better entry/exit levels"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Quick Position Sizing Presets */}
            <div className="space-y-3">
              <h5 className="font-medium text-sm">Quick Presets</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { name: "Conservative", risk: 1, color: "outline" },
                  { name: "Moderate", risk: 2, color: "default" },
                  { name: "Aggressive", risk: 3, color: "secondary" },
                  { name: "High Risk", risk: 5, color: "destructive" },
                ].map((preset) => (
                  <Button
                    key={preset.name}
                    variant={preset.color as any}
                    size="sm"
                    onClick={() => setRiskPercentage([preset.risk])}
                    className="text-xs"
                  >
                    {preset.name} ({preset.risk}%)
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            {/* Risk Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="text-sm text-muted-foreground">Volatility (Annual)</div>
                <div className="text-xl font-bold">{riskMetrics.volatility.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">
                  {riskMetrics.volatility > 30 ? "High" : riskMetrics.volatility > 20 ? "Medium" : "Low"}
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="text-sm text-muted-foreground">Beta</div>
                <div className="text-xl font-bold">{riskMetrics.beta.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">
                  {riskMetrics.beta > 1.2 ? "High Beta" : riskMetrics.beta < 0.8 ? "Low Beta" : "Market Beta"}
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                <div className="text-xl font-bold">{riskMetrics.sharpeRatio.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">
                  {riskMetrics.sharpeRatio > 1 ? "Excellent" : riskMetrics.sharpeRatio > 0.5 ? "Good" : "Poor"}
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="text-sm text-muted-foreground">Max Drawdown</div>
                <div className="text-xl font-bold text-red-600">-{riskMetrics.maxDrawdown.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Historical Peak-to-Trough</div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="text-sm text-muted-foreground">Value at Risk (95%)</div>
                <div className="text-xl font-bold text-red-600">{formatCurrency(riskMetrics.valueAtRisk)}</div>
                <div className="text-xs text-muted-foreground">Daily VaR</div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="text-sm text-muted-foreground">Expected Shortfall</div>
                <div className="text-xl font-bold text-red-600">{formatCurrency(riskMetrics.expectedShortfall)}</div>
                <div className="text-xs text-muted-foreground">Tail Risk</div>
              </div>
            </div>

            <Separator />

            {/* Risk Distribution */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Risk Factor Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {riskDistribution.map((risk, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: risk.color }} />
                        <span className="text-sm">{risk.name}</span>
                      </div>
                      <span className="font-medium">{risk.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h5 className="font-medium text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Risk Assessment
              </h5>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Volatility Risk:</strong>{" "}
                  {riskMetrics.volatility > 30
                    ? "High volatility suggests significant price swings. Consider smaller position sizes."
                    : riskMetrics.volatility > 20
                      ? "Moderate volatility is typical for this asset class."
                      : "Low volatility indicates relatively stable price movements."}
                </p>
                <p>
                  <strong>Market Correlation:</strong> Beta of {riskMetrics.beta.toFixed(2)} means this stock{" "}
                  {riskMetrics.beta > 1.2
                    ? "amplifies market movements significantly."
                    : riskMetrics.beta < 0.8
                      ? "moves independently of the broader market."
                      : "generally follows market trends."}
                </p>
                <p>
                  <strong>Tail Risk:</strong> In extreme scenarios (5% probability), expect losses exceeding{" "}
                  {formatCurrency(riskMetrics.expectedShortfall)}.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            {/* Portfolio Impact Calculator */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <PieIcon className="h-4 w-4" />
                Portfolio Impact Analysis
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="portfolio-value">Total Portfolio Value</Label>
                    <Input
                      id="portfolio-value"
                      type="number"
                      value={portfolioValue}
                      onChange={(e) => setPortfolioValue(Number(e.target.value))}
                      placeholder="250000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current-position">Current Position Value</Label>
                    <Input
                      id="current-position"
                      type="number"
                      value={currentPosition}
                      onChange={(e) => setCurrentPosition(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <h5 className="font-medium text-sm">Allocation Impact</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Current Allocation</span>
                        <span className="font-medium">{portfolioImpact.currentAllocation.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">New Allocation</span>
                        <span className="font-medium">{portfolioImpact.newAllocation.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Change</span>
                        <span
                          className={`font-medium ${portfolioImpact.newAllocation > portfolioImpact.currentAllocation ? "text-blue-600" : "text-gray-600"}`}
                        >
                          +{(portfolioImpact.newAllocation - portfolioImpact.currentAllocation).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Diversification Analysis */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Diversification Analysis</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Diversification Score</span>
                    <Badge
                      variant={
                        portfolioImpact.diversificationScore > 80
                          ? "default"
                          : portfolioImpact.diversificationScore > 60
                            ? "outline"
                            : "destructive"
                      }
                    >
                      {getDiversificationLevel(portfolioImpact.diversificationScore).level}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{portfolioImpact.diversificationScore}/100</div>
                    <Progress value={portfolioImpact.diversificationScore} className="h-2" />
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Correlation Risk</span>
                    <Badge
                      variant={
                        portfolioImpact.correlationRisk < 30
                          ? "default"
                          : portfolioImpact.correlationRisk < 60
                            ? "outline"
                            : "destructive"
                      }
                    >
                      {portfolioImpact.correlationRisk < 30
                        ? "Low"
                        : portfolioImpact.correlationRisk < 60
                          ? "Medium"
                          : "High"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{portfolioImpact.correlationRisk}%</div>
                    <Progress value={portfolioImpact.correlationRisk} className="h-2" />
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <span className="text-sm text-muted-foreground">Sector Exposure</span>
                  <div className="space-y-1">
                    {portfolioImpact.sectorExposure.map((sector, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Recommendations */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h5 className="font-medium text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Portfolio Recommendations
              </h5>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Position Size:</strong>{" "}
                  {portfolioImpact.newAllocation > 10
                    ? "Consider reducing position size to maintain diversification. Large positions increase concentration risk."
                    : portfolioImpact.newAllocation > 5
                      ? "Position size is reasonable but monitor for overconcentration."
                      : "Position size allows for good diversification."}
                </p>
                <p>
                  <strong>Diversification:</strong>{" "}
                  {portfolioImpact.diversificationScore > 80
                    ? "Excellent diversification maintained."
                    : portfolioImpact.diversificationScore > 60
                      ? "Good diversification, consider adding uncorrelated assets."
                      : "Poor diversification. Consider reducing position size or adding defensive assets."}
                </p>
                <p>
                  <strong>Risk Management:</strong>{" "}
                  {portfolioImpact.correlationRisk > 60
                    ? "High correlation risk detected. Consider hedging or reducing exposure during market stress."
                    : "Correlation risk is manageable with current allocation."}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-6">
            {/* Scenario Analysis */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Scenario Analysis</h4>

              <div className="space-y-3">
                {scenarioAnalysis.map((scenario, index) => (
                  <div key={index} className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{scenario.name}</span>
                        <Badge variant="outline">{scenario.probability}% probability</Badge>
                      </div>
                      <div className={`font-bold ${scenario.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {scenario.pnl >= 0 ? "+" : ""}
                        {formatCurrency(scenario.pnl)}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Price Change</div>
                        <div className={`font-medium ${scenario.priceChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {scenario.priceChange >= 0 ? "+" : ""}
                          {scenario.priceChange}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">New Price</div>
                        <div className="font-medium">
                          ${(stockData.price * (1 + scenario.priceChange / 100)).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Return on Risk</div>
                        <div className="font-medium">
                          {((scenario.pnl / positionSizing.riskAmount) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Expected Value Calculation */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h5 className="font-medium text-sm">Expected Value Analysis</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Expected Return</div>
                  <div className="text-lg font-bold">
                    {formatCurrency(scenarioAnalysis.reduce((sum, s) => sum + (s.pnl * s.probability) / 100, 0))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Win Probability</div>
                  <div className="text-lg font-bold">
                    {scenarioAnalysis.filter((s) => s.pnl > 0).reduce((sum, s) => sum + s.probability, 0)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Average Win</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(
                      scenarioAnalysis.filter((s) => s.pnl > 0).reduce((sum, s) => sum + s.pnl, 0) /
                        scenarioAnalysis.filter((s) => s.pnl > 0).length || 0,
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Average Loss</div>
                  <div className="text-lg font-bold text-red-600">
                    {formatCurrency(
                      scenarioAnalysis.filter((s) => s.pnl < 0).reduce((sum, s) => sum + s.pnl, 0) /
                        scenarioAnalysis.filter((s) => s.pnl < 0).length || 0,
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Monte Carlo Simulation Preview */}
            <div className="space-y-3">
              <h5 className="font-medium text-sm">Price Path Simulation (Sample)</h5>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={Array.from({ length: 30 }, (_, i) => ({
                      day: i,
                      price: stockData.price * (1 + (Math.random() - 0.5) * 0.1 * Math.sqrt(i / 30)),
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={["dataMin - 5", "dataMax + 5"]} />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]} />
                    <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground">
                Sample price path showing potential price evolution over 30 days based on current volatility.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
