"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button } from "../vendorsec/ui-components"
import { Eye, Edit, Trash2 } from "./icons (1)"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"

export function SouvenirTable({ souvenirs, onView, onEdit, onDelete }) {
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, item: null })

  const handleDeleteClick = (item) => {
    setDeleteDialog({ isOpen: true, item })
  }

  const handleDeleteConfirm = () => {
    onDelete(deleteDialog.item.id)
    setDeleteDialog({ isOpen: false, item: null })
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Sold</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {souvenirs.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <img
                    src={item.thumbnail || "/placeholder.svg"}
                    alt={item.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.description.substring(0, 50)}...</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {item.category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              </TableCell>
              <TableCell>₹{item.price.toFixed(2)}</TableCell>
              <TableCell>
                <span className={item.stock <= 5 ? "text-red-500 font-medium" : ""}>{item.stock}</span>
              </TableCell>
              <TableCell>{item.sold}</TableCell>
              <TableCell>
                <Badge variant={item.status === "active" ? "default" : "secondary"}>{item.status}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onView(item)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteClick(item)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, item: null })}
        itemName={deleteDialog.item?.name || ""}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}
