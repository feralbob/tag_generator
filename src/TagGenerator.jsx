import React from 'react';
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';

const TagGenerator = ({ 
  fireDepartment, 
  tags, 
  pdfUrl,
  downloadPDF,
  printPDF,
  areAllTagsComplete
}) => {
  const validTagsCount = tags.filter(tag => 
    tag.memberNumber && tag.memberName && tag.role
  ).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left side - Tag Summary */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Tag Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Fire Department:</span>
              <span className="font-medium">{fireDepartment || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Members:</span>
              <span className="font-medium">{validTagsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Pages:</span>
              <span className="font-medium">{validTagsCount * 2}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Members to Print</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tags.filter(tag => tag.memberNumber && tag.memberName && tag.role).map((tag, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{tag.memberName}</div>
                  <div className="text-sm text-gray-600">#{tag.memberNumber} - {tag.role}</div>
                </div>
                <div className="flex gap-2">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: tag.backgroundColor }}
                    title="Background color"
                  />
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: tag.textColor }}
                    title="Text color"
                  />
                </div>
              </div>
            ))}
            {validTagsCount === 0 && (
              <p className="text-gray-500 text-center py-4">
                No valid members to display. Please add members in the Members tab.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right side - PDF Preview */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold mb-1">Tag Preview</h2>
              <p className="text-xs sm:text-sm text-gray-600">
                {validTagsCount * 2} {validTagsCount * 2 === 1 ? 'page' : 'pages'} ({validTagsCount} {validTagsCount === 1 ? 'tag' : 'tags'}, 2 copies each)
              </p>
            </div>
            
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2 w-full sm:w-auto sm:flex-shrink-0">
              <button
                onClick={printPDF}
                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                disabled={!areAllTagsComplete()}
                title={!areAllTagsComplete() ? "Please fill in all fields for all tags" : "Print PDF"}
              >
                <PrinterIcon className="h-4 w-4" />
                <span>Print Tags</span>
              </button>
              <button
                onClick={downloadPDF}
                className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                disabled={!areAllTagsComplete()}
                title={!areAllTagsComplete() ? "Please fill in all fields for all tags" : "Download PDF"}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Download Tags</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <iframe
            src={pdfUrl}
            className="w-full h-[300px] sm:h-[400px] lg:h-[600px] border-0"
            title="PDF Preview"
          />
          <div className="bg-yellow-50 border-t border-yellow-200 p-3 text-sm text-yellow-800 sm:hidden">
            📱 <strong>Mobile note:</strong> Preview may only show first page. Complete PDF includes all {validTagsCount * 2} {validTagsCount * 2 === 1 ? 'page' : 'pages'}.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagGenerator;