import { AudioConnection } from "./audio-connection";
import { AudioContext } from "./audio-context";
import { NodeRenderer } from "./renderer";

export interface AudioNode {
	context: AudioContext;

	numberOfInputs: number;
	numberOfOutputs: number;

	inputs: AudioConnection[];

	updateSamples(outputIndex: number): Float32Array;

	createRenderer(): NodeRenderer;
}

export interface TriggerableAudioNode extends AudioNode {
	trigger(): void;
	on: boolean;
	off(): void;
	lastTriggered: number;
}

export interface TuneableAudioNode extends AudioNode {
	frequency: number;
}
