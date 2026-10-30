
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("shopEaseToken");

      if (!token) {
        setError("Please log in to view your orders.");
        return;
      }

      const response = await axios.get(
        `${API}/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("Fetch orders error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <section className="my-orders">
      <h2>My Orders</h2>
      <p>Loading your orders...</p>
    </section>;
  }

  return (
    <section className="my-orders">
      <h2>My Orders</h2>

      {error && (
        <p className="error-message">{error}</p>
      )}

      {!error && orders.length === 0 && (
        <p>You haven't placed any orders yet.</p>
      )}

      {orders.map((order) => (
        <div className="order-card" key={order._id}>

          <div className="order-header">
            <div>
              <h3>
                Order #{order._id.slice(-8).toUpperCase()}
              </h3>

              <p>
                Date: {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>

            <span className={`order-status ${order.status?.toLowerCase()}`}>
              {order.status}
            </span>
          </div>

          <div className="order-items">
            {order.items.map((item, index) => (
              <div className="order-item" key={index}>
                <div>
                  <strong>
                    {item.name || item.product?.name || "Product"}
                  </strong>

                  <p>Quantity: {item.quantity}</p>
                </div>

                <p>
                  ₹{(
                    Number(item.price) * Number(item.quantity)
                  ).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>

          <div className="order-footer">
            <strong>
              Total: ₹{Number(order.totalAmount).toLocaleString("en-IN")}
            </strong>

            <p>Payment: {order.paymentMethod}</p>
          </div>

        </div>
      ))}
    </section>
  );
}

export default MyOrders;
