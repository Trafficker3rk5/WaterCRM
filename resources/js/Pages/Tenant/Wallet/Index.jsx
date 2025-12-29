import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';

export default function WalletIndex({ auth, wallet, transactions }) {
    const [showNewTransaction, setShowNewTransaction] = useState(false);
    const [formData, setFormData] = useState({
        type: 'income',
        amount: '',
        payment_method: 'cash',
        concept: 'deposit',
        description: '',
        budget_id: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        router.post('/wallet/transaction', formData, {
            onSuccess: () => {
                setShowNewTransaction(false);
                setFormData({
                    type: 'income',
                    amount: '',
                    payment_method: 'cash',
                    concept: 'deposit',
                    description: '',
                    budget_id: ''
                });
            }
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const typeLabels = {
        income: 'Ingreso',
        outcome: 'Gasto'
    };

    const paymentMethodLabels = {
        cash: 'Efectivo',
        card: 'Tarjeta',
        transfer: 'Transferencia'
    };

    const conceptLabels = {
        deposit: 'Depósito',
        payment: 'Pago',
        delivery: 'Entrega'
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mi Cartera" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden shadow-lg sm:rounded-lg mb-6">
                        <div className="p-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-blue-200 text-sm mb-2">Saldo Disponible</p>
                                    <h2 className="text-4xl font-bold text-white mb-4">
                                        {formatCurrency(wallet?.balance || 0)}
                                    </h2>
                                    <div className="flex gap-4 text-sm">
                                        <div>
                                            <p className="text-blue-200">Ingresos Totales</p>
                                            <p className="text-white font-semibold">
                                                {formatCurrency(wallet?.total_income || 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-blue-200">Gastos Totales</p>
                                            <p className="text-white font-semibold">
                                                {formatCurrency(wallet?.total_outcome || 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowNewTransaction(true)}
                                    className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                                >
                                    + Nueva Transacción
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* New Transaction Modal */}
                    {showNewTransaction && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowNewTransaction(false)}>
                            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium">Nueva Transacción</h3>
                                    <button
                                        onClick={() => setShowNewTransaction(false)}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tipo
                                        </label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="income">Ingreso</option>
                                            <option value="outcome">Gasto</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cantidad (€)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Método de Pago
                                        </label>
                                        <select
                                            value={formData.payment_method}
                                            onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="cash">Efectivo</option>
                                            <option value="card">Tarjeta</option>
                                            <option value="transfer">Transferencia</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Concepto
                                        </label>
                                        <select
                                            value={formData.concept}
                                            onChange={(e) => setFormData({...formData, concept: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="deposit">Depósito</option>
                                            <option value="payment">Pago</option>
                                            <option value="delivery">Entrega</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descripción (opcional)
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowNewTransaction(false)}
                                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Transactions List */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Últimas Transacciones</h3>

                            {transactions && transactions.length > 0 ? (
                                <div className="space-y-4">
                                    {transactions.map(transaction => (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                    transaction.type === 'income'
                                                        ? 'bg-green-100'
                                                        : 'bg-red-100'
                                                }`}>
                                                    {transaction.type === 'income' ? (
                                                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                                        </svg>
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {conceptLabels[transaction.concept]}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {paymentMethodLabels[transaction.payment_method]} • {new Date(transaction.created_at).toLocaleDateString()}
                                                    </div>
                                                    {transaction.description && (
                                                        <div className="text-sm text-gray-600 mt-1">
                                                            {transaction.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={`text-lg font-semibold ${
                                                transaction.type === 'income'
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}>
                                                {transaction.type === 'income' ? '+' : '-'}
                                                {formatCurrency(transaction.amount)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        No hay transacciones
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Comienza registrando tu primera transacción
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
