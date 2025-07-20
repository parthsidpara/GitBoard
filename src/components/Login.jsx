import { signInWithGoogle } from '../firebase';
import { ShieldCheck } from 'lucide-react';

// Added an optional message prop to guide users during the import flow
export default function Login({ message }) {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-2xl shadow-lg text-center">
        <div className="flex flex-col items-center">
          <ShieldCheck className="w-16 h-16 text-blue-600" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Git Board</h1>
          <p className="mt-2 text-gray-600">{message || "Prioritize github issues of your projects with the Eisenhower Matrix."}</p>
        </div>
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200"
        >
          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
            <path fillRule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.342A8.8 8.8 0 0 1 8.842 18.083Z" clipRule="evenodd"/>
          </svg>
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
}
