import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import morgan from 'morgan'
import userRoutes from './routes/users.js'
import activityRoutes from './routes/activities.js'
import challengeRoutes from './routes/challenges.js'
import groupRoutes from './routes/groups.js'

const app = express()


// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))


// Routes
app.use('/api/users', userRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/challenges', challengeRoutes)
app.use('/api/groups', groupRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something broke!' })
})

// Database connection
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGODB_URL)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err))

export default app