import React, { useState, useRef, useEffect } from 'react';
import {
  Send, X, ArrowLeft, Download, Share2, Lock, Globe,
  LayoutDashboard, MessageSquare, Sliders, ChevronLeft, ChevronRight,
  User, Sparkles, Mic, MicOff, Languages, Moon, Sun,
  Copy, ThumbsUp, ThumbsDown, RotateCcw, FileText, UserPlus, Edit3, Trash2, Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Dashboard from './Dashboard';
import DocumentSummary from './DocumentSummary';
import { exportChatToPDF } from '../utils/pdfExport';
import logo from '../Assets/lomgo.png';
import { API } from '../utils/api';
import PDFViewer from './PDFViewer';

// Language options
const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'hi', name: 'Hindi' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ar', name: 'Arabic' },
];

export default function ChatInterface({
  domain,
  fileType,
  visibility = 'private',
  isUploadComplete = false,
  dbName, // Database name from catalog
  onClose
}) {
  const { isDark, toggleTheme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('chatbot');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [uploadComplete, setUploadComplete] = useState(isUploadComplete);
  const [messageHistory, setMessageHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [participantEmail, setParticipantEmail] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [participants, setParticipants] = useState([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [chatTitle, setChatTitle] = useState(domain?.name || dbName || 'Chat Session');
  const [likedMessages, setLikedMessages] = useState([]);
  const [dislikedMessages, setDislikedMessages] = useState([]);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [dbFiles, setDbFiles] = useState([]);
  const [fileLoading, setFileLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize with welcome message only after upload complete
  useEffect(() => {
    if (uploadComplete && messages.length === 0) {
      setMessages([{
        id: 1,
        type: 'bot',
        text: `Hello! I'm your AI assistant for ${domain?.name || 'data analysis'}. I've successfully processed your ${fileType?.toUpperCase() || 'document'} file and I'm ready to help you explore the data.\n\nYou can ask me questions about:\n• Data insights and patterns\n• Statistical summaries\n• Specific data queries\n• Visualizations and reports\n\nWhat would you like to know?`,
        timestamp: new Date()
      }]);
    }
  }, [uploadComplete, domain, fileType, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = selectedLanguage;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setInputValue(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [selectedLanguage]);

  useEffect(() => {
    const fetchHistory = async () => {
      const db = dbName || domain?.name;
      if (!db) return;

      try {
        const res = await API.chat.getHistory(db);
        if (res.data && Array.isArray(res.data)) {
          const historyMessages = res.data.flatMap((item, index) => [
            {
              id: `history-${index}-user`,
              type: 'user',
              text: item.query,
              timestamp: new Date()
            },
            {
              id: `history-${index}-bot`,
              type: 'bot',
              text: item.answer,
              sources: item.citation,
              timestamp: new Date()
            }
          ]);
          setMessages(historyMessages);
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };

    fetchHistory();
  }, [dbName, domain]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSendMessage = async (textOverride) => {
    const textToSend = textOverride || inputValue;
    if (!textToSend.trim() || !uploadComplete) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const db = dbName || domain?.name || 'default';
      // Call backend API
      const response = await API.chat.sendQuery({
        query: textToSend,
        database: db,
        visibility: visibility === 'public' ? 'global' : 'local'
      });

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: response.data.bot_answer,
        sources: response.data.sources || [],
        charts: response.data.charts || {},
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Query failed:', error);
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: 'Sorry, I encountered an error processing your question. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadChat = () => {
    exportChatToPDF(messages, {
      title: `${domain?.name || 'Chat'} Conversation`,
      subtitle: `DataDiscover.AI - ${fileType?.toUpperCase() || 'Document'} Analysis`,
      fileName: `chat-${domain?.id || 'export'}-${Date.now()}.pdf`
    });
  };

  const handleCopyMessage = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleLike = (id) => {
    setLikedMessages(prev =>
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
    setDislikedMessages(prev => prev.filter(mid => mid !== id));
  };

  const handleDislike = (id) => {
    setDislikedMessages(prev =>
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
    setLikedMessages(prev => prev.filter(mid => mid !== id));
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/share/${Math.random().toString(36).substr(2, 9)}`;
    navigator.clipboard.writeText(shareUrl);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 3000);
  };

  const handleRegenerate = (messageId) => {
    // Find the user message that came before this bot message
    const botIndex = messages.findIndex(m => m.id === messageId);
    if (botIndex > 0) {
      // Look backwards for the first user message
      for (let i = botIndex - 1; i >= 0; i--) {
        if (messages[i].type === 'user') {
          handleSendMessage(messages[i].text);
          return;
        }
      }
    } else if (messages.length > 0) {
      // If index not found or first message, just take the last user message
      const lastUserMessage = [...messages].reverse().find(m => m.type === 'user');
      if (lastUserMessage) {
        handleSendMessage(lastUserMessage.text);
      }
    }
  };

  // Theme classes
  const bgClass = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBgClass = isDark ? 'bg-gray-800' : 'bg-white';
  const inputBgClass = isDark ? 'bg-gray-700' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';

  // Show dashboard for Excel/SQL domains
  const showDashboard = fileType === 'excel' || fileType === 'sql' || domain?.id === 'excel' || domain?.id === 'sql';

  useEffect(() => {
    const fetchDbFiles = async () => {
      setFileLoading(true);
      try {
        const name = dbName || domain?.name;
        if (name) {
          const res = await API.chat.getDbFiles(name);
          if (res.data && res.data.files) {
            setDbFiles(res.data.files);
          }
        }
      } catch (err) {
        console.error('Failed to fetch files', err);
      } finally {
        setFileLoading(false);
      }
    };

    if (activeSection === 'preview') {
      fetchDbFiles();
    }
  }, [activeSection, dbName, domain]);

  const renderChatbot = () => (
    <div className={`flex flex-col h-full ${bgClass} relative`}>

      {/* Upload Status Banner */}
      {!uploadComplete && (
        <div className={`${isDark ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border-b px-6 py-4`}>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            <div>
              <p className={`font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-800'}`}>Processing your document...</p>
              <p className={`text-sm ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>Chat will be available once upload is complete</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area - Split View */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Chat & Input */}
        <div className={`flex flex-col transition-all duration-300 ${selectedPdf ? 'w-[60%] border-r ' + borderClass : 'w-full'}`}>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-cyan-300 scrollbar-track-transparent">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-3 max-w-[75%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${message.type === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                    : 'bg-gradient-to-br from-emerald-400 to-cyan-500'
                    }`}>
                    {message.type === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <img src={logo} alt="AI" className="w-6 h-6 object-contain" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className="group relative">
                    <div
                      className={`px-5 py-4 rounded-2xl shadow-sm ${message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-md'
                        : `${cardBgClass} ${textClass} border ${borderClass} rounded-tl-md`
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>

                      {/* Sources Rendering */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className={`text-xs font-semibold mb-2 ${subTextClass}`}>References:</p>
                          <div className="space-y-2">
                            {Array.from(new Set(message.sources.map(s => s.file_name))).map((fileName, idx) => {
                              const fileSources = message.sources.filter(s => s.file_name === fileName);
                              return (
                                <div key={idx} className="flex flex-wrap items-center gap-2 text-xs">
                                  <span className={`${textClass} opacity-80`}>📄 {fileName}:</span>
                                  {fileSources.map((source, sIdx) => (
                                    <button
                                      key={sIdx}
                                      onClick={() => setSelectedPdf({
                                        url: `${source.file_link}#page=${source.page_numbers}`,
                                        fileName: source.file_name,
                                        page: source.page_numbers
                                      })}
                                      className={`px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors`}
                                    >
                                      Page {source.page_numbers}
                                    </button>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-200' : subTextClass}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Action buttons for bot messages - Always visible */}
                    {message.type === 'bot' && (
                      <div className="flex items-center gap-1 mt-2 transition-opacity">
                        <button
                          onClick={() => handleCopyMessage(message.text, message.id)}
                          className={`p-1.5 ${copiedMessageId === message.id ? 'text-green-500' : subTextClass} hover:${textClass} ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-all duration-200 active:scale-95`}
                          title="Copy"
                        >
                          {copiedMessageId === message.id ? <Check className="w-4 h-4 animate-in zoom-in-50" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleLike(message.id)}
                          className={`p-1.5 ${likedMessages.includes(message.id) ? 'text-green-500 scale-110' : subTextClass} hover:text-green-500 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-green-50'} rounded-lg transition-all duration-200 active:scale-90`}
                          title="Like"
                        >
                          <ThumbsUp className={`w-4 h-4 ${likedMessages.includes(message.id) ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDislike(message.id)}
                          className={`p-1.5 ${dislikedMessages.includes(message.id) ? 'text-red-500 scale-110' : subTextClass} hover:text-red-500 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-red-50'} rounded-lg transition-all duration-200 active:scale-90`}
                          title="Dislike"
                        >
                          <ThumbsDown className={`w-4 h-4 ${dislikedMessages.includes(message.id) ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleRegenerate(message.id)}
                          className={`p-1.5 ${subTextClass} hover:text-blue-500 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-blue-50'} rounded-lg transition-colors`}
                          title="Regenerate"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                    <img src={logo} alt="AI" className="w-6 h-6 object-contain" />
                  </div>
                  <div className={`${cardBgClass} border ${borderClass} px-5 py-4 rounded-2xl rounded-tl-md shadow-sm`}>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className={`w-2 h-2 ${isDark ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
                        <div className={`w-2 h-2 ${isDark ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
                        <div className={`w-2 h-2 ${isDark ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className={`text-sm ${subTextClass}`}>Analyzing...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state when no upload */}
            {!uploadComplete && messages.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className={`w-20 h-20 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <FileText className={`w-10 h-10 ${subTextClass}`} />
                  </div>
                  <h3 className={`text-xl font-semibold ${textClass} mb-2`}>Document Processing</h3>
                  <p className={subTextClass}>Your document is being processed. Chat will be available shortly.</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input - Only visible after upload complete */}
          {uploadComplete && (
            <div className={`border-t ${borderClass} ${cardBgClass} p-4`}>
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                  {/* Text Input - Left side */}
                  <div className="flex-1 relative">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        // Enter to send (without shift)
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (inputValue.trim() && !isLoading) {
                            // Add to history
                            setMessageHistory(prev => [inputValue, ...prev.slice(0, 49)]);
                            setHistoryIndex(-1);
                            handleSendMessage();
                          }
                        }
                        // Up arrow for previous messages
                        if (e.key === 'ArrowUp' && !inputValue.trim()) {
                          e.preventDefault();
                          if (messageHistory.length > 0) {
                            const newIndex = Math.min(historyIndex + 1, messageHistory.length - 1);
                            setHistoryIndex(newIndex);
                            setInputValue(messageHistory[newIndex]);
                          }
                        }
                        // Down arrow for next messages
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          if (historyIndex > 0) {
                            const newIndex = historyIndex - 1;
                            setHistoryIndex(newIndex);
                            setInputValue(messageHistory[newIndex]);
                          } else if (historyIndex === 0) {
                            setHistoryIndex(-1);
                            setInputValue('');
                          }
                        }
                      }}
                      placeholder="Ask a question about your data..."
                      rows={1}
                      className={`w-full px-5 py-3.5 border ${borderClass} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all ${cardBgClass} ${textClass}`}
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                  </div>

                  {/* Controls - Right side */}
                  <div className="flex items-center gap-2">
                    {/* Microphone Button */}
                    <button
                      onClick={toggleListening}
                      className={`flex-shrink-0 p-3 rounded-xl transition-all ${isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : `${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} ${textClass}`
                        }`}
                      title={isListening ? 'Stop listening' : 'Voice input'}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    {/* Language Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                        className={`flex-shrink-0 p-3 rounded-xl transition-all ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} ${textClass}`}
                        title="Select language"
                      >
                        <Languages className="w-5 h-5" />
                      </button>

                      {showLanguageDropdown && (
                        <div className={`absolute bottom-full right-0 mb-2 ${cardBgClass} border ${borderClass} rounded-xl shadow-xl py-2 min-w-[150px] max-h-60 overflow-y-auto z-10`}>
                          {languages.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => {
                                setSelectedLanguage(lang.code);
                                setShowLanguageDropdown(false);
                              }}
                              className={`w-full px-4 py-2 text-left text-sm ${selectedLanguage === lang.code
                                ? 'bg-blue-500 text-white'
                                : `${textClass} ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
                                }`}
                            >
                              {lang.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Send Button */}
                    <button
                      onClick={() => {
                        if (inputValue.trim()) {
                          setMessageHistory(prev => [inputValue, ...prev.slice(0, 49)]);
                          setHistoryIndex(-1);
                          handleSendMessage();
                        }
                      }}
                      disabled={isLoading || !inputValue.trim()}
                      className="flex-shrink-0 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className={`text-xs ${subTextClass} mt-2 text-center`}>
                  Press Enter to send • ↑ for previous • {languages.find(l => l.code === selectedLanguage)?.name || 'English'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: PDF Viewer */}
        {
          selectedPdf && (
            <div className={`w-[40%] h-full border-l ${borderClass} animate-in slide-in-from-right duration-300 rounded-l-[30px] overflow-hidden shadow-2xl ml-[-1px] z-10`}>
              <PDFViewer
                url={selectedPdf.url.split('#')[0]}
                initialPage={selectedPdf.page || 1}
                onClose={() => setSelectedPdf(null)}
                isDark={isDark}
              />
            </div>
          )
        }
      </div >

      {/* Custom Styles */}
      < style > {`
        .scrollbar-thin::-webkit-scrollbar {
          width: 5px;
        }
        .scrollbar-thumb-cyan-300::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #67e8f9, #a855f7);
          border-radius: 3px;
        }
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thumb-rounded::-webkit-scrollbar-thumb {
          border-radius: 3px;
        }
        
        textarea {
          scrollbar-width: thin;
          scrollbar-color: #67e8f9 transparent;
        }
        
        textarea::-webkit-scrollbar {
          width: 4px;
        }
        
        textarea::-webkit-scrollbar-thumb {
          background-color: #67e8f9;
          border-radius: 2px;
        }
        
        textarea::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style >
    </div >
  );

  const renderSettings = () => (
    <div className={`p-6 overflow-y-auto h-full ${bgClass}`}>
      <h2 className={`text-2xl font-bold ${textClass} mb-6 flex items-center gap-3`}>
        <Sliders className="w-6 h-6 text-blue-500" />
        Chat Settings
      </h2>

      <div className="space-y-6">
        {/* Visibility */}
        <div className={`${cardBgClass} rounded-2xl border ${borderClass} p-6`}>
          <h3 className={`font-semibold ${textClass} mb-4`}>Visibility</h3>
          <div className="flex items-center gap-4">
            <div className={`flex-1 p-4 rounded-xl border-2 ${visibility === 'public' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : `${borderClass}`}`}>
              <div className="flex items-center gap-3">
                <Globe className={`w-5 h-5 ${visibility === 'public' ? 'text-blue-500' : subTextClass}`} />
                <div>
                  <p className={`font-medium ${textClass}`}>Public</p>
                  <p className={`text-xs ${subTextClass}`}>Visible to workspace</p>
                </div>
              </div>
            </div>
            <div className={`flex-1 p-4 rounded-xl border-2 ${visibility === 'private' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : `${borderClass}`}`}>
              <div className="flex items-center gap-3">
                <Lock className={`w-5 h-5 ${visibility === 'private' ? 'text-purple-500' : subTextClass}`} />
                <div>
                  <p className={`font-medium ${textClass}`}>Private</p>
                  <p className={`text-xs ${subTextClass}`}>Only you</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className={`${cardBgClass} rounded-2xl border ${borderClass} p-6`}>
          <h3 className={`font-semibold ${textClass} mb-4`}>Appearance</h3>
          <button
            onClick={toggleTheme}
            className={`w-full p-4 rounded-xl border ${borderClass} flex items-center justify-between ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
          >
            <div className="flex items-center gap-3">
              {isDark ? <Moon className="w-5 h-5 text-purple-500" /> : <Sun className="w-5 h-5 text-yellow-500" />}
              <span className={textClass}>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <ChevronRight className={`w-5 h-5 ${subTextClass}`} />
          </button>
        </div>

        {/* Export */}
        <div className={`${cardBgClass} rounded-2xl border ${borderClass} p-6`}>
          <h3 className={`font-semibold ${textClass} mb-4`}>Export</h3>
          <button
            onClick={handleDownloadChat}
            disabled={messages.length === 0}
            className={`w-full p-4 rounded-xl border ${borderClass} flex items-center gap-3 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors disabled:opacity-50`}
          >
            <Download className={`w-5 h-5 ${subTextClass}`} />
            <span className={textClass}>Download Chat as PDF</span>
          </button>
        </div>

        {/* Model Info */}
        <div className={`${cardBgClass} rounded-2xl border ${borderClass} p-6`}>
          <h3 className={`font-semibold ${textClass} mb-4`}>AI Model</h3>
          <div className={`flex items-center gap-4 p-4 ${isDark ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-xl`}>
            <div className={`p-3 ${isDark ? 'bg-gray-600' : 'bg-white'} rounded-xl shadow-sm`}>
              <Sparkles className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`font-medium ${textClass}`}>DataDiscover AI v2.0</p>
              <p className={`text-sm ${subTextClass}`}>Advanced document analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return showDashboard ? (
          <Dashboard domain={domain?.id} fileType={fileType} />
        ) : (
          <DocumentSummary domain={domain} fileType={fileType} />
        );
      case 'preview':
        return (
          <div className={`flex-1 flex flex-col ${bgClass} h-full`}>
            {!selectedPdf && (
              <div className={`p-6 border-b ${borderClass} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${textClass}`}>Document Preview</h3>
                    <p className={subTextClass}>View available PDF documents</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-hidden relative">
              {selectedPdf ? (
                <PDFViewer
                  url={selectedPdf.url.split('#')[0]}
                  initialPage={selectedPdf.page || 1}
                  onClose={() => setSelectedPdf(null)}
                  isDark={isDark}
                />
              ) : (
                <div className="h-full overflow-y-auto p-6">
                  {fileLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dbFiles.filter(f => f.file_name?.toLowerCase().endsWith('.pdf')).length === 0 ? (
                        <div className={`col-span-full text-center ${subTextClass} py-10`}>
                          No PDF files found in this database.
                        </div>
                      ) : (
                        dbFiles.filter(f => f.file_name?.toLowerCase().endsWith('.pdf')).map((file, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedPdf({
                                url: file.file_link,
                                fileName: file.file_name,
                                page: 1
                              });
                              // Stay in preview section
                            }}
                            className={`p-5 rounded-2xl border ${borderClass} ${isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col gap-4 group`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-500">
                                <FileText className="w-8 h-8" />
                              </div>
                              <span className={`px-2 py-1 text-xs font-bold rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>PDF</span>
                            </div>

                            <div>
                              <h4 className={`font-bold ${textClass} text-lg truncate mb-1`} title={file.file_name}>{file.file_name}</h4>
                              <p className="text-sm text-blue-500 group-hover:underline flex items-center gap-1">
                                Open in Viewer <ArrowLeft className="w-3 h-3 rotate-180" />
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      case 'settings':
        return renderSettings();
      default:
        return renderChatbot();
    }
  };

  return (
    <div className={`fixed inset-0 ${bgClass} z-50 flex overflow-hidden`}>
      {/* Side Navbar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col transition-all duration-300`}>
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-sm truncate">{domain?.name || 'Chat Session'}</h1>
                <div className={`flex items-center gap-1 text-xs ${visibility === 'public' ? 'text-blue-400' : 'text-purple-400'}`}>
                  {visibility === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span className="capitalize">{visibility}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', label: showDashboard ? 'Dashboard' : 'Summary', icon: LayoutDashboard },
            { id: 'preview', label: 'Document Preview', icon: FileText },
            { id: 'chatbot', label: 'Chatbot', icon: MessageSquare },
            { id: 'settings', label: 'Settings', icon: Sliders },
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
            {!sidebarCollapsed && <span className="text-sm">{isDark ? 'Light' : 'Dark'}</span>}
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

        {/* File Info */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-white/10">
            <div className="p-3 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {fileType === 'pdf' ? '📄' : fileType === 'excel' ? '📊' : fileType === 'sql' ? '🗄️' : '📁'}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 truncate">{fileType?.toUpperCase() || 'Document'}</p>
                  <p className="text-xs text-gray-300 truncate">{domain?.name || 'Analysis'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className={`${cardBgClass} border-b ${borderClass} px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-4 flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 max-w-md w-full">
                <input
                  type="text"
                  autoFocus
                  value={chatTitle}
                  onChange={(e) => setChatTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditingTitle(false);
                    if (e.key === 'Escape') {
                      setChatTitle(domain?.name || 'Chat Session');
                      setIsEditingTitle(false);
                    }
                  }}
                  className={`w-full px-3 py-1 text-xl font-bold rounded-lg border-2 border-blue-500 bg-transparent ${textClass} focus:outline-none`}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                <h2 className={`text-xl font-bold ${textClass} capitalize truncate`}>{chatTitle}</h2>
                <Edit3 className={`w-4 h-4 ${subTextClass} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
            )}
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${visibility === 'public'
              ? isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
              : isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
              }`}>
              {visibility === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {visibility}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
                  onClose(); // In a real app, you'd also delete from backend/state
                }
              }}
              className={`p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors`}
              title="Delete Conversation"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowParticipantModal(true)}
              className={`p-2 ${subTextClass} ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
              title="Add Participant"
            >
              <UserPlus className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownloadChat}
              disabled={messages.length === 0}
              className={`p-2 ${subTextClass} ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors disabled:opacity-50`}
              title="Download chat as PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                onClick={handleShare}
                className={`p-2 ${shareLinkCopied ? 'text-green-500 bg-green-500/10' : subTextClass} ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-all duration-300 active:scale-90`}
                title="Share link to this chat"
              >
                {shareLinkCopied ? <Check className="w-5 h-5 animate-in zoom-in-50" /> : <Share2 className="w-5 h-5" />}
              </button>
              {shareLinkCopied && (
                <div className="absolute top-full right-0 mt-2 py-1 px-3 bg-green-500 text-white text-[10px] font-bold rounded-lg shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-top-2">
                  Link Copied!
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className={`p-2 ${subTextClass} ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Participant Modal */}
        {showParticipantModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className={`${cardBgClass} border ${borderClass} rounded-2xl w-full max-w-md shadow-2xl overflow-hidden`}>
              <div className={`p-6 border-b ${borderClass} flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600`}>
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Add Participant
                </h3>
                <button onClick={() => setShowParticipantModal(false)} className="text-white/80 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <p className={`${subTextClass} text-sm mb-4`}>Invite collaborators to this conversation by email.</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={participantEmail}
                    onChange={(e) => setParticipantEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className={`flex-1 px-4 py-2 rounded-xl border ${borderClass} ${inputBgClass || cardBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <button
                    onClick={() => {
                      if (participantEmail.trim()) {
                        setParticipants(prev => [...prev, participantEmail.trim()]);
                        setParticipantEmail('');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {participants.length > 0 && (
                  <div className="mt-6">
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${subTextClass} mb-3`}>Current Participants</h4>
                    <div className="space-y-2">
                      {participants.map((p, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className={`text-sm ${textClass}`}>{p}</span>
                          </div>
                          <button
                            onClick={() => setParticipants(prev => prev.filter((_, i) => i !== idx))}
                            className="text-red-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className={`p-6 border-t ${borderClass} flex justify-end`}>
                <button
                  onClick={() => setShowParticipantModal(false)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}





        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
