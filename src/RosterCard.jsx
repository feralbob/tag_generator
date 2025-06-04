import React from 'react';
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';

const CR80_WIDTH_MM = 85.6;
const CR80_HEIGHT_MM = 53.98;

const RosterCard = ({ 
  fireDepartment,
  tags, 
  roleColorMap, 
  sortBy, 
  setSortBy,
  downloadRosterPDF,
  printRosterPDF,
  rosterPdfUrl
}) => {
  // Group members by role for summary
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

  const validMembersCount = tags.filter(tag => 
    tag.memberNumber && tag.memberName && tag.role
  ).length;

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

      {/* Right side - PDF Preview */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold mb-1">Roster Preview</h2>
              <p className="text-xs sm:text-sm text-gray-600">
                CR80 Double-sided Card ({validMembersCount} members)
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2 w-full sm:w-auto sm:flex-shrink-0">
              <button
                onClick={printRosterPDF}
                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                disabled={!rosterPdfUrl}
                title={!rosterPdfUrl ? "Add members to generate roster" : "Print Roster"}
              >
                <PrinterIcon className="h-4 w-4" />
                <span>Print Roster</span>
              </button>
              <button
                onClick={downloadRosterPDF}
                className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                disabled={!rosterPdfUrl}
                title={!rosterPdfUrl ? "Add members to generate roster" : "Download Roster"}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Download Roster</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <iframe
            src={rosterPdfUrl}
            className="w-full h-[300px] sm:h-[400px] lg:h-[600px] border-0"
            title="Roster PDF Preview"
          />
          <div className="bg-yellow-50 border-t border-yellow-200 p-3 text-sm text-yellow-800 sm:hidden">
            📱 <strong>Mobile note:</strong> Preview may only show first page. Complete PDF includes front and back sides.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RosterCard;