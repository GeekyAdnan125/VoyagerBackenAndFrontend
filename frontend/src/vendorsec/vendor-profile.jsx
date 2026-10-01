"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
} from "../vendorsec/ui-components"
import { Edit } from "./icons (1)"
import { CloudHail } from "lucide-react"

export function VendorProfile({ vendorInfo, setVendorInfo }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedInfo, setEditedInfo] = useState(vendorInfo)

  const handleSave = () => {
    setVendorInfo(editedInfo)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedInfo(vendorInfo)
    setIsEditing(false)
  }
  console.log("hee  i am from vendor")
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vendor Profile</CardTitle>
          <CardDescription>Manage your vendor information and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <img
              src={vendorInfo.avatar || "/placeholder.svg"}
              alt="Vendor Avatar"
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold">{vendorInfo.businessName}</h3>
              <p className="text-gray-500">{vendorInfo.email}</p>
            </div>
            <div className="ml-auto">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={editedInfo.businessName}
                  onChange={(e) => setEditedInfo({ ...editedInfo, businessName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editedInfo.email}
                  onChange={(e) => setEditedInfo({ ...editedInfo, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editedInfo.phone}
                  onChange={(e) => setEditedInfo({ ...editedInfo, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={editedInfo.website}
                  onChange={(e) => setEditedInfo({ ...editedInfo, website: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={editedInfo.address}
                  onChange={(e) => setEditedInfo({ ...editedInfo, address: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={editedInfo.description}
                  onChange={(e) => setEditedInfo({ ...editedInfo, description: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="specialties">Specialties</Label>
                <Input
                  id="specialties"
                  value={editedInfo.specialties}
                  onChange={(e) => setEditedInfo({ ...editedInfo, specialties: e.target.value })}
                  disabled={!isEditing}
                  placeholder="e.g., Handmade crafts, Local artwork"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{vendorInfo.stats.yearsInBusiness}</div>
              <p className="text-sm text-gray-500">Years in Business</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{vendorInfo.stats.totalSales}</div>
              <p className="text-sm text-gray-500">Total Sales</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{vendorInfo.stats.customerRating}</div>
              <p className="text-sm text-gray-500">Customer Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
