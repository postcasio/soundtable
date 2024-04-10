import Prim from "prim";
import { AudioContext } from "./soundtable/audio-context";
import { Instrument, Octave, Pitch } from "./soundtable/instrument";
import { sineWave } from "./soundtable/sine-wave";
import { squareWave } from "./soundtable/square-wave";
import { connect, crossing, crossingDown, mapRange } from "./soundtable/utils";
import { SequencerNode } from "./soundtable/sequencer-node";
import { Renderer } from "./soundtable/renderer";
import { triangleWave } from "./soundtable/triangle-wave";

class Game {
	context: AudioContext;

	instrument: Instrument;
	file: FileStream;
	header: DataView;
	sequencer: SequencerNode;

	renderer: Renderer;

	keyState: Map<number, boolean> = new Map();

	constructor() {
		this.context = new AudioContext();
		this.renderer = new Renderer(this.context);

		this.sequencer = this.createSequencer();

		this.file = new FileStream("~/output.wav", FileOp.Write);
		const header = new DataView(new Uint8Array(44).buffer);
		this.header = header;
		header.setUint32(0, 0x52494646); // "RIFF"
		// file size
		header.setUint32(8, 0x57415645); // "WAVE"
		header.setUint32(12, 0x666d7420); // "fmt "
		header.setUint32(16, 16, true); // fmt size
		header.setUint16(20, 1, true); // format (PCM)
		header.setUint16(22, this.context.numChannels, true); // channels
		header.setUint32(24, this.context.sampleRate, true); // sample rate
		header.setUint32(
			28,
			(this.context.sampleRate *
				this.context.bitsPerSample *
				this.context.numChannels) /
				8,
			true
		); // byte rate
		header.setUint16(
			32,
			(this.context.bitsPerSample * this.context.numChannels) / 8,
			true
		); // block align
		header.setUint16(34, this.context.bitsPerSample, true); // bits per sample
		header.setUint32(36, 0x64617461); // "data"
		// data size
		this.file.write(header);

		let voiceIndex = 0;

		this.instrument = this.context.createInstrument((context) => {
			// carrier
			const oscillator = context.createOscillator();
			oscillator.wave = squareWave;
			oscillator.frequencyModulationAmount = 0.03;
			oscillator.initialBasicRendererOptions.position = [
				voiceIndex * 250,
				0,
			];
			const oscillator2 = context.createOscillator();
			oscillator2.wave = sineWave;
			oscillator2.amplitude = 1;
			oscillator2.frequency = 6;
			oscillator2.initialBasicRendererOptions.position = [
				voiceIndex * 250,
				600,
			];

			const adsr = context.createADSR();
			adsr.attack.setValue(0.5);
			adsr.decay.setValue(0.5);
			adsr.sustain.setValue(0.7);
			adsr.release.setValue(1);
			adsr.initialBasicRendererOptions.position = [voiceIndex * 250, 250];
			connect(oscillator, adsr);

			// modulator;
			const adsr2 = context.createADSR();
			adsr2.attack.setValue(3);
			adsr2.decay.setValue(0.2);
			adsr2.release.setValue(3);
			adsr2.initialBasicRendererOptions.position = [
				voiceIndex * 250,
				900,
			];
			connect(oscillator2, adsr2);
			connect(adsr2, oscillator, 0, 0); // connect to first oscillator's frequency input

			voiceIndex++;
			return {
				triggerNode: adsr,
				trigger: () => {
					oscillator.sync();
					oscillator2.sync();
					adsr.trigger();
					adsr2.trigger();
				},
				off: () => {
					adsr.off();
					adsr2.off();
				},
				output: adsr,
				setFrequency: (frequency: number) => {
					oscillator.frequency = frequency;
				},
			};
		});

		const echo = this.context.createEcho();
		echo.delay = 0.5;
		echo.feedback = 0.6;
		connect(this.instrument, echo);

		// connect(this.instrument, this.context.output);
		connect(echo, this.context.output);
	}

	start() {
		Mixer.Default.volume = 1.0;

		this.context.update();
		this.context.soundStream.play(Mixer.Default);

		let dataSize = 0;

		this.renderer.setupRenderers();

		Dispatch.onRender(() => {
			this.renderer.render();
		});

		Dispatch.onUpdate(() => {
			this.instrument.update();

			if (this.context.update()) {
				this.file.write(this.context.buffer.buffer);
				dataSize += this.context.buffer.byteLength;
			}

			if (Keyboard.Default.isPressed(Key.Escape)) {
				this.header.setUint32(4, dataSize + 36, true); // file size
				this.header.setUint32(40, dataSize, true); // data size
				this.file.position = 0;
				this.file.write(this.header);
				this.file.dispose();
				Sphere.shutDown();
			}
		});
	}

	createSequencer() {
		const sequencer = this.context.createSequencer(this.instrument);

		sequencer.sequences = [
			{
				bars: [
					[
						{
							octave: Octave.C3,
							pitch: Pitch.D,
							duration: 0.5,
							velocity: 1,
							start: 0,
						},
						{
							octave: Octave.C3,
							pitch: Pitch.D,
							duration: 0.5,
							velocity: 1,
							start: 0,
						},
					],
				],
			},
		];

		return sequencer;
	}
}

const game = new Game();
game.start();
