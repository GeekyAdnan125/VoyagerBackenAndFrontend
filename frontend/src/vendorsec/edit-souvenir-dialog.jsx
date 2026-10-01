"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectOption,
} from "../vendorsec/ui-components"

export function EditSouvenirDialog({ editingItem, onClose, setEditingItem, onEdit, categories }) {
  if (!editingItem) return null

  return (
    <Dialog open={!!editingItem} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Souvenir</DialogTitle>
          <DialogDescription>Update souvenir information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={editingItem.name}
              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={editingItem.description}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-price">Price</Label>
              <Input
                id="edit-price"
                type="number"
                value={editingItem.price}
                onChange={(e) => setEditingItem({ ...editingItem, price: Number.parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="edit-stock">Stock</Label>
              <Input
                id="edit-stock"
                type="number"
                value={editingItem.stock}
                onChange={(e) => setEditingItem({ ...editingItem, stock: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-category">Category</Label>
            <Select
              value={editingItem.category}
              onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
            >
              {categories.slice(1).map((category) => (
                <SelectOption key={category} value={category}>
                  {category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectOption>
              ))}
            </Select>
          </div>
          <Button onClick={() => onEdit(editingItem)} className="w-full">
            Update Souvenir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
