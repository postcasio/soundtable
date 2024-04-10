export function sineWave(t: number, f: number, a: number, p: number) {
	// sin(2 * pi * (2 * t - cos(t)));

	return a * Math.sin(Math.PI * 2 * t);
	// return a * (Math.sin(f * Math.PI * 2 * t + p) / (Math.PI * 2));
}
