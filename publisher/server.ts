import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import fetch from 'node-fetch'
import bodyParser from 'body-parser'
import cors from 'cors'
import Keyv from 'keyv'
import isUrl from 'is-url'

const app = express()
const store = new Keyv<Array<string>>()
const processValidation = (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }
}

app.use(bodyParser.json())
app.use(cors())

app.post(
  '/subscribe/:topic',
  body('url').custom((value) => isUrl(value)),
  async (req: Request, res: Response) => {
    processValidation(req, res)

    const url = req.body.url
    const topic = req.params.topic
    const subscribers = (await store.get(topic)) ?? []
    const uniqueSubscribers = [...subscribers, url].filter(
      (value, index, self) => self.indexOf(value) === index,
    )

    await store.set(topic, uniqueSubscribers)

    console.log(`[publisher]: new subscriber "${url}" for topic "${topic}"`)

    res.json({ url, topic })
  },
)

app.post('/publish/:topic', async (req: Request, res: Response) => {
  processValidation(req, res)

  const topic = req.params.topic
  const payload = { topic, data: req.body }
  const subscribers = (await store.get(topic)) ?? []

  try {
    await Promise.all(
      subscribers.map((subscriber) => {
        console.log(
          `[publisher]: sending payload "${JSON.stringify(
            payload,
          )}" on topic "${topic}" to subscriber "${subscriber}"`,
        )

        return fetch(subscriber, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    )

    res.sendStatus(202)
  } catch (error) {
    res.sendStatus(400)
  }
})

app.listen(8000, () => console.log('Publisher running on port 8000'))
