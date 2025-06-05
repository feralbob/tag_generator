import React from 'react';
import PDFPreview from './PDFPreview';

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
      <PDFPreview
        title="Roster Preview"
        subtitle={`CR80 Double-sided Card (${validMembersCount} members)`}
        pdfUrl={rosterPdfUrl}
        onPrint={printRosterPDF}
        onDownload={downloadRosterPDF}
        printDisabled={!rosterPdfUrl}
        downloadDisabled={!rosterPdfUrl}
        printTooltip={!rosterPdfUrl ? "Add members to generate roster" : "Print Roster"}
        downloadTooltip={!rosterPdfUrl ? "Add members to generate roster" : "Download Roster"}
        mobileNote="📱 Mobile note: Preview may only show first page. Complete PDF includes front and back sides."
        emptyStateTitle="No Roster Preview"
        emptyStateMessage="Add members in the Members tab to generate a roster"
      />
    </div>
  );
};

export default RosterCard;