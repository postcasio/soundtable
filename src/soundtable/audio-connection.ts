import { AudioNode } from "./audio-node";

export class AudioConnection {
	source: AudioNode;
	destination: AudioNode;
	outputIndex: number;
	inputIndex: number;

	constructor(
		source: AudioNode,
		destination: AudioNode,
		outputIndex: number,
		inputIndex: number
	) {
		this.source = source;
		this.destination = destination;
		this.outputIndex = outputIndex;
		this.inputIndex = inputIndex;
	}
}
