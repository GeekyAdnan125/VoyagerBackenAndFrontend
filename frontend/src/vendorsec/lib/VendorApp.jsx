"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent, Badge } from "../ui-components"
import { Package } from "../icons (1)"
import { Dashboard } from "../dashboard"
import { SouvenirManagement } from "../souvenir-management"
import { OrdersManagement } from "../orders-management"
import { VendorProfile } from "../vendor-profile"
import { useAppContext } from "../../context/AppContext"

export default function VendorApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const {logout , user} = useAppContext();
  // Sample data with your provided products
  const [souvenirs, setSouvenirs] = useState([
    {
      id: 1,
      name: "Terracotta Horse",
      description: "Famous Bankura horse in terracotta",
      vendorDetails: {
        name: "Bishnupur Crafts",
        email: "bishnupur.crafts@gmail.com",
        phone: "9876543210",
      },
      price: 325,
      category: "Handicrafts",
      region: "Bishnupur",
      thumbnail:
        "https://trovecraftindia.com/cdn/shop/files/Bankura_Horse_Small_06530df9-db14-46ef-8f73-e3c784809566.jpg?v=1746176951&width=1445",
      images: [
        "https://trovecraftindia.com/cdn/shop/files/Bankura_Horse_Small_06530df9-db14-46ef-8f73-e3c784809566.jpg?v=1746176951&width=1445",
      ],
      rating: 0,
      reviews: 0,
      inStock: true,
      features: ["Traditional craft", "Handmade", "Cultural significance"],
      place: "bishnupur",
      stock: 15,
      sold: 8,
      status: "active",
    },
    {
      id: 2,
      name: "Baluchari Saree",
      description: "Traditional silk saree with mythological motifs",
      vendorDetails: {
        name: "Bishnupur Silks",
        email: "bishnupur.silks@gmail.com",
        phone: "9876543211",
      },
      price: 9000,
      category: "Textiles",
      region: "Bishnupur",
      thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ92pjaORZ0Xf0P2esKcadM7shBtrvR_fFwig&s",
      images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ92pjaORZ0Xf0P2esKcadM7shBtrvR_fFwig&s"],
      rating: 0,
      reviews: 0,
      inStock: true,
      features: ["Pure silk", "Handwoven", "Intricate designs"],
      place: "bishnupur",
      stock: 3,
      sold: 12,
      status: "active",
    },
    {
      id: 3,
      name: "Bishnupur Silk",
      description: "Handloom silk products",
      vendorDetails: {
        name: "Bishnupur Silk House",
        email: "silk.house@gmail.com",
        phone: "9876543213",
      },
      price: 1250,
      category: "Textiles",
      region: "Bishnupur",
      thumbnail:
        "https://www.luxurionworld.com/cdn/shop/files/PS1P4PR423050805_Purple_Plain_Pure_Bishnupur_Silk_Saree_1.jpg?v=1683528038&width=1445",
      images: [
        "https://www.luxurionworld.com/cdn/shop/files/PS1P4PR423050805_Purple_Plain_Pure_Bishnupur_Silk_Saree_1.jpg?v=1683528038&width=1445",
      ],
      rating: 0,
      reviews: 0,
      inStock: true,
      features: ["Pure silk", "Lightweight", "Traditional patterns"],
      place: "bishnupur",
      stock: 8,
      sold: 25,
      status: "active",
    },
    {
      id: 4,
      name: "Conch Shell Products",
      description: "Items made from conch shells, a local specialty",
      vendorDetails: {
        name: "Bishnupur Shell Crafts",
        email: "shell.crafts@gmail.com",
        phone: "9876543214",
      },
      price: 550,
      category: "Handicrafts",
      region: "Bishnupur",
      thumbnail: "https://www.poojaproducts.com/cdn/shop/products/ganeshashanghu.jpg?v=1620165855",
      images: ["https://www.poojaproducts.com/cdn/shop/products/ganeshashanghu.jpg?v=1620165855"],
      rating: 0,
      reviews: 0,
      inStock: true,
      features: ["Natural material", "Religious significance", "Handcrafted"],
      place: "bishnupur",
      stock: 12,
      sold: 18,
      status: "active",
    },
    {
      id: 5,
      name: "Local Sweets (Mihidana, Sitabhog)",
      description: "Famous local sweet delicacies",
      vendorDetails: {
        name: "Bishnupur Sweets",
        email: "bishnupur.sweets@gmail.com",
        phone: "9876543215",
      },
      price: 200,
      category: "Food",
      region: "Bishnupur",
      thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf6haCmZm-FcKoSSKG2OM02hdg30J9VPWRYw&s",
      images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf6haCmZm-FcKoSSKG2OM02hdg30J9VPWRYw&s"],
      rating: 0,
      reviews: 0,
      inStock: true,
      features: ["Traditional recipe", "Freshly made", "Authentic taste"],
      place: "bishnupur",
      stock: 25,
      sold: 45,
      status: "active",
    },
    {
      id: 6,
      name: "Miniature India Gate",
      description: "Classic Delhi souvenir in various sizes",
      vendorDetails: {
        name: "Delhi Souvenirs",
        email: "delhi.souvenirs@gmail.com",
        phone: "9876543220",
      },
      price: 650,
      category: "Souvenirs",
      region: "Delhi",
      thumbnail: "https://www.silaii.com/cdn/shop/files/India_Gate_1_1.jpg?v=1722923845",
      images: ["https://www.silaii.com/cdn/shop/files/India_Gate_1_1.jpg?v=1722923845"],
      rating: 0,
      reviews: 0,
      inStock: true,
      features: ["Iconic landmark replica", "Various sizes", "Durable material"],
      place: "delhi",
      stock: 20,
      sold: 35,
      status: "active",
    },
    {
      id: 7,
      name: "Attar (Indian Perfume)",
      description: "Traditional Indian fragrances",
      vendorDetails: {
        name: "Delhi Fragrances",
        email: "delhi.fragrances@gmail.com",
        phone: "9876543221",
      },
      price: 1750,
      category: "Personal Care",
      region: "Delhi",
      thumbnail: "https://www.raahiparfums.com/cdn/shop/files/MH6A2535-5.jpg?v=1745485650&width=1946",
      images: ["https://www.raahiparfums.com/cdn/shop/files/MH6A2535-5.jpg?v=1745485650&width=1946"],
      rating: 0,
      reviews: 0,
      inStock: true,
      features: ["Traditional scents", "Long-lasting", "Natural ingredients"],
      place: "delhi",
      stock: 15,
      sold: 22,
      status: "active",
    },
    {
      id: 8,
      name: "Kathakali Mask",
      description: "Traditional vibrant Kathakali dance masks",
      vendorDetails: {
        name: "Kerala Arts",
        email: "kerala.arts@gmail.com",
        phone: "9876543230",
      },
      price: 1150,
      category: "Handicrafts",
      region: "Kerala",
      thumbnail: "/placeholder.svg?height=200&width=200",
      images: ["/placeholder.svg?height=200&width=200"],
      rating: 0,
      reviews: 0,
      inStock: true,
      features: ["Vibrant colors", "Traditional art", "Hand-painted"],
      place: "kerala",
      stock: 10,
      sold: 15,
      status: "active",
    },
    {
      id: 9,
      name: "Dooars Tea",
      description: "Locally grown aromatic tea leaves, known for their rich flavor and refreshing aroma.",
      vendorDetails: {
        name: "TeaVendor1",
        email: "tea.vendor1@gmail.com",
        phone: "9876543210",
      },
      price: 250,
      category: "Beverages",
      region: "Dooars",
      thumbnail:
        "https://images.unsplash.com/photo-1589311581037-583328e6a0cd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGRvYXJzJTIwdGVhfGVufDB8fDB8fHww",
      images: [
        "https://plus.unsplash.com/premium_photo-1674406481284-43eba097a291?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dGVhfGVufDB8fDB8fHww",
        "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8dGVhfGVufDB8fDB8fHww",
      ],
      rating: 0,
      reviews: 0,
      inStock: true,
      features: ["Rich aroma", "Organically grown", "Locally sourced"],
      place: "dooars",
      stock: 30,
      sold: 67,
      status: "active",
    },
    {
      id: 10,
      name: "Bamboo Products",
      description: "Beautifully handcrafted utensils, baskets, and decor items made from bamboo.",
      vendorDetails: {
        name: "BambooVendor",
        email: "bamboo.vendor@gmail.com",
        phone: "9678563421",
      },
      price: 350,
      category: "Handicrafts",
      region: "Dooars",
      thumbnail:
        "https://plus.unsplash.com/premium_photo-1664392230823-2b48a024c2df?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmFtYm9vJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      images: [
        "https://plus.unsplash.com/premium_photo-1664007755697-04fa7f059752?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmFtYm9vJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
        "https://plus.unsplash.com/premium_photo-1661614220271-ab4abdf42bef?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YmFtYm9vJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      ],
      rating: 0,
      reviews: 0,
      inStock: true,
      features: ["Handwoven bamboo", "Sustainable", "Lightweight & durable"],
      place: "dooars",
      stock: 22,
      sold: 41,
      status: "active",
    },
  ])

  const [orders, setOrders] = useState([
    {
      id: 1001,
      customer: "John Smith",
      email: "john@example.com",
      items: [
        { name: "Terracotta Horse", quantity: 2 },
        { name: "Baluchari Saree", quantity: 1 },
      ],
      total: 9650,
      date: "2024-01-15",
      status: "pending",
    },
    {
      id: 1002,
      customer: "Sarah Johnson",
      email: "sarah@example.com",
      items: [{ name: "Dooars Tea", quantity: 3 }],
      total: 750,
      date: "2024-01-14",
      status: "shipped",
    },
    {
      id: 1003,
      customer: "Mike Davis",
      email: "mike@example.com",
      items: [
        { name: "Bamboo Products", quantity: 2 },
        { name: "Local Sweets", quantity: 1 },
      ],
      total: 900,
      date: "2024-01-13",
      status: "delivered",
    },
    {
      id: 1004,
      customer: "Emily Wilson",
      email: "emily@example.com",
      items: [{ name: "Kathakali Mask", quantity: 1 }],
      total: 1150,
      date: "2024-01-12",
      status: "processing",
    },
  ])

  const [vendorInfo, setVendorInfo] = useState({
    businessName: "Heritage Souvenirs Co.",
    email: "contact@heritagesouvenirs.com",
    phone: "+1 (555) 123-4567",
    website: "www.heritagesouvenirs.com",
    address: "123 Main Street, Historic District, City, State 12345",
    description:
      "We specialize in authentic local souvenirs and handcrafted items that capture the essence of our beautiful regions.",
    specialties: "Handmade crafts, Local artwork, Traditional textiles",
    avatar: "/placeholder.svg?height=80&width=80",
    stats: {
      yearsInBusiness: 8,
      totalSales: "2,450+",
      customerRating: "4.8/5",
    },
  })

  const analytics = {
    monthlyRevenue: [
      { month: "Jan", revenue: 2400 },
      { month: "Feb", revenue: 1800 },
      { month: "Mar", revenue: 3200 },
      { month: "Apr", revenue: 2800 },
      { month: "May", revenue: 3600 },
      { month: "Jun", revenue: 4200 },
    ],
  }

  const tabItems = [
    { value: "dashboard", label: "Dashboard" },
    { value: "souvenirs", label: "Souvenirs" },
    { value: "orders", label: "Orders" },
    { value: "profile", label: "Profile" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Package className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold">{user?.name}</h1>
            </div>
            <div className="flex gap-x-2 items-center space-x-4">
              {/* <Badge variant="outline">Vendor Dashboard</Badge> */}
              <button
                onClick={logout}
               className="px-4 py-2 bg-red-600 rounded-xl text-sl">Logout</button>
              <div className="flex items-center space-x-2">
                <img src={vendorInfo.avatar || "/placeholder.svg"} alt="Profile" className="w-8 h-8 rounded-full" />
                <span className="text-sm font-medium">{vendorInfo.businessName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            {tabItems.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                onClick={() => setActiveTab(tab.value)}
                isActive={activeTab === tab.value}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="dashboard" activeValue={activeTab}>
            <Dashboard souvenirs={souvenirs} orders={orders} analytics={analytics} />
          </TabsContent>

          <TabsContent value="souvenirs" activeValue={activeTab}>
            <SouvenirManagement souvenirs={souvenirs} setSouvenirs={setSouvenirs} />
          </TabsContent>

          <TabsContent value="orders" activeValue={activeTab}>
            <OrdersManagement orders={orders} setOrders={setOrders} />
          </TabsContent>

          <TabsContent value="profile" activeValue={activeTab}>
            <VendorProfile vendorInfo={vendorInfo} setVendorInfo={setVendorInfo} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
