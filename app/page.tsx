import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, Activity, Target } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Transform Your Fitness Journey</h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
        Achieve your fitness goals with personalized trainer, challenges, and expert guidance. 
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/challenges">View Challenges</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
      <Card>
          <CardHeader>
            <Activity className="w-8 h-8 text-primary mb-2" />
            <CardTitle>Track Progress</CardTitle>
            <CardDescription>Monitor your exerciese live</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Users className="w-8 h-8 text-primary mb-2" />
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>Climb the leaderboard to the top</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Trophy className="w-8 h-8 text-primary mb-2" />
            <CardTitle>Compete & Win</CardTitle>
            <CardDescription>Join challenges and climb the leaderboard</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Target className="w-8 h-8 text-primary mb-2" />
            <CardTitle>Set Goals</CardTitle>
            <CardDescription>Achieve your fitness targets</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

