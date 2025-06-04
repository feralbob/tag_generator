import React from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const MemberEditor = ({ 
  fireDepartment, 
  setFireDepartment, 
  tags, 
  setTags, 
  roleColorMap 
}) => {
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

  const validMembersCount = tags.filter(tag => 
    tag.memberNumber && tag.memberName && tag.role
  ).length;

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

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Members</h3>
          <span className="text-sm text-gray-600">
            {validMembersCount} valid member{validMembersCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {tags.map((tag, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Member {index + 1}</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Member Number</label>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Member Number"
                  value={tag.memberNumber}
                  onChange={(e) => updateTag(index, 'memberNumber', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Member Name</label>
                <input
                  type="text"
                  placeholder="Member Name"
                  value={tag.memberName}
                  onChange={(e) => updateTag(index, 'memberName', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
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
            </div>
            
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
        Add Another Member
      </button>
    </div>
  );
};

export default MemberEditor;