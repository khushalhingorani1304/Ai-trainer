import express from 'express'
import bcrypt from 'bcryptjs'
import { auth } from '../middleware/auth.js'
import User from '../models/User.js'
import Activity from '../models/Activity.js'

const router = express.Router()

// Register user
router.post('/register', async (req, res) => {
try {
const user = new User(req.body)
await user.save()
const token = user.generateAuthToken()
res.status(201).json({ user, token })
} catch (error) {
res.status(400).json({ error: error.message })
}
})

// Login user
router.post('/login', async (req, res) => {
try {
const { email, password } = req.body
const user = await User.findOne({ email })

if (!user) {
throw new Error('Invalid login credentials')
}

const isMatch = await bcrypt.compare(password, user.password)

if (!isMatch) {
throw new Error('Invalid login credentials')
}

const token = user.generateAuthToken()
res.json({ user, token })
} catch (error) {
res.status(400).json({ error: error.message })
}
})

// Get user profile
router.get('/profile', auth, async (req, res) => {
try {
const user = await User.findById(req.user._id)
.populate('friends', 'name avatar level')
.populate('groups', 'name avatar')
res.json(user)
} catch (error) {
res.status(500).json({ error: error.message })
}
})

// Update user profile
router.patch('/profile', auth, async (req, res) => {
const updates = Object.keys(req.body)
const allowedUpdates = ['name', 'password', 'avatar', 'preferences']
const isValidOperation = updates.every(update => allowedUpdates.includes(update))

if (!isValidOperation) {
return res.status(400).json({ error: 'Invalid updates!' })
}

try {
updates.forEach(update => req.user[update] = req.body[update])
await req.user.save()
res.json(req.user)
} catch (error) {
res.status(400).json({ error: error.message })
}
})

// Get user stats
router.get('/stats', auth, async (req, res) => {
try {
const activities = await Activity.find({ user: req.user._id })

const stats = {
totalWorkouts: activities.length,
totalCalories: activities.reduce((sum, act) => sum + act.calories, 0),
activityBreakdown: activities.reduce((acc, act) => {
acc[act.type] = (acc[act.type] || 0) + 1
return acc
}, {}),
averageAccuracy: activities.reduce((sum, act) => sum + act.accuracy, 0) / activities.length || 0
}

res.json(stats)
} catch (error) {
res.status(500).json({ error: error.message })
}
})

// Add friend
router.post('/friends/:id', auth, async (req, res) => {
try {
const friend = await User.findById(req.params.id)

if (!friend) {
return res.status(404).json({ error: 'User not found' })
}

if (req.user.friends.includes(friend._id)) {
return res.status(400).json({ error: 'Already friends' })
}

req.user.friends.push(friend._id)
await req.user.save()

res.json(req.user)
} catch (error) {
res.status(400).json({ error: error.message })
}
})

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
try {
const users = await User.find()
.sort({ totalScore: -1 })
.limit(100)
.select('name avatar level totalScore')

res.json(users)
} catch (error) {
res.status(500).json({ error: error.message })
}
})

// Signup Route
router.post("/signup", async (req, res) => {
    try {
      const { name, email, password } = req.body
      if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required." })
      }
  
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use." })
      }
  
      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = new User({ name, email, password: hashedPassword })
      await newUser.save()
  
      res.status(201).json({ message: "User registered successfully." })
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" })
    }
  })
  
export default router
