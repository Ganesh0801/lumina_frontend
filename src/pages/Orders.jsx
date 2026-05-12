import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import { LoadingSpinner, StatusBadge, EmptyState } from '../components/UI';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my')
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="pt-24 min-h-screen"><LoadingSpinner size="lg" text="Loading orders..." /></div>;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl font-bold text-dark-50 mb-2">My Orders</h1>
        <p className="text-dark-400 mb-8">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>

        {orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Orders Yet"
            description="Start shopping and your orders will appear here"
            action={<Link to="/products" className="btn-gold px-8 py-3 rounded-xl inline-flex items-center gap-2">Shop Now <ArrowRight className="w-4 h-4" /></Link>}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="glass rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-gold-500/30 transition-all group animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 bg-dark-700 rounded-xl overflow-hidden flex-shrink-0">
                    {order.items[0]?.image
                      ? <img src={order.items[0].image} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">💡</div>}
                  </div>
                  <div>
                    <p className="font-semibold text-dark-100 group-hover:text-gold-400 transition-colors">{order.orderNumber}</p>
                    <p className="text-dark-400 text-sm">{order.items.length} item{order.items.length > 1 ? 's' : ''} • {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p className="text-gold-400 font-bold">₹{order.total?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <ArrowRight className="w-4 h-4 text-dark-500 group-hover:text-gold-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
