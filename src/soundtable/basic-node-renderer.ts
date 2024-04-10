import Prim from "prim";
import { AudioNode } from "./audio-node";
import { NodeRenderer, Vector2D } from "./renderer";
import { drawOscilloscope } from "./oscilloscope";

export interface InitialBasicRendererOptions {
	position?: Vector2D;
	size?: Vector2D;
	backgroundColor?: Color;
	textColor?: Color;
	font?: Font;
}

export class BasicNodeRenderer implements NodeRenderer {
	node: AudioNode;

	position: Vector2D = [30, 30];
	size: Vector2D = [250, 600];

	style = {
		backgroundColor: Color.DarkSlateBlue.fadeTo(0.5),
		textColor: Color.White,
		font: Font.Default,
	};

	constructor(node: AudioNode, options: InitialBasicRendererOptions = {}) {
		this.node = node;

		const inputHeight = this.node.numberOfInputs * this.style.font.height;
		const outputHeight = this.node.numberOfOutputs * this.style.font.height;

		this.size[1] =
			Math.max(inputHeight, outputHeight) + this.style.font.height + 200;

		Object.assign(this, options);
	}

	render(surface: Surface) {
		Prim.drawSolidRectangle(
			surface,
			...this.position,
			...this.size,
			this.style.backgroundColor
		);

		this.style.font.drawText(
			surface,
			this.position[0],
			this.position[1],
			this.node.constructor.name,
			this.style.textColor
		);

		const inputHeight = this.node.numberOfInputs * this.style.font.height;
		const outputHeight = this.node.numberOfOutputs * this.style.font.height;

		for (let i = 0; i < this.node.numberOfInputs; i++) {
			this.style.font.drawText(
				surface,
				this.position[0],
				this.position[1] + this.style.font.height * (i + 1),
				"Input",
				this.style.textColor
			);
		}

		for (let i = 0; i < this.node.numberOfOutputs; i++) {
			this.style.font.drawText(
				surface,
				this.position[0] +
					this.size[0] -
					this.style.font.getTextSize("Output").width,
				this.position[1] + this.style.font.height * (i + 1),
				"Output",
				this.style.textColor
			);
		}

		this.style.font.drawText(
			surface,
			this.position[0],
			this.position[1] +
				Math.max(inputHeight, outputHeight) +
				this.style.font.height,
			"Osc.",
			this.style.textColor
		);

		if ((this.node as any).buffer) {
			drawOscilloscope(
				surface,
				[this.position[0], this.position[1] + this.size[1] - 200],
				[this.size[0], 200],
				(this.node as any as { buffer: ArrayLike<number> }).buffer,
				0
			);
		}
	}
}
