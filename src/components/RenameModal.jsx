import { useState } from 'react';

export default function RenameModal({ isOpen, onClose, onRename, currentName }) {
  const [newName, setNewName] = useState(currentName || '');
  if (!isOpen) return null;
  const handleSubmit = (e) => { e.preventDefault(); onRename(newName); onClose(); };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-sm m-4">
        <h2 className="text-xl font-bold mb-4">Rename Canvas</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required autoFocus />
          <div className="flex justify-end space-x-4 mt-6"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700">Rename</button></div>
        </form>
      </div>
    </div>
  );
}
