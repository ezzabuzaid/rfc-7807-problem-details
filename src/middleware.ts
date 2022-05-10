import { ProblemDetailsOptions } from "./problem_details_options";
import type {
	Request,
	Response,
	NextFunction,
	ErrorRequestHandler,
} from "express";
import { ProblemDetails } from "./problem_details";
import { getReasonPhrase } from "http-status-codes";
import type { IncomingHttpHeaders } from "http";
import { createStatusCodeProblem } from "./status_code_problem_details";
export function problemDetailsMiddleware(
	configure: (options: ProblemDetailsOptions) => void
): ErrorRequestHandler {
	const options = new ProblemDetailsOptions();
	configure(options);

	options.includeExceptionDetails ??= () =>
		process.env.NODE_ENV === "development";

	options.exceptionDetailsPropertyName ||=
		ProblemDetailsOptions.DefaultExceptionDetailsPropertyName;

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
		const problem = createStatusCodeProblem(res.statusCode);
		problem.detail = "";
		return problem;
	};

	options.isProblem ??= (response: Response) => {
		// TODO: should it check if the status code has been set first?
		// if there is no status code means some middleware throw an error thus if not status code then it is problem.
		// if there is status code means the developer set it intentionally
		if (response.statusCode < 400 || response.statusCode >= 600) {
			return false;
		}
		if (!response.hasHeader("content-type")) {
			return true;
		}
		return false;
	};

	return (error, req, res, next) => {
		if (res.headersSent) {
			next(error); // delegate to default error handler
		} else if (options.isProblem(res)) {
			const mapping = options.mappings.get(error);
			const problem =
				mapping?.(req, res, error) ?? options.mapStatusCode(req, res);
			const statusCode = res.statusCode;
			res
				.header("content-type", options.contentTypes)
				.status(statusCode)
				.json(problem);
		}
		next();
	};
}
