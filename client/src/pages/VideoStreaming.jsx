export const VideoStreaming = () => {
  return (
    <>
      <h1>VIDEO STREAMING</h1>
      <video controls width={750}>
        <source
          src="http://localhost:3000/static/videos/_86oEihp880mTKVgVmAKg.mp4"
          type="video/mp4"
        />
      </video>
    </>
  );
};
