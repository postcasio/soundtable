import { AudioConnection } from "./audio-connection";
import { AudioContext } from "./audio-context";
import { AudioNode } from "./audio-node";
import {
	BasicNodeRenderer,
	InitialBasicRendererOptions,
} from "./basic-node-renderer";
import { NodeRenderer, NullRenderer } from "./renderer";
import { sineWave } from "./sine-wave";
import { mapRange, readInputSamples } from "./utils";
import { WaveFunction } from "./wave";

export type OscillatorType = "sine";

export class OscillatorNode implements AudioNode {
	static INPUT_FREQUENCY = 0;

	context: AudioContext;
	numberOfInputs = 1;
	numberOfOutputs = 1;
	wave: WaveFunction = sineWave;
	frequency = 440;
	frequencyModulationAmount = 0.1;
	amplitude = 1;
	inputs: AudioConnection[] = [];

	buffer: Float32Array;
	syncTime = 0;

	phase = 0;
	maxPhase = 10000000;

	initialBasicRendererOptions: InitialBasicRendererOptions = {};

	constructor(context: AudioContext) {
		this.context = context;
		this.buffer = new Float32Array(this.context.bufferLength);
	}

	sync() {
		this.syncTime = 0;
	}

	updateSamples(outputIndex: number) {
		const input = this.inputs[OscillatorNode.INPUT_FREQUENCY];
		let frequencySamples: Float32Array | null = null;

		if (input) {
			frequencySamples = this.context.readSamples(input);
		}

		for (let i = 0; i < this.context.bufferLength; i++) {
			const frequency = frequencySamples
				? this.frequency +
				  frequencySamples[i] * 440 * this.frequencyModulationAmount
				: this.frequency;

			const delta =
				(this.maxPhase * frequency) / this.context.sampleRate + 0.5;

			this.buffer[i] = this.wave(
				((this.phase += delta) % this.maxPhase) / this.maxPhase,
				frequency,
				this.amplitude,
				0
			);

			this.phase = this.phase % this.maxPhase;
		}

		// SSj.log(this.buffer);

		return this.buffer;
	}

	createRenderer(): NodeRenderer {
		return new BasicNodeRenderer(this, this.initialBasicRendererOptions);
	}
}
