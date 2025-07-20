import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, addDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Loader2, Frown, Download } from 'lucide-react';

export default function ImportCanvas({ shareId, user }) {
  const [sharedCanvas, setSharedCanvas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        const canvasDocRef = doc(db, 'sharedCanvases', shareId);
        const canvasDoc = await getDoc(canvasDocRef);

        if (!canvasDoc.exists()) {
          setError("This shared canvas could not be found or has been deleted.");
        } else {
          setSharedCanvas({ id: canvasDoc.id, ...canvasDoc.data() });
        }
      } catch (e) {
        setError("An error occurred while trying to load the canvas.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSharedData();
  }, [shareId]);

  const handleImport = async () => {
    if (!sharedCanvas || !user) return;
    setIsImporting(true);

    try {
      // 1. Fetch all issues from the shared canvas subcollection
      const issuesSnapshot = await getDocs(collection(db, 'sharedCanvases', sharedCanvas.id, 'issues'));
      const issuesData = issuesSnapshot.docs.map(doc => doc.data());

      // Sync labels before creating the project
      const labelsToImport = sharedCanvas.labelsSnapshot || [];
      if (labelsToImport.length > 0) {
        // Get the current user's existing labels
        const userLabelsRef = collection(db, 'users', user.uid, 'labels');
        const userLabelsSnapshot = await getDocs(userLabelsRef);
        const existingLabelNames = userLabelsSnapshot.docs.map(doc => doc.data().name);

        // Filter out labels that the user already has
        const newLabels = labelsToImport.filter(label => !existingLabelNames.includes(label.name));
        
        // Batch write the new labels to the user's collection
        if (newLabels.length > 0) {
          const labelBatch = writeBatch(db);
          newLabels.forEach(label => {
            const newUserLabelRef = doc(collection(db, 'users', user.uid, 'labels'));
            labelBatch.set(newUserLabelRef, { name: label.name, color: label.color });
          });
          await labelBatch.commit();
        }
      }

      // 2. Create a new project for the current user
      const newProjectRef = await addDoc(collection(db, 'projects'), {
        name: `Copy of ${sharedCanvas.name}`,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      // 3. Batch write all issues to the new project's subcollection
      const batch = writeBatch(db);
      issuesData.forEach(issue => {
        const newIssueRef = doc(collection(db, 'projects', newProjectRef.id, 'issues'));
        batch.set(newIssueRef, issue);
      });
      await batch.commit();

      // 4. Redirect to the main app page, which will then select the new project
      alert('Canvas imported successfully!');
      window.location.href = window.location.origin;

    } catch (e) {
      setError("Failed to import the canvas. Please try again.");
      console.error(e);
      setIsImporting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>;
  }

  if (error) {
    return <div className="flex flex-col items-center justify-center h-screen"><Frown className="w-16 h-16 text-gray-400 mb-4" /><h2 className="text-2xl font-bold">{error}</h2></div>;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg text-center">
        <h1 className="text-2xl font-bold text-gray-900">Import Shared Canvas</h1>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-lg font-semibold">{sharedCanvas.name}</p>
          <p className="text-sm text-gray-500">You've been invited to clone this canvas.</p>
        </div>
        <button
          onClick={handleImport}
          disabled={isImporting}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-200 disabled:bg-gray-400"
        >
          {isImporting ? <Loader2 className="animate-spin" /> : <Download />}
          <span>{isImporting ? 'Importing...' : 'Import to My Account'}</span>
        </button>
         <button
          onClick={() => window.location.href = window.location.origin}
          className="text-sm text-gray-600 hover:underline"
        >
          Cancel and go to my dashboard
        </button>
      </div>
    </div>
  );
}
