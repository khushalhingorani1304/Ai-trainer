import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal } from "lucide-react"
import { cn } from "@/lib/utils"

const achievements = [
  {
    id: 1,
    title: "30-Day Warrior",
    description: "Completed a 30-day challenge",
    icon: Trophy,
    date: "2024-01-15",
    type: "gold",
  },
  {
    id: 2,
    title: "Push-up Master",
    description: "Completed 1000 push-ups",
    icon: Medal,
    date: "2024-02-01",
    type: "silver",
  },
  // Add more achievements...
]

export function Achievements() {
  return (
    <Card>
      <CardContent className="p-2">
        <ScrollArea className="h-[400px] px-6 py-4">
          <div className="space-y-6">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-start gap-4 border-b pb-4 last:border-0">
                <div
                  className={cn(
                    "rounded-full p-3",
                    achievement.type === "gold" && "bg-yellow-100 text-yellow-600",
                    achievement.type === "silver" && "bg-gray-100 text-gray-600",
                  )}
                >
                  <achievement.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-lg">{achievement.title}</p>
                    <Badge variant="secondary">{achievement.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <p className="text-xs text-muted-foreground">Achieved on {achievement.date}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
