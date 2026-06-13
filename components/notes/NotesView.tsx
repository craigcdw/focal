"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Note, NoteFolder } from "@/lib/types";
import { Plus, FolderOpen, FileText, X, Search, Tag } from "lucide-react";
import { format } from "date-fns";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

function NoteEditor({ note, onSave }: { note: Note; onSave: (id: string, title: string, content: string) => void }) {
  const [title, setTitle] = useState(note.title);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: note.content,
    onUpdate({ editor }) {
      onSave(note.id, title, editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-64 text-gray-800 dark:text-zinc-200",
      },
    },
  });

  useEffect(() => {
    if (editor && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content);
    }
    setTitle(note.title);
  }, [note.id]);

  return (
    <div className="flex-1 flex flex-col h-full">
      <input
        value={title}
        onChange={e => { setTitle(e.target.value); onSave(note.id, e.target.value, editor?.getHTML() ?? ""); }}
        placeholder="Untitled"
        className="text-2xl font-semibold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-zinc-600 mb-4 w-full"
      />
      <div className="text-xs text-gray-400 dark:text-zinc-500 mb-6">
        Last edited {format(new Date(note.updated_at), "MMM d, h:mm a")}
      </div>
      {/* Toolbar */}
      <div className="flex items-center gap-1 mb-4 pb-4 border-b border-gray-100 dark:border-zinc-800 flex-wrap">
        {[
          { label: "B", cmd: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive("bold") },
          { label: "I", cmd: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive("italic") },
          { label: "S", cmd: () => editor?.chain().focus().toggleStrike().run(), active: editor?.isActive("strike") },
          { label: "H1", cmd: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), active: editor?.isActive("heading", { level: 1 }) },
          { label: "H2", cmd: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive("heading", { level: 2 }) },
          { label: "•", cmd: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive("bulletList") },
          { label: "1.", cmd: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive("orderedList") },
          { label: "<>", cmd: () => editor?.chain().focus().toggleCode().run(), active: editor?.isActive("code") },
        ].map(({ label, cmd, active }) => (
          <button
            key={label}
            onClick={cmd}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
              active ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
    </div>
  );
}

export function NotesView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [selected, setSelected] = useState<Note | null>(null);
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const saveTimeout = { current: null as ReturnType<typeof setTimeout> | null };

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: n }, { data: f }] = await Promise.all([
      supabase.from("notes").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
      supabase.from("note_folders").select("*").eq("user_id", user.id).order("name"),
    ]);
    setNotes(n ?? []);
    setFolders(f ?? []);
    if (n && n.length > 0) setSelected(n[0]);
    setLoading(false);
  }

  async function createNote() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("notes").insert({
      user_id: user.id,
      title: "Untitled",
      content: "",
      folder_id: activeFolder,
      tags: [],
      linked_task_ids: [],
      linked_event_ids: [],
    }).select().single();
    if (data) {
      setNotes(prev => [data, ...prev]);
      setSelected(data);
    }
  }

  async function createFolder() {
    const name = prompt("Folder name:");
    if (!name) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("note_folders").insert({
      user_id: user.id,
      name,
      color: "#6b7280",
    }).select().single();
    if (data) setFolders(prev => [...prev, data]);
  }

  async function deleteNote(id: string) {
    await supabase.from("notes").delete().eq("id", id);
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selected?.id === id) setSelected(notes.find(n => n.id !== id) ?? null);
  }

  const handleSave = useCallback((id: string, title: string, content: string) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      await supabase.from("notes").update({ title, content, updated_at: new Date().toISOString() }).eq("id", id);
      setNotes(prev => prev.map(n => n.id === id ? { ...n, title, content, updated_at: new Date().toISOString() } : n));
    }, 600);
  }, []);

  const filtered = notes.filter(n => {
    const matchSearch = search === "" || n.title.toLowerCase().includes(search.toLowerCase());
    const matchFolder = activeFolder === null || n.folder_id === activeFolder;
    return matchSearch && matchFolder;
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] -mx-8 -my-8">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800 flex flex-col">
        {/* Search & new */}
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 space-y-2">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-gray-400 dark:text-zinc-500 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes…"
              className="flex-1 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none"
            />
          </div>
          <button
            onClick={createNote}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-80 transition-opacity"
          >
            <Plus size={15} /> New note
          </button>
        </div>

        {/* Folders */}
        <div className="px-3 py-2 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Folders</span>
            <button onClick={createFolder} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"><Plus size={14} /></button>
          </div>
          <button
            onClick={() => setActiveFolder(null)}
            className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm transition-colors ${activeFolder === null ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-zinc-800" : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"}`}
          >
            <FileText size={14} /> All notes
          </button>
          {folders.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFolder(f.id)}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm transition-colors ${activeFolder === f.id ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-zinc-800" : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"}`}
            >
              <FolderOpen size={14} style={{ color: f.color }} /> {f.name}
            </button>
          ))}
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto py-2">
          {filtered.map(note => (
            <div
              key={note.id}
              onClick={() => setSelected(note)}
              className={`group px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 dark:border-zinc-800 ${
                selected?.id === note.id ? "bg-blue-50 dark:bg-blue-950/30" : "hover:bg-gray-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{note.title || "Untitled"}</p>
                <button
                  onClick={e => { e.stopPropagation(); deleteNote(note.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 dark:text-zinc-600 hover:text-red-500 transition-all flex-shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">{format(new Date(note.updated_at), "MMM d")}</p>
              {note.tags.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {note.tags.map(t => <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-500">{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-white dark:bg-zinc-950 p-8 overflow-y-auto">
        {selected ? (
          <NoteEditor key={selected.id} note={selected} onSave={handleSave} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300 dark:text-zinc-600">
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
