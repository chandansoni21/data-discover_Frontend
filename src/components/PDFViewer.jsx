import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
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
        <div className={`flex flex-col h-full bg-gray-100 dark:bg-gray-900`}>
            {/* Header with Red Close Button */}
            <div className="flex-shrink-0">
                <button
                    className={`py-3 w-full font-medium text-sm ${isDark ? 'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950' : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'} text-white transition-all duration-200 shadow-md flex items-center justify-center gap-2`}
                    onClick={onClose}
                >
                    <X className="w-4 h-4" />
                    Close PDF Viewer
                </button>
            </div>

            {/* Toolbar */}
            <div className={`flex items-center justify-between p-2 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} sticky top-0 z-10`}>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium ml-2">
                        {numPages ? `${numPages} Pages` : 'Loading...'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={zoomOut} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Zoom Out">
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{Math.round(scale * 100)}%</span>
                    <button onClick={zoomIn} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Zoom In">
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button onClick={rotate} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Rotate">
                        <RotateCw className="w-4 h-4" />
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
                    onLoadError={(error) => console.error('Error loading PDF:', error)}
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
