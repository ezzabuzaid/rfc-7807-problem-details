interface IProblemDetails {
	type: string;
	title: string;
	status: number;
	detail: string;
	instance: string;
	Extensions: Record<string, any>;
}

export class ProblemDetails {
	[key: string]: any;
	constructor(
		public type?: string,
		public title?: string,
		public status?: number,
		public detail?: string,
		public instance?: string
	) {}
}
