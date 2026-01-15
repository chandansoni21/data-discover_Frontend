import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle, Plus, LogOut, Clock, User, Database, Zap,
  TrendingUp, Shield, ChevronRight, Activity, BarChart3,
  Sparkles, Users, Brain, Bot, Star, ChevronLeft,
  Home as HomeIcon, Coins, History, Moon, Sun, X,
  FolderOpen, Edit3, Trash2, Check, FileText, FileSpreadsheet
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import UploadModal from './UploadModal';
import logo from '../Assets/lomgo.png';
import { chatHistory, activeConversations } from '../data/mockData';

// Domain data
const domains = [
  { id: 'finance', name: 'Financial Services', icon: '💰', color: 'from-yellow-500 to-orange-500', description: 'Banking & finance solutions' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', color: 'from-red-500 to-pink-500', description: 'Medical & health analytics' },
  { id: 'retail', name: 'Retail & E-commerce', icon: '🛒', color: 'from-green-500 to-emerald-500', description: 'Customer & sales insights' },
  { id: 'manufacturing', name: 'Manufacturing', icon: '🏭', color: 'from-blue-500 to-cyan-500', description: 'Production optimization' },
  { id: 'education', name: 'Education', icon: '🎓', color: 'from-purple-500 to-violet-500', description: 'Learning analytics' },
  { id: 'legal', name: 'Legal Assistant', icon: '⚖️', color: 'from-indigo-500 to-blue-500', description: 'Legal research & analysis' },
  { id: 'excel', name: 'Excel Analysis', icon: '📊', color: 'from-green-600 to-teal-500', description: 'Spreadsheet insights' },
  { id: 'sql', name: 'SQL Database', icon: '🗄️', color: 'from-orange-500 to-amber-500', description: 'Database querying' },
];



// ... existing imports

export default function Home() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [chats, setChats] = useState(chatHistory);
  const [activeChats, setActiveChats] = useState(activeConversations);

  const [editingChatId, setEditingChatId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const [catalogs, setCatalogs] = useState([
    { id: 'cat_001', name: 'Financial Reports 2024', type: 'pdf', size: '45.2 MB', items: 12, lastSync: '2 hours ago', icon: FileText, color: 'text-red-500' },
    { id: 'cat_002', name: 'Customer Sales Data', type: 'excel', size: '12.8 MB', items: 5, lastSync: '1 day ago', icon: FileSpreadsheet, color: 'text-green-500' },
    { id: 'cat_003', name: 'Inventory DB', type: 'sql', size: 'N/A', items: 28, lastSync: 'Just now', icon: Database, color: 'text-blue-500' },
    { id: 'cat_004', name: 'Legal Appendices', type: 'docx', size: '8.4 MB', items: 3, lastSync: '3 days ago', icon: FileText, color: 'text-indigo-500' },
  ]);

  const [tokenUsage] = useState({
    used: 125000,
    total: 1000000,
    percentage: 12.5,
    dailyAverage: 8500,
    databasesCreated: 61,
    queriesProcessed: 8420,
    efficiency: 94,
    totalCatalogues: 42
  });

  const [activeSection, setActiveSection] = useState('home');
  const [greeting, setGreeting] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Chat flow states
  const [showDomainSelection, setShowDomainSelection] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const userName = sessionStorage.getItem('email')?.split('@')[0] || 'User';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    // If a domain was persisted from LandingPage, restore it
    const savedSelected = sessionStorage.getItem('selectedDomain');
    let domainFound = false;

    if (savedSelected) {
      try {
        const domainObj = JSON.parse(savedSelected);
        setSelectedDomain(domainObj);
        setShowDomainSelection(false);
        domainFound = true;
      } catch (e) {
        console.error('Failed to parse saved selected domain', e);
      }
    }

    // Check for pending domain from landing page (one-time)
    const pendingDomainId = sessionStorage.getItem('pendingDomainId');
    if (pendingDomainId) {
      const domain = domains.find(d => d.id === pendingDomainId);
      if (domain) {
        // persist the selection and open upload modal
        setSelectedDomain(domain);
        sessionStorage.setItem('selectedDomain', JSON.stringify(domain));
        setShowDomainSelection(false);
        setShowUploadModal(true);
        domainFound = true;
      }
      sessionStorage.removeItem('pendingDomainId');
    }

    // If no domain is selected, redirect to landing page
    if (!domainFound && !savedSelected) {
      navigate('/');
    }
  }, []);

  const handleStartChat = () => {
    setShowDomainSelection(true);
  };

  const handleDomainSelect = (domain) => {
    setSelectedDomain(domain);
    // persist selection so Home/Chat keep using it across navigation
    try {
      sessionStorage.setItem('selectedDomain', JSON.stringify(domain));
    } catch (e) {
      console.error('Failed to persist selected domain', e);
    }
    setShowDomainSelection(false);
    setShowUploadModal(true);
  };

  const handleUploadComplete = (uploadData) => {
    setShowUploadModal(false);
    const sessionData = {
      domain: selectedDomain,
      fileType: uploadData.fileType,
      visibility: uploadData.visibility,
      file: uploadData.file,
      isUploadComplete: true
    };
    sessionStorage.setItem('activeChatSession', JSON.stringify(sessionData));
    navigate('/chat');
  };



  const handleRename = (id, newName, type) => {
    if (type === 'chat') {
      setChats(prev => prev.map(c => c.id === id ? { ...c, title: newName } : c));
      setActiveChats(prev => prev.map(c => c.id === id ? { ...c, title: newName } : c));
    } else if (type === 'catalog') {
      setCatalogs(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
    }
    setEditingChatId(null);
  };

  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      setChats(prev => prev.filter(c => c.id !== chatId));
      setActiveChats(prev => prev.filter(c => c.id !== chatId));
    }
  };

  const handleDeleteCatalog = (e, catalogId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this catalog? This will remove access to the original data sources.')) {
      setCatalogs(prev => prev.filter(c => c.id !== catalogId));
    }
  };

  // Theme-aware classes
  const bgClass = isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-blue-50';
  const cardBgClass = isDark ? 'bg-gray-800' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = '/';
  };

  // Handle opening an existing chat
  const handleOpenChat = (chat) => {
    // Map domain name to domain object
    const domainObj = domains.find(d =>
      d.name.toLowerCase().includes(chat.domain.toLowerCase()) ||
      chat.domain.toLowerCase().includes(d.name.toLowerCase())
    ) || domains[0];

    const sessionData = {
      domain: domainObj,
      fileType: chat.fileType || 'pdf',
      visibility: 'private',
      isUploadComplete: true,
      existingChat: chat
    };
    sessionStorage.setItem('activeChatSession', JSON.stringify(sessionData));
    navigate('/chat');
  };

  const renderCatalogsSection = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-8 h-8 text-blue-500" />
          <h2 className={`text-3xl font-bold ${textClass}`}>Data Catalogs</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {catalogs.map((catalog) => (
          <div key={catalog.id} className={`${cardBgClass} border ${borderClass} rounded-2xl p-6 hover:shadow-xl transition-all group relative overflow-hidden`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'} flex-shrink-0`}>
                <catalog.icon className={`w-6 h-6 ${catalog.color}`} />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingChatId(catalog.id);
                    setEditValue(catalog.name);
                  }}
                  className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} ${subTextClass}`}
                  title="Rename"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDeleteCatalog(e, catalog.id)}
                  className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} text-red-400`}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {editingChatId === catalog.id ? (
              <div className="mb-2" onClick={e => e.stopPropagation()}>
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(catalog.id, editValue, 'catalog');
                    if (e.key === 'Escape') setEditingChatId(null);
                  }}
                  className={`w-full px-2 py-1 rounded border-2 border-blue-500 ${isDark ? 'bg-gray-700' : 'bg-white'} ${textClass} text-sm font-bold focus:outline-none`}
                />
              </div>
            ) : (
              <h3 className={`font-bold ${textClass} text-lg mb-1 group-hover:text-blue-500 transition-colors truncate`}>
                {catalog.name}
              </h3>
            )}

            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'} uppercase`}>
                {catalog.type}
              </span>
              <span className={`text-xs ${subTextClass}`}>• {catalog.size}</span>
            </div>

            <div className={`pt-4 border-t ${borderClass} flex justify-between`}>
              <div className="flex flex-col">
                <span className={`text-[10px] font-bold ${subTextClass} uppercase`}>Items</span>
                <span className={`text-sm font-bold ${textClass}`}>{catalog.items} files</span>
              </div>
              <div className="flex flex-col text-right">
                <span className={`text-[10px] font-bold ${subTextClass} uppercase`}>Synced</span>
                <span className={`text-sm font-bold ${textClass}`}>{catalog.lastSync}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTokenUsageSection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Coins className="w-8 h-8 text-yellow-500" />
        <h1 className={`text-3xl font-bold ${textClass}`}>Token Usage</h1>
      </div>

      <div className={`${cardBgClass} rounded-2xl border ${borderClass} shadow-xl p-8`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className={`text-sm ${subTextClass} mb-4`}>Current Usage</p>
            <div className="flex items-end gap-2 mb-4">
              <p className={`text-5xl font-bold ${textClass}`}>{tokenUsage.used.toLocaleString()}</p>
              <p className={`text-lg ${subTextClass} pb-1`}>/ {tokenUsage.total.toLocaleString()}</p>
            </div>
            <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} h-4 rounded-full overflow-hidden mb-4`}>
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${tokenUsage.percentage}%` }}
              />
            </div>
            <p className={`text-sm ${subTextClass}`}>{tokenUsage.percentage}% of monthly quota used</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Daily Average', value: tokenUsage.dailyAverage.toLocaleString(), color: 'blue' },
              { label: 'Efficiency', value: `${tokenUsage.efficiency}%`, color: 'green' },
              { label: 'Queries', value: tokenUsage.queriesProcessed.toLocaleString(), color: 'purple' },
              { label: 'Catalogs', value: tokenUsage.databasesCreated, color: 'amber' },
            ].map((item, idx) => (
              <div key={idx} className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : `bg-${item.color}-50`} border ${isDark ? 'border-gray-600' : `border-${item.color}-100`}`}>
                <p className={`text-sm ${subTextClass} mb-1`}>{item.label}</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : `text-${item.color}-600`}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderChatHistorySection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <History className="w-8 h-8 text-purple-500" />
          <h1 className={`text-3xl font-bold ${textClass}`}>Chat History</h1>
        </div>
        <span className={`text-sm ${subTextClass} ${isDark ? 'bg-gray-700' : 'bg-gray-100'} px-4 py-2 rounded-full`}>
          {chats.filter(chat => !selectedDomain || chat.domain === selectedDomain.name).length} conversations
        </span>
      </div>

      <div className={`${cardBgClass} rounded-2xl border ${borderClass} shadow-lg overflow-hidden`}>
        <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
          {chats.filter(chat => !selectedDomain || chat.domain === selectedDomain.name).map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleOpenChat(chat)}
              className={`p-5 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-all cursor-pointer group`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-xl ${chat.active
                    ? isDark ? 'bg-green-900/30' : 'bg-green-100'
                    : isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <MessageCircle className={`w-6 h-6 ${chat.active ? 'text-green-500' : subTextClass}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 group/title">
                      {editingChatId === chat.id ? (
                        <div className="flex-1 flex gap-2" onClick={e => e.stopPropagation()}>
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRename(chat.id, editValue, 'chat');
                              if (e.key === 'Escape') setEditingChatId(null);
                            }}
                            className={`flex-1 px-2 py-1 rounded border-2 border-blue-500 ${isDark ? 'bg-gray-700' : 'bg-white'} ${textClass} text-sm font-bold focus:outline-none`}
                          />
                          <button onClick={() => handleRename(chat.id, editValue, 'chat')} className="p-1 bg-green-500 text-white rounded"><Check className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <>
                          <h3 className={`font-semibold ${textClass} text-lg group-hover:text-blue-500 transition-colors`}>{chat.title}</h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingChatId(chat.id);
                              setEditValue(chat.title);
                            }}
                            className="opacity-0 group-hover/chat:opacity-100 p-1 hover:text-blue-500 transition-opacity"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-2.5 py-1 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-700'} text-[10px] font-bold rounded-lg flex items-center gap-1.5 border ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                        {chat.fileType === 'pdf' ? '📄' : chat.fileType === 'excel' ? '📊' : chat.fileType === 'sql' ? '🗄️' : chat.fileType === 'docx' ? '📝' : '📄'}
                        {chat.fileType?.toUpperCase() || 'DOC'}
                      </span>
                      <span className={`px-2.5 py-1 ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'} text-[10px] font-bold rounded-lg border ${isDark ? 'border-blue-800/30' : 'border-blue-100'}`}>
                        {chat.domain}
                      </span>
                      <span className={`text-sm ${subTextClass}`}>{chat.messages} messages</span>
                      <span className={`text-sm ${subTextClass}`}>• {chat.lastMessage}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} text-red-500 transition-colors`}
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <ChevronRight className={`w-5 h-5 ${subTextClass} group-hover:text-blue-500 group-hover:translate-x-1 transition-all`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHomeSection = () => (
    <>
      {/* Greeting Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          <h1 className={`text-4xl font-bold ${isDark
            ? 'text-white'
            : 'bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent'}`}>
            {greeting}, {userName}!
          </h1>
        </div>
        <p className={`text-lg ${subTextClass}`}>Here's what's happening with your AI conversations</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Active Conversations', value: activeChats.length, icon: Activity, color: 'blue', sub: 'Live right now' },
          { label: 'Catalogs Created', value: tokenUsage.databasesCreated, icon: Database, color: 'emerald', sub: 'Across all domains' },
          { label: 'Total Queries', value: tokenUsage.queriesProcessed.toLocaleString(), icon: BarChart3, color: 'purple', sub: 'Processed this month' },
          { label: 'Total Catalogue', value: tokenUsage.totalCatalogues, icon: Database, color: 'blue', sub: 'Overall count' },
        ].map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div key={idx} className={`${cardBgClass} rounded-2xl p-6 border ${borderClass} shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${subTextClass} mb-2`}>{stat.label}</p>
                  <p className={`text-3xl font-bold ${textClass}`}>{stat.value}</p>
                  <p className={`text-xs ${subTextClass} mt-1`}>{stat.sub}</p>
                </div>
                <IconComponent className={`w-10 h-10 text-${stat.color}-500`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Start New Chat Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-blue-600" />
            <h2 className={`text-2xl font-bold ${textClass}`}>Start New Chat</h2>
          </div>

          {selectedDomain && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-xl transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">New Chat for {selectedDomain?.name}</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Chats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h2 className={`text-2xl font-bold ${textClass}`}>Active Conversations</h2>
          </div>
          <span className={`text-sm ${subTextClass} ${isDark ? 'bg-gray-700' : 'bg-gray-100'} px-3 py-1 rounded-full`}>
            {activeChats.filter(chat => !selectedDomain || chat.domain === selectedDomain.name).length} live chats
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activeChats
            .filter(chat => !selectedDomain || chat.domain === selectedDomain.name)
            .map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleOpenChat(chat)}
                className={`relative overflow-hidden rounded-2xl ${cardBgClass} border ${borderClass} shadow-lg cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 group`}
              >
                <div className={`absolute inset-0 ${chat.color} opacity-10`} />
                <div className="relative p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 group/title">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        {editingChatId === chat.id ? (
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRename(chat.id, editValue, 'chat');
                              if (e.key === 'Escape') setEditingChatId(null);
                            }}
                            className={`flex-1 px-2 py-1 rounded border-2 border-blue-500 ${isDark ? 'bg-gray-700' : 'bg-white'} ${textClass} text-sm font-bold focus:outline-none`}
                          />
                        ) : (
                          <>
                            <h3 className={`font-bold ${textClass} text-lg group-hover:text-blue-500 transition-colors truncate`}>{chat.title}</h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingChatId(chat.id);
                                setEditValue(chat.title);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-blue-500 transition-opacity"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <span className={`ml-3 px-2 py-0.5 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-700'} text-[10px] font-bold rounded-md flex items-center gap-1.5 border ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                          {chat.fileType === 'pdf' ? '📄' : chat.fileType === 'excel' ? '📊' : chat.fileType === 'sql' ? '🗄️' : '📝'}
                          {chat.fileType?.toUpperCase()}
                        </span>
                      </div>
                      <p className={`text-sm ${subTextClass} mb-3`}>{chat.domain}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className={`w-4 h-4 ${subTextClass}`} />
                          <span className={subTextClass}>Started {chat.started}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className={`w-4 h-4 ${subTextClass}`} />
                          <span className={subTextClass}>{chat.participants} participants</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleDeleteChat(e, chat.id)}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} text-red-500 transition-colors`}
                        title="Delete Conversation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className={`w-5 h-5 ${subTextClass} group-hover:text-blue-500 group-hover:translate-x-1 transition-all`} />
                    </div>
                  </div>
                  <button className={`w-full py-2.5 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} ${textClass} rounded-xl font-medium transition-colors`}>
                    Join Conversation
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );

  const renderContent = () => {
    if (activeSection === 'tokens') return renderTokenUsageSection();
    if (activeSection === 'history') return renderChatHistorySection();
    if (activeSection === 'catalogs') return renderCatalogsSection();
    return renderHomeSection();
  };



  return (
    <div className={`min-h-screen ${bgClass} flex`}>
      {/* Side Navbar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col transition-all duration-300 sticky top-0 h-screen`}>
        {/* Logo Section */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
              <img src={logo} alt="DataDiscover.Ai" className="w-10 h-10 object-contain" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-lg">DataDiscover.Ai</h1>
                <p className="text-xs text-gray-400">AI Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'home', label: 'Home', icon: HomeIcon },
            { id: 'catalogs', label: 'Catalogs', icon: FolderOpen },
            { id: 'tokens', label: 'Token Usage', icon: Coins },
            { id: 'history', label: 'Chat History', icon: History },
          ].map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <IconComponent className="w-5 h-5" />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="px-4 pb-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {!sidebarCollapsed && <span className="text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        </div>

        {/* Collapse Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {!sidebarCollapsed && <span className="text-sm">Collapse</span>}
          </button>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{userName}</p>
                <p className="text-xs text-gray-400 truncate">{sessionStorage.getItem('email') || 'user@example.com'}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all`}
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {renderContent()}
      </main>

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
        }}
        onUploadComplete={handleUploadComplete}
        preSelectedDomain={selectedDomain?.name}
      />
    </div>
  );
}