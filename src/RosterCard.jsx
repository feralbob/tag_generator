import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const CR80_WIDTH_MM = 85.6;
const CR80_HEIGHT_MM = 53.98;

const RosterCard = ({ 
  fireDepartment,
  tags, 
  roleColorMap, 
  rosterSide, 
  setRosterSide, 
  sortBy, 
  setSortBy,
  generateRosterPDF,
  downloadRosterPDF,
  printRosterPDF,
  rosterPdfUrl
}) => {
  // Sort members by role and then by name or number
  const sortMembers = (members, sortBy) => {
    return [...members].sort((a, b) => {
      // First sort by role
      const roleCompare = a.role.localeCompare(b.role);
      if (roleCompare !== 0) return roleCompare;
      
      // Then sort by selected criteria within same role
      if (sortBy === 'name') {
        return a.memberName.localeCompare(b.memberName);
      } else {
        return parseInt(a.memberNumber) - parseInt(b.memberNumber);
      }
    });
  };

  // Group members by role
  const groupMembersByRole = (members) => {
    const groups = {};
    members.forEach(member => {
      if (!groups[member.role]) {
        groups[member.role] = [];
      }
      groups[member.role].push(member);
    });
    return groups;
  };

  // Distribute members into columns
  const distributeMembers = (tags) => {
    const validTags = tags.filter(tag => 
      tag.memberNumber && tag.memberName && tag.role
    );
    
    const sortedMembers = sortMembers(validTags, sortBy);
    const roleGroups = groupMembersByRole(sortedMembers);
    
    const columns = {
      front: [[], []],
      back: [[], []]
    };
    
    let currentSide = 'front';
    let currentColumn = 0;
    let currentCount = 0;
    const maxPerColumn = 12;
    
    // Process each role group
    Object.entries(roleGroups).forEach(([role, members]) => {
      members.forEach(member => {
        // Check if we need to switch column or side
        if (currentCount >= maxPerColumn) {
          currentColumn++;
          currentCount = 0;
          
          if (currentColumn > 1) {
            currentColumn = 0;
            currentSide = currentSide === 'front' ? 'back' : 'front';
          }
        }
        
        // Add member to current position
        const lastSection = columns[currentSide][currentColumn].slice(-1)[0];
        if (lastSection && lastSection.role === role) {
          lastSection.members.push(member);
        } else {
          columns[currentSide][currentColumn].push({
            role,
            members: [member],
            color: roleColorMap[role] || { textColor: '#000000', backgroundColor: '#ffffff' }
          });
        }
        
        currentCount++;
      });
    });
    
    return columns;
  };

  const columnData = distributeMembers(tags);
  const validMembersCount = tags.filter(tag => 
    tag.memberNumber && tag.memberName && tag.role
  ).length;

  const renderColumn = (sections) => {
    if (sections.length === 0) return null;
    
    return (
      <div className="h-full flex flex-col">
        {sections.map((section, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 px-2 py-2 transition-colors"
            style={{
              backgroundColor: section.color.backgroundColor,
              color: section.color.textColor,
              borderBottom: idx < sections.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none'
            }}
          >
            {/* Optional: Add role label */}
            <div className="text-[10px] font-semibold opacity-75 mb-1">{section.role}</div>
            {section.members.map((member, memberIdx) => (
              <div key={memberIdx} className="text-xs leading-relaxed">
                {member.memberName} {member.memberNumber}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left side - Roster Configuration */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Roster Configuration</h2>
          <div className="mb-4">
            <div className="text-sm text-gray-600">Fire Department:</div>
            <div className="font-medium">{fireDepartment || 'Not set'}</div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sort Members By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border rounded bg-white"
              >
                <option value="name">Name (A-Z)</option>
                <option value="number">Number</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Total Members: {validMembersCount}</p>
              <p>Cards Required: 1 (double-sided)</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Member Summary</h2>
          <div className="space-y-2 text-sm">
            {Object.entries(groupMembersByRole(tags.filter(tag => 
              tag.memberNumber && tag.memberName && tag.role
            ))).map(([role, members]) => (
              <div key={role} className="flex justify-between">
                <span>{role}:</span>
                <span className="font-medium">{members.length} members</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Roster Preview */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold mb-1">Roster Preview</h2>
              <p className="text-xs sm:text-sm text-gray-600">
                CR80 Card - {rosterSide === 'front' ? 'Front' : 'Back'} Side
              </p>
            </div>
            
            {/* Side Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setRosterSide('front')}
                className={`px-3 py-1 rounded text-sm ${
                  rosterSide === 'front' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Front
              </button>
              <button
                onClick={() => setRosterSide('back')}
                className={`px-3 py-1 rounded text-sm ${
                  rosterSide === 'back' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Back
              </button>
            </div>
          </div>
        </div>
        
        {/* Card Preview */}
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white" 
             style={{ aspectRatio: `${CR80_WIDTH_MM}/${CR80_HEIGHT_MM}` }}>
          <div className="p-4 h-full">
            <div className="grid grid-cols-2 gap-4 h-full">
              {columnData[rosterSide].map((column, idx) => (
                <div key={idx} className="border border-gray-200 rounded overflow-hidden">
                  {renderColumn(column)}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-4 flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2">
          <button
            onClick={generateRosterPDF}
            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2 text-sm font-medium"
          >
            Generate PDF
          </button>
          <button
            onClick={downloadRosterPDF}
            className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 flex items-center justify-center gap-2 text-sm font-medium"
            disabled={!rosterPdfUrl}
          >
            Download PDF
          </button>
          <button
            onClick={printRosterPDF}
            className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 flex items-center justify-center gap-2 text-sm font-medium"
            disabled={!rosterPdfUrl}
          >
            Print PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default RosterCard;