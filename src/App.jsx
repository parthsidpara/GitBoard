import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { Loader2 } from 'lucide-react';

import Login from './components/Login';
import Sidebar from './components/Sidebar';
import GraphCanvas from './components/GraphCanvas';
import ImportCanvas from './components/ImportCanvas';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [shareId, setShareId] = useState(null);

  // checks if the URL is a share link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('share');
    if (id) {
      setShareId(id);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setCurrentProjectId(null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }
  
  // If a share ID is present, handle the import flow
  if (shareId) {
    if (!user) {
      return <Login message="Please sign in to import the shared canvas." />;
    }
    return <ImportCanvas shareId={shareId} user={user} />;
  }

  // Otherwise, the normal authentication flow
  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        user={user} 
        currentProjectId={currentProjectId}
        setCurrentProjectId={setCurrentProjectId}
      />
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-hidden">
        {currentProjectId ? (
          <GraphCanvas projectId={currentProjectId} key={currentProjectId} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-md border border-gray-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-700">Welcome, {user.displayName}!</h2>
              <p className="mt-2 text-gray-500">Create a new canvas from the sidebar to begin.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
