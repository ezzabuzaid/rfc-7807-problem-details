import { getReasonPhrase } from "http-status-codes";
import { ProblemDetails } from "./problem_details";
import { ProblemDetailsOptions } from "./problem_details_options";
import { createStatusCodeProblem } from "./status_code_problem_details";
export interface IProblemDetailsExceptionOptions {
	statusCode: number;
	type?: string;
	title?: string;
}
export class ProblemDetailsException extends Error {
	public Details: ProblemDetails;
	constructor(options: IProblemDetailsExceptionOptions);
	constructor(details: ProblemDetails);
	constructor(
		optionsOrDetails: IProblemDetailsExceptionOptions | ProblemDetails
	) {
		super();
		this.Details = !(optionsOrDetails instanceof ProblemDetails)
			? new ProblemDetails(
					`${ProblemDetailsOptions.TypePrefix}/${optionsOrDetails.type}`,
					optionsOrDetails.title ??
						getReasonPhrase(optionsOrDetails.statusCode),
					optionsOrDetails.statusCode
			  )
			: optionsOrDetails;
	}
}
