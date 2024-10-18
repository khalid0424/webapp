'use client'

import { useState, useEffect, useCallback } from 'react'
import { DollarSign, Trophy, Gift, ArrowUp, Zap, RotateCw } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const achievements = [
  { id: 1, name: "Оғози роҳ", requirement: 10, description: "10 KhalidTokens ҷамъ кунед" },
  { id: 2, name: "Сармоягузори хурд", requirement: 100, description: "100 KhalidTokens ҷамъ кунед" },
  { id: 3, name: "Миллионер", requirement: 1000, description: "1000 KhalidTokens ҷамъ кунед" },
  { id: 4, name: "Миллиардер", requirement: 1000000, description: "1,000,000 KhalidTokens ҷамъ кунед" },
]

const upgrades = [
  { id: 1, name: "Қувваи клик", baseCost: 10, costMultiplier: 1.5, powerIncrease: 1, icon: ArrowUp },
  { id: 2, name: "Автоклик", baseCost: 100, costMultiplier: 2, powerIncrease: 1, icon: RotateCw },
  { id: 3, name: "Мултипликатор", baseCost: 1000, costMultiplier: 3, powerIncrease: 2, icon: Zap },
]

export default function Component() {
  const [khalidTokens, setKhalidTokens] = useState(0)
  const [clickPower, setClickPower] = useState(1)
  const [autoClickPower, setAutoClickPower] = useState(0)
  const [multiplier, setMultiplier] = useState(1)
  const [message, setMessage] = useState('')
  const [unlockedAchievements, setUnlockedAchievements] = useState<number[]>([])
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 })
  const [upgradeLevels, setUpgradeLevels] = useState<{ [key: number]: number }>({1: 0, 2: 0, 3: 0})
  const [lastDailyBonus, setLastDailyBonus] = useState<number | null>(null)
  const { toast } = useToast()

  const playSound = useCallback((soundName: string) => {
    console.log(`Playing sound: ${soundName}`)
  }, [])

  const incrementTokens = useCallback((amount: number, e?: React.MouseEvent) => {
    setKhalidTokens(prevTokens => prevTokens + amount * multiplier)
    setMessage(`+${amount * multiplier}`)
    setTimeout(() => setMessage(''), 500)
    if (e) {
      setClickPosition({ x: e.clientX, y: e.clientY })
    }
    playSound('click')
  }, [multiplier, playSound])

  const handleClick = useCallback((e: React.MouseEvent) => {
    incrementTokens(clickPower, e)
  }, [incrementTokens, clickPower])

  const upgradeItem = useCallback((upgradeId: number) => {
    const upgrade = upgrades.find(u => u.id === upgradeId)
    if (!upgrade) return

    const currentLevel = upgradeLevels[upgradeId] || 0
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel))

    if (khalidTokens >= cost) {
      setKhalidTokens(prevTokens => prevTokens - cost)
      setUpgradeLevels(prevLevels => ({...prevLevels, [upgradeId]: currentLevel + 1}))

      switch(upgradeId) {
        case 1:
          setClickPower(prevPower => prevPower + upgrade.powerIncrease)
          break
        case 2:
          setAutoClickPower(prevPower => prevPower + upgrade.powerIncrease)
          break
        case 3:
          setMultiplier(prevMultiplier => prevMultiplier + upgrade.powerIncrease)
          break
      }

      playSound('upgrade')
      toast({
        title: "Баланд бардошта шуд!",
        description: `${upgrade.name} баланд бардошта шуд!`,
      })
    } else {
      toast({
        title: "Хато!",
        description: "KhalidTokens кифоя нест!",
        variant: "destructive",
      })
    }
  }, [khalidTokens, upgradeLevels, playSound, toast])

  const claimDailyBonus = useCallback(() => {
    const now = Date.now()
    if (!lastDailyBonus || now - lastDailyBonus > 24 * 60 * 60 * 1000) {
      const bonus = Math.floor(100 * Math.pow(1.5, upgradeLevels[3] || 0))
      setKhalidTokens(prevTokens => prevTokens + bonus)
      setLastDailyBonus(now)
      toast({
        title: "Бонус!",
        description: `Шумо ${bonus} KhalidTokens бонус гирифтед!`,
      })
      playSound('bonus')
    } else {
      toast({
        title: "Хато!",
        description: "Шумо аллакай бонуси имрӯзаро гирифтед!",
        variant: "destructive",
      })
    }
  }, [lastDailyBonus, upgradeLevels, playSound, toast])

  useEffect(() => {
    const savedData = localStorage.getItem('khalidTokenData')
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      setKhalidTokens(parsedData.khalidTokens)
      setClickPower(parsedData.clickPower)
      setAutoClickPower(parsedData.autoClickPower)
      setMultiplier(parsedData.multiplier)
      setUnlockedAchievements(parsedData.unlockedAchievements)
      setUpgradeLevels(parsedData.upgradeLevels)
      setLastDailyBonus(parsedData.lastDailyBonus)
    }
  }, [])

  useEffect(() => {
    const saveData = () => {
      const dataToSave = {
        khalidTokens,
        clickPower,
        autoClickPower,
        multiplier,
        unlockedAchievements,
        upgradeLevels,
        lastDailyBonus
      }
      localStorage.setItem('khalidTokenData', JSON.stringify(dataToSave))
    }

    saveData()

    const autoClickInterval = setInterval(() => {
      if (autoClickPower > 0) {
        incrementTokens(autoClickPower)
      }
    }, 1000)

    return () => {
      clearInterval(autoClickInterval)
      saveData()
    }
  }, [khalidTokens, clickPower, autoClickPower, multiplier, unlockedAchievements, upgradeLevels, lastDailyBonus, incrementTokens])

  useEffect(() => {
    achievements.forEach(achievement => {
      if (khalidTokens >= achievement.requirement && !unlockedAchievements.includes(achievement.id)) {
        setUnlockedAchievements(prev => [...prev, achievement.id])
        toast({
          title: "Дастоварди нав!",
          description: `Дастоварди нав кушода шуд: ${achievement.name}!`,
        })
        playSound('achievement')
      }
    })
  }, [khalidTokens, unlockedAchievements, playSound, toast])

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col items-center justify-between p-4 bg-gradient-to-b from-purple-900 to-indigo-900">
        <Card className="w-full max-w-md bg-black/50 backdrop-blur-md border-none text-white">
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-bold text-center">Бозии KhalidToken</CardTitle>
            <CardDescription className="text-xl md:text-2xl text-center text-gray-300">KhalidTokens-и шумо:</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl md:text-5xl font-bold text-center text-yellow-400 mb-4" aria-live="polite">
              {Math.floor(khalidTokens).toLocaleString()}
            </p>
            <div className="flex justify-between text-sm">
              <Tooltip>
                <TooltipTrigger>
                  <p>Қувваи клик: {clickPower}</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Миқдори KhalidTokens, ки бо ҳар як клик ба даст меояд</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <p>Автоклик: {autoClickPower}/сония</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Миқдори KhalidTokens, ки ҳар сония ба таври худкор ба даст меояд</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <p>Мултипликатор: x{multiplier}</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Зарбкунандаи ҳамаи KhalidTokens-ҳои ба даст овардашуда</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        <div className="my-8 relative">
          <button 
            onClick={handleClick}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-full p-8 transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50 shadow-lg"
            aria-label="Зиёд кардани KhalidTokens"
          >
            <DollarSign size={64} />
          </button>
          {message && (
            <div 
              className="absolute pointer-events-none text-yellow-400 font-bold text-2xl"
              style={{
                left: clickPosition.x,
                top: clickPosition.y,
                animation: 'float-up 1s ease-out',
                opacity: 1,
              }}
            >
              +{message}
            </div>
          )}
        </div>

        <Card className="w-full max-w-md bg-black/50 backdrop-blur-md border-none text-white mb-4">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Баланд бардоштани қувва</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {upgrades.map(upgrade => {
              const level = upgradeLevels[upgrade.id] || 0
              const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level))
              const Icon = upgrade.icon
              return (
                <Tooltip key={upgrade.id}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => upgradeItem(upgrade.id)}
                      className="w-full"
                      disabled={khalidTokens < cost}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {upgrade.name} (Сатҳ {level}) - {cost.toLocaleString()} KhalidTokens
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{upgrade.name} қувваи шуморо зиёд мекунад</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </CardContent>
        </Card>

        <Button
          onClick={claimDailyBonus}
          className="mb-4"
          disabled={lastDailyBonus && Date.now() - lastDailyBonus < 24 * 60 * 60 * 1000}
        >
          <Gift className="mr-2" /> Бонуси ҳаррӯза
        </Button>

        <Card className="w-full max-w-md bg-black/50 backdrop-blur-md border-none text-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Дастовардҳо</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {achievements.map(achievement => (
              <div key={achievement.id} className="mb-2">
                <div className={`flex items-center ${unlockedAchievements.includes(achievement.id) ? 'text-yellow-400' : 'text-gray-400'}`}>
                  <Trophy className="mr-2" size={16} />
                  <span>{achievement.name}</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Progress value={(khalidTokens / achievement.requirement) * 100} className="h-2" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{achievement.description}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </CardContent>
        </Card>

        <Toaster />

        <style jsx>{`
          @keyframes float-up {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-50px); opacity: 0; }
          }
        `}</style>
      </div>
    
    </TooltipProvider>
  )
}