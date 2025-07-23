import React, { useState, useEffect } from 'react';
import {
  fetchNotes, createNote, updateNote, deleteNote, fetchNote
} from './api';

// PUBLIC_INTERFACE
export default function NotesApp({ user, onLogout }) {
  /**
   * Root view for the note app UI after login; manages state for notes list, search, selected note, and actions.
   */
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null); // note id
  const [noteObj, setNoteObj] = useState(null);   // full note object
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  // Fetch notes on mount or when query changes
  useEffect(() => {
    setLoading(true);
    fetchNotes(query)
      .then(setNotes)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    if (selected) {
      fetchNote(selected).then(setNoteObj).catch(() => setNoteObj(null));
    } else {
      setNoteObj(null);
    }
  }, [selected]);

  function handleNoteClick(id) {
    setSelected(id);
    setEditing(false);
  }

  async function handleDeleteNote(id) {
    if (!window.confirm('Delete this note?')) return;
    setLoading(true);
    try {
      await deleteNote(id);
      setNotes(n => n.filter(note => note.id !== id));
      if (selected === id) setSelected(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(note) {
    setSelected(note.id);
    setNoteObj(note);
    setEditing(true);
  }

  function startCreate() {
    setSelected(null);
    setNoteObj({ title: '', content: '' });
    setEditing(true);
  }

  async function handleSave(note) {
    setLoading(true);
    setError('');
    try {
      let saved;
      if (note.id) {
        saved = await updateNote(note.id, { title: note.title, content: note.content });
        setNotes(n => n.map(nn => nn.id === note.id ? saved : nn));
      } else {
        saved = await createNote({ title: note.title, content: note.content });
        setNotes(n => [saved, ...n]);
        setSelected(saved.id);
      }
      setNoteObj(saved);
      setEditing(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Responsive/Minimal navigation
  return (
    <div className="notesapp-wrap">
      <header className="notes-header" style={{ background: '#3f51b5', color: '#fff' }}>
        <span style={{ fontWeight: 600, fontSize: 20, letterSpacing: 1 }}>📝 NoteKeeper</span>
        <span style={{ flex: 1 }} />
        <span className="user-label">{user?.username}</span>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </header>
      <div className="notes-main">
        <aside className="notes-sidebar">
          <div className="sidebar-actions">
            <button className="primary-btn" style={{ width: '100%' }} onClick={startCreate}>
              + New Note
            </button>
            <input
              type="search"
              value={query}
              placeholder="Search notes…"
              onChange={e => setQuery(e.target.value)}
              className="sidebar-search"
              style={{ marginTop: 8 }}
            />
          </div>
          <div className="sidebar-list">
            {loading && <div className="mini-loader">Loading…</div>}
            {!loading && notes.length === 0 && (
              <div className="sidebar-empty">No notes found.</div>
            )}
            <ul className="notes-list">
              {notes.map(note => (
                <li
                  key={note.id}
                  className={selected === note.id ? 'active' : ''}
                  onClick={() => handleNoteClick(note.id)}
                >
                  <div className="note-title">{note.title || <i>Untitled</i>}</div>
                  <button
                    className="del-btn"
                    title="Delete"
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <main className="notes-main-content">
          {error && <div className="error-message">{error}</div>}
          {editing ? (
            <NoteEditor
              note={noteObj || { title: '', content: '' }}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
              loading={loading}
            />
          ) : !noteObj && !editing ? (
            <div className="select-message">
              <span>Select a note or create a new one</span>
            </div>
          ) : (
            <NoteViewer note={noteObj} onEdit={() => setEditing(true)} />
          )}
        </main>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function NoteEditor({ note, onSave, onCancel, loading }) {
  /**
   * Editor for notes (create/update)
   */
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...note, title, content });
  }

  return (
    <form className="note-editor minimal-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        disabled={loading}
        placeholder="Note Title"
        style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}
        required
        onChange={e => setTitle(e.target.value)}
        maxLength={100}
      />
      <textarea
        value={content}
        disabled={loading}
        placeholder="Write your note here..."
        rows={10}
        style={{ minHeight: 180, padding: 12, fontFamily: 'inherit', fontSize: 15 }}
        onChange={e => setContent(e.target.value)}
        maxLength={5000}
        required
      />
      <div style={{ marginTop: 10 }}>
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="secondary-btn" style={{ marginLeft: 8 }} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// PUBLIC_INTERFACE
function NoteViewer({ note, onEdit }) {
  /**
   * Displays a note and edit button
   */
  if (!note) return null;
  return (
    <div className="note-viewer">
      <h2 style={{ fontWeight: 600, color: '#3f51b5' }}>{note.title}</h2>
      <div className="note-content" style={{ whiteSpace: 'pre-wrap', margin: '18px 0', minHeight: 120 }}>
        {note.content}
      </div>
      <button className="primary-btn" onClick={onEdit}>
        Edit
      </button>
    </div>
  );
}
