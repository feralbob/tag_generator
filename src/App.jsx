import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { PlusIcon, TrashIcon, ArrowDownTrayIcon, PrinterIcon, RectangleStackIcon, IdentificationIcon, UsersIcon } from '@heroicons/react/24/outline';
import RosterCard from './RosterCard';
import MemberEditor from './MemberEditor';
import TagGenerator from './TagGenerator';

const CR80_WIDTH_MM = 85.6;
const CR80_HEIGHT_MM = 53.98;

// Role to color mapping - moved outside component to prevent re-creation
const roleColorMap = {
  'Firefighter': { textColor: '#FFFFFF', backgroundColor: '#FF0000' }, // White on Red
  'Captain': { textColor: '#FFFFFF', backgroundColor: '#000000' },     // White on Black
  'Ground Support': { textColor: '#FFFFFF', backgroundColor: '#00FF00' }, // White on Green
  'Chief': { textColor: '#000000', backgroundColor: '#FFFFFF' },       // Black on White
  'Deputy Chief': { textColor: '#000000', backgroundColor: '#FFFFFF' },// Black on White
  'Lieutenant': { textColor: '#FFFFFF', backgroundColor: '#000000' },  // White on Black
  'Water Supply': { textColor: '#FFFFFF', backgroundColor: '#0000FF' },  // White on Blue
};

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

// Helper functions for localStorage
const loadFromStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('members'); // 'members', 'tags', or 'roster'
  
  // Load initial state from localStorage
  const [fireDepartment, setFireDepartment] = useState(() => 
    loadFromStorage('fireDepartment', '')
  );
  
  const [tags, setTags] = useState(() => 
    loadFromStorage('memberData', [{
      memberNumber: '',
      memberName: '',
      role: '',
      textColor: '#000000',
      backgroundColor: '#ffffff',
      selectedForPdf: true
    }])
  );

  const [pdfUrl, setPdfUrl] = useState('');
  
  // Roster-specific state
  const [sortBy, setSortBy] = useState(() => 
    loadFromStorage('rosterSortBy', 'name')
  ); // 'name' or 'number'
  const [rosterPdfUrl, setRosterPdfUrl] = useState('');

  // Debounce the tags and fireDepartment values
  const debouncedTags = useDebounce(tags, 500);
  const debouncedFireDepartment = useDebounce(fireDepartment, 500);

  // Save to localStorage when data changes
  useEffect(() => {
    saveToStorage('fireDepartment', fireDepartment);
  }, [fireDepartment]);

  useEffect(() => {
    saveToStorage('memberData', tags);
  }, [tags]);

  useEffect(() => {
    saveToStorage('rosterSortBy', sortBy);
  }, [sortBy]);

  const addTag = () => {
    setTags([...tags, {
      memberNumber: '',
      memberName: '',
      role: '',
      textColor: '#000000',
      backgroundColor: '#ffffff',
      selectedForPdf: true
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

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all member data? This cannot be undone.')) {
      setFireDepartment('');
      setTags([{
        memberNumber: '',
        memberName: '',
        role: '',
        textColor: '#000000',
        backgroundColor: '#ffffff',
        selectedForPdf: true
      }]);
      setSortBy('name');
      
      // Clear localStorage
      localStorage.removeItem('fireDepartment');
      localStorage.removeItem('memberData');
      localStorage.removeItem('rosterSortBy');
    }
  };

  const generatePDF = useCallback(() => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [CR80_HEIGHT_MM, CR80_WIDTH_MM]
    });

    // Only include selected members
    const selectedTags = debouncedTags.filter(tag => tag.selectedForPdf);
    
    selectedTags.forEach((tag, tagIdx) => {
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
    
    // Clean up previous URL to prevent memory leaks
    setPdfUrl(prevUrl => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
      return url;
    });
  }, [debouncedTags, debouncedFireDepartment]);

  useEffect(() => {
    generatePDF();
  }, [generatePDF]);

  const areAllTagsComplete = useCallback(() => {
    if (!fireDepartment) return false;
    
    const selectedTags = tags.filter(tag => tag.selectedForPdf);
    if (selectedTags.length === 0) return false;
    
    return selectedTags.every(tag => 
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
    // Don't generate if no valid members
    const validRosterTags = debouncedTags.filter(tag => 
      tag.memberNumber && tag.memberName && tag.role
    );
    
    if (validRosterTags.length === 0 || !debouncedFireDepartment) {
      setRosterPdfUrl('');
      return;
    }

    try {
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [CR80_HEIGHT_MM, CR80_WIDTH_MM]
    });

    // Sort and group members
    const sortedMembers = [...validRosterTags].sort((a, b) => {
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
    const maxY = CR80_WIDTH_MM - 10;  // Swapped since we're in portrait
    const columnWidth = (CR80_HEIGHT_MM - 15) / 2;  // Swapped since we're in portrait
    const lineHeight = 4;

    Object.entries(roleGroups).forEach(([role, members]) => {
      const color = roleColorMap[role] || { textColor: '#000000', backgroundColor: '#ffffff' };
      const sectionHeight = members.length * lineHeight + 6; // Extra space for role label + padding
      
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
      const x = colIdx === 0 ? 5 : CR80_HEIGHT_MM / 2 + 2.5;  // Adjusted for portrait
      
      column.forEach(section => {
        const sectionHeight = section.members.length * lineHeight + 4; // Extra space for role label
        
        // Draw background
        doc.setFillColor(section.color.backgroundColor);
        doc.rect(x, section.y, columnWidth, sectionHeight, 'F');
        
        // Draw text
        doc.setTextColor(section.color.textColor);
        
        // Draw role label
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(section.role, x + 2, section.y + 3);
        
        // Draw members
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        section.members.forEach((member, idx) => {
          doc.text(
            `${member.memberName} ${member.memberNumber}`,
            x + 2,
            section.y + 6 + idx * lineHeight // Offset by role label height
          );
        });
      });
    });

    // Add back side if needed
    if (columns.back[0].length > 0 || columns.back[1].length > 0) {
      doc.addPage();
      
      columns.back.forEach((column, colIdx) => {
        const x = colIdx === 0 ? 5 : CR80_HEIGHT_MM / 2 + 2.5;  // Adjusted for portrait
        
        column.forEach(section => {
          const sectionHeight = section.members.length * lineHeight + 4; // Extra space for role label
          
          // Draw background
          doc.setFillColor(section.color.backgroundColor);
          doc.rect(x, section.y, columnWidth, sectionHeight, 'F');
          
          // Draw text
          doc.setTextColor(section.color.textColor);
          
          // Draw role label
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(section.role, x + 2, section.y + 3);
          
          // Draw members
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          section.members.forEach((member, idx) => {
            doc.text(
              `${member.memberName} ${member.memberNumber}`,
              x + 2,
              section.y + 6 + idx * lineHeight // Offset by role label height
            );
          });
        });
      });
    }

    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    
    // Clean up previous URL to prevent memory leaks
    setRosterPdfUrl(prevUrl => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
      return url;
    });
    
    } catch (error) {
      console.error('Error generating roster PDF:', error);
      setRosterPdfUrl('');
    }
  }, [debouncedTags, debouncedFireDepartment, sortBy, roleColorMap]);

  useEffect(() => {
    generateRosterPDF();
  }, [generateRosterPDF]);

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

  const validMembersCount = tags.filter(tag => 
    tag.memberNumber && tag.memberName && tag.role
  ).length;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Fire Department Management System</h1>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg flex items-center gap-2 ${
                activeTab === 'members'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <UsersIcon className="h-4 w-4" />
              Members
              {validMembersCount > 0 && (
                <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded">
                  {validMembersCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tags')}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-t border-b ${
                activeTab === 'tags'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <IdentificationIcon className="h-4 w-4" />
              Tags
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('roster')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg flex items-center gap-2 ${
                activeTab === 'roster'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <RectangleStackIcon className="h-4 w-4" />
              Roster
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'members' && (
          <MemberEditor
            fireDepartment={fireDepartment}
            setFireDepartment={setFireDepartment}
            tags={tags}
            setTags={setTags}
            roleColorMap={roleColorMap}
            clearAllData={clearAllData}
          />
        )}

        {activeTab === 'tags' && (
          <TagGenerator
            fireDepartment={fireDepartment}
            tags={tags}
            setTags={setTags}
            pdfUrl={pdfUrl}
            downloadPDF={downloadPDF}
            printPDF={printPDF}
            areAllTagsComplete={areAllTagsComplete}
          />
        )}

        {activeTab === 'roster' && (
          <RosterCard
            fireDepartment={fireDepartment}
            tags={tags}
            roleColorMap={roleColorMap}
            sortBy={sortBy}
            setSortBy={setSortBy}
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