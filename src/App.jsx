import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { Loader2 } from 'lucide-react';

import Login from './components/Login';
import Sidebar from './components/Sidebar';
import GraphCanvas from './components/GraphCanvas';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // Reset state on logout
        setCurrentProjectId(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

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
