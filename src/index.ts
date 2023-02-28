import express from 'express'
import bodyParser from "body-parser";
import { runDb } from './repositories/db';
import { blogsRouter } from './routers/blogsRouter';
import { postsRouter } from './routers/postsRouter';
import { authRouter } from './routers/authRouter';
import { usersRouter } from './routers/usersRouter';
import { commentsRouter } from './routers/commentsRouter';
import { testingRouter } from './routers/testingRouter';
export const app = express()
const port = process.env.PORT || 3001
;

const jsonBodyMiddleware = bodyParser.json()
app.use (jsonBodyMiddleware)

//прописываем наши роуты
app.use('/blogs', blogsRouter) 
app.use('/posts', postsRouter) 
app.use('/auth', authRouter) 
app.use('/testing', testingRouter)
app.use('/users', usersRouter)
app.use('/comments', commentsRouter)



const startApp = async () => {
  await runDb();
  app.listen(port, () => {
  console.log("Example app listening on port: ${port}");
  });
 };
 startApp();
