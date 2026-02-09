import { z } from "zod";
import {
	AbsoluteFill,
	Sequence,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";
import { CompositionProps } from "../../../types/constants";
import { NextLogo } from "./NextLogo";
import { loadFont, fontFamily } from "@remotion/google-fonts/Inter";
import { Rings } from "./Rings";
import { TextFade } from "./TextFade";
import { Video } from "@remotion/media";

loadFont("normal", {
	subsets: ["latin"],
	weights: ["400", "700"],
});
export const Main = ({ title }: z.infer<typeof CompositionProps>) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const transitionStart = 2 * fps;
	const transitionDuration = 1 * fps;

	const logoOut = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		durationInFrames: transitionDuration,
		delay: transitionStart,
	});

	return (
		<AbsoluteFill className="bg-white">
			<Video src={"https://remotion.media/video.mp4"} />
		</AbsoluteFill>
	);
};
