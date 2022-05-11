Typescript implementation of [RFC 7870](https://datatracker.ietf.org/doc/html/rfc7807)
inspired from [https://www.nuget.org/packages/Hellang.Middleware.ProblemDetails/](Hellang ProblemDetails)

**Still work in progress**

## Problem details options

- typePrefix
- contentTypes
- isProblem
- mapStatusCode
- appendCacheHeaders

```typescript
import express from "express";
import { problemDetailsMiddleware } from "rfc-7807-problem-details";

const app = express();

app.use(
	problemDetailsMiddleware((options) => {
		// catch all error, needed to be added last.
		options.mapToStatusCode(Error, 500 /* Server Error */);
	})
);

const server = app.listen(3000);
```
