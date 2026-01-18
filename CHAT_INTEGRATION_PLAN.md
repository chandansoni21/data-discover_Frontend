# Chat Integration Implementation Plan

## Overview
This document outlines the implementation for integrating the ChatInterface with the backend RAG system and PDF viewer.

## Components Modified

### 1. Catalogs.jsx ✅
- Added ChatInterface import
- Added selectedCatalog state
- Made catalog cards clickable
- Pass db_name, visibility, folder_type to ChatInterface

### 2. ChatInterface.jsx (TO BE MODIFIED)
Need to add:
- Accept `dbName`, `visibility`, `fileType` props
- Integrate with `/api/chat/query` endpoint
- Display bot_answer with proper formatting
- Show sources with file references
- Implement PDF viewer popup
- Handle page number clicks to open PDF at specific page

## Backend Integration

### API Endpoint: `/api/chat/query`
**Request:**
```json
{
  "query": "user question",
  "database": "db_name",
  "visibility": "local" | "global"
}
```

**Response:**
```json
{
  "bot_answer": "AI generated answer",
  "sources": [
    {
      "page_numbers": 87,
      "file_link": "https://...",
      "file_name": "filename.pdf"
    }
  ],
  "charts": {}
}
```

## UI Requirements

### Chat Message Display
1. Show bot_answer as main response
2. Below answer, show "References" section
3. List unique file names
4. Show page numbers as clickable badges
5. When page number clicked:
   - Download PDF from file_link
   - Open PDF viewer popup on right side
   - Navigate to specific page
   - Show close button

### PDF Viewer Component
- Position: Fixed right side overlay
- Features:
  - PDF rendering using iframe or pdf.js
  - Page navigation
  - Close button
  - Responsive design

## Implementation Steps

1. ✅ Update API utility with sendQuery method
2. ✅ Make catalog cards clickable
3. ⏳ Modify ChatInterface to accept catalog props
4. ⏳ Integrate handleSendMessage with backend API
5. ⏳ Create References component
6. ⏳ Create PDFViewer component
7. ⏳ Test end-to-end flow

## Next Steps
- Modify ChatInterface component's handleSendMessage function
- Create References display component
- Implement PDF viewer with page navigation
