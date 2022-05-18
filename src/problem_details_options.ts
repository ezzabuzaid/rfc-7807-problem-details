import { ProblemDetails } from "./problem_details";
import type { HttpContext } from "./context";
import { ProblemDetailsException } from "./problem_details_exception";

type Type<T> = new (...args: any) => T;
export class ProblemDetailsOptions {
	public static DefaultExceptionDetailsPropertyName =
		"exceptionDetails" as const;

	private mappings: [
		Type<Error>,
		(context: HttpContext, error: any) => ProblemDetails
	][] = [];

	private rethrows: [Type<Error>, ((error: any) => boolean)?][] = [];

	public includeExceptionDetails!: () => boolean;
	public appendCacheHeaders!: (
		setter: (name: string, value: string) => void
	) => void;
	public mapStatusCode!: (
		context: HttpContext,
		statusCode: number
	) => ProblemDetails;

	public map<TError extends Type<Error>>(
		error: TError,
		mapping: (error: InstanceType<TError>) => ProblemDetails
	): void;
	public map<TError extends Type<Error>>(
		error: TError,
		predicate: (error: InstanceType<TError>) => boolean,
		mapping: (error: InstanceType<TError>) => ProblemDetails
	): void;
	public map<TError extends Type<Error>>(
		error: TError,
		predicateOrMapping:
			| ((error: InstanceType<TError>) => boolean)
			| ((error: InstanceType<TError>) => ProblemDetails),
		mapping?: (error: InstanceType<TError>) => ProblemDetails
	): void {
		const _mapping: any = mapping ?? predicateOrMapping;
		const _predicate = mapping ? predicateOrMapping : () => true;
		this.mappings.push([
			error,
			(context, errorInstance: InstanceType<TError>) => {
				if (_predicate(errorInstance)) {
					const details = _mapping(errorInstance);
					return details;
				}
				const statusCode = coerceStatusCode(context.res);
				return this.mapStatusCode(context, statusCode);
			},
		]);
	}

	public mapToStatusCode<TError extends Type<Error>>(
		error: TError,
		statusCode: number
	) {
		this.map(error, (errorInstance) => {
			if (error instanceof ProblemDetailsException) {
				error.Details.status = statusCode;
				return error.Details;
			} else {
				const title = undefined; // will be set to status code text in the middleware
				return new ProblemDetails(
					`${statusCode}`,
					title,
					statusCode,
					errorInstance?.message ?? undefined
				);
			}
		});
	}

	public mapToProblemDetails<TError extends Error>(
		context: HttpContext,
		error: TError
	) {
		const [, mapper] =
			this.mappings.find(([errorCtor]) => error instanceof errorCtor) ?? [];
		// FIXME: should mapStatusCode exist at all? if there is no mapping for specific error then the default error
		// handler should take control
		return (
			mapper?.(context, error) ??
			(() => {
				// respect error.statusCode and error.status
				// a lot of 3rd libarires set status or statusCode on the Error object
				const statusCode = coerceStatusCode(error);
				if (statusCode) {
					// return this.mapStatusCode(context, statusCode);
				} else {
					// FIXME: should it delegate to routing framework error handler? or just set the status code to 500
				}
				return this.mapStatusCode(context, statusCode);
			})()
		);
	}
	public rethrow<TError extends Type<Error>>(
		error: TError,
		predicate?: (error: InstanceType<TError>) => boolean
	) {
		this.rethrows.push([error, predicate]);
	}

	public typePrefix?: string;
	public contentTypes: string[] = [];
	public exceptionDetailsPropertyName!: string;
}

function coerceStatusCode(error: object) {
	return (error as any).statusCode || (error as any).status;
}
