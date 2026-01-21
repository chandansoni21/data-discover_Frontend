import React, { useState, useEffect, useRef } from 'react';
import {
    Send, Database, Table, FileText, ChevronRight,
    BarChart3, PieChart, Info, Maximize2, X, RefreshCcw,
    Loader2, AlertCircle, Eye, Download, Search, Plus, Minus,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API, IDManager } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import './UnifiedChatInterface.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const Plot = createPlotlyComponent(Plotly);

// Helper component to render tables using AG Grid
const ChatTable = ({ html, isDark }) => {
    const parseData = (htmlString) => {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');
            const table = doc.querySelector('table');
            if (!table) return null;

            const headers = Array.from(table.querySelectorAll('thead th, thead td')).map(cell => cell.innerText.trim());
            const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => {
                const cells = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
                const rowData = {};
                headers.forEach((header, index) => {
                    rowData[header] = cells[index] || '';
                });
                return rowData;
            });

            const columnDefs = headers.map(header => ({
                field: header,
                headerName: header,
                filter: true,
                sortable: true,
                resizable: true,
                flex: 1,
                minWidth: 150
            }));

            return { rowData: rows, columnDefs };
        } catch (e) {
            console.error("Failed to parse table:", e);
            return null;
        }
    };

    const data = parseData(html);
    if (!data || data.rowData.length === 0) {
        return <div className="chat-response-html" dangerouslySetInnerHTML={{ __html: html }} />;
    }

    return (
        <div
            className={isDark ? "ag-theme-quartz-dark" : "ag-theme-quartz"}
            style={{ height: data.rowData.length > 10 ? '400px' : 'auto', width: '100%', marginTop: '1rem', marginBottom: '1rem' }}
        >
            <AgGridReact
                rowData={data.rowData}
                columnDefs={data.columnDefs}
                pagination={data.rowData.length > 5}
                paginationPageSize={10}
                domLayout={data.rowData.length > 10 ? 'normal' : 'autoHeight'}
                defaultColDef={{
                    filter: true,
                    sortable: true,
                    resizable: true,
                }}
            />
        </div>
    );
};

const UnifiedChatInterface = ({ dbName, visibility = 'local' }) => {
    const { isDark } = useTheme();
    const navigate = useNavigate();

    // States for data
    const [availableTables, setAvailableTables] = useState([]);
    const [selectedTables, setSelectedTables] = useState([]);
    const [activeTable, setActiveTable] = useState(null);
    const [messagesByTable, setMessagesByTable] = useState({}); // Per-table chat persistence
    const [inputValue, setInputValue] = useState('');

    // Loading & Error states
    const [selectionMode, setSelectionMode] = useState(false);
    const [checkedTables, setCheckedTables] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isTablesLoading, setIsTablesLoading] = useState(false);
    const [isSidebarLoading, setIsSidebarLoading] = useState(false);
    const [tableSearchQuery, setTableSearchQuery] = useState('');
    const [error, setError] = useState(null);

    // Preview Modal state
    const [previewData, setPreviewData] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewRows, setPreviewRows] = useState(5);

    const messagesEndRef = useRef(null);

    // 1. Fetch available tables for Document Preview Panel
    const fetchAvailableTables = async () => {
        setIsTablesLoading(true);
        try {
            const response = await API.sql.getTables(dbName, visibility);
            if (response.data && response.data.tables) {
                setAvailableTables(response.data.tables);
            } else {
                setAvailableTables([]);
            }
        } catch (err) {
            console.error('Error fetching tables:', err);
        } finally {
            setIsTablesLoading(false);
        }
    };

    // 3. Fetch previously selected tables
    const fetchSelectedTables = async () => {
        setIsSidebarLoading(true);
        try {
            const response = await API.sql.getSelectedTables(dbName);
            // Support 'tables' or 'selected_tables' for flexibility
            const tables = response.data.tables || response.data.selected_tables || [];
            setSelectedTables(tables);

            // Set first table as active if none set
            if (tables.length > 0 && !activeTable) {
                const firstTable = typeof tables[0] === 'object' ? tables[0].name : tables[0];
                setActiveTable(firstTable);
            }
        } catch (err) {
            console.error('Error fetching selected tables:', err);
        } finally {
            setIsSidebarLoading(false);
        }
    };

    // 2. Select a table and persist
    const handleSelectTable = async (tableName) => {
        try {
            await API.sql.storeSelectTable(
                dbName,
                tableName,
                visibility === 'public' ? 'global' : 'local'
            );
            // Refresh sidebar
            fetchSelectedTables();
            toast.success(`Table "${tableName}" added successfully`);
        } catch (err) {
            console.error('Error storing selected table:', err);
            toast.error('Failed to add table');
        }
    };

    const handleRemoveTable = async (tableName) => {
        try {
            await API.sql.removeSelectTable(dbName, tableName);

            // If the table we're removing was active, reset it
            if (activeTable === tableName) {
                setActiveTable(null);
            }

            // Refresh sidebar
            fetchSelectedTables();
            toast.success(`Table "${tableName}" removed`);
        } catch (err) {
            console.error('Error removing selected table:', err);
            toast.error('Failed to remove table');
        }
    };

    const handleBulkRemove = async () => {
        if (checkedTables.length === 0) return;

        try {
            setIsSidebarLoading(true);
            await API.sql.removeSelectedTables(dbName, checkedTables);

            // If any of the removed tables was active, reset activeTable
            if (checkedTables.includes(activeTable)) {
                setActiveTable(null);
            }

            toast.success(`${checkedTables.length} tables removed successfully`);
            setCheckedTables([]);
            setSelectionMode(false);
            fetchSelectedTables();
        } catch (err) {
            console.error('Error removing selected tables:', err);
            toast.error('Failed to remove selected tables');
        } finally {
            setIsSidebarLoading(false);
        }
    };

    // 4. Preview table content
    const handlePreviewTable = async (tableName, rows = 5) => {
        setIsPreviewLoading(true);
        setShowPreviewModal(true);
        try {
            const response = await API.sql.getTablePreview(dbName, tableName, rows, visibility === 'public' ? 'global' : 'local');
            const dataRows = response.data.rows || response.data.data || [];

            // Extract columns dynamically from the first row if columns aren't provided
            let columns = response.data.columns || [];
            if (columns.length === 0 && dataRows.length > 0) {
                columns = Object.keys(dataRows[0]);
            }

            setPreviewData({
                tableName,
                columns: columns,
                rows: dataRows
            });
        } catch (err) {
            console.error('Error previewing table:', err);
            setError('Failed to load table preview');
        } finally {
            setIsPreviewLoading(false);
        }
    };

    // 7. Chat Behaviour
    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;
        if (!activeTable) {
            toast.error('Please select a table to start the conversation');
            return;
        }

        const userMsg = {
            id: Date.now(),
            type: 'user',
            text: inputValue,
            timestamp: new Date()
        };

        // Add user message to specific table's history
        setMessagesByTable(prev => ({
            ...prev,
            [activeTable]: [...(prev[activeTable] || []), userMsg]
        }));

        setInputValue('');
        setIsLoading(true);

        try {
            const response = await API.chat.sendQuery({
                query: userMsg.text,
                database: dbName,
                dataset_id: activeTable,
                table_name: activeTable,
                visibility: visibility === 'public' ? 'global' : 'local'
            });

            const botMsg = {
                id: Date.now() + 1,
                type: 'bot',
                text: response.data.bot_answer,
                sources: response.data.sources || [],
                charts: response.data.charts || null,
                timestamp: new Date()
            };

            // Add bot response to specific table's history
            setMessagesByTable(prev => ({
                ...prev,
                [activeTable]: [...(prev[activeTable] || []), botMsg]
            }));
        } catch (err) {
            console.error('Error sending query:', err);
            toast.error('Message failed to send');

            const errorMsg = {
                id: Date.now() + 1,
                type: 'bot',
                text: 'Sorry, I encountered an error. Please try again.',
                isError: true,
                timestamp: new Date()
            };

            setMessagesByTable(prev => ({
                ...prev,
                [activeTable]: [...(prev[activeTable] || []), errorMsg]
            }));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (dbName) {
            // Generate new Trace ID only when DB context changes
            IDManager.generateNewTraceId();

            // Reset selection state
            setSelectionMode(false);
            setCheckedTables([]);

            fetchAvailableTables();
            fetchSelectedTables();

            // Test toast
            toast.success(`Connected to ${dbName}`);
        }
    }, [dbName]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messagesByTable, activeTable]);

    // Current conversation scoped to the active table
    const currentMessages = activeTable ? (messagesByTable[activeTable] || []) : [];

    // Theme-based classes
    const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-50';
    const cardBgClass = isDark ? 'bg-slate-800' : 'bg-white';
    const borderClass = isDark ? 'border-slate-700' : 'border-gray-200';
    const textClass = isDark ? 'text-slate-100' : 'text-gray-900';
    const subTextClass = isDark ? 'text-slate-400' : 'text-gray-500';

    const ChartRenderer = ({ charts }) => {
        if (!charts) return null;

        // Ensure we handle both a single chart object or an array of charts
        const chartList = Array.isArray(charts) ? charts : [charts];

        const renderChart = (chart, index) => {
            if (!chart || !chart.type) return null;

            const commonLayout = {
                autosize: true,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { color: isDark ? '#f1f5f9' : '#1e293b' },
                margin: { l: 40, r: 20, t: 40, b: 40 },
                showlegend: true,
                ...(chart.layout || {})
            };

            if (chart.type === 'pie') {
                return (
                    <div key={index} className="mt-4 w-full h-80 bg-slate-800/20 rounded-xl p-2">
                        <Plot
                            data={[{
                                type: 'pie',
                                labels: chart.data?.labels || [],
                                values: chart.data?.values || [],
                                hole: chart.data?.hole || 0,
                                ...(chart.data || {})
                            }]}
                            layout={{
                                ...commonLayout,
                                title: chart.data?.title || chart.layout?.title || 'Data Distribution'
                            }}
                            style={{ width: '100%', height: '100%' }}
                            config={{ responsive: true, displayModeBar: false }}
                        />
                    </div>
                );
            }

            if (chart.type === 'bar') {
                return (
                    <div key={index} className="mt-4 w-full h-80 bg-slate-800/20 rounded-xl p-2">
                        <Plot
                            data={[{
                                type: 'bar',
                                x: chart.x || chart.data?.x || [],
                                y: chart.y || chart.data?.y || [],
                                marker: { color: '#3b82f6' },
                                ...(chart.data || {})
                            }]}
                            layout={{
                                ...commonLayout,
                                title: chart.layout?.title || chart.data?.title || 'Data Trends'
                            }}
                            style={{ width: '100%', height: '100%' }}
                            config={{ responsive: true, displayModeBar: false }}
                        />
                    </div>
                );
            }

            return null;
        };

        return (
            <div className="space-y-4">
                {chartList.map((chart, i) => renderChart(chart, i))}
            </div>
        );
    };

    return (
        <div className={`flex h-screen w-full overflow-hidden ${bgClass} ${textClass}`}>

            {/* LEFT SIDEBAR: Selected Tables */}
            <div className={`w-64 border-r ${borderClass} flex flex-col ${cardBgClass} transition-all`}>
                <div className={`p-4 border-b ${borderClass} flex items-center gap-3`}>
                    <button
                        onClick={() => navigate(-1)}
                        className={`p-1.5 rounded-lg hover:bg-slate-700/50 transition-all ${subTextClass}`}
                        title="Go Back"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Database className="w-4 h-4 text-blue-500 shrink-0" />
                        <h2 className="font-bold truncate text-sm">{dbName}</h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    <div className="px-2 py-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Selected Tables</span>
                        {selectedTables.length > 0 && (
                            <button
                                onClick={() => {
                                    setSelectionMode(!selectionMode);
                                    setCheckedTables([]);
                                }}
                                className={`text-[10px] font-semibold transition-colors ${selectionMode ? 'text-red-400 hover:text-red-300' : 'text-blue-500 hover:text-blue-400'}`}
                            >
                                {selectionMode ? 'Cancel' : 'Manage'}
                            </button>
                        )}
                    </div>

                    {selectionMode && selectedTables.length > 0 && (
                        <div className="px-2 mb-3 space-y-2">
                            <div className={`flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border ${borderClass}`}>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={checkedTables.length === selectedTables.length && selectedTables.length > 0}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setCheckedTables(selectedTables.map(t => typeof t === 'object' ? t.name : t));
                                            } else {
                                                setCheckedTables([]);
                                            }
                                        }}
                                        className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 focus:ring-offset-0 transition-all"
                                    />
                                    <span className="text-[10px] font-medium text-slate-400">Select All</span>
                                </label>
                                <button
                                    onClick={handleBulkRemove}
                                    disabled={checkedTables.length === 0}
                                    className="px-2 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:bg-slate-700 text-white rounded text-[10px] font-bold transition-all shadow-lg shadow-red-900/20"
                                >
                                    Remove ({checkedTables.length})
                                </button>
                            </div>
                        </div>
                    )}

                    {isSidebarLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div>
                    ) : (
                        <div className="space-y-1">
                            {selectedTables.length > 0 ? (
                                selectedTables.map((table, i) => {
                                    const tableName = typeof table === 'object' ? table.name : table;
                                    const isActive = activeTable === tableName;
                                    const isChecked = checkedTables.includes(tableName);

                                    return (
                                        <div key={i} className="group relative">
                                            {selectionMode && (
                                                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {
                                                            setCheckedTables(prev =>
                                                                prev.includes(tableName)
                                                                    ? prev.filter(t => t !== tableName)
                                                                    : [...prev, tableName]
                                                            );
                                                        }}
                                                        className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 focus:ring-offset-0 transition-all"
                                                    />
                                                </div>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (selectionMode) {
                                                        setCheckedTables(prev =>
                                                            prev.includes(tableName)
                                                                ? prev.filter(t => t !== tableName)
                                                                : [...prev, tableName]
                                                        );
                                                    } else {
                                                        setActiveTable(tableName);
                                                    }
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${selectionMode ? 'pl-9' : ''} ${isActive
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                    : isChecked && selectionMode
                                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                        : 'hover:bg-blue-500/10 text-slate-400'
                                                    }`}
                                            >
                                                {!selectionMode && <Table className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`} />}
                                                <span className="truncate font-medium pr-6">{tableName}</span>
                                                {isActive && !selectionMode && (
                                                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                                                )}
                                            </button>

                                            {/* Remove button visible on hover - Only in normal mode */}
                                            {!selectionMode && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveTable(tableName);
                                                    }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md bg-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all z-10"
                                                    title="Remove table"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className={`px-3 py-4 text-xs text-center ${subTextClass}`}>No tables selected</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* MAIN CHAT AREA */}
            <div className="flex-1 flex flex-col relative">
                {/* Top Header Actions */}
                <div className={`h-14 border-b ${borderClass} ${cardBgClass} flex items-center justify-between px-6 z-10`}>
                    <div className="flex items-center gap-4">
                        <h1 className="text-sm font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Live Chat Support
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                if (activeTable) {
                                    handlePreviewTable(activeTable);
                                } else if (selectedTables.length > 0) {
                                    const firstTable = selectedTables[0];
                                    const tableName = typeof firstTable === 'object' ? firstTable.name : firstTable;
                                    handlePreviewTable(tableName);
                                }
                            }}
                            disabled={selectedTables.length === 0}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <Eye className="w-4 h-4" />
                            View {activeTable ? `"${activeTable}"` : 'Table'} Content
                        </button>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    <div className="max-w-3xl mx-auto p-6 space-y-6 min-h-full flex flex-col">
                        {currentMessages.length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-50 space-y-4 py-20">
                                <div className="p-6 bg-slate-800/50 rounded-full">
                                    {activeTable ? <Table className="w-12 h-12 text-blue-500" /> : <Search className="w-12 h-12 text-blue-500" />}
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold">
                                        {activeTable ? `Isolated Chat: ${activeTable}` : `Select a Table`}
                                    </h3>
                                    <p className="text-sm max-w-md mt-2">
                                        {activeTable
                                            ? `Queries sent here will only analyze data from the "${activeTable}" table.`
                                            : 'Please select a table from the left sidebar to start a focused analysis.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {currentMessages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[90%] ${msg.type === 'user' ? 'bg-blue-600 rounded-2xl rounded-tr-none px-4 py-3' : `bg-slate-800 border ${borderClass} rounded-2xl rounded-tl-none px-5 py-4 w-full`}`}>
                                    {msg.type === 'bot' && msg.text && msg.text.includes('<table') ? (
                                        <div className="space-y-4">
                                            {msg.text.split(/(<table[\s\S]*?<\/table>)/g).map((part, index) => {
                                                if (part.startsWith('<table')) {
                                                    return <ChatTable key={index} html={part} isDark={isDark} />;
                                                }
                                                if (!part.trim()) return null;
                                                return (
                                                    <div
                                                        key={index}
                                                        className="text-sm leading-relaxed whitespace-pre-wrap"
                                                        dangerouslySetInnerHTML={{ __html: part }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ) : msg.type === 'bot' && msg.text && (msg.text.includes('<div') || msg.text.includes('<p')) ? (
                                        <div
                                            className="chat-response-html"
                                            dangerouslySetInnerHTML={{ __html: msg.text }}
                                        />
                                    ) : (
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                    )}

                                    {msg.type === 'bot' && msg.charts && <ChartRenderer charts={msg.charts} />}

                                    {msg.type === 'bot' && msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-slate-700">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Sources Found</p>
                                            <div className="flex wrap gap-2">
                                                {msg.sources.map((src, i) => (
                                                    <div key={i} className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-[10px] flex items-center gap-2">
                                                        <FileText className="w-3 h-3 text-red-400" />
                                                        {src.file_name} (Page {src.page_numbers})
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className={`text-[10px] mt-2 opacity-50 ${msg.type === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                                        {msg.timestamp.toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-3">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                    <span className="text-sm animate-pulse">Analyzing data...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Bar */}
                <div className={`p-4 border-t ${borderClass} ${cardBgClass}`}>
                    <div className="max-w-3xl mx-auto flex items-center gap-3 bg-slate-700/30 rounded-2xl p-2 border border-slate-700/50 focus-within:border-blue-500/50 transition-all">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Query tables or ask for insights..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm resize-none py-2 px-3 h-10 scrollbar-none"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: Document Preview (SQL Tables) */}
            <div className={`w-72 border-l ${borderClass} flex flex-col ${cardBgClass}`}>
                <div className={`p-4 border-b ${borderClass} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                        <Table className="w-5 h-5 text-purple-500" />
                        <h2 className="font-bold text-sm">Document Preview</h2>
                    </div>
                    <button onClick={fetchAvailableTables} className="p-1 hover:bg-slate-700 rounded transition-colors" title="Refresh Tables">
                        <RefreshCcw className="w-3 h-3 text-slate-400" />
                    </button>
                </div>

                <div className="p-3">
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search tables..."
                            value={tableSearchQuery}
                            onChange={(e) => setTableSearchQuery(e.target.value)}
                            className={`w-full bg-slate-700/30 border ${borderClass} rounded-lg py-1.5 pl-9 pr-3 text-xs focus:ring-1 focus:ring-purple-500 outline-none transition-all`}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 pt-0">
                    <div className="mb-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Database Tables ({availableTables.length})</label>
                        <div className="mt-2 space-y-2">
                            {isTablesLoading ? (
                                <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
                            ) : (
                                availableTables
                                    .filter(table => {
                                        const name = typeof table === 'object' ? table.name : table;
                                        return name.toLowerCase().includes(tableSearchQuery.toLowerCase());
                                    })
                                    .map((table, i) => {
                                        const tableName = typeof table === 'object' ? table.name : table;
                                        const rowCount = typeof table === 'object' ? table.row_count : null;

                                        const isSelected = selectedTables.some(st => {
                                            const sName = typeof st === 'object' ? st.name : st;
                                            return sName === tableName;
                                        });

                                        return (
                                            <div
                                                key={i}
                                                className={`group p-3 rounded-xl border ${isSelected ? 'border-purple-500/50 bg-purple-500/10' : 'border-slate-700/50 hover:border-slate-500'} transition-all`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex flex-col truncate pr-2">
                                                        <span className="text-xs font-medium truncate">{tableName}</span>
                                                        {rowCount !== null && (
                                                            <span className="text-[9px] opacity-50">{rowCount} rows</span>
                                                        )}
                                                    </div>
                                                    {isSelected ? (
                                                        <button
                                                            onClick={() => handleRemoveTable(tableName)}
                                                            className="p-1 rounded bg-red-500/80 hover:bg-red-600 text-white transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                                                            title="Remove from sidebar"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleSelectTable(tableName)}
                                                            className="p-1 rounded bg-purple-600 hover:bg-purple-700 text-white transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                                                            title="Add to sidebar"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handlePreviewTable(tableName)}
                                                    className="text-[10px] text-purple-400 hover:underline flex items-center gap-1"
                                                >
                                                    Preview Data
                                                </button>
                                            </div>
                                        );
                                    })
                            )}
                            {!isTablesLoading && availableTables.length === 0 && (
                                <div className="text-center py-10 opacity-50">
                                    <span className="text-xs">No tables found</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLE PREVIEW MODAL */}
            {showPreviewModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className={`w-full max-w-5xl max-h-[85vh] ${cardBgClass} border ${borderClass} rounded-3xl overflow-hidden flex flex-col shadow-2xl`}>
                        <div className={`p-6 border-b ${borderClass} flex items-center justify-between`}>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500/20 rounded-2xl">
                                    <Table className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{previewData?.tableName || 'Table Preview'}</h3>
                                    <p className="text-xs text-slate-400">Read-only view of top {previewRows} rows</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <select
                                    value={previewRows}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        setPreviewRows(val);
                                        handlePreviewTable(previewData?.tableName, val);
                                    }}
                                    className="bg-slate-700 text-xs border-none rounded-lg py-1.5 focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value={5}>Top 5 Rows</option>
                                    <option value={10}>Top 10 Rows</option>
                                </select>
                                <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-slate-700 rounded-xl transition-all">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-6">
                            {isPreviewLoading ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                                    <p className="text-sm animate-pulse">Loading table data...</p>
                                </div>
                            ) : previewData ? (
                                <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                                    <table className="w-full text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-slate-700/50">
                                                {previewData.columns.map((col, i) => (
                                                    <th key={i} className="px-4 py-3 text-left font-bold text-slate-300 border-b border-slate-700 min-w-[120px]">
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.rows.length > 0 ? previewData.rows.map((row, i) => (
                                                <tr key={i} className="hover:bg-slate-700/20 transition-colors">
                                                    {previewData.columns.map((col, j) => (
                                                        <td key={j} className="px-4 py-3 border-b border-slate-700/50 text-slate-400">
                                                            {String(row[col] ?? '')}
                                                        </td>
                                                    ))}
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={previewData.columns.length} className="px-4 py-10 text-center opacity-50">
                                                        No data available in this table
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-50">
                                    <AlertCircle className="w-12 h-12 mb-2" />
                                    <p>No preview data available</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-slate-900/50 flex justify-end gap-3">
                            <button onClick={() => setShowPreviewModal(false)} className="px-6 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-all border border-slate-700">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Global Styles for Scrollbars */}
            <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 5px; height: 5px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>
        </div>
    );
};

export default UnifiedChatInterface;
