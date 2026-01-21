import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';
// Set up the worker
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ url, onClose, isDark }) {
    const [numPages, setNumPages] = useState(null);
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);
    const [loading, setLoading] = useState(true);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setLoading(false);
    }

    const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
    const rotate = () => setRotation(prev => (prev + 90) % 360);

    return (
        <div className={`flex flex-col h-full bg-sky-50/30 dark:bg-slate-900`}>
            {/* Header with Light Blue Styling */}
            <div className="flex-shrink-0">
                <button
                    className="py-3 w-full font-bold text-sm bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                    onClick={onClose}
                >
                    <X className="w-4 h-4 text-white" />
                    Close PDF Viewer
                </button>
            </div>

            {/* Toolbar - Light Blue Theme */}
            <div className="flex items-center justify-between p-3 border-b border-blue-200/50 bg-sky-500 text-white sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold ml-2">
                        {numPages ? `${numPages} Pages` : 'Loading...'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={zoomOut} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Zoom Out">
                        <ZoomOut className="w-4 h-4 text-white" />
                    </button>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-md font-bold">{Math.round(scale * 100)}%</span>
                    <button onClick={zoomIn} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Zoom In">
                        <ZoomIn className="w-4 h-4 text-white" />
                    </button>
                    <button onClick={rotate} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Rotate">
                        <RotateCw className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>

            {/* PDF Content - Continuous Scroll */}
            <div className="flex-1 overflow-y-auto flex justify-center p-4 relative scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 dark:bg-black/50">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={(error) => {
                        console.error('Error loading PDF:', error);
                        if (error.status === 403) {
                            toast.error('Session link expired or forbidden. Please try refreshing.');
                        } else {
                            toast.error('Failed to load PDF document');
                        }
                    }}
                    className="flex flex-col items-center gap-4"
                >
                    {numPages && Array.from(new Array(numPages), (el, index) => (
                        <Page
                            key={`page_${index + 1}`}
                            pageNumber={index + 1}
                            scale={scale}
                            rotate={rotation}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            className="shadow-lg bg-white"
                            loading={index === 0 ? "Loading page..." : ""}
                        />
                    ))}
                </Document>
            </div>
        </div>
    );
}
