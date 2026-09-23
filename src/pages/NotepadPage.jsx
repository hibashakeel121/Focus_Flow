import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useTimer } from "../context/TimerContext";

export default function NotepadPage() {
  const {
    notes,
    activeNoteId,
    setActiveNoteId,
    addNote,
    updateNote,
    updateNoteTitle,
    deleteNote,
  } = useTimer();

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  return (
    <Card title="Notepad">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Sidebar: Note List */}
        <div className="space-y-2 border-r pr-3 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase text-gray-400">All Notes</span>
            <Button onClick={addNote} variant="primary">
              + New Note
            </Button>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`flex justify-between items-center p-2 rounded-lg cursor-pointer text-sm font-medium transition-all ${
                  note.id === activeNoteId
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                <span className="truncate flex-1">{note.title || "Untitled Note"}</span>
                {notes.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="ml-2 text-xs opacity-70 hover:opacity-100 hover:text-red-300"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Area: Active Note Editor */}
        <div className="md:col-span-2 space-y-3">
          <input
            type="text"
            value={activeNote?.title || ""}
            onChange={(e) => updateNoteTitle(activeNote.id, e.target.value)}
            placeholder="Note Title..."
            className="w-full p-2 text-lg font-bold border-b bg-transparent focus:outline-none dark:border-gray-700"
          />
          <textarea
            value={activeNote?.content || ""}
            onChange={(e) => updateNote(activeNote.id, e.target.value)}
            placeholder="Write your note here..."
            className="w-full h-52 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none font-sans leading-relaxed"
          />
        </div>
      </div>
    </Card>
  );
}