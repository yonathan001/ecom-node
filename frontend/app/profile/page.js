'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '../../lib/auth-client';
import { useToast } from '../../components/Toast';
import { formatPrice } from '../../lib/currency';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchProfile();
    // Only fetch orders for customers (not admin or delivery)
    if (session.user.role !== 'delivery' && !session.user.is_admin) {
      fetchOrders();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setName(data.name);
        setPhoneNumber(data.phone_number || '');
        setAddress(data.address || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/orders`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          name,
          phone_number: phoneNumber,
          address
        })
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setEditing(false);
        addToast('Profile updated successfully!', 'success');
      } else {
        const data = await res.json();
        addToast(data.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      addToast('Error updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'paid':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 text-black">My Profile</h1>

        <div className={`grid grid-cols-1 ${session?.user?.role !== 'delivery' && !session?.user?.is_admin ? 'lg:grid-cols-3' : 'lg:grid-cols-1 max-w-2xl mx-auto'} gap-8`}>
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-6">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-black flex items-center justify-center">
                    <span className="text-3xl text-white font-bold">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <h2 className="text-xl font-bold text-black">{profile.name}</h2>
                <p className="text-gray-600 text-sm">{profile.email}</p>
              </div>

              {editing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-black focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-black focus:outline-none focus:border-black"
                      placeholder="0911121314"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Address
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-black focus:outline-none focus:border-black"
                      rows="3"
                      placeholder="Your address"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setName(profile.name);
                        setPhoneNumber(profile.phone_number || '');
                        setAddress(profile.address || '');
                      }}
                      className="flex-1 border border-gray-200 text-black py-2 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {profile.phone_number && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-gray-700">{profile.phone_number}</span>
                      </div>
                    )}
                    {profile.address && (
                      <div className="flex items-start text-sm">
                        <svg className="w-4 h-4 mr-2 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-700">{profile.address}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800"
                  >
                    Edit Profile
                  </button>
                </>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Member since {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Order History - Only show for customers */}
          {session?.user?.role !== 'delivery' && !session?.user?.is_admin && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-6 text-black">Order History</h2>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="text-gray-600 mb-4">No orders yet</p>
                    <button
                      onClick={() => router.push('/products')}
                      className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:border-black transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-black">Order #{order.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-black">{formatPrice(order.total_amount)}</p>
                          <div className="flex flex-wrap justify-end gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.payment_status)}`}>
                              {getStatusLabel(order.payment_status)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Tracking Timeline */}
                      {order.payment_status === 'paid' && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Order Status</p>
                          <div className="flex items-center justify-between text-xs">
                            <div className={`flex flex-col items-center ${order.status === 'confirmed' || order.status === 'assigned' || order.status === 'out_for_delivery' || order.status === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${order.status === 'confirmed' || order.status === 'assigned' || order.status === 'out_for_delivery' || order.status === 'delivered' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                                ✓
                              </div>
                              <span className="text-center">Confirmed</span>
                            </div>
                            <div className={`flex-1 h-1 mx-2 ${order.status === 'assigned' || order.status === 'out_for_delivery' || order.status === 'delivered' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                            <div className={`flex flex-col items-center ${order.status === 'assigned' || order.status === 'out_for_delivery' || order.status === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${order.status === 'assigned' || order.status === 'out_for_delivery' || order.status === 'delivered' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                                ✓
                              </div>
                              <span className="text-center">Assigned</span>
                            </div>
                            <div className={`flex-1 h-1 mx-2 ${order.status === 'out_for_delivery' || order.status === 'delivered' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                            <div className={`flex flex-col items-center ${order.status === 'out_for_delivery' || order.status === 'delivered' ? 'text-blue-600' : 'text-gray-400'}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${order.status === 'out_for_delivery' || order.status === 'delivered' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                                🚚
                              </div>
                              <span className="text-center">On the Way</span>
                            </div>
                            <div className={`flex-1 h-1 mx-2 ${order.status === 'delivered' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                            <div className={`flex flex-col items-center ${order.status === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${order.status === 'delivered' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                                ✓
                              </div>
                              <span className="text-center">Delivered</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.product.name} x {item.quantity}
                            </span>
                            <span className="text-black font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                        {order.shipping_address && (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Delivery Address:</span> {order.shipping_address}
                          </p>
                        )}
                        {order.payment_reference && (
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Payment Ref:</span> {order.payment_reference}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
