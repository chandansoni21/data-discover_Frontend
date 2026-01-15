import React from 'react';
import {
    BarChart3, TrendingUp, TrendingDown, Activity, Database,
    Users, DollarSign, ShoppingCart, FileText, Zap, ArrowUpRight,
    ArrowDownRight, PieChart, LineChart, AlertCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Dummy data for different domains
const getDashboardData = (domain, fileType) => {
    if (fileType === 'excel' || fileType === 'sql' || domain === 'finance' || domain === 'retail') {
        return {
            kpis: [
                { label: 'Total Revenue', value: '$1.24M', change: '+12.5%', trend: 'up', icon: DollarSign, color: 'emerald' },
                { label: 'Active Users', value: '8,420', change: '+5.2%', trend: 'up', icon: Users, color: 'blue' },
                { label: 'Conversion Rate', value: '3.45%', change: '-0.8%', trend: 'down', icon: TrendingUp, color: 'purple' },
                { label: 'Avg Order Value', value: '$142', change: '+8.1%', trend: 'up', icon: ShoppingCart, color: 'amber' },
            ],
            chartData: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    { label: 'Revenue', data: [65, 78, 90, 81, 95, 110] },
                    { label: 'Expenses', data: [45, 52, 48, 61, 55, 68] }
                ]
            },
            barData: [
                { label: 'Product A', value: 85, color: 'from-blue-500 to-blue-600' },
                { label: 'Product B', value: 65, color: 'from-purple-500 to-purple-600' },
                { label: 'Product C', value: 45, color: 'from-green-500 to-green-600' },
                { label: 'Product D', value: 75, color: 'from-orange-500 to-orange-600' },
                { label: 'Product E', value: 55, color: 'from-pink-500 to-pink-600' },
            ],
            pieData: [
                { label: 'Direct', value: 35, color: '#3B82F6' },
                { label: 'Organic', value: 25, color: '#8B5CF6' },
                { label: 'Referral', value: 20, color: '#10B981' },
                { label: 'Social', value: 15, color: '#F59E0B' },
                { label: 'Other', value: 5, color: '#EF4444' },
            ],
            insights: [
                { text: 'Revenue increased by 12.5% compared to last quarter', type: 'positive' },
                { text: 'Customer acquisition cost decreased by 8%', type: 'positive' },
                { text: 'Churn rate slightly increased, recommend retention campaign', type: 'warning' },
                { text: 'Top performing region: North America (+23%)', type: 'info' },
            ]
        };
    }

    return {
        kpis: [
            { label: 'Total Records', value: '12,450', change: '+245', trend: 'up', icon: Database, color: 'blue' },
            { label: 'Data Quality', value: '98.5%', change: '+1.2%', trend: 'up', icon: Activity, color: 'emerald' },
            { label: 'Processing Time', value: '1.2s', change: '-0.3s', trend: 'up', icon: Zap, color: 'amber' },
            { label: 'Documents', value: '156', change: '+12', trend: 'up', icon: FileText, color: 'purple' },
        ],
        chartData: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
                { label: 'Queries', data: [120, 185, 210, 245] },
                { label: 'Responses', data: [118, 182, 208, 243] }
            ]
        },
        barData: [
            { label: 'Category A', value: 72, color: 'from-blue-500 to-blue-600' },
            { label: 'Category B', value: 58, color: 'from-purple-500 to-purple-600' },
            { label: 'Category C', value: 89, color: 'from-green-500 to-green-600' },
            { label: 'Category D', value: 41, color: 'from-orange-500 to-orange-600' },
        ],
        pieData: [
            { label: 'Type A', value: 40, color: '#3B82F6' },
            { label: 'Type B', value: 30, color: '#8B5CF6' },
            { label: 'Type C', value: 20, color: '#10B981' },
            { label: 'Type D', value: 10, color: '#F59E0B' },
        ],
        insights: [
            { text: 'Data processing efficiency improved by 15%', type: 'positive' },
            { text: 'All automated checks passed successfully', type: 'positive' },
            { text: 'Consider archiving records older than 2 years', type: 'info' },
        ]
    };
};

export default function Dashboard({ domain, fileType }) {
    const { isDark } = useTheme();
    const data = getDashboardData(domain, fileType);

    const bgClass = isDark ? 'bg-gray-800' : 'bg-white';
    const cardBgClass = isDark ? 'bg-gray-700/50' : 'bg-gray-50';
    const textClass = isDark ? 'text-white' : 'text-gray-900';
    const subTextClass = isDark ? 'text-gray-400' : 'text-gray-500';
    const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';
    const scrollbarClass = isDark
        ? 'scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800'
        : 'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100';

    const getColorClasses = (color) => {
        const colors = {
            emerald: { bg: isDark ? 'bg-emerald-900/30' : 'bg-emerald-50', text: 'text-emerald-500', border: 'border-emerald-200' },
            blue: { bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-200' },
            purple: { bg: isDark ? 'bg-purple-900/30' : 'bg-purple-50', text: 'text-purple-500', border: 'border-purple-200' },
            amber: { bg: isDark ? 'bg-amber-900/30' : 'bg-amber-50', text: 'text-amber-500', border: 'border-amber-200' },
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className={`h-full overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-gray-50'} ${scrollbarClass}`} style={{ scrollBehavior: 'smooth' }}>
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className={`text-2xl font-bold ${textClass}`}>Analytics Dashboard</h2>
                        <p className={subTextClass}>Real-time insights from your data</p>
                    </div>
                    <div className={`px-4 py-2 ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'} rounded-full text-sm font-medium flex items-center gap-2`}>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Live Data
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {data.kpis.map((kpi, idx) => {
                        const IconComponent = kpi.icon;
                        const colorClasses = getColorClasses(kpi.color);
                        return (
                            <div
                                key={idx}
                                className={`${bgClass} rounded-2xl p-5 border ${borderClass} hover:shadow-lg transition-all duration-300 group`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-2.5 rounded-xl ${colorClasses.bg} group-hover:scale-110 transition-transform`}>
                                        <IconComponent className={`w-5 h-5 ${colorClasses.text}`} />
                                    </div>
                                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${kpi.trend === 'up'
                                            ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                                            : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {kpi.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {kpi.change}
                                    </div>
                                </div>
                                <p className={`text-sm ${subTextClass} mb-1`}>{kpi.label}</p>
                                <p className={`text-2xl font-bold ${textClass}`}>{kpi.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Trend Chart */}
                    <div className={`${bgClass} rounded-2xl p-6 border ${borderClass}`}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                                    <LineChart className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className={`font-semibold ${textClass}`}>Trend Analysis</h3>
                                    <p className={`text-xs ${subTextClass}`}>Last 6 periods</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-56 flex items-end justify-between gap-3">
                            {data.chartData.datasets[0].data.map((value, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center">
                                    <div className="w-full flex justify-center gap-1.5 flex-1 items-end">
                                        <div
                                            className="w-6 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer"
                                            style={{ height: `${(value / 120) * 100}%` }}
                                            title={`${data.chartData.datasets[0].label}: ${value}`}
                                        />
                                        <div
                                            className="w-6 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer"
                                            style={{ height: `${(data.chartData.datasets[1].data[idx] / 120) * 100}%` }}
                                            title={`${data.chartData.datasets[1].label}: ${data.chartData.datasets[1].data[idx]}`}
                                        />
                                    </div>
                                    <span className={`text-xs ${subTextClass} mt-3 font-medium`}>{data.chartData.labels[idx]}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center gap-8 mt-6 pt-4 border-t ${borderClass}">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded" />
                                <span className={`text-sm ${subTextClass}`}>{data.chartData.datasets[0].label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gradient-to-r from-purple-600 to-purple-400 rounded" />
                                <span className={`text-sm ${subTextClass}`}>{data.chartData.datasets[1].label}</span>
                            </div>
                        </div>
                    </div>

                    {/* Distribution Chart */}
                    <div className={`${bgClass} rounded-2xl p-6 border ${borderClass}`}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                                    <BarChart3 className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                    <h3 className={`font-semibold ${textClass}`}>Performance Distribution</h3>
                                    <p className={`text-xs ${subTextClass}`}>By category</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {data.barData.map((item, idx) => (
                                <div key={idx} className="group">
                                    <div className="flex justify-between mb-2">
                                        <span className={`text-sm font-medium ${textClass}`}>{item.label}</span>
                                        <span className={`text-sm font-bold ${textClass}`}>{item.value}%</span>
                                    </div>
                                    <div className={`h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                                        <div
                                            className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-700 group-hover:shadow-lg`}
                                            style={{ width: `${item.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pie Chart & Insights Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pie Chart */}
                    <div className={`${bgClass} rounded-2xl p-6 border ${borderClass}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                                <PieChart className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${textClass}`}>Traffic Sources</h3>
                                <p className={`text-xs ${subTextClass}`}>Distribution breakdown</p>
                            </div>
                        </div>
                        <div className="relative w-40 h-40 mx-auto mb-6">
                            <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                {data.pieData.reduce((acc, item, idx) => {
                                    const prevTotal = acc.total;
                                    const dashArray = (item.value / 100) * 283;
                                    const dashOffset = (prevTotal / 100) * 283;
                                    acc.elements.push(
                                        <circle
                                            key={idx}
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill="none"
                                            stroke={item.color}
                                            strokeWidth="10"
                                            strokeDasharray={`${dashArray} 283`}
                                            strokeDashoffset={-dashOffset}
                                            className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                                        />
                                    );
                                    acc.total += item.value;
                                    return acc;
                                }, { elements: [], total: 0 }).elements}
                            </svg>
                        </div>
                        <div className="space-y-2">
                            {data.pieData.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className={`text-sm ${subTextClass}`}>{item.label}</span>
                                    </div>
                                    <span className={`text-sm font-semibold ${textClass}`}>{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Insights */}
                    <div className={`lg:col-span-2 ${bgClass} rounded-2xl p-6 border ${borderClass}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
                                <Zap className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${textClass}`}>AI-Generated Insights</h3>
                                <p className={`text-xs ${subTextClass}`}>Smart recommendations based on your data</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.insights.map((insight, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-xl flex items-start gap-3 border transition-all hover:scale-[1.02] cursor-pointer ${insight.type === 'positive'
                                            ? isDark ? 'bg-green-900/20 border-green-800/50 hover:border-green-600' : 'bg-green-50 border-green-200 hover:border-green-400'
                                            : insight.type === 'warning'
                                                ? isDark ? 'bg-amber-900/20 border-amber-800/50 hover:border-amber-600' : 'bg-amber-50 border-amber-200 hover:border-amber-400'
                                                : isDark ? 'bg-blue-900/20 border-blue-800/50 hover:border-blue-600' : 'bg-blue-50 border-blue-200 hover:border-blue-400'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${insight.type === 'positive' ? 'bg-green-500'
                                            : insight.type === 'warning' ? 'bg-amber-500'
                                                : 'bg-blue-500'
                                        }`} />
                                    <p className={`text-sm ${textClass} leading-relaxed`}>{insight.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className={`${bgClass} rounded-2xl p-6 border ${borderClass}`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-900/30' : 'bg-cyan-50'}`}>
                                <Database className="w-5 h-5 text-cyan-500" />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${textClass}`}>Recent Data</h3>
                                <p className={`text-xs ${subTextClass}`}>Latest records from your dataset</p>
                            </div>
                        </div>
                        <button className={`text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors`}>
                            View All →
                        </button>
                    </div>
                    <div className="overflow-x-auto rounded-xl border ${borderClass}">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                                    <th className={`text-left py-4 px-5 font-semibold ${textClass} border-b ${borderClass}`}>ID</th>
                                    <th className={`text-left py-4 px-5 font-semibold ${textClass} border-b ${borderClass}`}>Name</th>
                                    <th className={`text-left py-4 px-5 font-semibold ${textClass} border-b ${borderClass}`}>Category</th>
                                    <th className={`text-left py-4 px-5 font-semibold ${textClass} border-b ${borderClass}`}>Value</th>
                                    <th className={`text-left py-4 px-5 font-semibold ${textClass} border-b ${borderClass}`}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4, 5].map((row) => (
                                    <tr key={row} className={`border-b ${borderClass} ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'} transition-colors`}>
                                        <td className={`py-4 px-5 ${subTextClass} font-mono`}>#{(1000 + row).toString().padStart(5, '0')}</td>
                                        <td className={`py-4 px-5 ${textClass} font-medium`}>Record {row}</td>
                                        <td className={`py-4 px-5 ${subTextClass}`}>Category {String.fromCharCode(64 + row)}</td>
                                        <td className={`py-4 px-5 font-semibold ${textClass}`}>${(row * 1234).toLocaleString()}</td>
                                        <td className="py-4 px-5">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${row % 3 === 0
                                                    ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                                                    : row % 3 === 1
                                                        ? isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                                                        : isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {row % 3 === 0 ? 'Completed' : row % 3 === 1 ? 'Active' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
