import React from 'react';
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';

const PDFPreview = ({
  title,
  subtitle,
  pdfUrl,
  onPrint,
  onDownload,
  printDisabled = false,
  downloadDisabled = false,
  printTooltip,
  downloadTooltip,
  mobileNote,
  emptyStateTitle = "No Preview Available",
  emptyStateMessage = "Add data to generate preview"
}) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold mb-1">{title}</h2>
            <p className="text-xs sm:text-sm text-gray-600">{subtitle}</p>
          </div>
          
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2 w-full sm:w-auto sm:flex-shrink-0">
            <button
              onClick={onPrint}
              className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              disabled={printDisabled}
              title={printTooltip}
            >
              <PrinterIcon className="h-4 w-4" />
              <span>Print</span>
            </button>
            <button
              onClick={onDownload}
              className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              disabled={downloadDisabled}
              title={downloadTooltip}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        {pdfUrl ? (
          <div className="relative">
            <iframe
              src={pdfUrl}
              className="w-full h-[300px] sm:h-[400px] lg:h-[600px] border-0"
              title="PDF Preview"
              type="application/pdf"
              width="100%"
              height="100%"
            />
            <div className="absolute top-2 right-2">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
              >
                Open in New Tab
              </a>
            </div>
          </div>
        ) : (
          <div className="w-full h-[300px] sm:h-[400px] lg:h-[600px] flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">{emptyStateTitle}</p>
              <p className="text-sm">{emptyStateMessage}</p>
            </div>
          </div>
        )}
        {mobileNote && (
          <div className="bg-yellow-50 border-t border-yellow-200 p-3 text-sm text-yellow-800 sm:hidden">
            {mobileNote}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFPreview;