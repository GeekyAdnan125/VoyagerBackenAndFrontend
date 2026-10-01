// "use client"

// import { useState } from "react"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
//   Button,
//   Input,
//   Select,
//   SelectOption,
// } from "../vendorsec/ui-components"
// import { Plus, Search } from "./icons (1)"
// import { SouvenirTable } from "./souvenir-table"
// import { AddSouvenirDialog } from "./add-souvenir-dialog"
// import { EditSouvenirDialog } from "./edit-souvenir-dialog"
// import { ProductDetailModal } from "./product-detail-modal (1)"

// export function SouvenirManagement({ souvenirs, setSouvenirs }) {
//   const [searchTerm, setSearchTerm] = useState("")
//   const [filterCategory, setFilterCategory] = useState("all")
//   const [editingItem, setEditingItem] = useState(null)
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
//   const [selectedProduct, setSelectedProduct] = useState(null)
//   const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
//   const [newItem, setNewItem] = useState({
//     name: "",
//     description: "",
//     price: "",
//     category: "",
//     stock: "",
//     thumbnail: "/placeholder.svg?height=100&width=100",
//   })

//   const categories = [
//     "all",
//     "handicrafts",
//     "textiles",
//     "food",
//     "souvenirs",
//     "personal-care",
//     "beverages",
//     "stationery",
//     "art",
//   ]

//   const filteredSouvenirs = souvenirs.filter((item) => {
//     const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
//     const matchesCategory = filterCategory === "all" || item.category.toLowerCase() === filterCategory
//     return matchesSearch && matchesCategory
//   })

//   const handleAddItem = () => {
//     const item = {
//       id: Date.now(),
//       ...newItem,
//       price: Number.parseFloat(newItem.price),
//       stock: Number.parseInt(newItem.stock),
//       sold: 0,
//       status: "active",
//       inStock: true,
//       rating: 0,
//       reviews: 0,
//       features: [],
//       vendorDetails: {
//         name: "Default Vendor",
//         email: "vendor@example.com",
//         phone: "1234567890",
//       },
//       region: "Unknown",
//       place: "unknown",
//     }
//     setSouvenirs([...souvenirs, item])
//     setNewItem({
//       name: "",
//       description: "",
//       price: "",
//       category: "",
//       stock: "",
//       thumbnail: "/placeholder.svg?height=100&width=100",
//     })
//     setIsAddDialogOpen(false)
//   }

//   const handleEditItem = (item) => {
//     const updatedSouvenirs = souvenirs.map((s) => (s.id === item.id ? item : s))
//     setSouvenirs(updatedSouvenirs)
//     setEditingItem(null)
//   }

//   const handleDeleteItem = (id) => {
//     setSouvenirs(souvenirs.filter((item) => item.id !== id))
//   }

//   const handleViewItem = (item) => {
//     setSelectedProduct(item)
//     setIsDetailModalOpen(true)
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
//         <div className="flex gap-4 items-center">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//             <Input
//               placeholder="Search souvenirs..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10 w-64"
//             />
//           </div>
//           <Select value={filterCategory} onValueChange={setFilterCategory}>
//             <SelectOption value="all">All Categories</SelectOption>
//             {categories.slice(1).map((category) => (
//               <SelectOption key={category} value={category}>
//                 {category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
//               </SelectOption>
//             ))}
//           </Select>
//         </div>

//         <Button onClick={() => setIsAddDialogOpen(true)}>
//           <Plus className="h-4 w-4 mr-2" />
//           Add Souvenir
//         </Button>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Souvenir Inventory</CardTitle>
//           <CardDescription>Manage your souvenir collection and inventory</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <SouvenirTable
//             souvenirs={filteredSouvenirs}
//             onView={handleViewItem}
//             onEdit={setEditingItem}
//             onDelete={handleDeleteItem}
//           />
//         </CardContent>
//       </Card>

//       <AddSouvenirDialog
//         isOpen={isAddDialogOpen}
//         onClose={() => setIsAddDialogOpen(false)}
//         newItem={newItem}
//         setNewItem={setNewItem}
//         onAdd={handleAddItem}
//         categories={categories}
//       />

//       <EditSouvenirDialog
//         editingItem={editingItem}
//         onClose={() => setEditingItem(null)}
//         setEditingItem={setEditingItem}
//         onEdit={handleEditItem}
//         categories={categories}
//       />

//       <ProductDetailModal
//         product={selectedProduct}
//         isOpen={isDetailModalOpen}
//         onClose={() => {
//           setIsDetailModalOpen(false)
//           setSelectedProduct(null)
//         }}
//       />
//     </div>
//   )
// }
"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  SelectOption,
} from "../vendorsec/ui-components"
import { Plus, Search } from "./icons (1)"
import { SouvenirTable } from "./souvenir-table"
import { AddSouvenirDialog } from "./add-souvenir-dialog"
import { EditSouvenirDialog } from "./edit-souvenir-dialog"
import { ProductDetailModal } from "./product-detail-modal (1)"
import { useAppContext } from "../context/AppContext" // <-- Add your context path here

export function SouvenirManagement({ souvenirs, setSouvenirs }) {
  const { user } = useAppContext() // ✅ Get user from context
  const vendorName = user?.name || "Default Vendor"

  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [editingItem, setEditingItem] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    thumbnail: "/placeholder.svg?height=100&width=100",
  })

  const categories = [
    "all",
    "handicrafts",
    "textiles",
    "food",
    "souvenirs",
    "personal-care",
    "beverages",
    "stationery",
    "art",
    "jewellry"
  ]
 
  useEffect(() => {
    async function fetchSouvenirs() {
      try {
        const response = await axios.get(
          `https://voyagerserver.onrender.com/api/souvenirs/vendor/${encodeURIComponent(vendorName)}`
        )
        setSouvenirs(response.data.data)
      } catch (error) {
        console.error("Error fetching souvenirs:", error)
      }
    }

    if (vendorName) {
      fetchSouvenirs()
    }
  }, [vendorName, setSouvenirs])

  const filteredSouvenirs = souvenirs.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || item.category.toLowerCase() === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleAddItem = () => {
    const item = {
      id: Date.now(),
      ...newItem,
      price: Number.parseFloat(newItem.price),
      stock: Number.parseInt(newItem.stock),
      sold: 0,
      status: "active",
      inStock: true,
      rating: 0,
      reviews: 0,
      features: [],
      vendorDetails: {
        name: user?.name,
        email: user?.email  ,
        phone: user?.phone  ,
      },
      region: "Unknown",
      place: "unknown",
    }
    setSouvenirs([...souvenirs, item])
    setNewItem({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      thumbnail: "/placeholder.svg?height=100&width=100",
    })
    setIsAddDialogOpen(false)
  }

  const handleEditItem = (item) => {
    const updatedSouvenirs = souvenirs.map((s) => (s.id === item.id ? item : s))
    setSouvenirs(updatedSouvenirs)
    setEditingItem(null)
  }

  const handleDeleteItem = (id) => {
    setSouvenirs(souvenirs.filter((item) => item.id !== id))
  }

  const handleViewItem = (item) => {
    setSelectedProduct(item)
    setIsDetailModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search souvenirs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectOption value="all">All Categories</SelectOption>
            {categories.slice(1).map((category) => (
              <SelectOption key={category} value={category}>
                {category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </SelectOption>
            ))}
          </Select>
        </div>

        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Souvenir
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Souvenir Inventory</CardTitle>
          <CardDescription>Manage your souvenir collection and inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <SouvenirTable
            souvenirs={filteredSouvenirs}
            onView={handleViewItem}
            onEdit={setEditingItem}
            onDelete={handleDeleteItem}
          />
        </CardContent>
      </Card>

      <AddSouvenirDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        newItem={newItem}
        setNewItem={setNewItem}
        onAdd={handleAddItem}
        categories={categories}
      />

      <EditSouvenirDialog
        editingItem={editingItem}
        onClose={() => setEditingItem(null)}
        setEditingItem={setEditingItem}
        onEdit={handleEditItem}
        categories={categories}
      />

      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedProduct(null)
        }}
      />
    </div>
  )
}
