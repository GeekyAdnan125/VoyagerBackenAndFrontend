import { useState, useEffect } from "react";
import axios from "axios";
import { useAppContext } from "../../context/AppContext";

export function useVendorData() {
  const { user } = useAppContext();
  const vendorName = user?.name || "Default Vendor";

  const [souvenirs, setSouvenirs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      if (!user?.token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch souvenirs and orders in parallel
        const [souvenirResponse, ordersResponse] = await Promise.all([
          axios.get(
            `https://voyagerserver.onrender.com/api/souvenirs/vendor/${encodeURIComponent(
              vendorName
            )}`,
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          ),
          axios.get("https://voyagerserver.onrender.com/api/souvenirs/orders", {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }),
        ]);

        // Process souvenirs
        let souvenirNames = [];
        if (
          souvenirResponse.data.success &&
          Array.isArray(souvenirResponse.data.data)
        ) {
          souvenirNames = souvenirResponse.data.data.map((s) => s.name);
          setSouvenirs(souvenirNames);
        } else {
          setSouvenirs([]);
        }

        // Process and filter orders
        if (
          ordersResponse.data.success &&
          Array.isArray(ordersResponse.data.data)
        ) {
          const allOrders = ordersResponse.data.data;
          const vendorOrders = allOrders.filter((order) =>
            souvenirNames.includes(order.itemsName)
          );
          setOrders(vendorOrders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        setError(err);
        console.error("❌ Error fetching vendor data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, vendorName]);

  return { souvenirs, orders, loading, error };
} 