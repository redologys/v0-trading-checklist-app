"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface StockSearchProps {
  onSymbolSelect: (symbol: string) => void
  currentSymbol?: string
}

export function StockSearch({ onSymbolSelect, currentSymbol }: StockSearchProps) {
  const [symbol, setSymbol] = useState(currentSymbol || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (symbol.trim()) {
      onSymbolSelect(symbol.trim().toUpperCase())
    }
  }

  const popularStocks = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "NVDA", "META", "SPY"]

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Enter stock symbol (e.g., AAPL)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="pl-10"
          />
        </div>
        <Button type="submit" className="px-6">
          Analyze
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground">Popular:</span>
        {popularStocks.map((stock) => (
          <Button
            key={stock}
            variant="outline"
            size="sm"
            onClick={() => onSymbolSelect(stock)}
            className="h-7 px-3 text-xs"
          >
            {stock}
          </Button>
        ))}
      </div>
    </div>
  )
}
