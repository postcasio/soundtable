import Tween, { Easing } from "tween";

export class Parameter {
	data: {
		value: number;
	};

	constructor(value: number) {
		this.data = { value };
	}

	setValue(value: number) {
		this.data = { value };
	}

	getValue() {
		return this.data.value;
	}

	linearRampTo(value: number, frames: number) {
		this.data = { value: this.data.value };

		return new Tween(this.data, Easing.Linear).easeIn({ value }, frames);
	}

	exponentialRampTo(value: number, frames: number) {
		this.data = { value: this.data.value };

		return new Tween(this.data, Easing.Exponential).easeIn(
			{ value },
			frames
		);
	}
}
