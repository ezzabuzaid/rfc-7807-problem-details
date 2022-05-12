import { ProblemDetails } from "./problem_details";

export class ProblemDetailsException extends Error {
	public Details: ProblemDetails;
	constructor(details: ProblemDetails);
	constructor(problemDetails: ProblemDetails) {
		super(problemDetails.title);
		this.Details =
			problemDetails.constructor !== ProblemDetails
				? new ProblemDetails(
						problemDetails.type,
						problemDetails.title,
						problemDetails.status
				  )
				: problemDetails;
	}

	// public static fromError(
	// 	error: ProblemDetails & { message?: string; statusCode: number }
	// ) {
	// 	error.title ||= error.message;
	// 	error.status ||= error.statusCode;
	// 	return new ProblemDetailsException(error);
	// }
}
