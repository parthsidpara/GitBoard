import { useState, useEffect } from 'react';

export default function IssueModal({ isOpen, onClose, onSave, issue, labels }) {
  const [formData, setFormData] = useState({ number: '', title: '', url: '', label: '' });

  useEffect(() => {
    // when the modal opens, whether for a new or existing issue
    if (isOpen) {
      const defaultLabel = labels.length > 0 ? labels[0].name : '';
      if (issue) {
        // If editing, use the issue's label or fall back to the default if it's invalid
        const currentLabelExists = labels.some(l => l.name === issue.label);
        setFormData({ 
          number: issue.number || '', 
          title: issue.title || '', 
          url: issue.url || '', 
          label: currentLabelExists ? issue.label : defaultLabel
        });
      } else {
        // If adding, start with the default label
        setFormData({ number: '', title: '', url: '', label: defaultLabel });
      }
    }
  }, [issue, isOpen, labels]);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); onClose(); };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md m-4">
        <h2 className="text-2xl font-bold mb-6">{issue ? 'Edit Issue' : 'Add New Issue'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Issue Number</label><input type="text" name="number" value={formData.number} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="#123" required /></div>
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., Fix login button" required /></div>
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">URL (Optional)</label><input type="url" name="url" value={formData.url} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="https://github.com/..." /></div>
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
            <select name="label" value={formData.label} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white" disabled={labels.length === 0}>
              {labels.length === 0 ? (
                <option>No labels available</option>
              ) : (
                labels.map(label => <option key={label.id} value={label.name}>{label.name}</option>)
              )}
            </select>
          </div>
          <div className="flex justify-end space-x-4 mt-8"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700">Save Issue</button></div>
        </form>
      </div>
    </div>
  );
}
