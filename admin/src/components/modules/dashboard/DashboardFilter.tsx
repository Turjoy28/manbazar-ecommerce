"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DashboardFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStart = searchParams.get("start") || ""
  const currentEnd = searchParams.get("end") || ""

  const [preset, setPreset] = useState<string>("all")
  const [customStart, setCustomStart] = useState(currentStart)
  const [customEnd, setCustomEnd] = useState(currentEnd)

  useEffect(() => {
    if (currentStart === "" && currentEnd === "") {
        setPreset("all")
    } else if (currentStart && !currentEnd && preset !== "custom") {
        setPreset("custom")
    }
  }, [currentStart, currentEnd])

  const handlePresetChange = (value: string) => {
    setPreset(value)
    if (value === "custom") return

    let start = ""
    let end = ""

    const now = new Date()
    
    if (value === "today") {
      start = new Date(now.setHours(0, 0, 0, 0)).toISOString()
      end = new Date(now.setHours(23, 59, 59, 999)).toISOString()
    } else if (value === "yesterday") {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      start = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString()
      end = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString()
    } else if (value === "thismonth") {
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      end = new Date().toISOString()
    } else if (value === "lastmonth") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      endOfLastMonth.setHours(23, 59, 59, 999)
      end = endOfLastMonth.toISOString()
    } else if (value === "thisyear") {
      start = new Date(now.getFullYear(), 0, 1).toISOString()
      end = new Date().toISOString()
    } else if (value === "lastyear") {
      start = new Date(now.getFullYear() - 1, 0, 1).toISOString()
      const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31)
      endOfLastYear.setHours(23, 59, 59, 999)
      end = endOfLastYear.toISOString()
    }

    applyFilter(start, end)
  }

  const handleCustomApply = () => {
    if (customStart && customEnd) {
       // Convert YYYY-MM-DD to ISO
       const s = new Date(customStart)
       s.setHours(0, 0, 0, 0)
       const e = new Date(customEnd)
       e.setHours(23, 59, 59, 999)
       applyFilter(s.toISOString(), e.toISOString())
    }
  }

  const applyFilter = (start: string, end: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (start) params.set("start", start)
    else params.delete("start")
    
    if (end) params.set("end", end)
    else params.delete("end")

    router.push(`?${params.toString()}`, { scroll: false })
  }

  const clearFilter = () => {
    setPreset("all")
    setCustomStart("")
    setCustomEnd("")
    applyFilter("", "")
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm mb-6 mx-4 lg:mx-6">
      <div className="flex items-center gap-2 text-slate-500 font-medium">
        <Filter className="w-4 h-4" />
        <span className="text-sm">Filter By:</span>
      </div>
      
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px] h-9 bg-slate-50 border-slate-200 shadow-none">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Lifetime (All Time)</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="thismonth">This Month</SelectItem>
          <SelectItem value="lastmonth">Last Month</SelectItem>
          <SelectItem value="thisyear">This Year</SelectItem>
          <SelectItem value="lastyear">Last Year</SelectItem>
          <SelectItem value="custom">Custom Date Range</SelectItem>
        </SelectContent>
      </Select>

      {preset === "custom" && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-2 h-9 shadow-none">
             <span className="text-xs text-slate-400">From</span>
             <input 
                type="date" 
                value={customStart} 
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-transparent text-sm outline-none w-[110px] text-slate-600"
             />
             <span className="text-xs text-slate-400 border-l border-slate-200 pl-2">To</span>
             <input 
                type="date" 
                value={customEnd} 
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-transparent text-sm outline-none w-[110px] text-slate-600"
             />
          </div>
          <Button size="sm" onClick={handleCustomApply} className="h-9 px-4">Apply</Button>
        </div>
      )}

      {(currentStart || currentEnd) && (
        <Button variant="ghost" size="sm" onClick={clearFilter} className="h-9 text-slate-500 hover:text-red-500 ml-auto">
          <X className="w-4 h-4 mr-1" /> Clear Filter
        </Button>
      )}
    </div>
  )
}
