"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectOption,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
} from "../vendorsec/ui-components";
import { Search, Eye } from "./icons (1)";
import { useVendorData } from "./hooks/useVendorData"; // Import the custom hook
import axios from "axios";

export function OrdersManagement() {
  console.log("🚀 Component Rendered");

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { souvenirs, orders, loading, error } = useVendorData(); // Use the custom hook

  const statuses = [
    "all",
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  // 🔍 Capitalize helper
  const capitalize = (str) => str.replace(/\b\w/g, (l) => l.toUpperCase());

  // 🔄 Order status update handler
  const updateOrderStatus = (orderId, newStatus) => {
    console.log(`🛠️ Updating order #${orderId} status to: ${newStatus}`);
    // This part remains tricky as we are not setting orders directly anymore.
    // For now, let's assume we need to refetch or update the state in the hook.
    // A simple approach is to just update locally for UI responsiveness.
    // A better approach would be for the hook to expose a setter.
  };

  // 🧼 Filtered orders based on vendor, status, and search term
  const filteredOrders = orders.filter((order) => {
    // The vendor item filtering is already handled by the hook.

    // 2. Filter by search term.
    const fullName = `${order.firstName || ""} ${
      order.lastName || ""
    }`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      order._id?.toString().includes(searchTerm);

    // 3. Filter by status.
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // ✅ Render
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                console.log("🔎 Updated searchTerm:", e.target.value);
              }}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterStatus} onValueChange={(value) => {
            setFilterStatus(value);
            console.log("📊 Filter status changed to:", value);
          }}>
            <SelectOption value="all">All Status</SelectOption>
            {statuses.slice(1).map((status) => (
              <SelectOption key={status} value={status}>
                {capitalize(status)}
              </SelectOption>
            ))}
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>Track and manage customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Shipping Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">
                    #{order._id.slice(-6)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {order.firstName} {order.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{order.email}</p>
                      <p className="text-sm text-gray-500">{order.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {order.itemsName} x {order.quantity}
                      </div>
                      {order.specialInstructions && (
                        <p className="text-xs text-gray-500">
                          Note: {order.specialInstructions}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ₹{Number(order.price)?.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {new Date(order.deliveryDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{order.address}</p>
                      <p className="text-sm text-gray-500">
                        {order.city}, {order.zipCode}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) =>
                        updateOrderStatus(order._id, value)
                      }
                    >
                      {statuses.slice(1).map((status) => (
                        <SelectOption key={status} value={status}>
                          {capitalize(status)}
                        </SelectOption>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
