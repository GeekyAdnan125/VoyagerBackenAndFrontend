"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../vendorsec/ui-components"

export function TopSellingItems({ souvenirs }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {souvenirs
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 5)
            .map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.thumbnail || "/placeholder.svg"}
                    alt={item.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">₹{item.price}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{item.sold} sold</p>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
