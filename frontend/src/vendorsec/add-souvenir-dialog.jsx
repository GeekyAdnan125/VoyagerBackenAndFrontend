"use client";

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
} from "./ui-components";

import { use, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAppContext } from "../context/AppContext";

export function AddSouvenirDialog({
  isOpen,
  onClose,
  newItem,
  setNewItem,
  categories,
}) {
  const { user } = useAppContext();
  console.log(user.token);
  const [images, setImages] = useState([]); // Store selected images
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const onAdd = async () => {
    console.log("Submitting souvenir:", { newItem, images });

    if (
      !newItem.name ||
      !newItem.description ||
      !newItem.price ||
      !newItem.category ||
      !newItem.region ||
      !newItem.place ||
      images.length === 0
    ) {
      toast.error("Please fill all fields and select at least one image");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("description", newItem.description);
      formData.append("price", newItem.price);
      formData.append("category", newItem.category);
      formData.append("region", newItem.region);
      formData.append("place", newItem.place);
      formData.append("features", JSON.stringify(newItem.features || []));

      images.forEach((image) => formData.append("imageFile", image));

      const res = await axios.post(
        "https://voyagerserver.onrender.com/api/createsouvenir",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      toast.success("Souvenir added successfully!");
      setNewItem({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        region: "",
        place: "",
      });
      setImages([]);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add souvenir");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Souvenir</DialogTitle>
          <DialogDescription>
            Add a new souvenir to your inventory
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newItem.description}
              onChange={(e) =>
                setNewItem({ ...newItem, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={newItem.stock}
                onChange={(e) =>
                  setNewItem({ ...newItem, stock: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              value={newItem.region || ""}
              onChange={(e) =>
                setNewItem({ ...newItem, region: e.target.value })
              }
              placeholder="e.g., Kolkata"
            />
          </div>

          <div>
            <Label htmlFor="place">Place</Label>
            <Input
              id="place"
              value={newItem.place || ""}
              onChange={(e) =>
                setNewItem({ ...newItem, place: e.target.value })
              }
              placeholder="e.g., Park Street"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={newItem.category}
              onValueChange={(value) =>
                setNewItem({ ...newItem, category: value })
              }
            >
              <SelectOption value="">Select category</SelectOption>
              {categories.slice(1).map((category) => (
                <SelectOption key={category} value={category}>
                  {category
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectOption>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="images">Images</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
          </div>

          <Button onClick={onAdd} className="w-full" disabled={loading}>
            {loading ? "Uploading..." : "Add Souvenir"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
