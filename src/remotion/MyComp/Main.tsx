import { AbsoluteFill } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { Video } from "@remotion/media";

loadFont("normal", {
	subsets: ["latin"],
	weights: ["400", "700"],
});
export const Main = () => {
	return (
		<AbsoluteFill className="bg-white">
			<Video
				src={"https://remotion.media/video.mp4"}
				disallowFallbackToOffthreadVideo
			/>
		</AbsoluteFill>
	);
};
