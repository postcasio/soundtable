import { AudioConnection } from "./audio-connection";
import { AudioContext } from "./audio-context";
import { AudioNode, TriggerableAudioNode } from "./audio-node";
import { MixerNode } from "./mixer-node";
import { NodeRenderer, NullRenderer } from "./renderer";
import { connect } from "./utils";

export enum Pitch {
	C = 0,
	Cs = 1,
	Df = 1,
	D = 2,
	Ds = 3,
	Ef = 3,
	E = 4,
	F = 5,
	Fs = 6,
	Gf = 6,
	G = 7,
	Gs = 8,
	Af = 8,
	A = 9,
	As = 10,
	Bf = 10,
	B = 11,
}

export enum Octave {
	C0 = 0,
	C1 = 12,
	C2 = 24,
	C3 = 36,
	C4 = 48,
	C5 = 60,
	C6 = 72,
	C7 = 84,
	C8 = 96,
}

export interface Voice {
	trigger: () => void;
	off: () => void;
	triggerNode: TriggerableAudioNode;
	output: AudioNode;
	setFrequency: (frequency: number) => void;
}
export type VoiceBuilder = (context: AudioContext) => Voice;

const notes: Map<number, number> = new Map([
	[Key.W, 277.18],
	[Key.E, 311.13],
	[Key.T, 369.99],
	[Key.Y, 415.3],
	[Key.U, 466.16],
	[Key.A, 261.63],
	[Key.S, 293.66],
	[Key.D, 329.63],
	[Key.F, 349.23],
	[Key.G, 392.0],
	[Key.H, 440.0],
	[Key.J, 493.88],
	[Key.K, 523.25],
	[Key.L, 587.33],
]);

export class Instrument implements AudioNode {
	context: AudioContext;

	numberOfVoices = 4;

	numberOfInputs = 4;
	numberOfOutputs = 1;

	voices: Voice[] = [];
	inputs: AudioConnection[] = [];

	mixer: MixerNode;

	keyboardControlled = true;

	keyState: Map<number, Voice | false> = new Map();

	getUnusedVoice() {
		const voice = this.voices.find((voice) => !voice.triggerNode.on);

		if (!voice) {
			const oldestVoice = this.voices.reduce((oldestVoice, voice) => {
				return voice.triggerNode.lastTriggered <
					oldestVoice.triggerNode.lastTriggered
					? voice
					: oldestVoice;
			}, this.voices[0]);

			return oldestVoice;
		}

		return voice;
	}

	constructor(context: AudioContext, voiceBuilder: VoiceBuilder) {
		this.context = context;
		this.mixer = context.createMixer();

		for (let i = 0; i < this.numberOfVoices; i++) {
			const voice = voiceBuilder(context);

			connect(voice.output, this.mixer, 0, i);

			this.voices.push(voice);

			this.inputs[i] = new AudioConnection(voice.output, this, 0, i);
		}
	}

	trigger(pitch: Pitch, octave: Octave) {
		const voice = this.getUnusedVoice();
		const frequency = 440 * Math.pow(2, (octave + pitch) / 12);

		voice.setFrequency(frequency);
		voice.trigger();
	}

	update() {
		if (!this.keyboardControlled) {
			return;
		}

		for (const [key, freq] of notes.entries()) {
			if (Keyboard.Default.isPressed(key as unknown as Key)) {
				if (!this.keyState.get(key)) {
					const voice = this.getUnusedVoice();
					voice.setFrequency(freq);
					voice.trigger();
					this.keyState.set(key, voice);
				}
			} else {
				const voice = this.keyState.get(key);

				if (voice) {
					voice.off();
					this.keyState.set(key, false);
				}
			}
		}
	}

	updateSamples(outputIndex: number): Float32Array {
		return this.mixer.updateSamples(outputIndex);
	}

	createRenderer(): NodeRenderer {
		return new NullRenderer(this);
	}
}
