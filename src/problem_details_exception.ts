import { ProblemDetails } from "./problem_details";
import { createStatusCodeProblem } from "./status_code_problem_details";

export class ProblemDetailsException extends Error {
	public Details: ProblemDetails;
	constructor(statusCode: number) {
		super();
		this.Details = createStatusCodeProblem(statusCode);
	}
}
