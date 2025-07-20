import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, link }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Share Canvas</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20} /></button>
        </div>
        <p className="text-gray-600 mb-4">Anyone with this link will be able to view and edit this canvas but it won't affect your original canvas.</p>
        <div className="flex items-center gap-2">
          <input type="text" value={link} readOnly className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
          <button onClick={handleCopy} className={`px-4 py-2 font-bold rounded-md flex items-center gap-2 ${copied ? 'bg-green-600' : 'bg-blue-600'} text-white`}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
