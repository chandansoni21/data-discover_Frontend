import React from 'react';
import {
    FileText, Calendar, HardDrive, Layers, Hash, Tag,
    CheckCircle, Clock, BarChart3, TrendingUp, Zap,
    BookOpen, MessageSquare, Eye, Download
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Generate document summary data based on file type
const getDocumentSummary = (fileType, domain) => {
    const baseData = {
        metadata: {
            fileName: `${domain?.name || 'Document'}_Analysis.${fileType || 'pdf'}`,
            fileSize: '2.4 MB',
            uploadDate: new Date().toLocaleDateString(),
            lastModified: new Date().toLocaleDateString(),
            pages: fileType === 'pdf' ? 42 : null,
            words: 8420,
            characters: 45230
        },
        content: {
            sections: 12,
            subsections: 38,
            images: 8,
            tables: 5,
            charts: 3
        },
        analysis: {
            readingTime: '21 min',
            complexity: 'Medium',
            confidence: '94%',
            language: 'English'
        },
        topics: [
            { name: 'Business Analytics', relevance: 95, color: 'blue' },
            { name: 'Financial Metrics', relevance: 88, color: 'emerald' },
            { name: 'Data Insights', relevance: 82, color: 'purple' },
            { name: 'Performance KPIs', relevance: 75, color: 'amber' },
            { name: 'Market Trends', relevance: 68, color: 'cyan' }
        ],
        keyEntities: [
            { type: 'Organizations', count: 15, examples: ['Meridian Solutions', 'DataCorp', 'TechVentures'] },
            { type: 'Locations', count: 8, examples: ['New York', 'London', 'Singapore'] },
            { type: 'People', count: 12, examples: ['John Smith', 'Sarah Chen', 'Michael Foster'] },
            { type: 'Dates', count: 23, examples: ['Q4 2024', 'Jan 2025', 'FY 2024'] }
        ],
        insights: [
            { text: 'Document contains comprehensive financial analysis for Q4', type: 'info' },
            { text: 'High-confidence metrics detected throughout the document', type: 'positive' },
            { text: 'Multiple data sources referenced and validated', type: 'positive' },
            { text: 'Consider reviewing section 7 for updated compliance standards', type: 'warning' }
        ]
    };

    return baseData;
};

export default function DocumentSummary({ domain, fileType }) {
    const { isDark } = useTheme();
    const data = getDocumentSummary(fileType, domain);

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
            cyan: { bg: isDark ? 'bg-cyan-900/30' : 'bg-cyan-50', text: 'text-cyan-500', border: 'border-cyan-200' },
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className={`h-full overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-gray-50'} ${scrollbarClass}`} style={{ scrollBehavior: 'smooth' }}>
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className={`text-2xl font-bold ${textClass}`}>Document Summary</h2>
                        <p className={subTextClass}>AI-powered analysis of your document</p>
                    </div>
                    <div className={`px-4 py-2 ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'} rounded-full text-sm font-medium flex items-center gap-2`}>
                        <Eye className="w-4 h-4" />
                        Analyzed
                    </div>
                </div>

                {/* Document Metadata Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'File Type', value: fileType?.toUpperCase() || 'PDF', icon: FileText, color: 'blue' },
                        { label: 'File Size', value: data.metadata.fileSize, icon: HardDrive, color: 'emerald' },
                        { label: data.metadata.pages ? 'Pages' : 'Words', value: data.metadata.pages || data.metadata.words.toLocaleString(), icon: data.metadata.pages ? Layers : Hash, color: 'purple' },
                        { label: 'Upload Date', value: data.metadata.uploadDate, icon: Calendar, color: 'amber' },
                    ].map((item, idx) => {
                        const IconComponent = item.icon;
                        const colorClasses = getColorClasses(item.color);
                        return (
                            <div
                                key={idx}
                                className={`${bgClass} rounded-2xl p-5 border ${borderClass} hover:shadow-lg transition-all duration-300 group`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-2.5 rounded-xl ${colorClasses.bg} group-hover:scale-110 transition-transform`}>
                                        <IconComponent className={`w-5 h-5 ${colorClasses.text}`} />
                                    </div>
                                </div>
                                <p className={`text-sm ${subTextClass} mb-1`}>{item.label}</p>
                                <p className={`text-2xl font-bold ${textClass}`}>{item.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Analysis Metrics & Content Structure */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Analysis Metrics */}
                    <div className={`${bgClass} rounded-2xl p-6 border ${borderClass}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                                <BarChart3 className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${textClass}`}>Analysis Metrics</h3>
                                <p className={`text-xs ${subTextClass}`}>Document processing results</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Reading Time', value: data.analysis.readingTime, icon: Clock },
                                { label: 'Complexity', value: data.analysis.complexity, icon: TrendingUp },
                                { label: 'AI Confidence', value: data.analysis.confidence, icon: CheckCircle },
                                { label: 'Language', value: data.analysis.language, icon: MessageSquare }
                            ].map((metric, idx) => {
                                const IconComponent = metric.icon;
                                return (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <IconComponent className={`w-4 h-4 ${subTextClass}`} />
                                            <span className={`text-sm ${subTextClass}`}>{metric.label}</span>
                                        </div>
                                        <span className={`text-sm font-semibold ${textClass}`}>{metric.value}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Structure */}
                    <div className={`${bgClass} rounded-2xl p-6 border ${borderClass}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                                <BookOpen className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${textClass}`}>Content Structure</h3>
                                <p className={`text-xs ${subTextClass}`}>Document composition</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Sections', value: data.content.sections },
                                { label: 'Subsections', value: data.content.subsections },
                                { label: 'Images', value: data.content.images },
                                { label: 'Tables', value: data.content.tables },
                                { label: 'Charts', value: data.content.charts },
                                { label: 'Words', value: data.metadata.words.toLocaleString() }
                            ].map((item, idx) => (
                                <div key={idx} className={`p-3 rounded-xl ${cardBgClass} border ${borderClass}`}>
                                    <p className={`text-xs ${subTextClass} mb-1`}>{item.label}</p>
                                    <p className={`text-xl font-bold ${textClass}`}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Key Topics */}
                <div className={`${bgClass} rounded-2xl p-6 border ${borderClass}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                            <Tag className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className={`font-semibold ${textClass}`}>Key Topics Identified</h3>
                            <p className={`text-xs ${subTextClass}`}>AI-extracted themes and subjects</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {data.topics.map((topic, idx) => {
                            const colorClasses = getColorClasses(topic.color);
                            return (
                                <div key={idx} className="group">
                                    <div className="flex justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${colorClasses.text.replace('text-', 'bg-')}`} />
                                            <span className={`text-sm font-medium ${textClass}`}>{topic.name}</span>
                                        </div>
                                        <span className={`text-sm font-bold ${colorClasses.text}`}>{topic.relevance}%</span>
                                    </div>
                                    <div className={`h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                                        <div
                                            className={`h-full ${colorClasses.text.replace('text-', 'bg-')} rounded-full transition-all duration-700 group-hover:shadow-lg`}
                                            style={{ width: `${topic.relevance}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Key Entities & AI Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Key Entities */}
                    <div className={`${bgClass} rounded-2xl p-6 border ${borderClass}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-900/30' : 'bg-cyan-50'}`}>
                                <Hash className="w-5 h-5 text-cyan-500" />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${textClass}`}>Key Entities</h3>
                                <p className={`text-xs ${subTextClass}`}>Named entities extracted</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {data.keyEntities.map((entity, idx) => (
                                <div key={idx} className={`p-4 rounded-xl ${cardBgClass} border ${borderClass}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-sm font-semibold ${textClass}`}>{entity.type}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                                            {entity.count}
                                        </span>
                                    </div>
                                    <p className={`text-xs ${subTextClass}`}>{entity.examples.join(', ')}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Insights */}
                    <div className={`${bgClass} rounded-2xl p-6 border ${borderClass}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
                                <Zap className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${textClass}`}>AI Insights</h3>
                                <p className={`text-xs ${subTextClass}`}>Smart observations</p>
                            </div>
                        </div>
                        <div className="space-y-3">
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

                {/* Quick Actions */}
                <div className={`${bgClass} rounded-2xl p-6 border ${borderClass}`}>
                    <h3 className={`font-semibold ${textClass} mb-4`}>Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button className={`p-4 rounded-xl border ${borderClass} ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors flex flex-col items-center gap-2 group`}>
                            <Download className={`w-5 h-5 ${subTextClass} group-hover:text-blue-500 transition-colors`} />
                            <span className={`text-sm ${textClass}`}>Download</span>
                        </button>
                        <button className={`p-4 rounded-xl border ${borderClass} ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors flex flex-col items-center gap-2 group`}>
                            <Eye className={`w-5 h-5 ${subTextClass} group-hover:text-blue-500 transition-colors`} />
                            <span className={`text-sm ${textClass}`}>Preview</span>
                        </button>
                        <button className={`p-4 rounded-xl border ${borderClass} ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors flex flex-col items-center gap-2 group`}>
                            <MessageSquare className={`w-5 h-5 ${subTextClass} group-hover:text-blue-500 transition-colors`} />
                            <span className={`text-sm ${textClass}`}>Ask AI</span>
                        </button>
                        <button className={`p-4 rounded-xl border ${borderClass} ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors flex flex-col items-center gap-2 group`}>
                            <BarChart3 className={`w-5 h-5 ${subTextClass} group-hover:text-blue-500 transition-colors`} />
                            <span className={`text-sm ${textClass}`}>Analyze</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
