"use client"

import { CheckCircle2 } from "lucide-react"

const exercises = [
  {
    name: "Morning Squats",
    target: 30,
    completed: 30,
    status: "completed",
  },
  {
    name: "Push-ups",
    target: 20,
    completed: 15,
    status: "in-progress",
  },
  {
    name: "Crunches",
    target: 50,
    completed: 0,
    status: "not-started",
  },
]

export function DailyProgress() {
  return (
    <div className="space-y-8">
      {exercises.map((exercise) => (
        <div key={exercise.name} className="flex items-center">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{exercise.name}</p>
            <p className="text-sm text-muted-foreground">
              {exercise.completed} / {exercise.target} completed
            </p>
          </div>
          {exercise.status === "completed" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
        </div>
      ))}
    </div>
  )
}

