import { getReasonPhrase } from "http-status-codes";
import { HttpContext } from "./context";
import { ProblemDetails } from "./problem_details";
import { ProblemDetailsException } from "./problem_details_exception";
import { ProblemDetailsOptions } from "./problem_details_options";

export class ProblemDetailsSetup {
	constructor(private _options: ProblemDetailsOptions) {}
	public prepareProblemDetails(
		error: any,
		context: HttpContext
	): ProblemDetails {
		let problem: ProblemDetails;
		if (error instanceof ProblemDetailsException) {
			problem = error.Details;
			problem.detail ??= error.message;
		} else {
			problem = this._options.mapToProblemDetails(context, error);
		}

		if (!problem.type) {
			// Set problem details type to "about:blank" if not present
			problem.type = "about:blank";
		} else if (!/^((http|https):\/\/)/.test(problem.type)) {
			problem.type = `${this._options.typePrefix}/${problem.type}`;
			// If it doesn't start with valid https or http then use typePrefix
		}
		// if it's url that means the developer did this intentionally.

		// Set problem details title to status code text if title is not present
		if (!problem.title && problem.status) {
			// https://datatracker.ietf.org/doc/html/rfc7807#section-4.2
			problem.title = getReasonPhrase(problem.status);
		}

		// Set instance to the request url
		problem.instance = context.req.url;

		if (this._options.includeExceptionDetails()) {
			if (!(error instanceof Error)) {
				Error.captureStackTrace(error, this.prepareProblemDetails);
			}
			const stack: string | undefined = error.stack;

			problem[this._options.exceptionDetailsPropertyName] = stack
				?.split("\n")
				.map((line) => line.trim());
		}

		return problem;
	}

	public prepareProblemDetailsOptions() {
		this._options.includeExceptionDetails ??= () =>
			(process.env.NODE_ENV || "development") === "development";

		this._options.exceptionDetailsPropertyName ||=
			ProblemDetailsOptions.DefaultExceptionDetailsPropertyName;

		this._options.typePrefix ??= `https://httpstatuses.io`;

		if (this._options.contentTypes.length === 0) {
			this._options.contentTypes = ["application/problem+json"];
		}

		this._options.appendCacheHeaders ??= (setHeader) => {
			setHeader("cache-control", "no-cache, no-store, must-revalidate");
			setHeader("pragma", "no-cache");
			setHeader("etag", "0");
			setHeader("expires", "0");
		};

		this._options.mapStatusCode ??= (
			context: HttpContext,
			statusCode: number
		) => {
			const title = undefined; // will be set to status code text in the middleware
			const problem = new ProblemDetails(`${statusCode}`, title, statusCode);
			return problem;
		};
	}
}
