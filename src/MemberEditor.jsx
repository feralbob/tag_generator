import React, { useRef, useEffect } from 'react';
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const MemberEditor = ({ 
  fireDepartment, 
  setFireDepartment, 
  tags, 
  setTags, 
  roleColorMap,
  clearAllData
}) => {
  const tableRef = useRef(null);

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
    if (tags.length > 1) {
      setTags(tags.filter((_, i) => i !== index));
    }
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

  const handleKeyDown = (e, index, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Move to next row same column, or add new row if at end
      if (index === tags.length - 1) {
        addTag();
        // Focus will be set by useEffect below
      } else {
        // Focus next row, same field
        const nextInput = tableRef.current?.querySelector(`[data-row="${index + 1}"][data-field="${field}"]`);
        nextInput?.focus();
      }
    } else if (e.key === 'Tab' && !e.shiftKey) {
      // Tab moves to next field in same row, or next row if at end of row
      e.preventDefault();
      const fieldOrder = ['memberNumber', 'memberName', 'role'];
      const currentFieldIndex = fieldOrder.indexOf(field);
      
      if (currentFieldIndex < fieldOrder.length - 1) {
        // Move to next field in same row
        const nextField = fieldOrder[currentFieldIndex + 1];
        const nextInput = tableRef.current?.querySelector(`[data-row="${index}"][data-field="${nextField}"]`);
        nextInput?.focus();
      } else {
        // Move to first field of next row, or add new row
        if (index === tags.length - 1) {
          addTag();
        } else {
          const nextInput = tableRef.current?.querySelector(`[data-row="${index + 1}"][data-field="memberNumber"]`);
          nextInput?.focus();
        }
      }
    }
  };

  // Focus the new row when added
  useEffect(() => {
    if (tags.length > 0) {
      const lastRowIndex = tags.length - 1;
      const lastInput = tableRef.current?.querySelector(`[data-row="${lastRowIndex}"][data-field="memberNumber"]`);
      if (lastInput && tags[lastRowIndex].memberNumber === '' && tags[lastRowIndex].memberName === '') {
        setTimeout(() => lastInput.focus(), 0);
      }
    }
  }, [tags.length]);

  const validMembersCount = tags.filter(tag => 
    tag.memberNumber && tag.memberName && tag.role
  ).length;

  const roleOptions = [
    'Probationary',
    'Firefighter', 
    'Water Supply',
    'Ground Support',
    'Lieutenant',
    'Captain',
    'Deputy Chief',
    'Chief'
  ];

  return (
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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Members</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {validMembersCount} valid member{validMembersCount !== 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={clearAllData}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2 text-sm"
                  title="Clear all member data"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Clear All
                </button>
                <button
                  onClick={addTag}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 text-sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Row
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto" ref={tableRef}>
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-20">#</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-32">Number</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-48">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-40">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-24">Colors</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Number"
                      value={tag.memberNumber}
                      onChange={(e) => updateTag(index, 'memberNumber', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'memberNumber')}
                      data-row={index}
                      data-field="memberNumber"
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      placeholder="Member Name"
                      value={tag.memberName}
                      onChange={(e) => updateTag(index, 'memberName', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'memberName')}
                      data-row={index}
                      data-field="memberName"
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={tag.role}
                      onChange={(e) => updateTag(index, 'role', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'role')}
                      data-row={index}
                      data-field="role"
                      className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Role</option>
                      {roleOptions.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      <input
                        type="color"
                        value={tag.textColor}
                        onChange={(e) => updateTag(index, 'textColor', e.target.value)}
                        className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                        title="Text Color"
                      />
                      <input
                        type="color"
                        value={tag.backgroundColor}
                        onChange={(e) => updateTag(index, 'backgroundColor', e.target.value)}
                        className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                        title="Background Color"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => removeTag(index)}
                      disabled={tags.length === 1}
                      className="text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                      title="Delete Row"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-gray-50 border-t text-sm text-gray-600">
          <p><strong>Keyboard shortcuts:</strong></p>
          <ul className="mt-1 space-y-1">
            <li>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> - Move to next row</li>
            <li>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Tab</kbd> - Move to next field</li>
            <li>• Auto-saves as you type</li>
            <li>• Data persists across browser sessions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MemberEditor;