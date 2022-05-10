import { getReasonPhrase } from "http-status-codes";
import { ProblemDetails } from "./problem_details";

export function createStatusCodeProblem(statusCode: number, title?: string) {
	return new ProblemDetails(
		getDefaultType(statusCode),
		title ?? getReasonPhrase(statusCode),
		!title ? statusCode : undefined
	);
}
export function getDefaultType(statusCode: number) {
	return `https://httpstatuses.io/${statusCode}`;
}
