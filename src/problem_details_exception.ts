import { ProblemDetails } from "./problem_details";

export class ProblemDetailsException extends Error {
	public Details: ProblemDetails;
	constructor(details: ProblemDetails);
	constructor(problemDetails: ProblemDetails) {
		super(problemDetails.title);

		// CREDIT: https://github.com/c-hive/guides/blob/master/js/error-handling.md
		// Ensures that the error constructor isn't included in the stack trace.
		Error.captureStackTrace(this, ProblemDetailsException);

		// Changes from Error to ProblemDetailsException
		this.name = this.constructor.name;

		if (problemDetails instanceof ProblemDetails) {
			this.Details = problemDetails;
		} else {
			problemDetails = problemDetails; // hack typescript to avoid type guard
			this.Details = new ProblemDetails(
				problemDetails.type,
				problemDetails.title,
				problemDetails.status
			);
		}
	}

	// public static fromError(
	// 	error: ProblemDetails & { message?: string; statusCode: number }
	// ) {
	// 	error.title ||= error.message;
	// 	error.status ||= error.statusCode;
	// 	return new ProblemDetailsException(error);
	// }
}
