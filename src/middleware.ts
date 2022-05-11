import { ProblemDetailsOptions } from "./problem_details_options";
import type { Response, ErrorRequestHandler } from "express";
import { getReasonPhrase } from "http-status-codes";
import { ProblemDetails } from "./problem_details";
import { ProblemDetailsException } from "./problem_details_exception";
export function problemDetailsMiddleware(
	configure: (options: ProblemDetailsOptions) => void
): ErrorRequestHandler {
	const options = new ProblemDetailsOptions();
	configure(options);

	options.includeExceptionDetails ??= () =>
		(process.env.NODE_ENV || "development") === "development";

	options.exceptionDetailsPropertyName ||=
		ProblemDetailsOptions.DefaultExceptionDetailsPropertyName;

	ProblemDetailsOptions.TypePrefix =
		options.typePrefix ?? `https://httpstatuses.io`;

	if (options.contentTypes.length === 0) {
		options.contentTypes = ["application/problem+json"];
	}

	options.appendCacheHeaders ??= (req, res) => {
		res.setHeader("cache-control", "no-cache, no-store, must-revalidate");
		res.setHeader("pragma", "no-cache");
		res.setHeader("etag", "0");
		res.setHeader("expires", "0");
	};

	options.mapStatusCode ??= (req, res) => {
		const problem = new ProblemDetails(
			`${ProblemDetailsOptions.TypePrefix}/${res.statusCode}`,
			getReasonPhrase(res.statusCode),
			res.statusCode
		);
		return problem;
	};

	options.isProblem ??= (response: Response) => {
		// Always return true and let the developer change it based on his requrirment
		// in case the developer throws an error from any other middlware this should be fine
		// in case the developer return kind of "error" object he can modify this function to intercept it as
		// return an error response
		return true;
	};

	// FIXME: the developer needs to throw an error in order to be captured in expressjs error middleware
	// if the developer want to return e.g. bad request using "return" statement then we need to
	// check in normal middlware if the response object have error status code

	// FIXME: in koajs, the error handler middleware act just like .net middleware so different export needed
	return (error: any, req: any, res: any, next: any) => {
		if (res.headersSent) {
			next(error); // delegate to default error handler
		} else {
			let problem: ProblemDetails;
			if (error instanceof ProblemDetailsException) {
				problem = error.Details;
			} else {
				problem = options.mapToProblemDetails(
					{ request: req, response: res },
					error
				);
			}

			if (options.includeExceptionDetails()) {
				const stack =
					error instanceof Error ? error.stack : Error.captureStackTrace(error);
				problem[options.exceptionDetailsPropertyName] = stack
					?.split("\n")
					.map((line) => line.trim());
			}

			res
				.setHeader("content-type", options.contentTypes)
				.status(problem.status)
				.json(problem);
		}
		next();
	};
}
