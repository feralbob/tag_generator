import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { PlusIcon, TrashIcon, ArrowDownTrayIcon, PrinterIcon, RectangleStackIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import RosterCard from './RosterCard';

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
  const [mode, setMode] = useState('tags'); // 'tags' or 'roster'
  const [fireDepartment, setFireDepartment] = useState('');
  const [tags, setTags] = useState([{
    memberNumber: '',
    memberName: '',
    role: '',
    textColor: '#000000',
    backgroundColor: '#ffffff'
  }]);

  const [pdfUrl, setPdfUrl] = useState('');
  
  // Roster-specific state
  const [rosterSide, setRosterSide] = useState('front'); // 'front' or 'back'
  const [sortBy, setSortBy] = useState('name'); // 'name' or 'number'
  const [rosterPdfUrl, setRosterPdfUrl] = useState('');

  // Debounce the tags and fireDepartment values
  const debouncedTags = useDebounce(tags, 500);
  const debouncedFireDepartment = useDebounce(fireDepartment, 500);

  // Role to color mapping
  const roleColorMap = {
    'Firefighter': { textColor: '#FFFFFF', backgroundColor: '#FF0000' }, // White on Red
    'Captain': { textColor: '#FFFFFF', backgroundColor: '#000000' },     // White on Black
    'Ground Support': { textColor: '#FFFFFF', backgroundColor: '#00FF00' }, // White on Green
    'Chief': { textColor: '#000000', backgroundColor: '#FFFFFF' },       // Black on White
    'Deputy Chief': { textColor: '#000000', backgroundColor: '#FFFFFF' },// Black on White
    'Lieutenant': { textColor: '#FFFFFF', backgroundColor: '#000000' },  // White on Black
    'Water Supply': { textColor: '#FFFFFF', backgroundColor: '#0000FF' },  // White on Blue
  };

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
    // If the role is being changed, update colors if mapping exists
    if (field === 'role' && roleColorMap[value]) {
      newTags[index] = {
        ...newTags[index],
        role: value,
        textColor: roleColorMap[value].textColor,
        backgroundColor: roleColorMap[value].backgroundColor,
      };
    } else {
      newTags[index] = { ...newTags[index], [field]: value };
    }
    setTags(newTags);
  };

  const generatePDF = useCallback(() => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [CR80_HEIGHT_MM, CR80_WIDTH_MM]
    });

    debouncedTags.forEach((tag, tagIdx) => {
      for (let i = 0; i < 2; i++) {
        // Only add a new page if this is not the very first page
        if (tagIdx !== 0 || i !== 0) doc.addPage();
        // Background
        doc.setFillColor(tag.backgroundColor);
        doc.rect(0, 0, CR80_HEIGHT_MM, CR80_WIDTH_MM, 'F');
        doc.setTextColor(tag.textColor);
        doc.setDrawColor(tag.textColor);
        doc.setFont('helvetica', 'bold');

        // Fire Department Name (top, bold, wrapped)
        doc.setFontSize(18);
        doc.text(
          debouncedFireDepartment,
          CR80_HEIGHT_MM / 2,
          18,
          {
            align: 'center',
            maxWidth: CR80_HEIGHT_MM - 8 // 4mm padding on each side
          }
        );

        // Member Number (very large, bold, centered)
        doc.setFontSize(60);
        doc.text(tag.memberNumber, CR80_HEIGHT_MM/2, CR80_WIDTH_MM/2 + 10, { align: 'center' });

        // Role and Member Name (bottom, bold, underlined, two lines)
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(tag.role, CR80_HEIGHT_MM/2, CR80_WIDTH_MM - 22, { align: 'center' });
        doc.setLineWidth(0.8);
        const roleWidth = doc.getTextWidth(tag.role);
        doc.line(
          CR80_HEIGHT_MM/2 - roleWidth/2,
          CR80_WIDTH_MM - 20,
          CR80_HEIGHT_MM/2 + roleWidth/2,
          CR80_WIDTH_MM - 20
        );
        doc.text(tag.memberName, CR80_HEIGHT_MM/2, CR80_WIDTH_MM - 10, { align: 'center' });
        const nameWidth = doc.getTextWidth(tag.memberName);
        doc.line(
          CR80_HEIGHT_MM/2 - nameWidth/2,
          CR80_WIDTH_MM - 8,
          CR80_HEIGHT_MM/2 + nameWidth/2,
          CR80_WIDTH_MM - 8
        );
      }
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

  // Roster-specific functions
  const generateRosterPDF = useCallback(() => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [CR80_HEIGHT_MM, CR80_WIDTH_MM]
    });

    // Sort and group members
    const validTags = debouncedTags.filter(tag => 
      tag.memberNumber && tag.memberName && tag.role
    );
    
    const sortedMembers = [...validTags].sort((a, b) => {
      // First sort by role
      const roleCompare = a.role.localeCompare(b.role);
      if (roleCompare !== 0) return roleCompare;
      
      // Then sort by selected criteria
      if (sortBy === 'name') {
        return a.memberName.localeCompare(b.memberName);
      } else {
        return parseInt(a.memberNumber) - parseInt(b.memberNumber);
      }
    });

    // Group by role
    const roleGroups = {};
    sortedMembers.forEach(member => {
      if (!roleGroups[member.role]) {
        roleGroups[member.role] = [];
      }
      roleGroups[member.role].push(member);
    });

    // Distribute to columns
    const columns = { front: [[], []], back: [[], []] };
    let currentSide = 'front';
    let currentColumn = 0;
    let currentY = 10;
    const maxY = CR80_HEIGHT_MM - 10;
    const columnWidth = (CR80_WIDTH_MM - 15) / 2;
    const lineHeight = 4;

    Object.entries(roleGroups).forEach(([role, members]) => {
      const color = roleColorMap[role] || { textColor: '#000000', backgroundColor: '#ffffff' };
      const sectionHeight = members.length * lineHeight + 4;
      
      // Check if we need to switch column or side
      if (currentY + sectionHeight > maxY) {
        currentColumn++;
        currentY = 10;
        
        if (currentColumn > 1) {
          currentColumn = 0;
          currentSide = 'back';
        }
      }
      
      // Store section data
      columns[currentSide][currentColumn].push({
        role,
        members,
        color,
        y: currentY
      });
      
      currentY += sectionHeight + 2;
    });

    // Draw front side
    columns.front.forEach((column, colIdx) => {
      const x = colIdx === 0 ? 5 : CR80_WIDTH_MM / 2 + 2.5;
      
      column.forEach(section => {
        // Draw background
        doc.setFillColor(section.color.backgroundColor);
        doc.rect(x, section.y, columnWidth, section.members.length * lineHeight + 2, 'F');
        
        // Draw text
        doc.setTextColor(section.color.textColor);
        doc.setFontSize(9);
        
        section.members.forEach((member, idx) => {
          doc.text(
            `${member.memberName} ${member.memberNumber}`,
            x + 2,
            section.y + 3 + idx * lineHeight
          );
        });
      });
    });

    // Add back side if needed
    if (columns.back[0].length > 0 || columns.back[1].length > 0) {
      doc.addPage();
      
      columns.back.forEach((column, colIdx) => {
        const x = colIdx === 0 ? 5 : CR80_WIDTH_MM / 2 + 2.5;
        
        column.forEach(section => {
          // Draw background
          doc.setFillColor(section.color.backgroundColor);
          doc.rect(x, section.y, columnWidth, section.members.length * lineHeight + 2, 'F');
          
          // Draw text
          doc.setTextColor(section.color.textColor);
          doc.setFontSize(9);
          
          section.members.forEach((member, idx) => {
            doc.text(
              `${member.memberName} ${member.memberNumber}`,
              x + 2,
              section.y + 3 + idx * lineHeight
            );
          });
        });
      });
    }

    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    setRosterPdfUrl(url);
  }, [debouncedTags, debouncedFireDepartment, sortBy, roleColorMap]);

  const downloadRosterPDF = () => {
    if (!rosterPdfUrl) return;
    const date = new Date().toISOString().split('T')[0];
    const filename = `${fireDepartment.replace(/\s+/g, '_')}_Roster_${date}.pdf`;
    
    const link = document.createElement('a');
    link.href = rosterPdfUrl;
    link.download = filename;
    link.click();
  };

  const printRosterPDF = () => {
    if (!rosterPdfUrl) return;
    const printWindow = window.open(rosterPdfUrl);
    
    const checkPDFLoaded = setInterval(() => {
      try {
        if (printWindow.document.readyState === 'complete' && 
            printWindow.document.querySelector('embed')?.getAttribute('type') === 'application/pdf') {
          clearInterval(checkPDFLoaded);
          printWindow.print();
        }
      } catch (e) {
        clearInterval(checkPDFLoaded);
      }
    }, 100);

    setTimeout(() => clearInterval(checkPDFLoaded), 10000);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">Fire Department {mode === 'tags' ? 'Tag' : 'Roster'} Generator</h1>
        
        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setMode('tags')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg flex items-center gap-2 ${
                mode === 'tags'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <IdentificationIcon className="h-4 w-4" />
              Tag Generator
            </button>
            <button
              type="button"
              onClick={() => setMode('roster')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg flex items-center gap-2 ${
                mode === 'roster'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <RectangleStackIcon className="h-4 w-4" />
              Roster Cards
            </button>
          </div>
        </div>
        
        {mode === 'tags' ? (
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
                    type="number"
                    min="0"
                    inputmode="numeric"
                    pattern="[0-9]*"
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
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            {/* Mobile-first responsive header */}
            <div className="mb-4">
              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold mb-1">PDF Preview</h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {tags.length * 2} {tags.length * 2 === 1 ? 'page' : 'pages'} ({tags.length} {tags.length === 1 ? 'tag' : 'tags'}, 2 copies each)
                  </p>
                </div>
                
                {/* Buttons - stack vertically on mobile, horizontal on larger screens */}
                <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2 w-full sm:w-auto sm:flex-shrink-0">
                  <button
                    onClick={printPDF}
                    className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    disabled={!areAllTagsComplete()}
                    title={!areAllTagsComplete() ? "Please fill in all fields for all tags" : "Print PDF"}
                  >
                    <PrinterIcon className="h-4 w-4" />
                    <span>Print PDF</span>
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    disabled={!areAllTagsComplete()}
                    title={!areAllTagsComplete() ? "Please fill in all fields for all tags" : "Download PDF"}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>Download PDF</span>
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
              {/* Mobile-specific notice */}
              <div className="bg-yellow-50 border-t border-yellow-200 p-3 text-sm text-yellow-800 sm:hidden">
                📱 <strong>Mobile note:</strong> Preview may only show first page. Complete PDF includes all {tags.length * 2} {tags.length * 2 === 1 ? 'page' : 'pages'}.
              </div>
            </div>
          </div>
        </div>
        ) : (
          <RosterCard
            fireDepartment={fireDepartment}
            setFireDepartment={setFireDepartment}
            tags={tags}
            roleColorMap={roleColorMap}
            rosterSide={rosterSide}
            setRosterSide={setRosterSide}
            sortBy={sortBy}
            setSortBy={setSortBy}
            generateRosterPDF={generateRosterPDF}
            downloadRosterPDF={downloadRosterPDF}
            printRosterPDF={printRosterPDF}
            rosterPdfUrl={rosterPdfUrl}
          />
        )}
      </div>
    </div>
  );
}

export default App; 