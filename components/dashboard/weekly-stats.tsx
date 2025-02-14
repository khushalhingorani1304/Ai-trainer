"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { name: "Mon", exercises: 24 },
  { name: "Tue", exercises: 13 },
  { name: "Wed", exercises: 98 },
  { name: "Thu", exercises: 39 },
  { name: "Fri", exercises: 48 },
  { name: "Sat", exercises: 38 },
  { name: "Sun", exercises: 43 },
]

export function WeeklyStats() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Bar dataKey="exercises" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}

