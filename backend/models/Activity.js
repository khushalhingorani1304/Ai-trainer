import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
user: {
type: mongoose.Schema.Types.ObjectId,
ref: 'User',
required: true
},
type: {
type: String,
required: true,
enum: ['pushup', 'squat', 'crunch', 'jumping_jack', 'plank', 'burpee']
},
count: {
type: Number,
required: true,
min: 0
},
duration: {
type: Number, // in seconds
required: true
},
calories: {
type: Number,
required: true
},
accuracy: {
type: Number,
required: true,
min: 0,
max: 100
},
feedback: [{
timestamp: {
type: Number,
required: true
},
message: {
type: String,
required: true
},
type: {
type: String,
enum: ['form', 'pace', 'achievement', 'warning'],
required: true
}
}],
challengeId: {
type: mongoose.Schema.Types.ObjectId,
ref: 'Challenge',
default: null
}
}, {
timestamps: true
})

const Activity = mongoose.model('Activity', activitySchema)
export default Activity
