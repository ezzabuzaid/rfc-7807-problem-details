import type { Request, Response } from "express";
import { ProblemDetails } from "./problem_details";
import { createStatusCodeProblem } from "./status_code_problem_details";
type Type<T> = new (...args: any) => T;
export class ProblemDetailsOptions {
	public mappings = new Map<
		Type<Error>,
		(request: Request, response: Response, error: any) => ProblemDetails
	>();

	public static DefaultExceptionDetailsPropertyName =
		"exceptionDetails" as const;

	public includeExceptionDetails?: () => boolean;
	public isProblem!: (response: Response) => boolean;
	public appendCacheHeaders!: (req: Request, res: Response) => void;
	public mapStatusCode!: (req: Request, res: Response) => ProblemDetails;

	public map<TError extends Type<Error>>(
		error: TError,
		predicate: (error: InstanceType<TError>) => boolean,
		mapping: (error: InstanceType<TError>) => ProblemDetails
	) {
		this.mappings.set(
			error,
			(request, response, errorInstance: InstanceType<TError>) => {
				if (predicate(errorInstance)) {
					return mapping(errorInstance);
				}
				return this.mapStatusCode(request, response);
			}
		);
	}

	public matToStatusCode<TError extends Type<Error>>(
		error: TError,
		statusCode: number
	) {
		this.map(
			error,
			(errorInstance) => true,
			(errorInstance) => {
				const problem = createStatusCodeProblem(statusCode);
				problem.detail = errorInstance.message ?? "";
				return problem;
			}
		);
	}

	public rethrow() {}
	public contentTypes: string[] = [];
	public exceptionDetailsPropertyName!: string;
}
