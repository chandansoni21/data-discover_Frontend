import jsPDF from 'jspdf';

/**
 * Export chat messages to PDF
 * @param {Array} messages - Array of message objects with type, text, timestamp
 * @param {Object} options - Export options
 * @returns {void} - Downloads PDF to user's device
 */
export const exportChatToPDF = (messages, options = {}) => {
    const {
        title = 'Chat Export',
        subtitle = 'DataDiscover.AI Conversation',
        fileName = 'chat-export.pdf'
    } = options;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Helper to add new page if needed
    const checkNewPage = (height = 20) => {
        if (yPosition + height > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
        }
    };

    // Title
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246); // Blue color
    doc.text(title, margin, yPosition);
    yPosition += 10;

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128); // Gray color
    doc.text(subtitle, margin, yPosition);
    yPosition += 5;

    // Date
    doc.setFontSize(10);
    doc.text(`Exported on: ${new Date().toLocaleString()}`, margin, yPosition);
    yPosition += 15;

    // Divider line
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // Messages
    messages.forEach((message, index) => {
        checkNewPage(40);

        const isUser = message.type === 'user';
        const sender = isUser ? '👤 You' : '🤖 AI Assistant';
        const bgColor = isUser ? [239, 246, 255] : [240, 253, 244];
        const textColor = isUser ? [30, 64, 175] : [21, 128, 61];

        // Message header
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        doc.text(sender, margin, yPosition);

        // Timestamp
        const timestamp = message.timestamp
            ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';
        doc.setTextColor(156, 163, 175);
        doc.text(timestamp, pageWidth - margin - 20, yPosition);
        yPosition += 6;

        // Message content
        doc.setFontSize(11);
        doc.setTextColor(31, 41, 55);

        // Split text into lines that fit the page width
        const textLines = doc.splitTextToSize(message.text, pageWidth - (margin * 2) - 10);

        // Background for message
        const messageHeight = textLines.length * 5 + 10;
        checkNewPage(messageHeight + 10);

        doc.setFillColor(...bgColor);
        doc.roundedRect(margin, yPosition - 3, pageWidth - (margin * 2), messageHeight, 3, 3, 'F');

        // Text content
        doc.setTextColor(31, 41, 55);
        textLines.forEach((line, lineIndex) => {
            doc.text(line, margin + 5, yPosition + (lineIndex * 5) + 3);
        });

        yPosition += messageHeight + 10;
    });

    // Footer on each page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(156, 163, 175);
        doc.text(
            `Page ${i} of ${pageCount} | DataDiscover.AI`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
    }

    // Download the PDF
    doc.save(fileName);
};

export default exportChatToPDF;
