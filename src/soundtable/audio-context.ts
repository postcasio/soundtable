import { ADSRNode } from "./adsr-node";
import { AudioConnection } from "./audio-connection";
import { AudioNode } from "./audio-node";
import { BitcrushNode } from "./bitcrush-node";
import { EchoNode } from "./echo-node";
import { FMNode } from "./fm-node";
import { GainNode } from "./gain-node";
import { Instrument, VoiceBuilder } from "./instrument";
import { MixerNode } from "./mixer-node";
import { OscillatorNode } from "./oscillator-node";
import { Output } from "./output";
import { SequencerNode } from "./sequencer-node";
import { readInputSamples } from "./utils";

export class AudioContext {
	sampleRate = 44100;
	bitsPerSample = 8 as const;
	numChannels = 1;
	currentTime = 0;
	bufferLength = 768;

	nodeBuffers: Map<AudioNode, Float32Array> = new Map();

	buffer = new Uint8Array(this.bufferLength);

	output: Output;

	soundStream: SoundStream;

	constructor() {
		this.output = new Output(this);

		this.soundStream = new SoundStream(
			this.sampleRate,
			this.bitsPerSample,
			this.numChannels
		);
	}

	readSamples(connection: AudioConnection) {
		let buffer = this.nodeBuffers.get(connection.source);

		if (!buffer) {
			buffer = connection.source.updateSamples(connection.outputIndex);
		}

		return buffer;
	}

	update() {
		if (this.soundStream.length > 2 / 60) {
			return false;
		}

		this.nodeBuffers.clear();

		const samples = readInputSamples(this.output, 0);

		for (let i = 0; i < this.bufferLength; i++) {
			// SSj.log(
			// 	`${samples[i]} = ${Math.floor(((samples[i] + 1) / 2) * 255)}`
			// );
			this.buffer[i] = Math.floor(((samples[i] + 1) / 2) * 255);
		}

		this.currentTime += this.bufferLength;
		// SSj.log(this.buffer);
		this.soundStream.write(this.buffer.buffer);

		return true;
	}

	createOscillator() {
		return new OscillatorNode(this);
	}

	createADSR() {
		return new ADSRNode(this);
	}

	createInstrument(voiceBuilder: VoiceBuilder) {
		return new Instrument(this, voiceBuilder);
	}

	createMixer() {
		return new MixerNode(this);
	}

	createEcho() {
		return new EchoNode(this);
	}

	createFM() {
		return new FMNode(this);
	}

	createSequencer(instrument: Instrument) {
		return new SequencerNode(this, instrument);
	}

	createBitcrush(bits: number) {
		return new BitcrushNode(this, bits);
	}

	createGain(gain: number) {
		return new GainNode(this, gain);
	}
}
