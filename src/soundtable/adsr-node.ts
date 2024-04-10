import { AudioConnection } from "./audio-connection";
import { AudioContext } from "./audio-context";
import { TriggerableAudioNode } from "./audio-node";
import {
	BasicNodeRenderer,
	InitialBasicRendererOptions,
} from "./basic-node-renderer";
import { Parameter } from "./parameter";
import { NodeRenderer, NullRenderer } from "./renderer";

export class ADSRNode implements TriggerableAudioNode {
	context: AudioContext;
	numberOfInputs = 1;
	numberOfOutputs = 1;
	inputs: AudioConnection[] = [];

	attack = new Parameter(0.2);
	decay = new Parameter(0.07);
	sustain = new Parameter(0.5);
	release = new Parameter(0.2);

	volume = new Parameter(0);
	hold = true;

	buffer: Float32Array;

	on = false;
	lastTriggered = 0;

	state: "attack" | "decay" | "sustain" | "release" = "release";
	stateTime = 0;

	initialBasicRendererOptions: InitialBasicRendererOptions = {};

	constructor(context: AudioContext) {
		this.context = context;
		this.buffer = new Float32Array(this.context.bufferLength);
	}

	trigger() {
		this.on = true;
		this.lastTriggered = this.context.currentTime;
		this.state = "attack";
		this.stateTime = this.context.currentTime;
		this.volume.setValue(0);
		this.volume.linearRampTo(1.0, this.attack.getValue() * 60);
	}

	off() {
		this.state = "release";
		this.stateTime = this.context.currentTime;
		this.volume.setValue(this.sustain.getValue());
		this.volume.linearRampTo(0, this.release.getValue() * 60);
	}

	updateSamples(outputIndex: number) {
		const input = this.inputs[0];

		if (input) {
			const samples = this.context.readSamples(input);

			for (let i = 0; i < this.context.bufferLength; i++) {
				const volume = this.volume.getValue();

				this.buffer[i] = samples[i] * volume;

				const stateElapsed = this.context.currentTime - this.stateTime;
				switch (this.state) {
					case "attack":
						if (
							stateElapsed >
							this.attack.getValue() * this.context.sampleRate
						) {
							this.state = "decay";
							this.stateTime = this.context.currentTime;
							this.volume.linearRampTo(
								this.sustain.getValue(),
								this.decay.getValue() * 60
							);
						}
						break;
					case "decay":
						if (
							stateElapsed >
							this.decay.getValue() * this.context.sampleRate
						) {
							this.state = "sustain";
							this.stateTime = this.context.currentTime;
							this.volume.setValue(this.sustain.getValue());
						}
						break;
					case "sustain":
						if (!this.hold) {
							this.off();
						}
						break;
					case "release":
						if (
							this.on &&
							stateElapsed >
								this.release.getValue() *
									this.context.sampleRate
						) {
							this.volume.setValue(0);
							this.on = false;
						}
						break;
				}
			}

			return this.buffer;
		}

		throw new Error(
			`${this.constructor.name} has no connection at input 0`
		);
	}

	createRenderer(): NodeRenderer {
		return new BasicNodeRenderer(this, this.initialBasicRendererOptions);
	}
}
