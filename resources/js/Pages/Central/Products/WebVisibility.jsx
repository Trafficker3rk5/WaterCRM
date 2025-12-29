import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';

export default function WebVisibility({ auth, products, categories }) {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [filter, setFilter] = useState('all');

    const handleToggleVisibility = async (productId) => {
        try {
            await fetch(`/products/${productId}/toggle-visibility`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });

            router.reload({ only: ['products'] });
        } catch (error) {
            console.error('Error toggling visibility:', error);
        }
    };

    const handleToggleFeatured = async (productId) => {
        try {
            await fetch(`/products/${productId}/toggle-featured`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });

            router.reload({ only: ['products'] });
        } catch (error) {
            console.error('Error toggling featured:', error);
        }
    };

    const handleBulkVisibility = async (visible) => {
        if (selectedProducts.length === 0) {
            alert('Selecciona al menos un producto');
            return;
        }

        try {
            await fetch('/products/bulk-visibility', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    product_ids: selectedProducts,
                    visible_in_web: visible
                })
            });

            setSelectedProducts([]);
            router.reload({ only: ['products'] });
        } catch (error) {
            console.error('Error updating visibility:', error);
        }
    };

    const toggleProductSelection = (productId) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredProducts.map(p => p.id));
        }
    };

    const filteredProducts = products.filter(product => {
        if (filter === 'visible') return product.visible_in_web;
        if (filter === 'hidden') return !product.visible_in_web;
        if (filter === 'featured') return product.featured;
        return true;
    });

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Visibilidad Web de Productos" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Visibilidad Web de Productos
                            </h2>
                            <p className="text-gray-600">
                                Gestiona qué productos se muestran en tu sitio web y plugins de WordPress
                            </p>
                        </div>
                    </div>

                    {/* Filters and Bulk Actions */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex flex-wrap gap-4 items-center justify-between">
                                {/* Filters */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilter('all')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            filter === 'all'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Todos ({products.length})
                                    </button>
                                    <button
                                        onClick={() => setFilter('visible')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            filter === 'visible'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Visibles ({products.filter(p => p.visible_in_web).length})
                                    </button>
                                    <button
                                        onClick={() => setFilter('hidden')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            filter === 'hidden'
                                                ? 'bg-gray-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Ocultos ({products.filter(p => !p.visible_in_web).length})
                                    </button>
                                    <button
                                        onClick={() => setFilter('featured')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            filter === 'featured'
                                                ? 'bg-yellow-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        ⭐ Destacados ({products.filter(p => p.featured).length})
                                    </button>
                                </div>

                                {/* Bulk Actions */}
                                {selectedProducts.length > 0 && (
                                    <div className="flex gap-2">
                                        <span className="text-sm text-gray-600 flex items-center mr-2">
                                            {selectedProducts.length} seleccionados
                                        </span>
                                        <button
                                            onClick={() => handleBulkVisibility(true)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            👁️ Mostrar
                                        </button>
                                        <button
                                            onClick={() => handleBulkVisibility(false)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            🚫 Ocultar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                                                onChange={toggleSelectAll}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Producto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Categoría Web
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Visible
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Destacado
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Orden
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProducts.map(product => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(product.id)}
                                                    onChange={() => toggleProductSelection(product.id)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {product.model}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {product.category_web || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => handleToggleVisibility(product.id)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        product.visible_in_web
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {product.visible_in_web ? '👁️ Visible' : '🚫 Oculto'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => handleToggleFeatured(product.id)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        product.featured
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {product.featured ? '⭐ Sí' : '☆ No'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                                {product.order_web || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <button
                                                    onClick={() => router.visit(`/products/${product.id}/web-settings`)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    ⚙️ Configurar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredProducts.length === 0 && (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        No hay productos para mostrar
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Intenta cambiar el filtro o crear nuevos productos
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
