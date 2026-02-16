import { AbsoluteFill, OffthreadVideo } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

loadFont("normal", {
  subsets: ["latin"],
  weights: ["400", "700"],
});
export const Main = () => {
  return (
    <AbsoluteFill className="bg-white">
      <OffthreadVideo src="https://remotion.media/video-h265.mp4" />
    </AbsoluteFill>
  );
};
