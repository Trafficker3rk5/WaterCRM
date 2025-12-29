import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Template/Layouts/AuthenticatedLayout';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function UsageStatsIndex({ auth, companies }) {
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [stats, setStats] = useState([]);
    const [currentStats, setCurrentStats] = useState(null);
    const [trends, setTrends] = useState(null);
    const [loading, setLoading] = useState(false);
    const [billingSummary, setBillingSummary] = useState(null);

    useEffect(() => {
        loadBillingSummary();
    }, []);

    useEffect(() => {
        if (selectedCompany) {
            loadCompanyStats(selectedCompany);
            loadCurrentStats(selectedCompany);
            loadTrends(selectedCompany);
        }
    }, [selectedCompany]);

    const loadBillingSummary = async () => {
        try {
            const response = await fetch('/usage-stats/billing/summary');
            const data = await response.json();
            setBillingSummary(data);
        } catch (error) {
            console.error('Error loading billing summary:', error);
        }
    };

    const loadCompanyStats = async (companyId) => {
        setLoading(true);
        try {
            const response = await fetch(`/usage-stats/company/${companyId}`);
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCurrentStats = async (companyId) => {
        try {
            const response = await fetch(`/usage-stats/company/${companyId}/current`);
            const data = await response.json();
            setCurrentStats(data);
        } catch (error) {
            console.error('Error loading current stats:', error);
        }
    };

    const loadTrends = async (companyId) => {
        try {
            const response = await fetch(`/usage-stats/company/${companyId}/trends?months=6`);
            const data = await response.json();
            setTrends(data);
        } catch (error) {
            console.error('Error loading trends:', error);
        }
    };

    const handleExportCSV = async () => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        window.location.href = `/usage-stats/export?month=${month}&year=${year}`;
    };

    const trendsChartData = trends ? {
        labels: trends.labels,
        datasets: [
            {
                label: 'Usuarios Activos',
                data: trends.users,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                yAxisID: 'y',
            },
            {
                label: 'Almacenamiento (GB)',
                data: trends.storage_gb,
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                yAxisID: 'y1',
            },
        ],
    } : null;

    const costChartData = trends ? {
        labels: trends.labels,
        datasets: [
            {
                label: 'Costo Mensual (€)',
                data: trends.cost,
                backgroundColor: 'rgba(139, 92, 246, 0.5)',
                borderColor: 'rgb(139, 92, 246)',
                borderWidth: 1,
            },
        ],
    } : null;

    const chartOptions = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Estadísticas de Uso y Facturación" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Estadísticas de Uso y Facturación
                                    </h2>
                                    <p className="text-gray-600">
                                        Monitoriza el uso del sistema y genera reportes de facturación
                                    </p>
                                </div>
                                <button
                                    onClick={handleExportCSV}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Exportar CSV
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Billing Summary Cards */}
                    {billingSummary && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Empresas Activas
                                                </dt>
                                                <dd className="text-lg font-semibold text-gray-900">
                                                    {billingSummary.summary.length}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Ingresos Totales
                                                </dt>
                                                <dd className="text-lg font-semibold text-gray-900">
                                                    €{billingSummary.total_revenue.toFixed(2)}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                                            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Período
                                                </dt>
                                                <dd className="text-lg font-semibold text-gray-900">
                                                    {billingSummary.month}/{billingSummary.year}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Company Selector */}
                        <div className="lg:col-span-1">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Seleccionar Empresa</h3>
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {companies.map(company => (
                                            <button
                                                key={company.id}
                                                onClick={() => setSelectedCompany(company.id)}
                                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                                    selectedCompany === company.id
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                <div className="font-medium truncate">{company.name}</div>
                                                <div className="text-sm opacity-75">ID: {company.id}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Display */}
                        <div className="lg:col-span-3">
                            {!selectedCompany ? (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="text-center py-12">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                                Selecciona una empresa
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Selecciona una empresa para ver sus estadísticas de uso
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Current Stats */}
                                    {currentStats && (
                                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                            <div className="p-6">
                                                <h3 className="text-lg font-semibold mb-4">Uso Actual</h3>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="text-center">
                                                        <div className="text-3xl font-bold text-blue-600">{currentStats.users_active}</div>
                                                        <div className="text-sm text-gray-600">Usuarios Activos</div>
                                                        <div className="text-xs text-gray-500">de {currentStats.users_total}</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-3xl font-bold text-green-600">
                                                            {(currentStats.storage_used_mb / 1024).toFixed(2)}
                                                        </div>
                                                        <div className="text-sm text-gray-600">GB Usados</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-3xl font-bold text-purple-600">
                                                            {currentStats.modules_active?.length || 0}
                                                        </div>
                                                        <div className="text-sm text-gray-600">Módulos Activos</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-3xl font-bold text-indigo-600">
                                                            €{parseFloat(currentStats.calculated_cost).toFixed(2)}
                                                        </div>
                                                        <div className="text-sm text-gray-600">Costo Mensual</div>
                                                    </div>
                                                </div>

                                                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <div className="text-sm text-gray-600">Instalaciones</div>
                                                        <div className="text-2xl font-semibold">{currentStats.installations_count}</div>
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <div className="text-sm text-gray-600">Presupuestos</div>
                                                        <div className="text-2xl font-semibold">{currentStats.budgets_created}</div>
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <div className="text-sm text-gray-600">Mensajes</div>
                                                        <div className="text-2xl font-semibold">{currentStats.messages_sent}</div>
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <div className="text-sm text-gray-600">Gastos</div>
                                                        <div className="text-2xl font-semibold">{currentStats.expenses_processed}</div>
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <div className="text-sm text-gray-600">Incidencias</div>
                                                        <div className="text-2xl font-semibold">{currentStats.incidents_created}</div>
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <div className="text-sm text-gray-600">Clientes</div>
                                                        <div className="text-2xl font-semibold">{currentStats.clients_created}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Trends Chart */}
                                    {trends && trendsChartData && (
                                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                            <div className="p-6">
                                                <h3 className="text-lg font-semibold mb-4">Tendencias de Uso</h3>
                                                <Line data={trendsChartData} options={chartOptions} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Cost Chart */}
                                    {trends && costChartData && (
                                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                            <div className="p-6">
                                                <h3 className="text-lg font-semibold mb-4">Evolución de Costos</h3>
                                                <Bar data={costChartData} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
