import React, { useState, useRef } from 'react';
import {
    X, Upload, FileText, FileSpreadsheet, Database, FileJson,
    Plug, Globe, Lock, CheckCircle, AlertCircle, File, Server,
    Key, User, Shield, Eye, EyeOff, Loader2, FolderOpen, Clock
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { API } from '../utils/api';

const fileTypes = [
    { id: 'pdf', name: 'PDF', icon: FileText, color: 'from-red-500 to-rose-600', accept: '.pdf', description: 'PDF Documents' },
    { id: 'word', name: 'Word', icon: FileText, color: 'from-blue-500 to-blue-600', accept: '.doc,.docx', description: 'Word Documents' },
    { id: 'excel', name: 'Excel', icon: FileSpreadsheet, color: 'from-green-500 to-emerald-600', accept: '.xls,.xlsx,.csv', description: 'Spreadsheets' },
    { id: 'sql', name: 'SQL', icon: Database, color: 'from-orange-500 to-amber-600', accept: '.sql', description: 'Database Connection' },
    { id: 'json', name: 'JSON', icon: FileJson, color: 'from-purple-500 to-violet-600', accept: '.json', description: 'JSON Files' },
    { id: 'api', name: 'API', icon: Plug, color: 'from-cyan-500 to-teal-600', accept: '', description: 'API Integration' },
];

export default function UploadModal({
    isOpen,
    onClose,
    onUploadComplete,
    preSelectedDomain = null,
    preSelectedFileType = null
}) {
    const { isDark } = useTheme();
    const [selectedFileType, setSelectedFileType] = useState(preSelectedFileType);
    const [visibility, setVisibility] = useState('private');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // SQL Credentials state
    const [sqlCredentials, setSqlCredentials] = useState({
        hostname: '',
        username: '',
        password: '',
        databaseName: '',
        port: '5432'
    });

    // API Configuration state
    const [apiConfig, setApiConfig] = useState({
        endpoint: '',
        apiKey: '',
        method: 'GET'
    });

    const [uploadResult, setUploadResult] = useState(null);

    const fileInputRef = useRef(null);
    const folderInputRef = useRef(null);
    const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'folder'
    const [selectedFiles, setSelectedFiles] = useState([]); // For folder upload

    if (!isOpen) return null;

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (file) => {
        setError(null);

        if (selectedFileType && selectedFileType !== 'api' && selectedFileType !== 'sql') {
            const fileType = fileTypes.find(ft => ft.id === selectedFileType);
            const allowedExtensions = fileType?.accept.split(',').map(ext => ext.trim());
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

            if (allowedExtensions && !allowedExtensions.some(ext => fileExtension.endsWith(ext.replace('.', '')))) {
                setError(`Please select a valid ${fileType.name} file`);
                return;
            }
        }

        setSelectedFile(file);
    };

    const handleInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const validateSqlCredentials = () => {
        if (!sqlCredentials.hostname.trim()) return 'Hostname is required';
        if (!sqlCredentials.username.trim()) return 'Username is required';
        if (!sqlCredentials.password.trim()) return 'Password is required';
        if (!sqlCredentials.databaseName.trim()) return 'Database name is required';
        return null;
    };

    const validateApiConfig = () => {
        if (!apiConfig.endpoint.trim()) return 'API endpoint is required';
        return null;
    };



    const handleUpload = async () => {
        // Validate based on file type
        if (selectedFileType === 'sql') {
            const sqlError = validateSqlCredentials();
            if (sqlError) {
                setError(sqlError);
                return;
            }
        } else if (selectedFileType === 'api') {
            const apiError = validateApiConfig();
            if (apiError) {
                setError(apiError);
                return;
            }
        } else if (!selectedFile && selectedFiles.length === 0) {
            setError('Please select a file or folder to upload');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setError(null);
        setUploadResult(null);

        // Prepare FormData
        const formData = new FormData();

        let folderName = '';
        if (selectedFiles.length > 0) {
            // Folder upload
            Array.from(selectedFiles).forEach(file => {
                formData.append('files', file);
            });
            // Try to set folder name from relative path or first file
            const distinctFolders = new Set(Array.from(selectedFiles).map(f => f.webkitRelativePath.split('/')[0]).filter(Boolean));
            folderName = distinctFolders.size > 0 ? Array.from(distinctFolders)[0] : 'Uploaded_Folder';
        } else if (selectedFile) {
            // Single file upload
            formData.append('files', selectedFile);
            folderName = selectedFile.name.split('.')[0];
        }

        formData.append('folder_name', folderName);

        // Map frontend file types to backend expected types
        const typeMapping = {
            'pdf': 'standard_pdf',
            'word': 'docx',
            'excel': 'csv', // defaulting to csv for excel category based on common patterns, or pass 'xlsx' if supported
            'json': 'json',
            'txt': 'txt'
        };
        formData.append('file_type', typeMapping[selectedFileType] || selectedFileType);
        formData.append('visibility', visibility === 'public' ? 'global' : 'local');

        try {
            // Simulated progress for UX before real upload starts or during if axios support (axios upload progress not implemented here yet)
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) return prev;
                    return prev + 10;
                });
            }, 500);

            const response = await API.upload.createDatabase(formData);

            clearInterval(progressInterval);
            setUploadProgress(100);

            // Check if database creation failed
            const isFailed = response.data.message === "Database not created" ||
                (response.data.eta && response.data.eta === "0 minutes");

            // Handle Success or Failure
            setUploadResult({
                ...response.data,
                isError: isFailed
            });
            setIsUploading(false);

        } catch (err) {
            console.error('Upload failed', err);
            setError(err.response?.data?.detail || 'Upload failed. Please try again.');
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleClose = () => {
        setSelectedFileType(preSelectedFileType);
        setVisibility('private');
        setSelectedFile(null);
        setIsUploading(false);
        setUploadProgress(0);
        setError(null);
        setSqlCredentials({ hostname: '', username: '', password: '', databaseName: '', port: '5432' });
        setApiConfig({ endpoint: '', apiKey: '', method: 'GET' });
        onClose();
    };

    // Theme classes
    const bgClass = isDark ? 'bg-gray-900' : 'bg-white';
    const textClass = isDark ? 'text-white' : 'text-gray-900';
    const subTextClass = isDark ? 'text-gray-400' : 'text-gray-500';
    const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';
    const cardBgClass = isDark ? 'bg-gray-800' : 'bg-gray-50';
    const inputBgClass = isDark ? 'bg-gray-800' : 'bg-white';

    // Check if upload/connect button should be enabled
    const isFormValid = () => {
        if (!selectedFileType) return false;
        if (selectedFileType === 'sql') {
            return sqlCredentials.hostname && sqlCredentials.username && sqlCredentials.password && sqlCredentials.databaseName;
        }
        if (selectedFileType === 'api') {
            return apiConfig.endpoint;
        }
        return selectedFile !== null;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${bgClass} rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border ${borderClass} overflow-hidden`}>
                {/* Header */}
                <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2di00aC00djRoNHptMC02di00aC00djRoNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">
                                {selectedFileType === 'sql' ? 'Connect Database' : selectedFileType === 'api' ? 'Configure API' : 'Upload Document'}
                            </h2>
                            <p className="text-blue-100 text-sm">
                                {preSelectedDomain ? `Domain: ${preSelectedDomain}` : 'Select format and configure your data source'}
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-white/80 hover:text-white hover:bg-white/20 p-2.5 rounded-xl transition-all duration-200"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-6">
                        {/* File Type Selection */}
                        {!preSelectedFileType && (
                            <div>
                                <label className={`block text-sm font-semibold ${textClass} mb-3`}>
                                    Select Data Source
                                </label>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                    {fileTypes.map((type) => {
                                        const IconComponent = type.icon;
                                        const isSelected = selectedFileType === type.id;
                                        return (
                                            <button
                                                key={type.id}
                                                onClick={() => {
                                                    setSelectedFileType(type.id);
                                                    setSelectedFile(null);
                                                    setError(null);
                                                }}
                                                className={`group relative p-3 rounded-xl border-2 transition-all duration-300 ${isSelected
                                                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                                                    : `${borderClass} hover:border-blue-400 ${cardBgClass} hover:shadow-md`
                                                    }`}
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className={`p-2 rounded-lg bg-gradient-to-br ${type.color} shadow-sm`}>
                                                        <IconComponent className="w-5 h-5 text-white" />
                                                    </div>
                                                    <span className={`text-xs font-semibold ${isSelected ? 'text-blue-500' : textClass}`}>
                                                        {type.name}
                                                    </span>
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* SQL Database Connection Form */}
                        {selectedFileType === 'sql' && (
                            <div className={`${cardBgClass} rounded-2xl p-6 border ${borderClass}`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                                        <Server className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${textClass}`}>Database Credentials</h3>
                                        <p className={`text-sm ${subTextClass}`}>Enter your database connection details</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Hostname */}
                                    <div className="md:col-span-2">
                                        <label className={`block text-sm font-medium ${textClass} mb-2`}>
                                            <Server className="w-4 h-4 inline mr-2" />
                                            Hostname / IP Address
                                        </label>
                                        <input
                                            type="text"
                                            value={sqlCredentials.hostname}
                                            onChange={(e) => setSqlCredentials({ ...sqlCredentials, hostname: e.target.value })}
                                            placeholder="e.g., localhost or db.example.com"
                                            className={`w-full px-4 py-3 rounded-xl border ${borderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                        />
                                    </div>

                                    {/* Port */}
                                    <div>
                                        <label className={`block text-sm font-medium ${textClass} mb-2`}>Port</label>
                                        <input
                                            type="text"
                                            value={sqlCredentials.port}
                                            onChange={(e) => setSqlCredentials({ ...sqlCredentials, port: e.target.value })}
                                            placeholder="5432"
                                            className={`w-full px-4 py-3 rounded-xl border ${borderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                        />
                                    </div>

                                    {/* Database Name */}
                                    <div>
                                        <label className={`block text-sm font-medium ${textClass} mb-2`}>
                                            <Database className="w-4 h-4 inline mr-2" />
                                            Database Name
                                        </label>
                                        <input
                                            type="text"
                                            value={sqlCredentials.databaseName}
                                            onChange={(e) => setSqlCredentials({ ...sqlCredentials, databaseName: e.target.value })}
                                            placeholder="my_database"
                                            className={`w-full px-4 py-3 rounded-xl border ${borderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                        />
                                    </div>

                                    {/* Username */}
                                    <div>
                                        <label className={`block text-sm font-medium ${textClass} mb-2`}>
                                            <User className="w-4 h-4 inline mr-2" />
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            value={sqlCredentials.username}
                                            onChange={(e) => setSqlCredentials({ ...sqlCredentials, username: e.target.value })}
                                            placeholder="db_user"
                                            className={`w-full px-4 py-3 rounded-xl border ${borderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                        />
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className={`block text-sm font-medium ${textClass} mb-2`}>
                                            <Key className="w-4 h-4 inline mr-2" />
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={sqlCredentials.password}
                                                onChange={(e) => setSqlCredentials({ ...sqlCredentials, password: e.target.value })}
                                                placeholder="••••••••"
                                                className={`w-full px-4 py-3 pr-12 rounded-xl border ${borderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 ${subTextClass} hover:${textClass}`}
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} border ${isDark ? 'border-blue-800' : 'border-blue-200'}`}>
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-blue-500" />
                                        <span className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                                            Your credentials are encrypted and secure
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* API Configuration */}
                        {selectedFileType === 'api' && (
                            <div className={`${cardBgClass} rounded-2xl p-6 border ${borderClass}`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl shadow-lg">
                                        <Plug className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${textClass}`}>API Configuration</h3>
                                        <p className={`text-sm ${subTextClass}`}>Connect to your REST API endpoint</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className={`block text-sm font-medium ${textClass} mb-2`}>API Endpoint URL</label>
                                        <input
                                            type="text"
                                            value={apiConfig.endpoint}
                                            onChange={(e) => setApiConfig({ ...apiConfig, endpoint: e.target.value })}
                                            placeholder="https://api.example.com/v1/data"
                                            className={`w-full px-4 py-3 rounded-xl border ${borderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium ${textClass} mb-2`}>API Key (Optional)</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={apiConfig.apiKey}
                                                onChange={(e) => setApiConfig({ ...apiConfig, apiKey: e.target.value })}
                                                placeholder="Your API key"
                                                className={`w-full px-4 py-3 pr-12 rounded-xl border ${borderClass} ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 ${subTextClass} hover:${textClass}`}
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* File Upload Zone - Only for non-SQL, non-API types */}
                        {selectedFileType && selectedFileType !== 'sql' && selectedFileType !== 'api' && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className={`block text-sm font-semibold ${textClass}`}>Upload</label>
                                    <div className={`flex rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-1`}>
                                        <button
                                            onClick={() => setUploadMode('file')}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${uploadMode === 'file' ? 'bg-blue-500 text-white shadow' : `${textClass}`}`}
                                        >
                                            <File className="w-3 h-3 inline mr-1" />
                                            File
                                        </button>
                                        <button
                                            onClick={() => setUploadMode('folder')}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${uploadMode === 'folder' ? 'bg-blue-500 text-white shadow' : `${textClass}`}`}
                                        >
                                            <FolderOpen className="w-3 h-3 inline mr-1" />
                                            Folder
                                        </button>
                                    </div>
                                </div>
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => uploadMode === 'file' ? fileInputRef.current?.click() : folderInputRef.current?.click()}
                                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${dragActive
                                        ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
                                        : `${borderClass} ${cardBgClass} hover:border-blue-400 hover:shadow-lg`
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleInputChange}
                                        accept={fileTypes.find(ft => ft.id === selectedFileType)?.accept || '*'}
                                        className="hidden"
                                    />
                                    <input
                                        ref={folderInputRef}
                                        type="file"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            if (files.length > 0) {
                                                setSelectedFiles(files);
                                                setSelectedFile(files[0]); // Set first file for upload
                                                setError(null);
                                            }
                                        }}
                                        webkitdirectory=""
                                        directory=""
                                        multiple
                                        className="hidden"
                                    />

                                    {selectedFile || selectedFiles.length > 0 ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className={`p-4 bg-gradient-to-br ${uploadMode === 'folder' ? 'from-amber-500 to-orange-600' : 'from-green-500 to-emerald-600'} rounded-2xl shadow-lg`}>
                                                {uploadMode === 'folder' ? <FolderOpen className="w-8 h-8 text-white" /> : <File className="w-8 h-8 text-white" />}
                                            </div>
                                            <div>
                                                <p className={`font-semibold ${textClass}`}>
                                                    {uploadMode === 'folder' ? `${selectedFiles.length} files selected` : selectedFile?.name}
                                                </p>
                                                <p className={`text-sm ${subTextClass}`}>
                                                    {uploadMode === 'folder'
                                                        ? `Total: ${(selectedFiles.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB`
                                                        : `${(selectedFile?.size / 1024 / 1024).toFixed(2)} MB`
                                                    }
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setSelectedFiles([]); }}
                                                className="text-sm text-red-500 hover:text-red-600 font-medium hover:underline"
                                            >
                                                Remove {uploadMode === 'folder' ? 'files' : 'file'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className={`p-5 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-2xl`}>
                                                {uploadMode === 'folder' ? <FolderOpen className={`w-10 h-10 ${subTextClass}`} /> : <Upload className={`w-10 h-10 ${subTextClass}`} />}
                                            </div>
                                            <div>
                                                <p className={`font-semibold ${textClass} mb-1`}>
                                                    {uploadMode === 'folder' ? 'Select a folder to upload' : 'Drag & drop your file here'}
                                                </p>
                                                <p className={`text-sm ${subTextClass}`}>
                                                    or <span className="text-blue-500 font-medium">browse</span> to {uploadMode === 'folder' ? 'select folder' : 'upload'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className={`flex items-center gap-3 p-4 rounded-xl ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <span className={`text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}>{error}</span>
                            </div>
                        )}

                        {/* Visibility Selection */}
                        {selectedFileType && (
                            <div>
                                <label className={`block text-sm font-semibold ${textClass} mb-3`}>Visibility</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setVisibility('public')}
                                        className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${visibility === 'public'
                                            ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                                            : `${borderClass} ${cardBgClass} hover:border-blue-400`
                                            }`}
                                    >
                                        <div className={`p-2.5 rounded-xl ${visibility === 'public' ? 'bg-blue-500' : isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                            <Globe className={`w-5 h-5 ${visibility === 'public' ? 'text-white' : subTextClass}`} />
                                        </div>
                                        <div className="text-left">
                                            <p className={`font-semibold ${visibility === 'public' ? 'text-blue-500' : textClass}`}>Public</p>
                                            <p className={`text-xs ${subTextClass}`}>Team can access</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setVisibility('private')}
                                        className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${visibility === 'private'
                                            ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                                            : `${borderClass} ${cardBgClass} hover:border-purple-400`
                                            }`}
                                    >
                                        <div className={`p-2.5 rounded-xl ${visibility === 'private' ? 'bg-purple-500' : isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                            <Lock className={`w-5 h-5 ${visibility === 'private' ? 'text-white' : subTextClass}`} />
                                        </div>
                                        <div className="text-left">
                                            <p className={`font-semibold ${visibility === 'private' ? 'text-purple-500' : textClass}`}>Private</p>
                                            <p className={`text-xs ${subTextClass}`}>Only you</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Upload Progress */}
                        {isUploading && (
                            <div className={`${cardBgClass} rounded-xl p-5 border ${borderClass}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-sm font-semibold ${textClass}`}>
                                        {selectedFileType === 'sql' ? 'Connecting...' : selectedFileType === 'api' ? 'Configuring...' : 'Uploading...'}
                                    </span>
                                    <span className={`text-sm font-bold text-blue-500`}>{uploadProgress}%</span>
                                </div>
                                <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5 overflow-hidden`}>
                                    <div
                                        className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Success/Error Overlay */}
                {uploadResult && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in zoom-in duration-300">
                        <div className={`relative ${cardBgClass} p-8 rounded-3xl shadow-2xl max-w-md w-full border ${borderClass} flex flex-col items-center text-center`}>
                            {uploadResult.isError ? (
                                <>
                                    {/* Error State */}
                                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-500/30 animate-pulse">
                                        <AlertCircle className="w-8 h-8 text-white" />
                                    </div>

                                    <h3 className={`text-2xl font-bold text-red-500 mb-2`}>Database Creation Failed</h3>
                                    <p className={`${subTextClass} mb-6`}>{uploadResult.message || 'Failed to create database. Please try again.'}</p>

                                    <div className={`w-full p-4 rounded-xl ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border mb-8`}>
                                        <div className="flex items-center justify-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                            <span className={`text-sm font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                                Please check your configuration and try again
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 w-full">
                                        <button
                                            onClick={() => {
                                                setUploadResult(null);
                                                setError(null);
                                                setUploadProgress(0);
                                            }}
                                            className={`flex-1 py-3.5 rounded-xl font-semibold transition-all duration-300 ${isDark
                                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => {
                                                onUploadComplete({
                                                    ...uploadResult,
                                                    file: selectedFile || selectedFiles[0],
                                                    fileType: selectedFileType,
                                                    visibility: visibility,
                                                    domain: preSelectedDomain,
                                                    isUploadComplete: false,
                                                    hasError: true
                                                });
                                                handleClose();
                                            }}
                                            className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-[1.02]"
                                        >
                                            Try Chatting Anyway
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Success State */}
                                    {/* Close Button */}
                                    <button
                                        onClick={() => {
                                            setUploadResult(null);
                                            setError(null);
                                            setUploadProgress(0);
                                        }}
                                        className={`absolute top-4 right-4 ${subTextClass} hover:${textClass} hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg transition-all`}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
                                        <CheckCircle className="w-8 h-8 text-white" />
                                    </div>

                                    <h3 className={`text-2xl font-bold ${textClass} mb-2`}>Upload Successful!</h3>
                                    <p className={`${subTextClass} mb-6`}>{uploadResult.message}</p>

                                    <div className={`w-full p-4 rounded-xl ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'} border mb-8`}>
                                        <p className={`text-sm ${subTextClass} mb-1`}>Time remaining to chat</p>
                                        <div className="flex items-center justify-center gap-2">
                                            <Clock className="w-5 h-5 text-blue-500" />
                                            <span className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                {uploadResult.eta || 'Calculating...'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            onUploadComplete({
                                                ...uploadResult,
                                                file: selectedFile || selectedFiles[0],
                                                fileType: selectedFileType,
                                                visibility: visibility,
                                                domain: preSelectedDomain,
                                                isUploadComplete: true
                                            });
                                            handleClose();
                                        }}
                                        className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all hover:scale-[1.02]"
                                    >
                                        Start Chatting
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className={`flex-shrink-0 p-6 border-t ${borderClass} ${cardBgClass}`}>
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            disabled={isUploading}
                            className={`flex-1 py-3.5 rounded-xl font-semibold transition-all duration-300 ${isDark
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                } disabled:opacity-50`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={isUploading || !isFormValid()}
                            className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {selectedFileType === 'sql' ? 'Connecting...' : selectedFileType === 'api' ? 'Configuring...' : 'Uploading...'}
                                </>
                            ) : (
                                <>
                                    {selectedFileType === 'sql' ? <Database className="w-5 h-5" /> : selectedFileType === 'api' ? <Plug className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                                    {selectedFileType === 'sql' ? 'Connect Database' : selectedFileType === 'api' ? 'Connect API' : 'Upload & Continue'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
