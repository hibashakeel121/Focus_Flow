import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { notesRequest } from '../services/notesApi';

export default function NotepadPage() {
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [reload, setReload] = useState(0);
  const activeNote = notes.find((note) => note.id === activeId);
  const dirty = Boolean(activeNote && (draft.title !== activeNote.title || draft.content !== activeNote.content));

  useEffect(() => {
    let cancelled = false;
    notesRequest().then((data) => {
      if (cancelled) return;
      setNotes(data);
      setActiveId(data[0]?.id || null);
      setDraft(data[0] ? { title: data[0].title, content: data[0].content } : { title: '', content: '' });
    }).catch((err) => {
      if (!cancelled) setError(err.message);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [reload]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function selectNote(note) {
    setActiveId(note?.id || null);
    setDraft({ title: note?.title || '', content: note?.content || '' });
    setStatus('');
    setError('');
  }

  async function saveCurrent() {
    if (!dirty) return activeNote;
    const saved = await notesRequest(`/${activeId}`, { method: 'PUT', body: JSON.stringify(draft) });
    setNotes((previous) => previous.map((note) => note.id === saved.id ? saved : note));
    setDraft({ title: saved.title, content: saved.content });
    return saved;
  }

  async function run(action) {
    setBusy(true);
    setError('');
    setStatus('');
    try { await action(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  function addNote() {
    run(async () => {
      await saveCurrent();
      const note = await notesRequest('', { method: 'POST', body: JSON.stringify({ title: `Note ${notes.length + 1}`, content: '' }) });
      setNotes((previous) => [note, ...previous]);
      selectNote(note);
      setStatus('Note created in MongoDB.');
    });
  }

  function deleteNote(note) {
    if (!window.confirm(`Delete "${note.title}" permanently?`)) return;
    run(async () => {
      await notesRequest(`/${note.id}`, { method: 'DELETE' });
      const remaining = notes.filter((item) => item.id !== note.id);
      setNotes(remaining);
      if (activeId === note.id) selectNote(remaining[0]);
      setStatus('Note deleted.');
    });
  }

  return (
    <Card title="Notepad">
      <p className="text-sm text-gray-500 mb-4">Your notes are stored in MongoDB. Save your changes before leaving this page.</p>
      {error && <div role="alert" className="mb-4 p-3 rounded-lg bg-red-100 text-red-800">{error} {!activeNote && <Button variant="secondary" className="ml-2" disabled={loading || busy} onClick={() => { setLoading(true); setError(''); setReload((value) => value + 1); }}>Retry</Button>}</div>}
      {loading ? <p role="status">Loading notes...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-busy={busy}>
          <div className="space-y-2 border-r pr-3 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2 gap-2">
              <span className="text-xs font-bold uppercase text-gray-400">All Notes ({notes.length})</span>
              <Button onClick={addNote} disabled={busy}>+ New Note</Button>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {notes.map((note) => (
                <div key={note.id} className={`flex items-center p-2 rounded-lg text-sm font-medium ${note.id === activeId ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                  <button disabled={busy} onClick={() => run(async () => { const saved = await saveCurrent(); selectNote(note.id === activeId ? saved : note); })} className="truncate flex-1 text-left" aria-pressed={note.id === activeId}>{note.title}</button>
                  <button disabled={busy} onClick={() => deleteNote(note)} aria-label={`Delete ${note.title}`} className="ml-2 opacity-70 hover:opacity-100">×</button>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 space-y-3">
            {activeNote ? <>
              <label className="block text-sm" htmlFor="note-title">Title</label>
              <input id="note-title" maxLength={200} disabled={busy} value={draft.title} onChange={(event) => { setDraft({ ...draft, title: event.target.value }); setStatus(''); }} placeholder="Note Title..." className="w-full p-2 text-lg font-bold border-b bg-transparent focus:outline-none dark:border-gray-700" />
              <label className="block text-sm" htmlFor="note-content">Note</label>
              <textarea id="note-content" maxLength={100000} disabled={busy} value={draft.content} onChange={(event) => { setDraft({ ...draft, content: event.target.value }); setStatus(''); }} placeholder="Write your note here..." className="w-full h-52 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none font-sans leading-relaxed" />
              <div className="flex items-center gap-3">
                <Button disabled={busy || !dirty} onClick={() => run(async () => { await saveCurrent(); setStatus('Saved to MongoDB.'); })}>{busy ? 'Working...' : 'Save Note'}</Button>
                <span role="status" className="text-xs text-gray-500">{dirty ? 'Unsaved changes' : status || 'All changes saved'}</span>
              </div>
              <p className="text-xs text-gray-500">Last saved: {new Date(activeNote.updatedAt).toLocaleString()}</p>
            </> : <p className="text-sm text-gray-500">No notes yet. Create your first note to get started.</p>}
          </div>
        </div>
      )}
    </Card>
  );
}
