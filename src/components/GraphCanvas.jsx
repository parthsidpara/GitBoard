import { useState, useEffect, useRef, useCallback } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import IssueNode from './IssueNode';
import IssueModal from './IssueModal';
import ConfirmModal from './ConfirmModal';
import Tooltip from './Tooltip';
import { Plus, Edit, Trash2 } from 'lucide-react';

const defaultLabels = [
  { id: 'default-bug', name: 'Bug', color: '#ef4444' },
  { id: 'default-enhancement', name: 'Enhancement', color: '#22c55e' },
  { id: 'default-chore', name: 'Chore', color: '#6b7280' },
  { id: 'default-question', name: 'Question', color: '#a855f7' },
  { id: 'default-docs', name: 'Docs', color: '#3b82f6' },
];

export default function GraphCanvas({ projectId }) {
  const [issues, setIssues] = useState([]);
  // const [userLabels, setUserLabels] = useState([]);
  const [combinedLabels, setCombinedLabels] = useState(defaultLabels);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [issueToEdit, setIssueToEdit] = useState(null);
  const [issueToDelete, setIssueToDelete] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, data: null, position: { x: 0, y: 0 } });
  const [contextMenu, setContextMenu] = useState({ visible: false, issue: null, position: { x: 0, y: 0 } });
  const svgRef = useRef(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const labelsUnsub = onSnapshot(collection(db, 'users', user.uid, 'labels'), (snapshot) => {
      const fetchedUserLabels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // setUserLabels(fetchedUserLabels);
      setCombinedLabels([...defaultLabels, ...fetchedUserLabels]);
    });
    return () => labelsUnsub();
  }, [user]);

  useEffect(() => {
    if (!projectId) return;
    const issuesUnsub = onSnapshot(collection(db, 'projects', projectId, 'issues'), (snapshot) => {
      setIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => issuesUnsub();
  }, [projectId]);
  
  const getLabelColor = useCallback((labelsArray) => {
    if (!labelsArray || labelsArray.length === 0) return '#6b7280'; // default gray
    const firstLabelName = labelsArray[0];
    const label = combinedLabels.find(l => l.name === firstLabelName);
    return label ? label.color : '#6b7280';
  }, [combinedLabels]);

  const handleNodePositionChange = useCallback(async (issueId, newPosition) => {
    await updateDoc(doc(db, 'projects', projectId, 'issues', issueId), newPosition);
  }, [projectId]);

  const handleSaveIssue = async (issueData) => {
    if (issueToEdit) {
      await updateDoc(doc(db, 'projects', projectId, 'issues', issueToEdit.id), issueData);
    } else {
      await addDoc(collection(db, 'projects', projectId, 'issues'), { ...issueData, x: 0.5, y: 0.5 });
    }
  };

  const handleDeleteIssue = async () => {
    const idToDelete = issueToDelete?.id || contextMenu.issue?.id;
    if (idToDelete) await deleteDoc(doc(db, 'projects', projectId, 'issues', idToDelete));
  };

  const showTooltip = (issue, position) => setTooltip({ visible: true, data: issue, position });
  const hideTooltip = () => setTooltip(prev => ({ ...prev, visible: false }));
  const updateTooltipPosition = (position) => setTooltip(prev => ({ ...prev, position }));

  const showContextMenu = (issue, position) => setContextMenu({ visible: true, issue, position });
  useEffect(() => {
    const closeContextMenu = () => setContextMenu(prev => ({ ...prev, visible: false }));
    window.addEventListener('click', closeContextMenu);
    return () => window.removeEventListener('click', closeContextMenu);
  }, []);

  const QuadrantLabel = ({ x, y, children }) => (
    <text x={x} y={y} className="fill-gray-300 text-lg font-semibold pointer-events-none select-none" textAnchor="middle">{children}</text>
  );

  return (
    <>
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Eisenhower Matrix</h2><button onClick={() => { setIssueToEdit(null); setModalOpen(true); }} className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"><Plus size={18} /> Add Issue</button></div>
        <div className="flex-1 relative p-4">
          <svg ref={svgRef} className="w-full h-full graph-bg rounded-md">
            <line x1="50%" y1="0" x2="50%" y2="100%" className="stroke-gray-300" strokeWidth="1" />
            <line x1="0" y1="50%" x2="100%" y2="50%" className="stroke-gray-300" strokeWidth="1" />
            
            <QuadrantLabel x="25%" y="25%">Important & Urgent</QuadrantLabel>
            <QuadrantLabel x="75%" y="25%">Important & Not Urgent</QuadrantLabel>
            <QuadrantLabel x="25%" y="75%">Not Important & Urgent</QuadrantLabel>
            <QuadrantLabel x="75%" y="75%">Not Important & Not Urgent</QuadrantLabel>
            
            {issues.map(issue => <IssueNode key={issue.id} issue={issue} svgRef={svgRef} onPositionChange={handleNodePositionChange} onShowTooltip={showTooltip} onHideTooltip={hideTooltip} onUpdateTooltip={updateTooltipPosition} onShowContextMenu={showContextMenu} color={getLabelColor(issue.labels)} />)}
          </svg>
        </div>
      </div>
      
      <Tooltip tooltip={tooltip} allLabels={combinedLabels} />

      {contextMenu.visible && (
        <div style={{ top: contextMenu.position.y, left: contextMenu.position.x }} className="absolute bg-white rounded-md shadow-lg border text-sm py-1 z-50">
          <div onClick={() => { setIssueToEdit(contextMenu.issue); setModalOpen(true); }} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 cursor-pointer"><Edit size={14}/> Edit</div>
          <div onClick={() => { setIssueToDelete(contextMenu.issue); setDeleteModalOpen(true); }} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-red-600"><Trash2 size={14}/> Delete</div>
        </div>
      )}

      {isModalOpen && <IssueModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveIssue} issue={issueToEdit} labels={combinedLabels} />}
      {isDeleteModalOpen && <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDeleteIssue} title="Delete Issue" message={`Are you sure you want to delete issue "${issueToDelete?.number || contextMenu.issue?.number}"?`} />}
    </>
  );
}
