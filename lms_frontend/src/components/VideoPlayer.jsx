 // PUBLIC_INTERFACE
export default function VideoPlayer({ url }) {
  /** Basic HTML5 video player for the simple LMS variant. */
  return (
    <video controls className="w-full rounded-lg shadow-lg">
      <source src={url} type="video/mp4" />
    </video>
  );
}
