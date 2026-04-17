"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

const gasData = [
  { name: "Gas Usage", level: 65 },
]

const beerData = [
  { name: "Beer Usage", level: 42 },
]

export function IotMonitors() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Gas Usage Monitor (ESP32)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative w-32 h-48 bg-muted rounded-t-lg rounded-b-xl border-4 border-muted-foreground/20 overflow-hidden mb-4">
             {/* Cylinder effect */}
            <div 
              className="absolute bottom-0 w-full bg-orange-500/80 transition-all duration-1000"
              style={{ height: `${gasData[0].level}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
              {gasData[0].level}%
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Real-time Gas Cylinder Level</p>
          <div className="w-full h-[150px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="level" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Keg Draft Beer Monitor (ESP32)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative w-32 h-48 bg-muted rounded-xl border-4 border-muted-foreground/20 overflow-hidden mb-4">
            {/* Keg effect */}
            <div 
              className="absolute bottom-0 w-full bg-yellow-500/80 transition-all duration-1000"
              style={{ height: `${beerData[0].level}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
              {beerData[0].level}%
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Real-time Beer Keg Volume</p>
          <div className="w-full h-[150px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={beerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="level" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
