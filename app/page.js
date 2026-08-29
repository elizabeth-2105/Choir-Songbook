import { supabase } from "../lib/supabaseClient";

export const revalidate = 0; // always fetch fresh data

function formatWeek(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function isCurrentWeek(dateStr) {
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const diffDays = Math.floor((now - target) / (1000 * 60 * 60 * 24));
  return diffDays >= -6 && diffDays <= 6;
}

function publicUrl(bucket, path) {
  if (!path) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export default async function HomePage() {
  const { data: songs, error } = await supabase
    .from("songs")
    .select("*")
    .order("week_of", { ascending: false })
    .order("created_at", { ascending: true });

  if (error || !songs || songs.length === 0) {
    return (
      <main>
        <div className="empty-state">
          <h2>No songs posted yet</h2>
          <p>Check back after the next rehearsal — sheet music and recordings will show up here.</p>
        </div>
      </main>
    );
  }

  // group by week_of
  const groups = [];
  for (const song of songs) {
    let group = groups.find((g) => g.week_of === song.week_of);
    if (!group) {
      group = { week_of: song.week_of, songs: [] };
      groups.push(group);
    }
    group.songs.push(song);
  }

  return (
    <main>
      {groups.map((group) => (
        <div className="song-group" key={group.week_of}>
          <div className="staff">
            <div className="lines">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <div
              className={`week-label${isCurrentWeek(group.week_of) ? " current" : ""}`}
            >
              {isCurrentWeek(group.week_of) ? "This week" : formatWeek(group.week_of)}
            </div>
            <div className="week-note">{group.songs.length} songs</div>
          </div>

          {group.songs.map((song) => {
            const pdfUrl = publicUrl("sheet-music", song.pdf_path);
            const audioUrl = publicUrl("recordings", song.audio_path);
            return (
              <div className="song" key={song.id}>
                <div>
                  <p className="song-title">{song.title}</p>
                  {song.notes && <p className="song-notes">{song.notes}</p>}
                </div>
                <div className="song-links">
                  {pdfUrl && (
                    <a className="pill" href={pdfUrl} target="_blank" rel="noreferrer">
                      Sheet music
                    </a>
                  )}
                </div>
                {audioUrl && (
                  <div className="song-audio">
                    <audio controls preload="none" src={audioUrl} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </main>
  );
}
