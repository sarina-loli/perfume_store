import Footer from '../components/Footer'

/* ════════════════════════════════════
   ORDERS
════════════════════════════════════ */
export default function OrdersPage({ orders, loading, navigate }) {
  return (
    <div className="cart-page">
      <div className="cart-inner">
        <h1 className="page-title">Your Orders</h1>
        <p className="page-subtitle">
          {loading ? 'Loading…' : orders.length === 0 ? 'No orders yet' : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
        </p>

        {!loading && orders.length === 0 && (
          <div className="cart-empty">
            <div className="cart-empty-icon">✦</div>
            <h3>No orders yet</h3>
            <p>Once you check out, your orders will appear here.</p>
            <button className="btn-outline" style={{ display: 'inline-block', width: 'auto', padding: '0.75rem 2rem' }} onClick={() => navigate('home')}>
              Explore Collection
            </button>
          </div>
        )}

        {orders.map(order => (
          <div className="order-block" key={order.id}>
            <div className="order-block-header">
              <span className="order-id">Order #{order.id}</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
              <span className="order-status">{order.status}</span>
            </div>
            <div className="cart-items">
              {order.items.map(item => (
                <div key={item.id} className="cart-item">
                  <img className="cart-item-img" src={item.product?.img} alt={item.product_name} />
                  <div className="cart-item-details">
                    <h4>{item.product_name}</h4>
                    <p className="price">${item.price} each</p>
                    <p className="tagline">Qty {item.quantity}</p>
                  </div>
                  <div className="cart-item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="order-block-total">
              <span>Total</span>
              <span>${order.total}</span>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  )
}
