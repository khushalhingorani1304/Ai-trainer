import express from 'express'
import { auth } from '../middleware/auth.js'
import Challenge from '../models/Challenge.js'

const router = express.Router()

// Create challenge
router.post('/', auth, async (req, res) => {
  try {
    const challenge = new Challenge({
      ...req.body,
      creator: req.user._id
    })
    await challenge.save()
    res.status(201).json(challenge)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get all challenges
router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.find()
      .populate('creator', 'name avatar')
      .populate('participants.user', 'name avatar')
    res.json(challenges)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Get challenge by id
router.get('/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('creator', 'name avatar')
      .populate('participants.user', 'name avatar')
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' })
    }
    
    res.json(challenge)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Join challenge
router.post('/:id/join', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' })
    }

    const isParticipant = challenge.participants.some(
      p => p.user.toString() === req.user._id.toString()
    )

    if (isParticipant) {
      return res.status(400).json({ error: 'Already joined this challenge' })
    }

    challenge.participants.push({
      user: req.user._id,
      progress: 0
    })

    await challenge.save()
    res.json(challenge)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update challenge progress
router.patch('/:id/progress', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' })
    }

    const participant = challenge.participants.find(
      p => p.user.toString() === req.user._id.toString()
    )

    if (!participant) {
      return res.status(400).json({ error: 'Not a participant in this challenge' })
    }

    participant.progress = req.body.progress
    await challenge.save()
    res.json(challenge)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router