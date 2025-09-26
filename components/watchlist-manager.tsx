"use client"

import { useState } from "react"
import {
  Star,
  Plus,
  Trash2,
  Search,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  MoreVertical,
  FolderPlus,
  Folder,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface WatchlistManagerProps {
  onSymbolSelect: (symbol: string) => void
  currentSymbol: string
}

interface WatchlistItem {
  id: string
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  addedAt: Date
  notes?: string
  alertsEnabled: boolean
}

interface Watchlist {
  id: string
  name: string
  description?: string
  items: WatchlistItem[]
  isDefault: boolean
  createdAt: Date
}

export function WatchlistManager({ onSymbolSelect, currentSymbol }: WatchlistManagerProps) {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([
    {
      id: "default",
      name: "My Watchlist",
      description: "Default watchlist",
      items: [
        {
          id: "1",
          symbol: "AAPL",
          name: "Apple Inc.",
          price: 255.45,
          change: -1.42,
          changePercent: -0.55,
          volume: 55202075,
          addedAt: new Date(),
          alertsEnabled: true,
        },
        {
          id: "2",
          symbol: "GOOGL",
          name: "Alphabet Inc.",
          price: 2847.32,
          change: 15.67,
          changePercent: 0.55,
          volume: 1234567,
          addedAt: new Date(),
          alertsEnabled: false,
        },
        {
          id: "3",
          symbol: "MSFT",
          name: "Microsoft Corporation",
          price: 412.89,
          change: -2.34,
          changePercent: -0.56,
          volume: 2345678,
          addedAt: new Date(),
          alertsEnabled: true,
        },
      ],
      isDefault: true,
      createdAt: new Date(),
    },
  ])

  const [activeWatchlist, setActiveWatchlist] = useState("default")
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isCreateWatchlistDialogOpen, setIsCreateWatchlistDialogOpen] = useState(false)
  const [newSymbol, setNewSymbol] = useState("")
  const [newWatchlistName, setNewWatchlistName] = useState("")
  const [newWatchlistDescription, setNewWatchlistDescription] = useState("")

  const currentWatchlist = watchlists.find((w) => w.id === activeWatchlist)
  const filteredItems = currentWatchlist?.items.filter(
    (item) =>
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const addToWatchlist = async () => {
    if (!newSymbol.trim()) return

    // In a real app, you'd fetch the stock data
    const newItem: WatchlistItem = {
      id: Date.now().toString(),
      symbol: newSymbol.toUpperCase(),
      name: `${newSymbol.toUpperCase()} Inc.`, // Placeholder
      price: Math.random() * 1000 + 50,
      change: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 10000000),
      addedAt: new Date(),
      alertsEnabled: false,
    }

    setWatchlists((prev) =>
      prev.map((watchlist) =>
        watchlist.id === activeWatchlist ? { ...watchlist, items: [...watchlist.items, newItem] } : watchlist,
      ),
    )

    setNewSymbol("")
    setIsAddDialogOpen(false)
  }

  const removeFromWatchlist = (itemId: string) => {
    setWatchlists((prev) =>
      prev.map((watchlist) =>
        watchlist.id === activeWatchlist
          ? { ...watchlist, items: watchlist.items.filter((item) => item.id !== itemId) }
          : watchlist,
      ),
    )
  }

  const toggleAlerts = (itemId: string) => {
    setWatchlists((prev) =>
      prev.map((watchlist) =>
        watchlist.id === activeWatchlist
          ? {
              ...watchlist,
              items: watchlist.items.map((item) =>
                item.id === itemId ? { ...item, alertsEnabled: !item.alertsEnabled } : item,
              ),
            }
          : watchlist,
      ),
    )
  }

  const createWatchlist = () => {
    if (!newWatchlistName.trim()) return

    const newWatchlist: Watchlist = {
      id: Date.now().toString(),
      name: newWatchlistName,
      description: newWatchlistDescription,
      items: [],
      isDefault: false,
      createdAt: new Date(),
    }

    setWatchlists((prev) => [...prev, newWatchlist])
    setActiveWatchlist(newWatchlist.id)
    setNewWatchlistName("")
    setNewWatchlistDescription("")
    setIsCreateWatchlistDialogOpen(false)
  }

  const deleteWatchlist = (watchlistId: string) => {
    if (watchlists.find((w) => w.id === watchlistId)?.isDefault) return

    setWatchlists((prev) => prev.filter((w) => w.id !== watchlistId))
    if (activeWatchlist === watchlistId) {
      setActiveWatchlist("default")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Watchlists
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isCreateWatchlistDialogOpen} onOpenChange={setIsCreateWatchlistDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Watchlist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="watchlist-name">Watchlist Name</Label>
                    <Input
                      id="watchlist-name"
                      placeholder="Enter watchlist name"
                      value={newWatchlistName}
                      onChange={(e) => setNewWatchlistName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="watchlist-description">Description (Optional)</Label>
                    <Input
                      id="watchlist-description"
                      placeholder="Enter description"
                      value={newWatchlistDescription}
                      onChange={(e) => setNewWatchlistDescription(e.target.value)}
                    />
                  </div>
                  <Button onClick={createWatchlist} className="w-full">
                    Create Watchlist
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Stock
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Stock to Watchlist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="stock-symbol">Stock Symbol</Label>
                    <Input
                      id="stock-symbol"
                      placeholder="Enter stock symbol (e.g., AAPL)"
                      value={newSymbol}
                      onChange={(e) => setNewSymbol(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addToWatchlist()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="target-watchlist">Add to Watchlist</Label>
                    <Select value={activeWatchlist} onValueChange={setActiveWatchlist}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {watchlists.map((watchlist) => (
                          <SelectItem key={watchlist.id} value={watchlist.id}>
                            <div className="flex items-center gap-2">
                              <Folder className="h-3 w-3" />
                              {watchlist.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addToWatchlist} className="w-full">
                    Add to Watchlist
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeWatchlist} onValueChange={setActiveWatchlist} className="space-y-4">
          <TabsList className="grid w-full grid-cols-1">
            <div className="flex gap-1 overflow-x-auto">
              {watchlists.map((watchlist) => (
                <TabsTrigger key={watchlist.id} value={watchlist.id} className="flex items-center gap-2">
                  <Folder className="h-3 w-3" />
                  {watchlist.name}
                  <Badge variant="outline" className="ml-1">
                    {watchlist.items.length}
                  </Badge>
                </TabsTrigger>
              ))}
            </div>
          </TabsList>

          {watchlists.map((watchlist) => (
            <TabsContent key={watchlist.id} value={watchlist.id} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search stocks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {!watchlist.isDefault && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => deleteWatchlist(watchlist.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Watchlist
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredItems?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Star className="h-8 w-8 mx-auto mb-2" />
                      <p>No stocks in this watchlist</p>
                      <p className="text-sm">Add stocks to start tracking them</p>
                    </div>
                  ) : (
                    filteredItems?.map((item) => (
                      <div
                        key={item.id}
                        className={`bg-muted/50 rounded-lg p-3 space-y-2 cursor-pointer transition-colors hover:bg-muted/70 ${
                          currentSymbol === item.symbol ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => onSymbolSelect(item.symbol)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium text-sm">{item.symbol}</div>
                              <div className="text-xs text-muted-foreground">{item.name}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={item.change >= 0 ? "default" : "destructive"}
                              className="flex items-center gap-1"
                            >
                              {item.change >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {item.changePercent.toFixed(2)}%
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => toggleAlerts(item.id)}>
                                  {item.alertsEnabled ? (
                                    <>
                                      <EyeOff className="h-4 w-4 mr-2" />
                                      Disable Alerts
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Enable Alerts
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => removeFromWatchlist(item.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Price</div>
                            <div className="font-medium">${item.price.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Change</div>
                            <div className={`font-medium ${item.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {item.change >= 0 ? "+" : ""}${item.change.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Volume</div>
                            <div className="font-medium">{item.volume.toLocaleString()}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Added {item.addedAt.toLocaleDateString()}</span>
                          {item.alertsEnabled && (
                            <Badge variant="outline" className="text-xs">
                              <Eye className="h-2 w-2 mr-1" />
                              Alerts On
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
