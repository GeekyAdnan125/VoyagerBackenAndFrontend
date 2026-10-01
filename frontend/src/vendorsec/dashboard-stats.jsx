"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../vendorsec/ui-components"
import { TrendingUp, Package, ShoppingCart } from "./icons (1)"

export function DashboardStats({ souvenirs, orders }) {
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.price || 0), 0)
  const totalSouvenirs = souvenirs.length
  const pendingOrders = orders.filter((order) => order.status === "pending").length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-gray-500">+12% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Souvenirs</CardTitle>
          <Package className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSouvenirs}</div>
          <p className="text-xs text-gray-500">Active products</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingOrders}</div>
          <p className="text-xs text-gray-500">Awaiting processing</p>
        </CardContent>
      </Card>
    </div>
  )
}
