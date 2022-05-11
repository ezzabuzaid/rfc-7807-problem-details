import type { Request, Response } from "express";
import { ProblemDetails } from "./problem_details";
type Type<T> = new (...args: any) => T;
export class ProblemDetailsOptions {
	public static DefaultExceptionDetailsPropertyName =
		"exceptionDetails" as const;

	private mappings = new Map<
		Type<Error>,
		(request: Request, response: Response, error: any) => ProblemDetails
	>();

	public includeExceptionDetails!: () => boolean;
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
				const title = undefined; // will be set to status code text in the middleware
				return new ProblemDetails(
					`${statusCode}`,
					title,
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
		// FIXME: should mapStatusCode exist at all? if there is no mapping for specific error then the default error
		// handler should take control
		return (
			mapping?.(context.request, context.response, error) ??
			(() => {
				// respect error.statusCode and error.status
				// a lot of 3rd libarires set status or statusCode on error object
				const statusCode = (error as any).statusCode || (error as any).status;
				if (statusCode) {
					context.response.statusCode = statusCode;
				} else {
					// FIXME: should it delegate to routing framework error handler? or just set the status code to 500
				}
				return this.mapStatusCode(context.request, context.response);
			})()
		);
	}
	public rethrow() {}
	public typePrefix?: string;
	public contentTypes: string[] = [];
	public exceptionDetailsPropertyName!: string;
}
