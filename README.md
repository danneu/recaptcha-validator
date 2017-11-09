# recaptcha-validator

A simple library that makes API requests to Google's Recaptcha
service to confirm Recaptcha tokens.

<https://developers.google.com/recaptcha/intro>

Supports Recaptcha v2 / Invisible.

```javascript
const recaptcha = require('recaptcha-validator')

recaptcha(sitesecret, gRecaptchaResponse, clientIpAddress)
  .then(reply => console.log(reply))
  .catch(err => console.error('recaptcha confirmation failed:', err))
```

## Usage

Check out the `example/` folder for a complete but minimal example.

`recaptcha()` returns a promise that resolves with google's reply
if the request was successful.

It fails with `typeof err === 'string'` if the recaptcha api
reports a problem with the request.

- missing-input-secret: The secret parameter is missing.
- invalid-input-secret: The secret parameter is invalid or malformed.
- missing-input-response: The response parameter is missing.
- invalid-input-response: The response parameter is invalid or malformed.
- bad-request: The request is invalid or malformed.
- unspecified-error

Else the error will be an `Error` object representing network error.

Here's an example response upon success:

```json
{ success: true,
  challenge_ts: '2017-11-09T23:12:08Z',
  hostname: 'localhost' }
```

`hostname` only appears on successful requests and you can use it to
ensure recaptcha submissions are originating from your domain.

More info: https://developers.google.com/recaptcha/docs/domain_validation