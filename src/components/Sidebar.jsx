import { useState, useEffect } from 'react';
import { db, logout } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { Plus, MoreHorizontal, Edit, Trash2, LogOut, Loader2, Tags } from 'lucide-react';
import RenameModal from './RenameModal';
import ConfirmModal from './ConfirmModal';
import LabelManagerModal from './LabelManagerModal';

export default function Sidebar({ user, currentProjectId, setCurrentProjectId }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRenameModalOpen, setRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isLabelModalOpen, setLabelModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, "projects"), where("ownerId", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      if (querySnapshot.empty && user) {
        await addDoc(collection(db, "projects"), {
          name: "Untitled Canvas",
          ownerId: user.uid,
          createdAt: serverTimestamp(),
        });
        return;
      }

      const projectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      projectsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setProjects(projectsData);

      const hasCurrentProject = projectsData.some(p => p.id === currentProjectId);
      if (!hasCurrentProject && projectsData.length > 0) {
        setCurrentProjectId(projectsData[0].id);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, currentProjectId, setCurrentProjectId]);


  const handleNewProject = async () => {
    const newProjectRef = await addDoc(collection(db, "projects"), { name: "New Canvas", ownerId: user.uid, createdAt: serverTimestamp() });
    setCurrentProjectId(newProjectRef.id);
  };

  const handleRename = async (newName) => {
    if (projectToEdit && newName.trim() !== "") await updateDoc(doc(db, "projects", projectToEdit.id), { name: newName });
  };

  const handleDelete = async () => {
    if (projectToEdit) {
      await deleteDoc(doc(db, "projects", projectToEdit.id));
      if (currentProjectId === projectToEdit.id) {
        const remainingProjects = projects.filter(p => p.id !== projectToEdit.id);
        setCurrentProjectId(remainingProjects.length > 0 ? remainingProjects[0].id : null);
      }
    }
  };

  return (
    <>
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">My Projects</h1>
           <button onClick={handleNewProject} title="New Canvas" className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-800 transition-colors">
            <Plus size={20} />
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-gray-500" /></div>
          ) : (
            projects.map(project => (
              <ProjectItem key={project.id} project={project} isActive={project.id === currentProjectId} onSelect={() => setCurrentProjectId(project.id)} onRename={() => { setProjectToEdit(project); setRenameModalOpen(true); }} onDelete={() => { setProjectToEdit(project); setDeleteModalOpen(true); }} />
            ))
          )}
        </nav>

        {/* profile and logout section */}
        <div className="p-4 border-t border-gray-200 space-y-4">
          <button onClick={() => setLabelModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
            <Tags size={16} /> Manage Labels
          </button>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2">
              <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full" />
              <span className="text-sm font-medium text-gray-700 truncate">{user.displayName}</span>
            </div>
            <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>
      
      {isRenameModalOpen && <RenameModal isOpen={isRenameModalOpen} onClose={() => setRenameModalOpen(false)} onRename={handleRename} currentName={projectToEdit?.name} />}
      {isDeleteModalOpen && <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDelete} title="Delete Canvas" message={`Are you sure you want to delete "${projectToEdit?.name}"? This action cannot be undone.`} />}
      {isLabelModalOpen && <LabelManagerModal isOpen={isLabelModalOpen} onClose={() => setLabelModalOpen(false)} user={user} />}
    </>
  );
}

function ProjectItem({ project, isActive, onSelect, onRename, onDelete }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  return (
    <div className={`relative flex items-center justify-between p-2 rounded-md cursor-pointer ${isActive ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`} onClick={onSelect}>
      <span className="truncate flex-1 mr-2">{project.name}</span>
      <button onClick={(e) => { e.stopPropagation(); setDropdownOpen(prev => !prev); }} className="p-1 rounded-full hover:bg-gray-300"><MoreHorizontal size={16} /></button>
      {dropdownOpen && (
        <div className="absolute right-0 top-8 mt-1 w-32 bg-white rounded-md shadow-lg border z-10">
          <a href="#" onClick={(e) => { e.stopPropagation(); onRename(); setDropdownOpen(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><Edit size={14}/> Rename</a>
          <a href="#" onClick={(e) => { e.stopPropagation(); onDelete(); setDropdownOpen(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 size={14}/> Delete</a>
        </div>
      )}
    </div>
  );
}
