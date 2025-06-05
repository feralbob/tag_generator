import React from 'react';
import PDFPreview from './PDFPreview';

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
      <PDFPreview
        title="Tag Preview"
        subtitle={`${selectedTagsCount * 2} ${selectedTagsCount * 2 === 1 ? 'page' : 'pages'} (${selectedTagsCount} ${selectedTagsCount === 1 ? 'selected tag' : 'selected tags'}, 2 copies each)`}
        pdfUrl={pdfUrl}
        onPrint={printPDF}
        onDownload={downloadPDF}
        printDisabled={!areAllTagsComplete()}
        downloadDisabled={!areAllTagsComplete()}
        printTooltip={!areAllTagsComplete() ? (selectedTagsCount === 0 ? "Please select members to print" : "Please fill in all fields for selected members") : "Print Tags"}
        downloadTooltip={!areAllTagsComplete() ? (selectedTagsCount === 0 ? "Please select members to print" : "Please fill in all fields for selected members") : "Download Tags"}
        mobileNote={`📱 Mobile note: Preview may only show first page. Complete PDF includes all ${selectedTagsCount * 2} ${selectedTagsCount * 2 === 1 ? 'page' : 'pages'}.`}
        emptyStateTitle="No Tag Preview"
        emptyStateMessage="Select members and fill in their details to generate tags"
      />
    </div>
  );
};

export default TagGenerator;