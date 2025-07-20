import { useState, useEffect } from 'react';

export default function IssueModal({ isOpen, onClose, onSave, issue, labels }) {
  const [formData, setFormData] = useState({ number: '', title: '', url: '', labels: [] });

  useEffect(() => {
    // when the modal opens, whether for a new or existing issue
    if (isOpen) {
      const defaultLabel = labels.length > 0 ? labels[0].name : '';
      if (issue) {
        setFormData({ 
          number: issue.number || '', 
          title: issue.title || '', 
          url: issue.url || '', 
          // Ensure `issue.labels` is treated as an array
          labels: Array.isArray(issue.labels) ? issue.labels : []
        });
      } else {
        // If adding, start with an empty array of labels
        setFormData({ number: '', title: '', url: '', labels: [] });
      }
    }
  }, [issue, isOpen, labels]);

  if (!isOpen) return null;

  const handleTextChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleLabelChange = (labelName) => {
    setFormData(prev => {
      const newLabels = prev.labels.includes(labelName)
        ? prev.labels.filter(l => l !== labelName) // uncheck: remove from array
        : [...prev.labels, labelName]; // check: add to array
      return { ...prev, labels: newLabels };
    });
  };
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); onClose(); };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md m-4">
        <h2 className="text-2xl font-bold mb-6">{issue ? 'Edit Issue' : 'Add New Issue'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Issue Number</label><input type="text" name="number" value={formData.number} onChange={handleTextChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="#123" required /></div>
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" name="title" value={formData.title} onChange={handleTextChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., Fix login button" required /></div>
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">URL (Optional)</label><input type="url" name="url" value={formData.url} onChange={handleTextChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="https://github.com/..." /></div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Labels</label>
            <div className="grid grid-cols-2 gap-2 p-2 border border-gray-300 rounded-md max-h-32 overflow-y-auto">
              {labels.map(label => (
                <label key={label.id} className="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.labels.includes(label.name)}
                    onChange={() => handleLabelChange(label.name)}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{label.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-8"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700">Save Issue</button></div>
        </form>
      </div>
    </div>
  );
}
