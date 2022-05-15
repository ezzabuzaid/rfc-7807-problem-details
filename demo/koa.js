const Koa = require('koa');
const createError = require('http-errors');
const { ProblemDetails, ProblemDetailsException, problemDetailsMiddleware } = require('../dist/index');
const app = new Koa();

// Should come at the beginning of the middleware chain
// https://github.com/koajs/koa/blob/master/docs/error-handling.md
app.use(problemDetailsMiddleware.koa((options) => {
	// createError function returns instance of HttpError hence we need to map it to problem details
	options.map(createError.HttpError, (error) => {
		return new ProblemDetails(
			error.type,
			error.message,
			error.status,
			error.detail
		);
	});
}));

app.use(async (ctx, next) => {
	switch(ctx.originalUrl) {
		case '/example/throw':
			throw new ProblemDetailsException({
				type: 'cannot-proceed',
				status: 400,
				title: 'You cannot proceed.',
			});
		case '/example/custom/throw':
			throw createError(400, 'You cannot proceed.', {
				type: 'cannot-proceed',
				detail: `some more details about the error - human friendly error`
			});
		default:
			ctx.body = 'Hello World';
			break;
	}
	await next();
});

const server = app.listen(3000);
