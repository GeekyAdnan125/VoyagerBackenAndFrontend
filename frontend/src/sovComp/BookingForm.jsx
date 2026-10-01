"use client"

import { useState } from "react"
import { ArrowLeft, CreditCard, MapPin, Calendar, User } from "lucide-react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function BookingForm({ souvenir, onBack, onBookingComplete }) {
  console.log("🎯 Frontend: BookingForm component rendered");
  console.log("🎯 Frontend: Souvenir prop:", souvenir);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "", 
    address: "",
    city: "",
    zipCode: "",
    country: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    deliveryDate: "",
    specialInstructions: "",
  })

  const [errors, setErrors] = useState({})
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [showPaymentSimButtons, setShowPaymentSimButtons] = useState(false)
  const [paymentError, setPaymentError] = useState("")

  console.log("🎯 Frontend: Component state initialized");

  const handleInputChange = (e) => {
    const { name, value } = e.target
    console.log(`🎯 Frontend: Input changed - ${name}:`, value);
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    console.log("🎯 Frontend: validateForm called");
    console.log("🎯 Frontend: Current form data:", formData);
    
    const newErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required"
    if (!formData.country.trim()) newErrors.country = "Country is required"
    if (!formData.cardNumber.trim()) newErrors.cardNumber = "Card number is required"
    if (!formData.expiryDate.trim()) newErrors.expiryDate = "Expiry date is required"
    if (!formData.cvv.trim()) newErrors.cvv = "CVV is required"
    if (!formData.cardName.trim()) newErrors.cardName = "Cardholder name is required"

    console.log("🎯 Frontend: Validation errors:", newErrors);
    setErrors(newErrors)
    
    const isValid = Object.keys(newErrors).length === 0;
    console.log("🎯 Frontend: Form validation result:", isValid);
    return isValid;
  }

  // Load Razorpay and create order
  async function loadRazorpay() {
    console.log("💳 Frontend: loadRazorpay called");
    console.log("💳 Frontend: Souvenir data:", souvenir);
    console.log("💳 Frontend: Final total:", finalTotal);
    
    const payload = {
      amount: Number(finalTotal),
      item: {
        name: souvenir.name,
        description: souvenir.description,
        price: souvenir.price,
        category: souvenir.category,
        region: souvenir.region,
        vendorDetails: souvenir.vendorDetails,
        quantity: souvenir.quantity || 1
      }
    };
    
    console.log("💳 Frontend: Prepared payload:", payload);
    console.log("💳 Frontend: Making API call to /api/souvenirs/create-order");
    
    try {
      const res = await fetch("https://voyagerserver.onrender.com/api/souvenirs/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      console.log("💳 Frontend: API response received");
      console.log("💳 Frontend: Response status:", res.status);
      console.log("💳 Frontend: Response ok:", res.ok);
      
      const data = await res.json();
      console.log("💳 Frontend: Response data:", data);
      
      if (!res.ok || !data.order) {
        console.error("❌ Frontend: Order creation failed");
        console.error("❌ Frontend: Error message:", data.message);
        alert(data.message || "Order creation failed");
        return;
      }
      
      console.log("✅ Frontend: Order created successfully");
      console.log("✅ Frontend: Order details:", data.order);
      
      const order = data.order;
      const options = {
        key: "rzp_test_wb29ohYja8YQoG",
        amount: order.amount,
        currency: order.currency,
        name: "Voyeger Ltd.",
        description: `Souvenir Order - ${souvenir.name}`,
        order_id: order.id,
        handler: async function (response) {
          console.log("💳 Frontend: Razorpay handler called with response:", response);
          // No-op for simulation
        },
        theme: { color: "#000" },
      };
      
      console.log("💳 Frontend: Razorpay options prepared:", options);
      console.log("💳 Frontend: Opening Razorpay modal...");
      
      const rzp = new Razorpay(options);
      rzp.open();
      
      console.log("💳 Frontend: Razorpay modal opened, showing simulation buttons");
      setShowPaymentSimButtons(true); // Show Yes/No immediately
    } catch (error) {
      console.error("❌ Frontend: Exception in loadRazorpay:", error);
      console.error("❌ Frontend: Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      alert("Failed to initialize payment. Please try again.");
    }
  }

  const handleSimulateYes = async () => {
    console.log('💳 Frontend: handleSimulateYes called - Payment simulation successful');
    console.log('💳 Frontend: Setting payment success state');
    
    setPaymentSuccess(true);
    setShowPaymentSimButtons(false);
    setPaymentError("");

    console.log('💳 Frontend: Starting order saving process...');
    // Save order to database first
    const orderId = await saveSouvenirOrder();
    
    if (orderId) {
      console.log('💳 Frontend: Order saved successfully, starting email sending process...');
      // Send booking receipt email
      await sendBookingReceiptEmail();
      console.log('💳 Frontend: Email sending process completed');
    } else {
      console.error('💳 Frontend: Failed to save order, not sending email');
    }
  };

  const handleSimulateNo = () => {
    console.log('💳 Frontend: handleSimulateNo called - Payment simulation failed');
    setPaymentSuccess(false);
    setShowPaymentSimButtons(false);
    setPaymentError("Payment failed. Please try again.");
  };

  const sendBookingReceiptEmail = async () => {
    console.log('📧 Frontend: sendBookingReceiptEmail called');
    console.log('📧 Frontend: Form data:', formData);
    console.log('📧 Frontend: Souvenir data:', souvenir);
    
    try {
      const bookingDetails = {
        userName: `${formData.firstName} ${formData.lastName}`,
        userEmail: formData.email,
        itemName: souvenir.name,
        itemDescription: souvenir.description,
        itemCategory: souvenir.category,
        itemRegion: souvenir.region,
        quantity: souvenir.quantity || 1,
        price: souvenir.price,
        shippingCost: shippingCost,
        tax: tax,
        finalPrice: finalTotal,
        deliveryAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}, ${formData.country}`,
        deliveryDate: formData.deliveryDate,
        specialInstructions: formData.specialInstructions,
        paymentStatus: "Success",
        bookingDate: new Date().toLocaleString(),
        bookingId: `souvenir-${Date.now()}`
      };

      console.log('📧 Frontend: Prepared booking details:', bookingDetails);
      console.log('📧 Frontend: Making API call to /api/souvenirs/send-receipt');

      const response = await fetch("https://voyagerserver.onrender.com/api/souvenirs/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingDetails),
      });

      console.log('📧 Frontend: API response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();
      console.log('📧 Frontend: API response data:', data);
      
      if (data.success) {
        console.log('📧 Frontend: Email sent successfully, showing success toast');
        toast.success("Souvenir order receipt email sent successfully");
      } else {
        console.error('📧 Frontend: Email sending failed, showing error toast');
        console.error('📧 Frontend: Error details:', data.message);
        toast.error("Failed to send order receipt email. Please try again later.");
      }
    } catch (error) {
      console.error('📧 Frontend: Exception occurred while sending email');
      console.error('📧 Frontend: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      toast.error("An error occurred while sending order receipt email. Please try again later.");
    }
  };

  // Save souvenir order to database
  const saveSouvenirOrder = async () => {
    console.log('📝 Frontend: saveSouvenirOrder called');
    console.log('📝 Frontend: Form data:', formData);
    console.log('📝 Frontend: Souvenir data:', souvenir);
    
    try {
      const orderData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        country: formData.country,
        itemsName: souvenir.name,
        quantity: souvenir.quantity || 1,
        price: finalTotal,
        orderDate: new Date().toISOString(),
        deliveryDate: formData.deliveryDate,
        specialInstructions: formData.specialInstructions
      };

      console.log('📝 Frontend: Prepared order data:', orderData);
      console.log('📝 Frontend: Making API call to /api/souvenirs/create-order-db');

      const response = await fetch("https://voyagerserver.onrender.com/api/souvenirs/create-order-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      console.log('📝 Frontend: API response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();
      console.log('📝 Frontend: API response data:', data);
      
      if (data.success) {
        console.log('📝 Frontend: Order saved successfully, showing success toast');
        toast.success(`Order saved successfully! Order ID: ${data.orderId}`);
        return data.orderId;
      } else {
        console.error('📝 Frontend: Order saving failed, showing error toast');
        console.error('📝 Frontend: Error details:', data.message);
        toast.error("Failed to save order to database. Please try again later.");
        return null;
      }
    } catch (error) {
      console.error('📝 Frontend: Exception occurred while saving order');
      console.error('📝 Frontend: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      toast.error("An error occurred while saving order to database. Please try again later.");
      return null;
    }
  };

  const handleSubmit = (e) => {
    console.log("🎯 Frontend: handleSubmit called");
    e.preventDefault()
    
    if (validateForm()) {
      console.log("✅ Frontend: Form validation passed, calling loadRazorpay");
      loadRazorpay(); // Call Razorpay instead of onBookingComplete
    } else {
      console.log("❌ Frontend: Form validation failed, not proceeding");
    }
  }

  const totalPrice = souvenir.price * (souvenir.quantity || 1)
  const shippingCost = totalPrice >= 50 ? 0 : 9.99
  const tax = totalPrice * 0.08
  const finalTotal = totalPrice + shippingCost + tax

  console.log("🎯 Frontend: Price calculations:");
  console.log("🎯 Frontend: - Total price:", totalPrice);
  console.log("🎯 Frontend: - Shipping cost:", shippingCost);
  console.log("🎯 Frontend: - Tax:", tax);
  console.log("🎯 Frontend: - Final total:", finalTotal);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Product
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Order</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold">Shipping Address</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.zipCode ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.country ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="JP">Japan</option>
                    </select>
                    {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold">Payment Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cardName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cardNumber ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.expiryDate ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.cvv ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Options */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold">Delivery Options</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Delivery Date</label>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                  <textarea
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any special delivery instructions..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors"
            >
              Complete Order - ${finalTotal.toFixed(2)}
            </button>

            {/* Payment Simulation Buttons */}
            {showPaymentSimButtons && (
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4 text-center">Payment Simulation</h3>
                <div className="flex gap-4 justify-center">
                  <button
                    className="rounded-md bg-green-600 py-3 px-6 font-medium text-white hover:bg-green-700"
                    onClick={handleSimulateYes}
                  >
                    Payment Successful
                  </button>
                  <button
                    className="rounded-md bg-red-600 py-3 px-6 font-medium text-white hover:bg-red-700"
                    onClick={handleSimulateNo}
                  >
                    Payment Failed
                  </button>
                </div>
              </div>
            )}

            {/* Payment Success State */}
            {paymentSuccess && !showPaymentSimButtons && (
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Successful!</h3>
                  <p className="text-green-600">Your order has been placed successfully. You will receive a confirmation email shortly.</p>
                </div>
              </div>
            )}

            {/* Payment Error State */}
            {paymentError && (
              <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Payment Failed</h3>
                  <p className="text-red-600">{paymentError}</p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border sticky top-8">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={souvenir.image || "/placeholder.svg"}
                  alt={souvenir.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{souvenir.name}</h3>
                  <p className="text-gray-600 text-sm">{souvenir.region}</p>
                  <p className="text-sm">Qty: {souvenir.quantity || 1}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${totalPrice.toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
