export function triangleWave(t: number, f: number, a: number, p: number) {
	const period = f;
	const halfPeriod = period / 2;

	return ((t % halfPeriod) / halfPeriod) * a * 2 - 1;
}
