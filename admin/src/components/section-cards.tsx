"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, ShoppingBag, Package, CheckCircle, Clock } from "lucide-react"

export interface SectionCardsProps {
  stats?: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalProducts: number;
  };
}

export function SectionCards({ stats }: SectionCardsProps) {
  const revenue = stats?.totalRevenue ?? 0;
  const orders = stats?.totalOrders ?? 0;
  const products = stats?.totalProducts ?? 0;
  const pending = stats?.pendingOrders ?? 0;
  const delivered = stats?.deliveredOrders ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-card-foreground">
            ৳{revenue.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              Live Revenue
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Aggregate revenue from all customer orders
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-card-foreground">
            {orders}
          </CardTitle>
          <CardAction>
            <ShoppingBag className="h-5 w-5 text-orange-500" />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Lifetime orders placed in the system
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Store Products</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-card-foreground">
            {products}
          </CardTitle>
          <CardAction>
            <Package className="h-5 w-5 text-blue-400" />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Total active catalog listings
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Order Status Ratios</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl text-card-foreground flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-amber-500 text-sm">
              <Clock className="h-4 w-4" /> {pending} Pending
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1 text-emerald-500 text-sm">
              <CheckCircle className="h-4 w-4" /> {delivered} Delivered
            </span>
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Current delivery fulfillment balance
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
