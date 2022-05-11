import { getReasonPhrase } from "http-status-codes";
import { ProblemDetails } from "./problem_details";

export function createStatusCodeProblem(
	statusCode: number,
	title?: string,
	type?: string
) {
	return new ProblemDetails(
		type,
		title ?? getReasonPhrase(statusCode),
		!title ? statusCode : undefined
	);
}
