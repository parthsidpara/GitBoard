import { useState } from 'react';
import { Github, Search, Plus, X, ExternalLink, Check, Square, CheckSquare } from 'lucide-react';

export default function ImportIssuesModal({ isOpen, onClose, onImport }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedIssues, setSelectedIssues] = useState(new Set());

  const parseRepoUrl = (url) => {
    try {
      const { pathname } = new URL(url);
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length >= 2) return { owner: parts[0], repo: parts[1] };
      return {};
    } catch { return {}; }
  };

  const fetchIssues = async () => {
    const { owner, repo } = parseRepoUrl(repoUrl);
    if (!owner || !repo) return setError('Invalid repository URL. Please use the format https://github.com/owner/repo');
    
    setLoading(true);
    setError('');
    setIssues([]);
    setSelectedIssues(new Set());
    
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`);
      if (res.status === 404) throw new Error('Repository not found. Check the URL and ensure it is public.');
      if (!res.ok) throw new Error(`Failed to fetch issues (status: ${res.status}). Please try again.`);
      const data = await res.json();
      const filtered = data.filter(issue => !issue.pull_request); // Exclude Pull Requests
      setIssues(filtered);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleIssue = (issueId) => {
    const newSelected = new Set(selectedIssues);
    if (newSelected.has(issueId)) newSelected.delete(issueId);
    else newSelected.add(issueId);
    setSelectedIssues(newSelected);
  };

  const toggleAll = () => {
    if (selectedIssues.size === issues.length) setSelectedIssues(new Set());
    else setSelectedIssues(new Set(issues.map(issue => issue.id)));
  };

  const handleImport = (issuesToImport) => {
    if (issuesToImport.length === 0) return;
    
    const formattedIssues = issuesToImport.map(issue => ({
      number: `#${issue.number}`,
      title: issue.title,
      url: issue.html_url,
      labels: issue.labels.map(l => l.name),
    }));

    onImport(formattedIssues);
    onClose(); // Close the modal after importing
  };

  if (!isOpen) return null;

  const allSelected = issues.length > 0 && selectedIssues.size === issues.length;
  const someSelected = selectedIssues.size > 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-xl"><Github className="w-6 h-6 text-blue-600" /></div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Import GitHub Issues</h2>
              <p className="text-gray-600 text-sm">Fetch and add issues from any public repository</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-8 overflow-hidden">
          {/* Input Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">Repository URL</label>
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <Github className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-lg" placeholder="https://github.com/username/repository" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && fetchIssues()} />
              </div>
              <button onClick={fetchIssues} disabled={loading || !repoUrl.trim()} className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl">
                {loading ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Loading...</span></>) : (<><Search className="w-5 h-5" /><span>Fetch Issues</span></>)}
              </button>
            </div>
            {error && (<div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-700 font-medium">{error}</p></div>)}
          </div>

          {/* Actions Bar */}
          {issues.length > 0 && (
            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl border">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-900">Found {issues.length} issue{issues.length !== 1 ? 's' : ''}</h3>
                {someSelected && (<span className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full">{selectedIssues.size} selected</span>)}
              </div>
              <div className="flex items-center space-x-3">
                {someSelected && (<button onClick={() => handleImport(issues.filter(i => selectedIssues.has(i.id)))} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2 shadow-sm"><Plus className="w-4 h-4" /><span>Add Selected ({selectedIssues.size})</span></button>)}
                <button onClick={() => handleImport(issues)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2 shadow-sm"><Plus className="w-4 h-4" /><span>Add All</span></button>
              </div>
            </div>
          )}

          {/* Issues Table */}
          {issues.length > 0 && (
            <div className="flex-1 overflow-auto bg-white rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0"><tr>
                  <th className="w-12 p-4"><button onClick={toggleAll} className="flex items-center justify-center w-5 h-5 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors">{allSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : someSelected ? <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></div> : <Square className="w-4 h-4 text-gray-400" />}</button></th>
                  <th className="text-left p-4 font-semibold text-gray-900">#</th><th className="text-left p-4 font-semibold text-gray-900 min-w-0">Title</th><th className="text-left p-4 font-semibold text-gray-900">Labels</th><th className="w-32 p-4 font-semibold text-gray-900 text-center">Actions</th>
                </tr></thead>
                <tbody>{issues.map((issue) => { const isSelected = selectedIssues.has(issue.id); return (
                  <tr key={issue.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                    <td className="p-4"><button onClick={() => toggleIssue(issue.id)} className="flex items-center justify-center w-5 h-5 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors">{isSelected && <Check className="w-3 h-3 text-blue-600" />}</button></td>
                    <td className="p-4 text-sm font-mono text-gray-600">#{issue.number}</td>
                    <td className="p-4 min-w-0"><h4 className="font-medium text-gray-900 line-clamp-1 leading-snug">{issue.title}</h4></td>
                    <td className="p-4"><div className="flex flex-wrap gap-1 max-w-xs">{issue.labels.slice(0, 3).map((label) => (<span key={label.id} className="px-2 py-1 text-xs font-medium rounded-full border" style={{ backgroundColor: `#${label.color}20`, borderColor: `#${label.color}40`, color: `#${label.color}` }}>{label.name}</span>))}{issue.labels.length > 3 && (<span className="text-xs text-gray-500 px-2 py-1">+{issue.labels.length - 3}</span>)}</div></td>
                    <td className="p-4"><div className="flex items-center justify-center space-x-2"><a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors" title="View on GitHub"><ExternalLink className="w-4 h-4" /></a></div></td>
                  </tr>
                );})}</tbody>
              </table>
            </div>
          )}
          
          {issues.length === 0 && repoUrl && !loading && !error && ( <div className="flex-1 flex items-center justify-center"><div className="text-center"><Github className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3><p className="text-gray-600">This repository doesn't have any open issues.</p></div></div> )}
          {!repoUrl && !loading && ( <div className="flex-1 flex items-center justify-center"><div className="text-center"><Search className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">Enter a repository URL</h3><p className="text-gray-600">Start by entering a GitHub repository URL to fetch its issues.</p></div></div> )}
        </div>
      </div>
    </div>
  );
}
