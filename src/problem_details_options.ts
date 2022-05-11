import type { Request, Response } from "express";
import { getReasonPhrase } from "http-status-codes";
import { ProblemDetails } from "./problem_details";
type Type<T> = new (...args: any) => T;
export class ProblemDetailsOptions {
	public static DefaultExceptionDetailsPropertyName =
		"exceptionDetails" as const;
	// static to be used without injection the options class
	public static TypePrefix: string;

	private mappings = new Map<
		Type<Error>,
		(request: Request, response: Response, error: any) => ProblemDetails
	>();

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
					const details = mapping(errorInstance);
					details.instance = request.url;
					return details;
				}
				return this.mapStatusCode(request, response);
			}
		);
	}

	public mapToStatusCode<TError extends Type<Error>>(
		error: TError,
		statusCode: number
	) {
		this.map(
			error,
			(errorInstance) => true,
			(errorInstance) => {
				return new ProblemDetails(
					`${ProblemDetailsOptions.TypePrefix}/${statusCode}`,
					getReasonPhrase(statusCode),
					statusCode,
					errorInstance.message ?? undefined
				);
			}
		);
	}

	public mapToProblemDetails<TError extends Error>(
		context: { request: Request; response: Response },
		error: TError
	) {
		const mapping = this.mappings.get(error.constructor as Type<TError>);
		return (
			mapping?.(context.request, context.response, error) ??
			this.mapStatusCode(context.request, context.response)
		);
	}
	public rethrow() {}
	public typePrefix?: string;
	public contentTypes: string[] = [];
	public exceptionDetailsPropertyName!: string;
}
