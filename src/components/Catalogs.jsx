import React, { useEffect, useState } from 'react';
import { Database, FileText, FileSpreadsheet, Trash2, X, Check } from 'lucide-react';
import { API } from '../utils/api';
import ChatInterface from './ChatInterface';

export default function Catalogs({ isDark }) {
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('private'); // 'private' or 'public'

  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState(null);
  const [selectedCatalog, setSelectedCatalog] = useState(null);

  useEffect(() => {
    const fetchCatalogs = async () => {
      setLoading(true);
      try {
        const res = await API.catalog.getCatalogs();
        const data = Array.isArray(res.data) ? res.data : [];
        // filter based on view
        const filtered = data.filter(item => {
          if (view === 'public') return item.visibility === 'global';
          return item.visibility === 'local';
        });
        setCatalogs(filtered);
      } catch (err) {
        console.error('Failed to fetch catalogs', err);
        setCatalogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogs();
  }, [view, refreshKey]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (catalog) => {
    if (window.confirm(`Are you sure you want to delete catalog '${catalog.db_name}'?`)) {
      try {
        const res = await API.catalog.deleteDatabase(catalog.db_name);
        if (res.data.message) {
          showToast(res.data.message, 'success');
          // Refresh the list
          setRefreshKey(prev => prev + 1);
        }
      } catch (err) {
        console.error('Delete failed', err);
        if (err.response && err.response.data && err.response.data.detail) {
          showToast(err.response.data.detail, 'error');
        } else {
          showToast('Failed to delete catalog', 'error');
        }
      }
    }
  };

  const timeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + " years ago";
    if (interval === 1) return "1 year ago";

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + " months ago";
    if (interval === 1) return "1 month ago";

    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + " days ago";
    if (interval === 1) return "1 day ago";

    interval = Math.floor(seconds / 3600);
    if (interval > 1) return interval + " hours ago";
    if (interval === 1) return "1 hour ago";

    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + " minutes ago";
    if (interval === 1) return "1 minute ago";

    return Math.floor(seconds) + " seconds ago";
  };

  const cardBgClass = isDark ? 'bg-gray-800' : 'bg-white';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subTextClass = isDark ? 'text-gray-400' : 'text-gray-600';

  const handleCatalogClick = (catalog) => {
    setSelectedCatalog(catalog);
  };

  // If a catalog is selected, show ChatInterface
  if (selectedCatalog) {
    return (
      <ChatInterface
        dbName={selectedCatalog.db_name}
        visibility={selectedCatalog.visibility}
        fileType={selectedCatalog.folder_type}
        isUploadComplete={true}
        onClose={() => setSelectedCatalog(null)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-500" />
          <h2 className={`text-3xl font-bold ${textClass}`}>Data Catalogs</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setView('private')}
            className={`px-4 py-2 rounded-xl border transition-all ${view === 'private'
              ? 'bg-blue-600 text-white border-blue-600'
              : `bg-transparent ${isDark ? 'text-gray-300 border-gray-700 hover:bg-gray-800' : 'text-gray-600 border-gray-200 hover:bg-gray-100'}`
              }`}
          >
            Private
          </button>
          <button
            type="button"
            onClick={() => setView('public')}
            className={`px-4 py-2 rounded-xl border transition-all ${view === 'public'
              ? 'bg-blue-600 text-white border-blue-600'
              : `bg-transparent ${isDark ? 'text-gray-300 border-gray-700 hover:bg-gray-800' : 'text-gray-600 border-gray-200 hover:bg-gray-100'}`
              }`}
          >
            Public
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {catalogs.length === 0 ? (
            <div className={`p-6 rounded-2xl border ${borderClass} ${cardBgClass} ${textClass}`}>No catalogs found.</div>
          ) : (
            catalogs.map((catalog) => (
              <div
                key={catalog._id}
                onClick={() => handleCatalogClick(catalog)}
                className={`${cardBgClass} border ${borderClass} rounded-2xl p-6 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between h-full cursor-pointer`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'} flex-shrink-0`}>
                      {catalog.folder_type && catalog.folder_type.includes('pdf') ? (
                        <FileText className={`w-6 h-6 text-blue-500`} />
                      ) : (
                        <FileSpreadsheet className={`w-6 h-6 text-green-500`} />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {view === 'public' && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                          GLOBAL
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(catalog);
                        }}
                        className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300' : 'hover:bg-red-50 text-red-500 hover:text-red-600'} transition-colors`}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className={`font-bold ${textClass} text-lg mb-1 truncate`} title={catalog.db_name}>{catalog.db_name}</h3>

                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2.5 py-1 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-700'} text-[10px] font-bold rounded-lg border ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                      {catalog.folder_type?.toUpperCase() || 'UNKNOWN'}
                    </span>
                    <span className={`text-sm ${subTextClass}`}>{catalog.num_files} {catalog.num_files === 1 ? 'file' : 'files'}</span>
                  </div>
                </div>

                <div className={`pt-4 border-t ${borderClass} space-y-2`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-medium ${subTextClass}`}>Size</span>
                    <span className={`text-sm font-bold ${textClass}`}>
                      {catalog.total_size_mb} MB
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-medium ${subTextClass}`}>Uploaded</span>
                    <span className={`text-sm font-bold ${textClass}`}>
                      {timeAgo(catalog.upload_time)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 z-50 ${toast.type === 'error'
          ? 'bg-red-500 text-white'
          : 'bg-green-500 text-white'
          }`}>
          {toast.type === 'error' ? (
            <X className="w-5 h-5" />
          ) : (
            <Check className="w-5 h-5" />
          )}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
