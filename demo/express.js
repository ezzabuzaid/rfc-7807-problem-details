const express = require('express');
const createError = require('http-errors');
const { ProblemDetails, ProblemDetailsException, problemDetailsMiddleware } = require('../dist/index');
const app = express();

// Pass exception using next middleware
app.get('/example/next', (req, res, next) => {
	const canProceed = Math.random() * 10 > 1;
	if(canProceed) {
		return next(new ProblemDetailsException({
			type: 'cannot-proceed',
			status: 400,
			title: 'You cannot proceed.',
		}));
	}
	res.status(200).json({ text: `You've made it!` });
	next();
});

// throw exception
app.get('/example/throw', (req, res, next) => {
	const canProceed = Math.random() * 10 > 1;
	if(canProceed) {
		throw new ProblemDetailsException({
			type: 'cannot-proceed',
			status: 400,
			title: 'You cannot proceed.',
		});
	}
	res.status(200).json({ text: `You've made it!` });
	next();
});

// Pass custom exception using next middleware
app.get('/example/custom/next', (req, res, next) => {
	const canProceed = Math.random() * 10 > 1;
	if(canProceed) {
		return next(createError(400, 'You cannot proceed.', {
			type: 'cannot-proceed',
			detail: `some more details about the error - human friendly error`
		}));
	}
	res.status(200).json({ text: `You've made it!` });
	next();
});

// Throw custom exception
app.get('/example/custom/throw', (req, res, next) => {
	const canProceed = Math.random() * 10 > 1;
	if(canProceed) {
		throw createError(400, 'You cannot proceed.', {
			type: 'cannot-proceed',
			detail: `some more details about the error - human friendly error`
		});
	}
	res.status(200).json({ text: `You've made it!` });
	next();
});

// This is error handler hence, most be last
app.use(
	problemDetailsMiddleware.express((options) => {
		options.typePrefix = `https://example.com/probs/out-of-credit`;
		// default typePrefix is https://httpstatuses.io - make sure to use status code as type if you do not have dedicated errors page

		// createError function returns instance of HttpError hence we need to map it to problem details
		options.map(createError.HttpError, (error) => {
			return new ProblemDetails(error.type, error.message, error.status, error.detail);
		});
	})
);

const server = app.listen(3000);
