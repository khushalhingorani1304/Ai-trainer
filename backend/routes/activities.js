import express from 'express'
import { auth } from '../middleware/auth.js'
import Activity from '../models/Activity.js'
import User from '../models/User.js'

const router = express.Router()

// Record new activity
router.post('/', auth, async (req, res) => {
try {
const activity = new Activity({
...req.body,
user: req.user._id
})

await activity.save()

// Update user experience and score
const experienceGained = Math.floor(activity.count * activity.accuracy / 10)
req.user.experience += experienceGained
req.user.totalScore += activity.count

// Level up logic
const newLevel = Math.floor(req.user.experience / 1000) + 1
if (newLevel > req.user.level) {
req.user.level = newLevel
// Add level-up achievement
req.user.achievements.push({
type: 'level',
name: `Reached Level ${newLevel}`
})
}

await req.user.save()
res.status(201).json(activity)
} catch (error) {
res.status(400).json({ error: error.message })
}
})

// Get user activities
router.get('/', auth, async (req, res) => {
try {
const match = {}
const sort = {}

if (req.query.type) {
match.type = req.query.type
}

if (req.query.sortBy) {
const parts = req.query.sortBy.split(':')
sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
}

const activities = await Activity.find({ user: req.user._id, ...match })
.sort(sort)
.limit(parseInt(req.query.limit))
.skip(parseInt(req.query.skip))

res.json(activities)
} catch (error) {
res.status(500).json({ error: error.message })
}
})

// Get activity by id
router.get('/:id', auth, async (req, res) => {
try {
const activity = await Activity.findOne({
_id: req.params.id,
user: req.user._id
})

if (!activity) {
return res.status(404).json({ error: 'Activity not found' })
}

res.json(activity)
} catch (error) {
res.status(500).json({ error: error.message })
}
})

// Get activity statistics
router.get('/stats/summary', auth, async (req, res) => {
try {
const stats = await Activity.aggregate([
{
$match: { user: req.user._id }
},
{
$group: {
_id: '$type',
totalCount: { $sum: '$count' },
totalCalories: { $sum: '$calories' },
averageAccuracy: { $avg: '$accuracy' },
totalDuration: { $sum: '$duration' }
}
}
])

res.json(stats)
} catch (error) {
res.status(500).json({ error: error.message })
}
})

export default router
