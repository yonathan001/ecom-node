'use client';
import { useState, useEffect } from 'react';
import { useToast } from './Toast';
import { formatPrice } from '../lib/currency';

export default function OrderAssignment({ orders, onOrderUpdated }) {
  const [deliveryUsers, setDeliveryUsers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchDeliveryUsers();
  }, []);

  const fetchDeliveryUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/delivery-users`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setDeliveryUsers(data);
      }
    } catch (error) {
      console.error('Error fetching delivery users:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedDelivery) {
      addToast('Please select a delivery person', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${selectedOrder.id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ delivery_user_id: selectedDelivery })
      });

      if (res.ok) {
        addToast('Order assigned successfully!', 'success');
        setSelectedOrder(null);
        setSelectedDelivery('');
        onOrderUpdated();
      } else {
        const data = await res.json();
        addToast(data.error || 'Failed to assign order', 'error');
      }
    } catch (error) {
      addToast('Error assigning order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-black mb-6">Order Assignment</h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-black">Order #{order.id}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleString()}
                </p>
                <p className="text-sm text-gray-700 mt-1">Customer: {order.user?.name}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-black">{formatPrice(order.total_amount)}</p>
                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium mt-2 ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {order.assigned_to ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ✓ Assigned to: <span className="font-semibold">{order.delivery_person?.name}</span>
                </p>
              </div>
            ) : (
              <button
                onClick={() => setSelectedOrder(order)}
                className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800"
              >
                Assign to Delivery
              </button>
            )}
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">No orders to assign</p>
        </div>
      )}

      {/* Assignment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-black mb-4">
              Assign Order #{selectedOrder.id}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">
                Select Delivery Person
              </label>
              <select
                value={selectedDelivery}
                onChange={(e) => setSelectedDelivery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
              >
                <option value="">Choose delivery person...</option>
                {deliveryUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user._count.assigned_orders} orders)
                  </option>
                ))}
              </select>
            </div>

            {deliveryUsers.length === 0 && (
              <p className="text-sm text-red-600 mb-4">
                No delivery users available. Create one first!
              </p>
            )}

            <div className="flex space-x-2">
              <button
                onClick={handleAssign}
                disabled={loading || !selectedDelivery}
                className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
              >
                {loading ? 'Assigning...' : 'Assign'}
              </button>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setSelectedDelivery('');
                }}
                className="flex-1 border border-gray-200 text-black py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
