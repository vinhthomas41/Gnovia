export default function ArchiveLoading({
  label = "Opening archive",
}: {
  label?: string;
}) {
  return (
    <main className="archive-loading" role="status" aria-live="polite">
      <div className="archive-loading-mark" aria-hidden="true">
        ✦
      </div>
      <p>{label}</p>
      <div className="archive-loading-track" aria-hidden="true">
        <span />
      </div>
      <small>Restoring collection records</small>
    </main>
  );
}
