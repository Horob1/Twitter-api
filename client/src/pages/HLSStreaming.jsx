import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
export const HLSStreaming = () => {
  return (
    <>
      <h1>HLS STREAMING</h1>
      <MediaPlayer
        width={500}
        playsInline
        title="TEST HLS"
        src="http://localhost:3000/static/hls/_86oEihp880mTKVgVmAKg/master.m3u8"
      >
        <MediaProvider />
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
    </>
  );
};
