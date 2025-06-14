import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary from './configs/cloudinary.js'
import courseRouter from './routes/courseRoute.js'
import userRouter from './routes/userRoutes.js'
import { corsHandler } from './middlewares/corsHandler.js'

// ... after cors middleware
app.use(corsHandler)
const app = express()

await connectDB()
await connectCloudinary()
app.use(cors())
app.use(clerkMiddleware())

const corsOptions = {
  origin: [
    'https://upskillify.vercel.app', // Your frontend domain
    'http://localhost:3000' // For local development
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
}

app.get('/',(req,res)=>res.send("api working"))

app.post('/clerk',express.json(),clerkWebhooks)

app.use('/api/educator', clerkMiddleware(), educatorRouter)
app.use('/api/user', clerkMiddleware(), userRouter)

// Keep public routes without middleware
app.use('/api/course', courseRouter)

app.post('/stripe',express.raw({type: 'application/json'}), stripeWebhooks)

app.use(cors(corsOptions))
app.options('*', cors(corsOptions)) // Handle preflight requests

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})