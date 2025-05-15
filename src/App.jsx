import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { PlusIcon, TrashIcon, ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';

const CR80_WIDTH_MM = 85.6;
const CR80_HEIGHT_MM = 53.98;

// Custom debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

function App() {
  const [fireDepartment, setFireDepartment] = useState('');
  const [tags, setTags] = useState([{
    memberNumber: '',
    memberName: '',
    role: '',
    textColor: '#000000',
    backgroundColor: '#ffffff'
  }]);

  const [pdfUrl, setPdfUrl] = useState('');

  // Debounce the tags and fireDepartment values
  const debouncedTags = useDebounce(tags, 500);
  const debouncedFireDepartment = useDebounce(fireDepartment, 500);

  const addTag = () => {
    setTags([...tags, {
      memberNumber: '',
      memberName: '',
      role: '',
      textColor: '#000000',
      backgroundColor: '#ffffff'
    }]);
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const updateTag = (index, field, value) => {
    const newTags = [...tags];
    newTags[index] = { ...newTags[index], [field]: value };
    setTags(newTags);
  };

  const generatePDF = useCallback(() => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [CR80_HEIGHT_MM, CR80_WIDTH_MM]
    });

    debouncedTags.forEach((tag, index) => {
      if (index > 0) doc.addPage();
      
      // First tag on the page
      doc.setFillColor(tag.backgroundColor);
      doc.rect(0, 0, CR80_HEIGHT_MM, CR80_WIDTH_MM, 'F');
      
      doc.setTextColor(tag.textColor);
      doc.setFontSize(12);
      doc.text(debouncedFireDepartment, CR80_HEIGHT_MM/2, 10, { align: 'center' });
      doc.text(tag.memberNumber, CR80_HEIGHT_MM/2, 20, { align: 'center' });
      doc.text(tag.memberName, CR80_HEIGHT_MM/2, 30, { align: 'center' });
      doc.text(tag.role, CR80_HEIGHT_MM/2, 40, { align: 'center' });

      // Add second page with the same tag
      doc.addPage();
      doc.setFillColor(tag.backgroundColor);
      doc.rect(0, 0, CR80_HEIGHT_MM, CR80_WIDTH_MM, 'F');
      
      doc.setTextColor(tag.textColor);
      doc.text(debouncedFireDepartment, CR80_HEIGHT_MM/2, 10, { align: 'center' });
      doc.text(tag.memberNumber, CR80_HEIGHT_MM/2, 20, { align: 'center' });
      doc.text(tag.memberName, CR80_HEIGHT_MM/2, 30, { align: 'center' });
      doc.text(tag.role, CR80_HEIGHT_MM/2, 40, { align: 'center' });
    });

    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
  }, [debouncedTags, debouncedFireDepartment]);

  useEffect(() => {
    generatePDF();
  }, [generatePDF]);

  const areAllTagsComplete = useCallback(() => {
    if (!fireDepartment) return false;
    
    return tags.every(tag => 
      tag.memberNumber.trim() !== '' &&
      tag.memberName.trim() !== '' &&
      tag.role !== ''
    );
  }, [fireDepartment, tags]);

  const downloadPDF = () => {
    if (!areAllTagsComplete()) return;
    const date = new Date().toISOString().split('T')[0];
    const filename = `${fireDepartment.replace(/\s+/g, '_')}_${date}.pdf`;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename;
    link.click();
  };

  const printPDF = () => {
    if (!areAllTagsComplete()) return;
    const printWindow = window.open(pdfUrl);
    
    // Wait for the PDF to load in the new window
    const checkPDFLoaded = setInterval(() => {
      try {
        // Check if the PDF viewer is ready
        if (printWindow.document.readyState === 'complete' && 
            printWindow.document.querySelector('embed')?.getAttribute('type') === 'application/pdf') {
          clearInterval(checkPDFLoaded);
          printWindow.print();
        }
      } catch (e) {
        // If we can't access the window (e.g., it was closed), clear the interval
        clearInterval(checkPDFLoaded);
      }
    }, 100);

    // Clear the interval after 10 seconds to prevent infinite checking
    setTimeout(() => clearInterval(checkPDFLoaded), 10000);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Fire Department Tag Generator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Tag Editor */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Fire Department</h2>
              <input
                type="text"
                placeholder="Fire Department Name"
                value={fireDepartment}
                onChange={(e) => setFireDepartment(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            {tags.map((tag, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Tag {index + 1}</h2>
                  {tags.length > 1 && (
                    <button
                      onClick={() => removeTag(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Member Number"
                    value={tag.memberNumber}
                    onChange={(e) => updateTag(index, 'memberNumber', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Member Name"
                    value={tag.memberName}
                    onChange={(e) => updateTag(index, 'memberName', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                  <select
                    value={tag.role}
                    onChange={(e) => updateTag(index, 'role', e.target.value)}
                    className="w-full p-2 border rounded bg-white"
                  >
                    <option value="">Select Role</option>
                    <option value="Probationary">Probationary</option>
                    <option value="Firefighter">Firefighter</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Ground Support">Ground Support</option>
                    <option value="Lieutenant">Lieutenant</option>
                    <option value="Captain">Captain</option>
                    <option value="Deputy Chief">Deputy Chief</option>
                    <option value="Chief">Chief</option>
                  </select>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={tag.textColor}
                          onChange={(e) => updateTag(index, 'textColor', e.target.value)}
                          className="h-8 w-full p-0 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Background Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={tag.backgroundColor}
                          onChange={(e) => updateTag(index, 'backgroundColor', e.target.value)}
                          className="h-8 w-full p-0 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={addTag}
              className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Another Tag
            </button>
          </div>

          {/* Right side - PDF Preview */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">PDF Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={printPDF}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!areAllTagsComplete()}
                  title={!areAllTagsComplete() ? "Please fill in all fields for all tags" : "Print PDF"}
                >
                  <PrinterIcon className="h-5 w-5" />
                  Print PDF
                </button>
                <button
                  onClick={downloadPDF}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!areAllTagsComplete()}
                  title={!areAllTagsComplete() ? "Please fill in all fields for all tags" : "Download PDF"}
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  Download PDF
                </button>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <iframe
                src={pdfUrl}
                className="w-full h-[600px]"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 