require('dotenv').config()
const bodyParser = require('koa-bodyparser')
const logger = require('koa-logger')
const recaptcha = require('..')
const app = new (require('koa'))()

const { SITEKEY, SITESECRET } = process.env

if (!SITEKEY || !SITESECRET) {
    console.error('missing required env vars SITEKEY and/or SITESECRET')
    process.exit(1)
}

const template = {
    homepage: sitekey => `
        <!doctype html>
        <script src="https://www.google.com/recaptcha/api.js" async defer></script>
        <form method="POST" action="/submit">
            <div class="g-recaptcha" data-sitekey="${sitekey}"></div>
            <br/>
            <button type="submit">Submit</button>
        </form>
    `,
}

app
    .use(logger())
    .use(bodyParser({ enableTypes: ['form'] }))
    .use(async ctx => {
        const { method, path } = ctx
        if (method === 'GET' && path === '/') {
            ctx.type = 'html'
            ctx.body = template.homepage(SITEKEY)
        } else if (method === 'POST' && path === '/submit') {
            const gresponse = ctx.request.body['g-recaptcha-response']
            const reply = await recaptcha(SITESECRET, gresponse, ctx.ip).catch(err => {
                if (typeof err === 'string') {
                    return ctx.throw(400, `recaptcha request failed: ${err}`)
                }
                throw err
            })

            ctx.body = reply
        }
    })
    .listen(3000, () => console.log('listening on 3000'))
