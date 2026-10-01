"use client"

import { DashboardStats } from "./dashboard-stats"
import { RecentOrders } from "./recent-orders"
import { TopSellingItems } from "./top-selling-items"
import { useVendorData } from "./hooks/useVendorData"

export function Dashboard() {
  const { souvenirs, orders, loading, error } = useVendorData()

  if (loading) {
    return <div>Loading dashboard data...</div>
  }

  if (error) {
    return <div>Error loading data: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <DashboardStats souvenirs={souvenirs} orders={orders} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders orders={orders} />
        <TopSellingItems souvenirs={souvenirs} />
      </div>
    </div>
  )
}
