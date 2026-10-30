
import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function Checkout({ cart, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = cart.items.reduce(
    (sum, item) => sum + Number(item.subtotal || 0),
    0
  );

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function placeOrder(e) {
    e.preventDefault();
    setError("");

    if (!cart.items.length) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
  `${API}/orders`,
  {
    items: cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
    })),
    shippingAddress: form,
    paymentMethod: "COD",
  },
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("shopEaseToken")}`,
    },
  }
);

      onSuccess(response.data.order);
   } catch (err) {
  console.error("Order placement failed:", err);

  console.error("Backend response:", err.response?.data);

  setError(
    err.response?.data?.message ||
    err.message ||
    "Unable to place your order."
  );
} finally {
  setLoading(false);
}
  }

  return (
    <section className="checkout">
      <h2>Checkout</h2>

      <form onSubmit={placeOrder}>
        <input
          name="fullName"
          placeholder="Full name"
          value={form.fullName}
          onChange={handleChange}
          required
        />

        <input
          name="phone"
          placeholder="Phone number"
          value={form.phone}
          onChange={handleChange}
          pattern="[0-9]{10}"
          title="Enter a 10-digit phone number"
          required
        />

        <textarea
          name="address"
          placeholder="Full address"
          value={form.address}
          onChange={handleChange}
          required
        />

        <input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          required
        />

        <input
          name="pincode"
          placeholder="PIN code"
          value={form.pincode}
          onChange={handleChange}
          pattern="[0-9]{6}"
          title="Enter a 6-digit PIN code"
          required
        />

        <p>Payment: Cash on Delivery</p>
        <h3>Total: ₹{total.toLocaleString("en-IN")}</h3>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Placing order..." : "Place Order"}
        </button>

        <button type="button" onClick={onCancel}>
          Back to Cart
        </button>
      </form>
    </section>
  );
}

export default Checkout;
