

## [1.0.0](https://github.com/ezzabuzaid/rfc-7807-problem-details/compare/0.2.5...1.0.0) (2022-05-15)


### ⚠ BREAKING CHANGES

* decouble middleware from problem details handling

### Bug Fixes

* decouble middleware from problem details handling ([4e2ab91](https://github.com/ezzabuzaid/rfc-7807-problem-details/commit/4e2ab91827e5c59203cf550c1a55b2fc2a4b04f3))
* use instance of to find the correct constructor of error object ([6708ba8](https://github.com/ezzabuzaid/rfc-7807-problem-details/commit/6708ba87abceeadd6e13ebe30ba7fc9fdbcf0a99))

### [0.2.5](https://github.com/ezzabuzaid/rfc-7807-problem-details/compare/0.2.4...0.2.5) (2022-05-14)


### Bug Fixes

* set detail to equal Error instance message if not present ([3ef4419](https://github.com/ezzabuzaid/rfc-7807-problem-details/commit/3ef44198af53dcc147b87e2e7064fcb7aa8c4094))

### [0.2.4](https://github.com/ezzabuzaid/rfc-7807-problem-details/compare/0.2.3...0.2.4) (2022-05-14)


### Bug Fixes

* make configure parameter optional ([1d56139](https://github.com/ezzabuzaid/rfc-7807-problem-details/commit/1d56139727cb63cdf408314bd2affbb7805e8a3e))

### [0.2.3](https://github.com/ezzabuzaid/rfc-7807-problem-details/compare/0.2.2...0.2.3) (2022-05-13)


### Bug Fixes

* pass problem details as is when passed to ProblemDetailsException ([e83596d](https://github.com/ezzabuzaid/rfc-7807-problem-details/commit/e83596d538751b08507db09340c8ea37dd95449c))

### [0.2.2](https://github.com/ezzabuzaid/rfc-7807-problem-details/compare/0.2.1...0.2.2) (2022-05-12)


### Bug Fixes

* ignore prefixing type if it starts with http or https ([1b4c63a](https://github.com/ezzabuzaid/rfc-7807-problem-details/commit/1b4c63a356970cacfd9f89f69ced34d3d27fce5b))

### [0.2.1](https://github.com/ezzabuzaid/rfc-7807-problem-details/compare/0.2.0...0.2.1) (2022-05-11)


### Bug Fixes

* set type to about:blank if not present ([2496d8c](https://github.com/ezzabuzaid/rfc-7807-problem-details/commit/2496d8cbed13309074f7d4e08f99507a1f37fa40))

## 0.2.0 (2022-05-11)


### Features

* add exception details ([90fb76b](https://github.com/ezzabuzaid/rfc-7807-problem-details/commit/90fb76bbe33ab7cf64c359752819b1b2715f1d87))
* add ProblemDetailsException ([7c0da23](https://github.com/ezzabuzaid/rfc-7807-problem-details/commit/7c0da2335bff535308b939c701f0a6efccc3c1a9))