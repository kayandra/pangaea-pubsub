import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'

express()
  .use(bodyParser.json())
  .post('/:subscriber', async (req: Request, res: Response) => {
    console.log(
      `[subscriber]: subscriber "${
        req.params.subscriber
      }" payload received "${JSON.stringify(req.body)}"`,
    )

    res.sendStatus(200)
  })
  .listen(9000, () => console.log('Subscriber running on port 9000'))
