"use client"
import React from "react"

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Package, CheckCircle, Clock, MapPin, Box, Layers, DollarSign, ListOrdered, Palette } from "lucide-react"

export interface SectionCardsProps {
  stats?: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalProducts: number;
    thisMonthOrders: number;
    thisMonthRevenue: number;
    ordersByLocation: { location: string; count: number }[];
    mostOrderedItems: { name: string; count: number }[];
    inventory: {
      totalStockUnits: number;
      totalStockValue: number;
      stockByCategory: {
        category: string;
        totalItems: number;
        products: {
          name: string;
          stock: number;
          sizes: string[];
          colors: { color: string; stock: number }[];
        }[];
      }[];
    };
  };
}

export function SectionCards({ stats }: SectionCardsProps) {
  if (!stats) return null;

  const {
    totalOrders,
    totalRevenue,
    thisMonthOrders,
    thisMonthRevenue,
    totalProducts,
    ordersByLocation,
    mostOrderedItems,
    inventory,
    pendingOrders,
    deliveredOrders
  } = stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 lg:px-6 mb-6">
      
      {/* ─── ROW 1: CORE METRICS ───────────────────────────────── */}
      <Card className="shadow-xs border-indigo-100/50 bg-white dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
          <CardDescription className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Sales</CardDescription>
          <div className="p-2 bg-indigo-50 rounded-lg">
            <DollarSign className="h-4 w-4 text-indigo-500" />
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
            ৳{thisMonthRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 font-medium">This Month</p>
          <div className="mt-4 text-xs text-slate-500 border-t border-slate-100 pt-3 flex justify-between">
            <span>Lifetime:</span>
            <span className="font-semibold text-slate-600">৳{totalRevenue.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs border-emerald-100/50 bg-white dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
          <CardDescription className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Orders</CardDescription>
          <div className="p-2 bg-emerald-50 rounded-lg">
            <ShoppingBag className="h-4 w-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
            {thisMonthOrders.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 font-medium">This Month</p>
          <div className="mt-4 text-xs text-slate-500 border-t border-slate-100 pt-3 flex justify-between">
            <span>Lifetime:</span>
            <span className="font-semibold text-slate-600">{totalOrders.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs border-blue-100/50 bg-white dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
          <CardDescription className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Products</CardDescription>
          <div className="p-2 bg-blue-50 rounded-lg">
            <Package className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
            {totalProducts.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 font-medium">Unique products in store</p>
          <div className="mt-4 text-xs text-slate-500 border-t border-slate-100 pt-3 flex justify-between">
            <span className="flex items-center gap-1 text-amber-600"><Clock className="h-3.5 w-3.5"/> {pendingOrders} Pend</span>
            <span className="flex items-center gap-1 text-emerald-600"><CheckCircle className="h-3.5 w-3.5"/> {deliveredOrders} Deliv</span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs border-orange-100/50 bg-white dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
          <CardDescription className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Stock Units</CardDescription>
          <div className="p-2 bg-orange-50 rounded-lg">
            <Box className="h-4 w-4 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
            {inventory?.totalStockUnits?.toLocaleString() || 0}
          </div>
          <p className="text-xs text-slate-400 font-medium">Total available items</p>
          <div className="mt-4 text-xs text-slate-500 border-t border-slate-100 pt-3 flex justify-between">
            <span>Inventory Value:</span>
            <span className="font-bold text-slate-700">৳{inventory?.totalStockValue?.toLocaleString() || 0}</span>
          </div>
        </CardContent>
      </Card>

      {/* ─── ROW 2: DETAILED ANALYTICS ─────────────────── */}
      <Card className="shadow-xs border-purple-100/50 bg-white dark:bg-card lg:col-span-3 overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between p-4 px-5 bg-slate-50/50 border-b border-slate-100">
          <CardDescription className="text-sm font-bold text-slate-600 flex items-center gap-2 uppercase tracking-wide">
            <Layers className="h-4 w-4 text-purple-500" /> Stock by Category
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <div className="max-h-[260px] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50 sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="px-5 py-3 font-medium">Category / Product</th>
                  <th className="px-5 py-3 font-medium text-right">Stock</th>
                  <th className="px-5 py-3 font-medium">Variants Breakdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {inventory?.stockByCategory?.slice(0, 5).map((cat, i) => (
                  <React.Fragment key={i}>
                    {/* Category Header Row */}
                    <tr className="bg-slate-50/40">
                      <td className="px-5 py-2 font-bold text-slate-700 flex items-center gap-2">
                        <span className="text-purple-400 text-xs">#{i + 1}</span> {cat.category}
                      </td>
                      <td className="px-5 py-2 text-right font-bold text-slate-700">{cat.totalItems}</td>
                      <td className="px-5 py-2 text-slate-400 text-xs">{cat.products.length} products</td>
                    </tr>
                    {/* Products Row */}
                    {cat.products.slice(0, 3).map((prod, j) => (
                      <tr key={`${i}-${j}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3 pl-8 text-slate-600 truncate max-w-[220px] font-medium" title={prod.name}>
                          {prod.name}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-slate-600">{prod.stock}</td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {prod.colors?.length > 0 ? (
                              prod.colors.map((c, k) => (
                                <Badge key={k} variant="outline" className="text-xs h-5 px-1.5 bg-white border-slate-200">
                                  <Palette className="h-3 w-3 mr-1 text-slate-400" />
                                  {c.color}: <span className="font-bold ml-1">{c.stock}</span>
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-slate-300">No variants</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs border-indigo-100/50 bg-white dark:bg-card flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between p-4 px-5 bg-slate-50/50 border-b border-slate-100">
          <CardDescription className="text-sm font-bold text-slate-600 flex items-center gap-2 uppercase tracking-wide">
            <MapPin className="h-4 w-4 text-indigo-500" /> Orders by Location
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <ul className="divide-y divide-slate-50">
            {ordersByLocation?.slice(0, 5).map((loc, i) => (
              <li key={i} className="flex justify-between items-center px-5 py-3 hover:bg-slate-50/80 transition-colors">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-3">
                  <span className="text-indigo-400 text-xs font-bold">#{i + 1}</span>
                  <span className="capitalize">{loc.location === "dhaka" ? "Inside Dhaka" : loc.location === "subcity" ? "Sub City" : loc.location === "outside" ? "Outside Dhaka" : loc.location}</span>
                </span>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">{loc.count}</span>
              </li>
            ))}
            {(!ordersByLocation || ordersByLocation.length === 0) && (
              <li className="px-5 py-6 text-center text-sm text-slate-400">No location data yet</li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* ─── ROW 3: LEADERBOARDS ─────────────────── */}
      <Card className="shadow-xs border-pink-100/50 bg-white dark:bg-card lg:col-span-4 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between p-4 px-5 bg-slate-50/50 border-b border-slate-100">
          <CardDescription className="text-sm font-bold text-slate-600 flex items-center gap-2 uppercase tracking-wide">
            <ListOrdered className="h-4 w-4 text-pink-500" /> Top Ordered Items
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <ul className="divide-y divide-slate-50">
            {mostOrderedItems?.slice(0, 5).map((item, i) => (
              <li key={i} className="flex justify-between items-center px-5 py-3 hover:bg-slate-50/80 transition-colors">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-3 truncate max-w-[70%]">
                  <span className="text-pink-400 text-xs font-bold">#{i + 1}</span>
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">{item.count} items sold</span>
              </li>
            ))}
            {(!mostOrderedItems || mostOrderedItems.length === 0) && (
              <li className="px-5 py-6 text-center text-sm text-slate-400">No items ordered yet</li>
            )}
          </ul>
        </CardContent>
      </Card>

    </div>
  )
}
