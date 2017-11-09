const debug = require('debug')('recaptcha-request')
const https = require('https')
const querystring = require('querystring')

const options = {
    hostname: 'www.google.com',
    port: 443,
    path: '/recaptcha/api/siteverify',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
}

module.exports = (secret, response, remoteip = '') => {
    if (typeof secret !== 'string') {
        throw new TypeError('must provide secret')
    }

    if (typeof response !== 'string') {
        throw new TypeError('must provide g-recaptcha-response token')
    }

    return new Promise(function(resolve, reject) {
        const req = https.request(options, res => {
            res.setEncoding('utf8')

            let json = ''

            res.on('data', chunk => {
                json += chunk
            })

            res.on('error', err => {
                debug('Caught recaptcha error: ', err)
                reject(err)
            })

            res.on('end', () => {
                debug('Raw Response: ', json)

                let body
                try {
                    body = JSON.parse(json)
                } catch (err) {
                    console.warn('Caught exception when parsing response: ', json)
                    return reject('unspecified-error')
                }

                if (body.success) {
                    return resolve(body)
                }

                const err = Array.isArray(body['error-codes'])
                    ? body['error-codes'][0] || 'unspecified-error'
                    : 'unspecified-error'

                reject(err)
            })
        })

        req.on('error', err => {
            debug('Recaptcha request error: ', err)
            reject(err)
        })

        const postData = querystring.stringify({
            secret,
            response,
            remoteip,
        })

        debug('POSTing: ', postData)

        req.write(postData)
        req.end()
    })
}
