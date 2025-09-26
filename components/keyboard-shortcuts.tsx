"use client"

import { useEffect, useState } from "react"
import { Keyboard, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface KeyboardShortcutsProps {
  onRefresh?: () => void
  onToggleAutoRefresh?: () => void
  onExport?: () => void
  onShare?: () => void
}

interface Shortcut {
  keys: string[]
  description: string
  category: string
  action?: () => void
}

export function KeyboardShortcuts({ onRefresh, onToggleAutoRefresh, onExport, onShare }: KeyboardShortcutsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const shortcuts: Shortcut[] = [
    // Navigation
    { keys: ["?"], description: "Show keyboard shortcuts", category: "Navigation" },
    { keys: ["Esc"], description: "Close dialogs/modals", category: "Navigation" },
    { keys: ["Tab"], description: "Navigate between elements", category: "Navigation" },

    // Data Actions
    { keys: ["R"], description: "Refresh data", category: "Data", action: onRefresh },
    { keys: ["Ctrl", "R"], description: "Toggle auto-refresh", category: "Data", action: onToggleAutoRefresh },
    { keys: ["Ctrl", "E"], description: "Export data", category: "Data", action: onExport },
    { keys: ["Ctrl", "S"], description: "Share analysis", category: "Data", action: onShare },

    // Search & Selection
    { keys: ["Ctrl", "F"], description: "Search stocks", category: "Search" },
    { keys: ["Ctrl", "K"], description: "Quick command palette", category: "Search" },

    // View Controls
    { keys: ["1"], description: "Switch to Overview", category: "Views" },
    { keys: ["2"], description: "Switch to Technical Analysis", category: "Views" },
    { keys: ["3"], description: "Switch to Alerts", category: "Views" },
    { keys: ["4"], description: "Switch to AI Coach", category: "Views" },

    // Quick Actions
    { keys: ["A"], description: "Create new alert", category: "Quick Actions" },
    { keys: ["W"], description: "Add to watchlist", category: "Quick Actions" },
    { keys: ["P"], description: "Print current view", category: "Quick Actions" },
  ]

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return
      }

      const key = event.key.toLowerCase()
      const ctrl = event.ctrlKey || event.metaKey
      const shift = event.shiftKey
      const alt = event.altKey

      // Handle specific shortcuts
      switch (key) {
        case "?":
          if (!shift) {
            event.preventDefault()
            setIsDialogOpen(true)
          }
          break

        case "escape":
          event.preventDefault()
          setIsDialogOpen(false)
          break

        case "r":
          if (ctrl) {
            event.preventDefault()
            onToggleAutoRefresh?.()
            showToastMessage("Auto-refresh toggled")
          } else {
            event.preventDefault()
            onRefresh?.()
            showToastMessage("Data refreshed")
          }
          break

        case "e":
          if (ctrl) {
            event.preventDefault()
            onExport?.()
            showToastMessage("Export dialog opened")
          }
          break

        case "s":
          if (ctrl) {
            event.preventDefault()
            onShare?.()
            showToastMessage("Share dialog opened")
          }
          break

        case "f":
          if (ctrl) {
            event.preventDefault()
            // Focus search input if available
            const searchInput = document.querySelector('input[placeholder*="search" i]') as HTMLInputElement
            if (searchInput) {
              searchInput.focus()
              showToastMessage("Search focused")
            }
          }
          break

        case "p":
          if (!ctrl) {
            event.preventDefault()
            window.print()
            showToastMessage("Print dialog opened")
          }
          break

        case "1":
        case "2":
        case "3":
        case "4":
          if (!ctrl && !alt) {
            event.preventDefault()
            const views = ["Overview", "Technical", "Alerts", "AI Coach"]
            showToastMessage(`Switched to ${views[Number.parseInt(key) - 1]}`)
          }
          break

        case "a":
          if (!ctrl) {
            event.preventDefault()
            showToastMessage("Create alert shortcut triggered")
          }
          break

        case "w":
          if (!ctrl) {
            event.preventDefault()
            showToastMessage("Add to watchlist shortcut triggered")
          }
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onRefresh, onToggleAutoRefresh, onExport, onShare])

  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = []
      }
      acc[shortcut.category].push(shortcut)
      return acc
    },
    {} as Record<string, Shortcut[]>,
  )

  const formatKeys = (keys: string[]) => {
    return keys.map((key, index) => (
      <span key={index}>
        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
          {key}
        </kbd>
        {index < keys.length - 1 && <span className="mx-1">+</span>}
      </span>
    ))
  }

  return (
    <>
      {/* Keyboard Shortcuts Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-50 bg-transparent">
            <Keyboard className="h-4 w-4 mr-1" />
            Shortcuts
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category}>
                  <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <span className="text-sm">{shortcut.description}</span>
                        <div className="flex items-center gap-1">{formatKeys(shortcut.keys)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">?</kbd> to toggle this dialog
            </div>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-1" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-20 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <Card className="shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                <span className="text-sm">{toastMessage}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
