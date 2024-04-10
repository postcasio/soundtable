import { AudioConnection } from "./audio-connection";
import { AudioNode } from "./audio-node";

export function readInputSamples(node: AudioNode, inputIndex: number) {
	const input = node.inputs[inputIndex];

	if (input) {
		return input.source.updateSamples(input.outputIndex);
	}

	throw new Error(
		`${node.constructor.name} has no connection at input ${inputIndex}`
	);
}

export function connect(
	source: AudioNode,
	destination: AudioNode,
	outputIndex = 0,
	inputIndex = 0
) {
	destination.inputs[inputIndex] = new AudioConnection(
		source,
		destination,
		outputIndex,
		inputIndex
	);
}

export function mapRange(
	value: number,
	inMin: number,
	inMax: number,
	outMin: number,
	outMax: number
) {
	return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export function crossing(series: ArrayLike<number>, threshold = 0) {
	for (let i = 1; i < series.length; i++) {
		if (series[i] > threshold && series[i - 1] <= threshold) {
			return i;
		} else if (series[i] < threshold && series[i - 1] >= threshold) {
			return i;
		}
	}

	return undefined;
}

export function crossingDown(series: ArrayLike<number>, threshold = 0) {
	for (let i = 1; i < series.length; i++) {
		if (series[i] < threshold && series[i - 1] >= threshold) {
			return i;
		}
	}

	return undefined;
}

export function crossingUp(series: ArrayLike<number>, threshold = 0) {
	for (let i = 1; i < series.length; i++) {
		if (series[i] > threshold && series[i - 1] <= threshold) {
			return i;
		}
	}

	return undefined;
}
