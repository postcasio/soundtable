import { AudioContext } from "./audio-context";
import { AudioNode } from "./audio-node";
import { Instrument, Octave, Pitch } from "./instrument";
import { NodeRenderer, NullRenderer } from "./renderer";

export interface Note {
	octave: Octave;
	pitch: Pitch;
	duration: number;
	velocity: number;
	start: number;
}

export interface Sequence {
	bars: Note[][];
}

export class SequencerNode implements AudioNode {
	context: AudioContext;
	numberOfInputs = 0;
	numberOfOutputs = 1;
	inputs = [];
	tempo = 120;
	instrument: Instrument;
	sequences: Sequence[] = [];

	constructor(context: AudioContext, instrument: Instrument) {
		this.context = context;
		this.instrument = instrument;
	}

	updateSamples(outputIndex: number): Float32Array {
		const samples = new Float32Array(this.context.bufferLength);
		const tempoRate = this.context.sampleRate / this.tempo;

		for (let i = 0; i < this.context.bufferLength; i++) {
			const time = this.context.currentTime + i;

			const barIndex = Math.floor(time / tempoRate);
			const bar =
				this.sequences[0].bars[
					barIndex % this.sequences[0].bars.length
				];

			const noteIndex = Math.floor(
				(time % tempoRate) / (tempoRate / bar.length)
			);
			const note = bar[noteIndex % bar.length];

			if (time % (60 / this.tempo) < note.start) {
				continue;
			}

			this.instrument.trigger(note.pitch, note.octave);
		}

		return samples;
	}

	createRenderer(): NodeRenderer {
		return new NullRenderer(this);
	}
}
