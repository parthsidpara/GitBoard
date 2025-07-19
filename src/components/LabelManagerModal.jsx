import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { X, Trash2 } from 'lucide-react';

// Default labels that can't be deleted (as of now)
const defaultLabels = [
  { id: 'default-bug', name: 'Bug', color: '#ef4444' },
  { id: 'default-enhancement', name: 'Enhancement', color: '#22c55e' },
  { id: 'default-chore', name: 'Chore', color: '#6b7280' },
  { id: 'default-question', name: 'Question', color: '#a855f7' },
  { id: 'default-docs', name: 'Docs', color: '#3b82f6' },
];

export default function LabelManagerModal({ isOpen, onClose, user }) {
  const [userLabels, setUserLabels] = useState([]);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#4299e1');

  useEffect(() => {
    if (!isOpen || !user?.uid) {
      return; 
    }
    const labelsRef = collection(db, 'users', user.uid, 'labels');
    const unsubscribe = onSnapshot(labelsRef, (snapshot) => {
      setUserLabels(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching labels:", error);
    });
    return () => unsubscribe();
  }, [isOpen, user]);

  const handleAddLabel = async (e) => {
    e.preventDefault();
    if (newLabelName.trim() === '' || !user?.uid) return;
    
    try {
      await addDoc(collection(db, 'users', user.uid, 'labels'), {
        name: newLabelName,
        color: newLabelColor,
      });
      setNewLabelName('');
      setNewLabelColor('#4299e1');
    } catch (error) {
      console.error("Failed to add label:", error);
      alert("Could not add label. Please try again.");
    }
  };

  const handleDeleteLabel = async (labelId) => {
    if (!user?.uid) return;
    await deleteDoc(doc(db, 'users', user.uid, 'labels', labelId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Manage Labels</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20} /></button>
        </div>
        
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Labels</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {/* default labels */}
            {defaultLabels.map(label => (
              <div key={label.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: label.color }}></div>
                  <span className="text-gray-500">{label.name} (default)</span>
                </div>
              </div>
            ))}
            {/* user-created labels */}
            {userLabels.map(label => (
              <div key={label.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: label.color }}></div>
                  <span>{label.name}</span>
                </div>
                <button onClick={() => handleDeleteLabel(label.id)} className="p-1 text-gray-500 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleAddLabel}>
          <h3 className="font-semibold mb-2">Add New Label</h3>
          <div className="flex items-center gap-2">
            <input type="color" value={newLabelColor} onChange={(e) => setNewLabelColor(e.target.value)} className="h-10 p-1 border-none rounded-md cursor-pointer" />
            <input type="text" value={newLabelName} onChange={(e) => setNewLabelName(e.target.value)} placeholder="Label name" className="flex-1 px-3 py-2 border border-gray-300 rounded-md" required />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
}
