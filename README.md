Typescript implementation of [RFC 7870](https://datatracker.ietf.org/doc/html/rfc7807)
inspired from [Hellang ProblemDetails](https://www.nuget.org/packages/Hellang.Middleware.ProblemDetails)

## Problem details options

- typePrefix - [Reference](https://datatracker.ietf.org/doc/html/rfc7807#section-3.1)
- contentTypes - response content type, defaults to "application/problem+json"
- mapStatusCode - a function that creates default problem details in case there's no mapping for the current error or the `predicate` mapping didn't pass
- appendCacheHeaders - a function the add no cache response header
- includeExceptionDetails - a function that determines whether to include exception details or not.
- exceptionDetailsPropertyName - the property name that will have the error stack trace, defaults to `exceptionDetails`

### Cache headers

By default these headers will be added

```txt
"cache-control": "no-cache, no-store, must-revalidate"
"pragma": "no-cache"
"etag": "0"
"expires": "0"
```

You can modify this behaviour by changing appendCacheHeaders option

```typescript
// Default function
options.appendCacheHeaders = (setHeader) => {
	setHeader("cache-control", "no-cache, no-store, must-revalidate");
	setHeader("pragma", "no-cache");
	setHeader("etag", "0");
	setHeader("expires", "0");
};

// Do not add any cache header
options.appendCacheHeaders = (setHeader) => {};

// Add custom cache headers
options.appendCacheHeaders = (setHeader) => {
	setHeader("cache-control", "no-cache, no-store, must-revalidate");
	setHeader("pragma", "no-cache");
	setHeader("etag", "0");
	setHeader("expires", "0");
	setHeader("Last-Modified", "Wed, 21 Oct 2015 07:28:00 GMT"); // This line
};
```

## Framework support

The library support Koa.js and express.js out of the box

- Express

```typescript
import express from "express";
import { problemDetailsMiddleware } from "rfc-7807-problem-details";
const app = express();

// Should be added at the last of the middleware chain
app.use(problemDetailsMiddleware.express());
```

[Complete example](https://docs.page/ezzabuzaid/rfc-7807-problem-details/expressjs)

- Koa

```typescript
import Koa from "koa";
import { problemDetailsMiddleware } from "rfc-7807-problem-details";
const app = new Koa();

// Should be added at the start of the middleware chain
app.use(problemDetailsMiddleware.koa());
```

[Complete example](https://docs.page/ezzabuzaid/rfc-7807-problem-details/koa)

If you'd like to support custom framework take a look at the source code to see how you can do it.

For more examples check the **demo** directory.
