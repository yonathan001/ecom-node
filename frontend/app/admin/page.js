'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/Toast';
import AdminProductForm from '../../components/AdminProductForm';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0 });
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        credentials: 'include'
      });
      
      if (res.status === 401) {
        addToast('Please login first', 'warning');
        router.push('/login');
        return;
      }
      
      fetchProducts();
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        credentials: 'include'
      });
      const data = await res.json();
      setOrders(data);
      
      // Calculate stats
      const totalRevenue = data.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
      const pendingOrders = data.filter(order => order.status === 'pending').length;
      setStats({
        totalOrders: data.length,
        totalRevenue: totalRevenue.toFixed(2),
        pendingOrders
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${deleteProductId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        addToast('Product deleted successfully!', 'success');
        fetchProducts();
      } else {
        addToast('Error deleting product', 'error');
      }
    } catch (error) {
      addToast('Error: ' + error.message, 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        addToast('Order status updated!', 'success');
        fetchOrders();
      } else {
        addToast('Error updating order status', 'error');
      }
    } catch (error) {
      addToast('Error: ' + error.message, 'error');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'products'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'orders'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Orders
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Manage Products</h2>
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowForm(!showForm);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showForm ? 'Cancel' : 'Add Product'}
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <AdminProductForm product={editingProduct} onSuccess={handleFormSuccess} />
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Image</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <img
                          src={product.image_url || 'https://via.placeholder.com/50'}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-lg"
                        />
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{product.name}</td>
                      <td className="px-6 py-4 text-gray-900">{product.price} ETB</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' : 
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{product.category_name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowForm(true);
                            }}
                            className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setDeleteProductId(product.id);
                              setShowDeleteModal(true);
                            }}
                            className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRevenue} ETB</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pending Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingOrders}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900 font-medium">#{order.id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-900 font-medium">{order.user_name}</p>
                          <p className="text-gray-500 text-sm">{order.user_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-semibold">{order.total_amount} ETB</td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer ${getStatusColor(order.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            const items = order.items.map(item => 
                              `${item.name} x${item.quantity} - ${item.price} ETB`
                            ).join('\n');
                            addToast(`Order Items:\n${items}`, 'info');
                          }}
                          className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all text-sm font-medium"
                        >
                          View Items
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
