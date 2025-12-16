'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '../../lib/auth-client';
import { formatPrice } from '../../lib/currency';
import { useToast } from '../../components/Toast';

export default function DeliveryDashboard() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    if (session.user.role !== 'delivery') {
      router.push('/');
      return;
    }
    fetchOrders();
  }, [session]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delivery/orders`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delivery/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        addToast('Order status updated!', 'success');
        fetchOrders();
      } else {
        const data = await res.json();
        addToast(data.error || 'Failed to update status', 'error');
      }
    } catch (error) {
      addToast('Error updating status', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-black">Delivery Dashboard</h1>
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-black">{orders.length}</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-600">No orders assigned yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-black">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h4 className="font-semibold text-black mb-2">Customer Details</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700"><span className="font-medium">Name:</span> {order.user.name}</p>
                      {order.user.phone_number && (
                        <p className="text-gray-700"><span className="font-medium">Phone:</span> {order.user.phone_number}</p>
                      )}
                      <p className="text-gray-700"><span className="font-medium">Email:</span> {order.user.email}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black mb-2">Delivery Address</h4>
                    <p className="text-sm text-gray-700">{order.shipping_address}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-black mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.product.name} x {item.quantity}</span>
                        <span className="text-black font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                    <span className="font-semibold text-black">Total</span>
                    <span className="font-bold text-black">{formatPrice(order.total_amount)}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {order.status === 'assigned' && (
                    <button
                      onClick={() => updateStatus(order.id, 'out_for_delivery')}
                      className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800"
                    >
                      Picked Up
                    </button>
                  )}
                  {order.status === 'out_for_delivery' && (
                    <button
                      onClick={() => updateStatus(order.id, 'delivered')}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <div className="flex-1 bg-green-100 text-green-800 py-2 rounded-lg text-center font-medium">
                      ✓ Delivered
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
