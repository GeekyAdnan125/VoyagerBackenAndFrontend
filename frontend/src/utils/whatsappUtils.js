// Helper function to generate WhatsApp links with live tracking
export const getWhatsappLinkWithTracking = (phone, userId, lat = null, lng = null) => {
  try {
    // Clean phone number (remove non-digits)
    const digitsOnly = phone.replace(/[^0-9]/g, "");
    if (!digitsOnly) {
      console.error('[WhatsApp] Invalid phone number:', phone);
      return "#";
    }

    // Base tracking URL
    const trackingUrl = `https://voyagerserver.onrender.com/track/${userId}`;
    
    // Build message
    let message = `🚨 EMERGENCY! I need help!\n\n`;
    message += `📍 Live tracking: ${trackingUrl}\n\n`;
    
    // Add static Google Maps link if coordinates provided
    if (lat && lng) {
      const staticMapUrl = `https://maps.google.com/?q=${lat},${lng}`;
      message += `🗺️ Static location: ${staticMapUrl}\n\n`;
    }
    
    message += `⏰ This tracking link will be active for 1 hour.\n`;
    message += `📱 Please check the live tracking link for real-time updates.`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Generate WhatsApp URL
    const whatsappUrl = `https://wa.me/${digitsOnly}?text=${encodedMessage}`;
    
    console.log('[WhatsApp] Generated tracking link for user:', userId);
    return whatsappUrl;
    
  } catch (error) {
    console.error('[WhatsApp] Error generating tracking link:', error);
    return "#";
  }
};

// Helper function to generate simple WhatsApp link (for backward compatibility)
export const getWhatsappLink = (phone, lat = null, lng = null) => {
  try {
    const digitsOnly = phone.replace(/[^0-9]/g, "");
    if (!digitsOnly) return "#";
    
    let message = `Emergency! I need help`;
    
    if (lat && lng) {
      message += ` at this location: https://maps.google.com/?q=${lat},${lng}`;
    }
    
    return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
  } catch (error) {
    console.error('[WhatsApp] Error generating simple link:', error);
    return "#";
  }
}; 