import { useEffect, useState } from "react";
import axios from "axios";
import Auth from "./Auth.jsx";
import "./style.css";
import Checkout from "./Checkout";
import MyOrders from "./MyOrders";

const API = "http://localhost:5000/api";

function getCartSessionId() {
  let id = localStorage.getItem("shopEaseCartId");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("shopEaseCartId", id);
  }

  return id;
}

function App() {
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [user, setUser] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("shopEaseUser")) || null;
  } catch {
    return null;
  }
});

const [showAuth, setShowAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({
    items: [],
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartSessionId] = useState(getCartSessionId);

  useEffect(() => {
    async function loadData() {
      try {
        const [productResponse, cartResponse] =
          await Promise.all([
            axios.get(`${API}/products`),
            axios.get(`${API}/cart/${cartSessionId}`)
          ]);

        setProducts(productResponse.data);
        setCart(cartResponse.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load products or cart.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [cartSessionId]);

  async function addToCart(productId) {
    try {
      setError("");

      const response = await axios.post(
        `${API}/cart/${cartSessionId}/items`,
        { productId }
      );

      setCart(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to add product to cart."
      );
    }
  }

  async function updateQuantity(productId, quantity) {
    try {
      setError("");

      const response = await axios.patch(
        `${API}/cart/${cartSessionId}/items/${productId}`,
        { quantity }
      );

      setCart(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update quantity."
      );
    }
  }

  async function removeFromCart(productId) {
    try {
      setError("");

      const response = await axios.delete(
        `${API}/cart/${cartSessionId}/items/${productId}`
      );

      setCart(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to remove product."
      );
    }
  }

  const totalItems = cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="app">
      <header className="navbar">
        <h1>ShopEase</h1>

        <nav>
          
<nav>
  <a href="#home">Home</a>
  <a href="#products">Products</a>
  <a href="#cart">Cart</a>

  {user && (
  <button onClick={() => setShowMyOrders(true)}>
    My Orders
  </button>
)}

  {user ? (
    <>
      <span>Hi, {user.name}</span>
      <button
        type="button"
        onClick={() => {
          localStorage.removeItem("shopEaseToken");
          localStorage.removeItem("shopEaseUser");
          setUser(null);
        }}
      >
        Logout
      </button>
    </>
  ) : (
    <button
      type="button"
      onClick={() => setShowAuth(true)}
    >
      Sign In
    </button>
  )}
</nav>

        </nav>
      </header>

      <section className="hero" id="home">
        <h2>Discover Your Next Favourite</h2>
        <p>Explore our collection of products.</p>

        <a href="#products" className="shop-button">
          Shop Now
        </a>
      </section>

      <main>
      {showMyOrders ? (
  <MyOrders
    onBack={() => setShowMyOrders(false)}
  />
) : (
  <>
    {/* Keep all your existing product, cart,
        checkout, and order-success JSX here. */}
  </>
)}
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
       {showAuth && (
  <Auth
    onLogin={setUser}
    onClose={() => setShowAuth(false)}
  />
)}
        <section id="products">
          <h2>Our Products</h2>

          {loading && <p>Loading products...</p>}

          {!loading && products.length === 0 && (
            <p>No products available yet.</p>
          )}

          <div className="product-grid">
            {products.map((product) => {
              const cartItem = cart.items.find(
                (item) =>
                  item.product._id === product._id
              );

              const quantityInCart = cartItem
                ? cartItem.quantity
                : 0;

              return (
                <article
                  className="product-card"
                  key={product._id}
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                    />
                  )}

                  <h3>{product.name}</h3>
                  <p>{product.description}</p>

                  <strong>
                    ₹{product.price.toLocaleString("en-IN")}
                  </strong>

                  <p>Category: {product.category}</p>
                  <p>Stock: {product.stock}</p>

                  <button
                    className="primary-button"
                    onClick={() => addToCart(product._id)}
                    disabled={
                      product.stock === 0 ||
                      quantityInCart >= product.stock
                    }
                  >
                    {product.stock === 0
                      ? "Out of Stock"
                      : quantityInCart >= product.stock
                      ? "Stock Limit Reached"
                      : "Add to Cart"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section id="cart" className="cart-section">
          <h2>
            Shopping Cart ({totalItems} items)
          </h2>

          {cart.items.length === 0 ? (
            <p>Your cart is empty. Add some products!</p>
          ) : (
            <>
              <div className="cart-list">
                {cart.items.map((item) => {
                  const product = item.product;

                  return (
                    <article
                      className="cart-item"
                      key={product._id}
                    >
                      <div className="cart-product">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                          />
                        )}

                        <div>
                          <h3>{product.name}</h3>
                          <p>
                            ₹{product.price.toLocaleString("en-IN")}
                            {" "}each
                          </p>
                          <p>
                            Subtotal: ₹
                            {item.subtotal.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <div className="cart-actions">
                        <div className="quantity-control">
                          <button
                            onClick={() =>
                              updateQuantity(
                                product._id,
                                item.quantity - 1
                              )
                            }
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease ${product.name} quantity`}
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            onClick={() =>
                              updateQuantity(
                                product._id,
                                item.quantity + 1
                              )
                            }
                            disabled={
                              item.quantity >= product.stock
                            }
                            aria-label={`Increase ${product.name} quantity`}
                          >
                            +
                          </button>
                        </div>

                        <button
                          className="remove-button"
                          onClick={() =>
                            removeFromCart(product._id)
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="cart-summary">
                <h3>
                  Total: ₹
                  {cart.total.toLocaleString("en-IN")}
                </h3>

                <button className="primary-button" onClick={() => setShowCheckout(true)}>
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </section>
        {showCheckout && (
  <Checkout
    cart={cart}
    onCancel={() => setShowCheckout(false)}
    onSuccess={(order) => {
      setCompletedOrder(order);
      setShowCheckout(false);
      setCart({ items: [], total: 0 });
    }}
  />
)}

{completedOrder && (
  <section className="order-success">
    <h2>Order Placed Successfully!</h2>
    <p>Thank you for shopping with us.</p>
    <button
      onClick={() => setCompletedOrder(null)}
    >
      Continue Shopping
    </button>
  </section>
)}

      </main>

      <footer className="footer">
        <p>ShopEase - Your Online Shopping Store</p>
      </footer>
    </div>
  );
}

export default App;



