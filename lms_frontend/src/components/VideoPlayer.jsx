 // PUBLIC_INTERFACE
export default function VideoPlayer({ url }) {
  /** Basic HTML5 video player for the simple LMS variant. */
  return (
    <div className="card p-2">
      <video controls className="w-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
        <source src={url} type="video/mp4" />
      </video>
    </div>
  );
}
