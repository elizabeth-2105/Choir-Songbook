"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function DashboardPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [songs, setSongs] = useState([]);

  const [title, setTitle] = useState("");
  const [weekOf, setWeekOf] = useState("");
  const [notes, setNotes] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const loadSongs = useCallback(async () => {
    const { data } = await supabase
      .from("songs")
      .select("*")
      .order("week_of", { ascending: false });
    setSongs(data || []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/admin");
      } else {
        setChecking(false);
        loadSongs();
      }
    });
  }, [router, loadSongs]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/admin");
  }

  async function handleUpload(e) {
    e.preventDefault();
    setMessage(null);

    if (!title || !weekOf || !pdfFile) {
      setMessage({ type: "error", text: "Title, week, and a PDF file are required." });
      return;
    }

    setUploading(true);
    try {
      const stamp = Date.now();
      const base = slugify(title);

      const pdfPath = `${weekOf}/${stamp}-${base}.pdf`;
      const { error: pdfErr } = await supabase.storage
        .from("sheet-music")
        .upload(pdfPath, pdfFile);
      if (pdfErr) throw pdfErr;

      let audioPath = null;
      if (audioFile) {
        const ext = audioFile.name.split(".").pop();
        audioPath = `${weekOf}/${stamp}-${base}.${ext}`;
        const { error: audioErr } = await supabase.storage
          .from("recordings")
          .upload(audioPath, audioFile);
        if (audioErr) throw audioErr;
      }

      const { error: insertErr } = await supabase.from("songs").insert({
        title,
        week_of: weekOf,
        notes: notes || null,
        pdf_path: pdfPath,
        audio_path: audioPath,
      });
      if (insertErr) throw insertErr;

      setMessage({ type: "success", text: `"${title}" was added.` });
      setTitle("");
      setNotes("");
      setPdfFile(null);
      setAudioFile(null);
      document.getElementById("pdf-input").value = "";
      const audioInput = document.getElementById("audio-input");
      if (audioInput) audioInput.value = "";
      loadSongs();
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Upload failed." });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(song) {
    if (!confirm(`Remove "${song.title}"? This can't be undone.`)) return;
    await supabase.storage.from("sheet-music").remove([song.pdf_path]);
    if (song.audio_path) {
      await supabase.storage.from("recordings").remove([song.audio_path]);
    }
    await supabase.from("songs").delete().eq("id", song.id);
    loadSongs();
  }

  if (checking) {
    return (
      <main>
        <div className="admin-shell">
          <p>Checking sign-in…</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="admin-shell">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>Add a song</h1>
          <button className="btn btn-outline" onClick={handleSignOut}>
            Sign out
          </button>
        </div>

        <form onSubmit={handleUpload}>
          <div className="field">
            <label htmlFor="title">Song title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ave Verum Corpus"
            />
          </div>
          <div className="field">
            <label htmlFor="week">Week of</label>
            <input
              id="week"
              type="date"
              value={weekOf}
              onChange={(e) => setWeekOf(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="pdf-input">Sheet music (PDF)</label>
            <input
              id="pdf-input"
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files[0])}
            />
          </div>
          <div className="field">
            <label htmlFor="audio-input">Recording (optional)</label>
            <input
              id="audio-input"
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files[0])}
            />
          </div>
          <div className="field">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sopranos focus on measures 12-20"
            />
          </div>

          {message && (
            <p className={`message ${message.type}`}>{message.text}</p>
          )}

          <button className="btn" type="submit" disabled={uploading}>
            {uploading ? "Uploading…" : "Add song"}
          </button>
        </form>

        <h2 className="section-heading">Posted songs</h2>
        {songs.length === 0 && <p>Nothing posted yet.</p>}
        {songs.map((song) => (
          <div className="admin-song-row" key={song.id}>
            <div>
              <span className="title">{song.title}</span>
              <span className="meta">
                {song.week_of} {song.audio_path ? "· has recording" : ""}
              </span>
            </div>
            <button className="btn btn-outline" onClick={() => handleDelete(song)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
