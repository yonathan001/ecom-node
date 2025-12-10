'use client';
import { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, priceRange, sortBy, searchQuery]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === parseInt(selectedCategory));
    }

    // Filter by price range
    filtered = filtered.filter(p => {
      const price = parseFloat(p.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => b.id - a.id);
        break;
    }

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange([0, 2000]);
    setSearchQuery('');
    setSortBy('newest');
  };

  const activeFiltersCount = [
    selectedCategory,
    priceRange[0] !== 0 || priceRange[1] !== 2000,
    searchQuery
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">All Products</h1>
          <p className="text-gray-600">Discover our complete collection</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-4 pl-12 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full mb-4 px-4 py-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-gray-900 font-medium"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </span>
              <svg className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-6`}>
              {/* Filter Header */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        checked={selectedCategory === ''}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-gray-900">All Categories</span>
                    </label>
                    {categories.map(cat => (
                      <label key={cat.id} className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="category"
                          value={cat.id}
                          checked={selectedCategory === cat.id.toString()}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-gray-700 group-hover:text-gray-900">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Price Range: {priceRange[0]} - {priceRange[1]} ETB
                  </label>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort & Results */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products found
              </p>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            {/* Products */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600 text-lg mb-2">No products found</p>
                <p className="text-gray-500 text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
