export default function NotesPage() {
  return (
    <section>
      <h2>Notes</h2>
      <p>This route will eventually support topic assignment, tags, note links, and separate summary editing.</p>
      <ul>
        <li>Notes can be assigned to topic bins at depth 0, 1, or 2.</li>
        <li>Tags are global and can be attached or removed from notes.</li>
        <li>Links capture semantic relationships between notes.</li>
        <li>Summaries are edited separately from note body content.</li>
      </ul>
      <p>Use the API routes under <code>/api/notes</code>, <code>/api/tags</code>, and <code>/api/topics</code> for current feature work.</p>
    </section>
  );
}
