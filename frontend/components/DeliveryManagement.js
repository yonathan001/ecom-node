'use client';
import { useState, useEffect } from 'react';
import { useToast } from './Toast';

export default function DeliveryManagement() {
  const [deliveryUsers, setDeliveryUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone_number: '' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/delivery-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        addToast('Delivery user created successfully!', 'success');
        setShowForm(false);
        setFormData({ name: '', email: '', password: '', phone_number: '' });
        fetchDeliveryUsers();
      } else {
        const data = await res.json();
        addToast(data.error || 'Failed to create delivery user', 'error');
      }
    } catch (error) {
      addToast('Error creating delivery user', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Delivery Personnel</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          {showForm ? 'Cancel' : '+ Add Delivery User'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-black mb-4">Create Delivery User</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  required
                  minLength="8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  placeholder="0911121314"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Delivery User'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deliveryUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">{user.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="font-bold text-black">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            {user.phone_number && (
              <p className="text-sm text-gray-700 mb-2">📞 {user.phone_number}</p>
            )}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">Assigned Orders</span>
              <span className="font-bold text-black">{user._count.assigned_orders}</span>
            </div>
          </div>
        ))}
      </div>

      {deliveryUsers.length === 0 && !showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">No delivery users yet. Create one to get started!</p>
        </div>
      )}
    </div>
  );
}
