import { Prim } from "sphere-runtime";
import { crossingDown, mapRange } from "./utils";
import { Vector2D } from "./renderer";

export function drawOscilloscope(
	surface: Surface,
	position: Vector2D,
	size: Vector2D,
	buffer: ArrayLike<number>,
	midpoint: number
) {
	let lastX = 0;

	const start = crossingDown(buffer, midpoint) ?? 0;

	let lastY = size[1] / 2 + buffer[start] * (size[1] / 2);

	surface.clipTo(position[0], position[1], size[0], size[1]);

	let highest = 0;
	for (let i = start + 1; i < buffer.length; i += 16) {
		const sample = buffer[i];

		const x = (i - start) / 2;

		const y = size[1] / 2 + sample * (size[1] / 2.2);

		Prim.drawLine(
			surface,
			position[0] + lastX,
			position[1] + lastY,
			position[0] + x,
			position[1] + y,
			1,
			Color.White
		);
		lastX = x;
		lastY = y;

		if (buffer[i] > highest) {
			highest = buffer[i];
		}
	}

	surface.clipTo(0, 0, surface.width, surface.height);
}
