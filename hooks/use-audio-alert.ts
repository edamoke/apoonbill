"use client"

import { useState, useCallback, useEffect } from "react"

export function useAudioAlert(soundUrl: string = "/sounds/loud_alarm.mp3") {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)

  useEffect(() => {
    const a = new Audio(soundUrl)
    a.load()
    setAudio(a)
  }, [soundUrl])

  const unlock = useCallback(() => {
    if (audio && !isUnlocked) {
      // Play and immediately pause to "unlock" audio for the browser
      audio.play().then(() => {
        audio.pause()
        audio.currentTime = 0
        setIsUnlocked(true)
        console.log("[AudioAlert] Audio unlocked for this session")
      }).catch(err => {
        console.error("[AudioAlert] Failed to unlock audio:", err)
      })
    }
  }, [audio, isUnlocked])

  const playAlert = useCallback(() => {
    if (audio) {
      audio.currentTime = 0
      audio.volume = 1.0 // Ensure max volume
      audio.play().catch(err => {
        console.error("[AudioAlert] Failed to play alert:", err)
      })
    } else {
      console.warn("[AudioAlert] Audio not loaded yet")
    }
  }, [audio])

  return { playAlert, unlock, isUnlocked }
}
