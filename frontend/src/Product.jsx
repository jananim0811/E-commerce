
function Product({ products, loading, addToCart, cart }) {
  return (
    <section id="products">
      <h2>Our Products</h2>

      {loading && <p>Loading products...</p>}

      {!loading && products.length === 0 && (
        <p>No products available yet.</p>
      )}

      <div className="product-grid">
        {products.map((product) => {
          const cartItem = cart.items.find(
            (item) => item.product._id === product._id
          );

          const quantityInCart = cartItem
            ? cartItem.quantity
            : 0;

          return (
            <article className="product-card" key={product._id}>
              {product.image && (
                <img src={product.image} alt={product.name} />
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
  );
}

export default Product;
