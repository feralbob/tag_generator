import React from 'react';
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';

const TagGenerator = ({ 
  fireDepartment, 
  tags, 
  setTags,
  pdfUrl,
  downloadPDF,
  printPDF,
  areAllTagsComplete
}) => {
  const validTagsCount = tags.filter(tag => 
    tag.memberNumber && tag.memberName && tag.role
  ).length;

  const selectedTagsCount = tags.filter(tag => 
    tag.selectedForPdf && tag.memberNumber && tag.memberName && tag.role
  ).length;

  const updateTagSelection = (index, selected) => {
    const newTags = [...tags];
    newTags[index] = { ...newTags[index], selectedForPdf: selected };
    setTags(newTags);
  };

  const selectAll = () => {
    const newTags = tags.map(tag => ({ ...tag, selectedForPdf: true }));
    setTags(newTags);
  };

  const selectNone = () => {
    const newTags = tags.map(tag => ({ ...tag, selectedForPdf: false }));
    setTags(newTags);
  };

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
              <span className="text-gray-600">Selected for PDF:</span>
              <span className="font-medium">{selectedTagsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pages to Print:</span>
              <span className="font-medium">{selectedTagsCount * 2}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Members to Print</h2>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Select All
              </button>
              <button
                onClick={selectNone}
                className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Select None
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tags.filter(tag => tag.memberNumber && tag.memberName && tag.role).map((tag, originalIndex) => {
              // Find the original index in the full tags array
              const tagIndex = tags.findIndex(t => t === tag);
              return (
                <div key={tagIndex} className={`flex items-center justify-between p-3 rounded border-2 ${
                  tag.selectedForPdf ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={tag.selectedForPdf}
                      onChange={(e) => updateTagSelection(tagIndex, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <div className="font-medium">{tag.memberName}</div>
                      <div className="text-sm text-gray-600">#{tag.memberNumber} - {tag.role}</div>
                    </div>
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
              );
            })}
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
                {selectedTagsCount * 2} {selectedTagsCount * 2 === 1 ? 'page' : 'pages'} ({selectedTagsCount} {selectedTagsCount === 1 ? 'selected tag' : 'selected tags'}, 2 copies each)
              </p>
            </div>
            
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2 w-full sm:w-auto sm:flex-shrink-0">
              <button
                onClick={printPDF}
                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                disabled={!areAllTagsComplete()}
                title={!areAllTagsComplete() ? (selectedTagsCount === 0 ? "Please select members to print" : "Please fill in all fields for selected members") : "Print PDF"}
              >
                <PrinterIcon className="h-4 w-4" />
                <span>Print Tags</span>
              </button>
              <button
                onClick={downloadPDF}
                className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                disabled={!areAllTagsComplete()}
                title={!areAllTagsComplete() ? (selectedTagsCount === 0 ? "Please select members to print" : "Please fill in all fields for selected members") : "Download PDF"}
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
            📱 <strong>Mobile note:</strong> Preview may only show first page. Complete PDF includes all {selectedTagsCount * 2} {selectedTagsCount * 2 === 1 ? 'page' : 'pages'}.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagGenerator;