/**
 * A wave function is a function that takes a time value, a frequency value, an amplitude value,
 * and a phase value, and returns a value between -1 and 1.
 */
export type WaveFunction = (
	t: number,
	f: number,
	a: number,
	p: number
) => number;
