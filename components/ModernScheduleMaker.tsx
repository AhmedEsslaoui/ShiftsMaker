'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Plus, Trash2, Calendar, User, Save, Edit, Globe, Lock, BarChart, Archive, ChevronDown, ChevronUp } from 'lucide-react'

// Define types and initial data
type TaskType = 'Chat' | 'Emails' | 'All tasks' | 'All tasks/Chat assist'
type Task = { type: TaskType; additionalNote?: string }
type Agent = { name: string; tasks: (Task | null)[]; highlight?: boolean }
type ShiftType = 'Morning' | 'Day' | 'Afternoon' | 'Evening' | 'Night'
type ShiftTable = {
  id: string
  date: string
  senior: string
  shiftType: ShiftType
  timeSlots: string[]
  agents: Agent[]
  isLocked: boolean
  publishedTo: 'Egypt' | 'Morocco' | null
  isArchived: boolean
}

const shiftDetails: Record<ShiftType, { timeRange: string, slots: string[], theme: string }> = {
  'Morning': { timeRange: '8 AM to 4 PM', slots: ['8h to 9h', '9h to 10h', '10h to 11h', '11h to 12h', '12h to 13h', '13h to 14h', '14h to 15h', '15h to 16h'], theme: 'from-yellow-100 to-orange-100' },
  'Day': { timeRange: '4 PM to 12 AM', slots: ['16h to 17h', '17h to 18h', '18h to 19h', '19h to 20h', '20h to 21h', '21h to 22h', '22h to 23h', '23h to 00h'], theme: 'from-green-100 to-emerald-100' },
  'Afternoon': { timeRange: '12 PM to 8 PM', slots: ['12h to 13h', '13h to 14h', '14h to 15h', '15h to 16h', '16h to 17h', '17h to 18h', '18h to 19h', '19h to 20h'], theme: 'from-blue-100 to-cyan-100' },
  'Evening': { timeRange: '8 PM to 4 AM', slots: ['20h to 21h', '21h to 22h', '22h to 23h', '23h to 00h', '00h to 01h', '01h to 02h', '02h to 03h', '03h to 04h'], theme: 'from-purple-100 to-pink-100' },
  'Night': { timeRange: '12 AM to 8 AM', slots: ['00h to 01h', '01h to 02h', '02h to 03h', '03h to 04h', '04h to 05h', '05h to 06h', '06h to 07h', '07h to 08h'], theme: 'from-gray-100 to-slate-200' },
}

const taskTypes: TaskType[] = ['Chat', 'Emails', 'All tasks', 'All tasks/Chat assist']
const taskColors: Record<TaskType, string> = {
  'Chat': 'from-emerald-200 to-teal-200',
  'Emails': 'from-amber-200 to-yellow-200',
  'All tasks': 'from-rose-200 to-pink-200',
  'All tasks/Chat assist': 'from-violet-200 to-purple-200'
}

const initialAgents = {
  Morocco: [
    "Yasser Marrou", "Mariem Abdelhakmi", "Zaynab Adil", "Meryem Mazroui", "Mohammad Aznague",
    "Achraf Tazi", "Mohamed Elhachmi", "Mohamed ougrni", "Kenza Abbadi", "Marouan Bajbouji",
    "Hamza Sahraoui", "Nouhaila Essalih", "Nada Bennis", "Anis Boujmil"
  ],
  Egypt: [
    "Eman Anwer", "Noura Emam", "Mai Tarek Kamell Hessen", "Abdelhamid Khamis", "Ahmad Gamal Anwer",
    "Ahmad Sobhy", "Ahmed Moustafa", "Omnia Ahmed", "Mohammed Hamdy", "Ahmed Mohamed Ahmed",
    "Abdulrahman Sayed Gomaa Mohamed", "Ibrahim Zaki", "Amira Tarek Taher Megahed", "Esraa Osama",
    "Sara Mourad Wahba Mikhael", "Mahmoud Aataf", "Rawan AbdElbast", "Abdelaziz", "Mohamed Ali",
    "Moaz Yousef", "Eslam Nasser", "Asmaa Gamal Kamel", "Yasmine Tarek", "Asmaa Mohamed Zawam",
    "Nouran Ramdan", "Eman Mohsen", "Mohamed Osama", "Eslam Mohammed El Sayed Awad", "Shreif Abdrabo",
    "Michael Magdy", "Mohamedd Essam", "Sara Abdelrazek", "Ahmed Osama", "Hesham Adawy",
    "Sameh Adel Farah Ahmed", "Mohamed Mostafa Isawi Ali", "Mayan", "Amr Nady", "Abdulhamid Mostafa",
    "Fatima", "Youmna Yousef", "Heba Raafat", "Mahmoud Gamil abdelaziz", "Kareem abubakr",
    "Alaa Elsayed", "Rahma Hassan Abdelrahman", "Ahmed Shaaban"
  ]
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === 'admin' && password === 'Thinkdiffrent@123369') {
      const expirationTime = new Date().getTime() + 12 * 60 * 60 * 1000 // 12 hours from now
      localStorage.setItem('loginExpiration', expirationTime.toString())
      onLogin()
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <Card className="w-[350px] mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">
            <Lock className="mr-2 h-4 w-4" /> Login
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function AdminView({ shiftTables, setShiftTables }: { shiftTables: ShiftTable[], setShiftTables: React.Dispatch<React.SetStateAction<ShiftTable[]>> }) {
  const [newShiftType, setNewShiftType] = useState<ShiftType>('Morning')
  const [activeCountries, setActiveCountries] = useState<{ Egypt: boolean; Morocco: boolean }>({ Egypt: true, Morocco: false })
  const [agents, setAgents] = useState(initialAgents)
  const [newAgentName, setNewAgentName] = useState('')
  const [newAgentCountry, setNewAgentCountry] = useState<'Egypt' | 'Morocco'>('Egypt')

  const addNewShiftTable = () => {
    const newShiftTable: ShiftTable = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      senior: '',
      shiftType: newShiftType,
      timeSlots: shiftDetails[newShiftType].slots,
      agents: [],
      isLocked: false,
      publishedTo: null,
      isArchived: false
    }
    setShiftTables([...shiftTables, newShiftTable])
  }

  const removeShiftTable = (id: string) => {
    const updatedShiftTables = shiftTables.filter(table => table.id !== id)
    setShiftTables(updatedShiftTables)
  }

  const updateShiftTable = (id: string, field: keyof ShiftTable, value: string | boolean | null) => {
    const updatedShiftTables = shiftTables.map(table => 
      table.id === id ? { ...table, [field]: value } : table
    )
    setShiftTables(updatedShiftTables)
  }

  const addAgent = (tableId: string) => {
    const updatedShiftTables = shiftTables.map(table => {
      if (table.id === tableId) {
        const newAgent: Agent = {
          name: '',
          tasks: Array(table.timeSlots.length).fill(null)
        }
        return { ...table, agents: [...table.agents, newAgent] }
      }
      return table
    })
    setShiftTables(updatedShiftTables)
  }

  const updateAgentName = (tableId: string, agentIndex: number, name: string) => {
    const updatedShiftTables = shiftTables.map(table => {
      if (table.id === tableId) {
        const updatedAgents = [...table.agents]
        updatedAgents[agentIndex] = { ...updatedAgents[agentIndex], name }
        return { ...table, agents: updatedAgents }
      }
      return table
    })
    setShiftTables(updatedShiftTables)
  }

  const updateAgentTask = (tableId: string, agentIndex: number, taskIndex: number, taskType: TaskType) => {
    const updatedShiftTables = shiftTables.map(table => {
      if (table.id === tableId) {
        const updatedAgents = [...table.agents]
        updatedAgents[agentIndex].tasks[taskIndex] = { type: taskType }
        return { ...table, agents: updatedAgents }
      }
      return table
    })
    setShiftTables(updatedShiftTables)
  }

  const toggleLock = (id: string) => {
    const updatedShiftTables = shiftTables.map(table => 
      table.id === id ? { ...table, isLocked: !table.isLocked } : table
    )
    setShiftTables(updatedShiftTables)
  }

  const publishTable = (id: string) => {
    const activeCountry = activeCountries.Egypt ? 'Egypt' : 'Morocco'
    const updatedShiftTables = shiftTables.map(table => 
      table.id === id ? { ...table, publishedTo: activeCountry, isLocked: true } : table
    )
    setShiftTables(updatedShiftTables)
  }

  const unpublishTable = (id: string) => {
    const updatedShiftTables = shiftTables.map(table => 
      table.id === id ? { ...table, publishedTo: null } : table
    )
    setShiftTables(updatedShiftTables)
  }

  const addNewAgent = () => {
    if (newAgentName && newAgentCountry) {
      setAgents(prevAgents => ({
        ...prevAgents,
        [newAgentCountry]: [...prevAgents[newAgentCountry], newAgentName]
      }))
      setNewAgentName('')
    }
  }

  const archiveDay = (date: string) => {
    const updatedShiftTables = shiftTables.map(table => 
      table.date === date ? { ...table, isArchived: true } : table
    )
    setShiftTables(updatedShiftTables)
  }

  const canArchiveDay = (date: string) => {
    const tablesForDay = shiftTables.filter(table => table.date === date && !table.isArchived)
    const shiftTypes = new Set(tablesForDay.map(table => table.shiftType))
    return shiftTypes.has('Morning') && shiftTypes.has('Night')
  }

  const groupedTables = shiftTables
    .filter(table => !table.isArchived)
    .reduce((acc, table) => {
      if (!acc[table.date]) {
        acc[table.date] = []
      }
      acc[table.date].push(table)
      return acc
    }, {} as Record<string, ShiftTable[]>)

  const toggleActiveCountry = (country: 'Egypt' | 'Morocco') => {
    setActiveCountries(prev => {
      const newState = { ...prev, [country]: !prev[country] }
      if (newState.Egypt && newState.Morocco) {
        return country === 'Egypt' ? { Egypt: true, Morocco: false } : { Egypt: false, Morocco: true }
      }
      return newState
    })
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Label className="text-sm font-medium">Active Country:</Label>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="egypt-checkbox"
                  checked={activeCountries.Egypt}
                  onCheckedChange={() => toggleActiveCountry('Egypt')}
                />
                <label
                  htmlFor="egypt-checkbox"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Egypt
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="morocco-checkbox"
                  checked={activeCountries.Morocco}
                  onCheckedChange={() => toggleActiveCountry('Morocco')}
                />
                <label
                  htmlFor="morocco-checkbox"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Morocco
                </label>
              </div>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Add New Agent</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Agent</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-agent-name">Agent Name</Label>
                  <Input
                    id="new-agent-name"
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    placeholder="Enter agent name"
                  />
                </div>
                <div>
                  <Label htmlFor="new-agent-country">Country</Label>
                  <Select value={newAgentCountry} onValueChange={(value: 'Egypt' | 'Morocco') => setNewAgentCountry(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Egypt">Egypt</SelectItem>
                      <SelectItem value="Morocco">Morocco</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addNewAgent}>Add Agent</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <AnimatePresence>
        {Object.entries(groupedTables).map(([date, tables]) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold">{date}</h3>
            {tables.map((shiftTable) => (
              <Card key={shiftTable.id} className={cn("overflow-hidden bg-gradient-to-br", shiftDetails[shiftTable.shiftType].theme)}>
                <CardHeader className="bg-white bg-opacity-30 backdrop-blur-sm">
                  <CardTitle className="flex justify-between items-center">
                    <span>{shiftTable.shiftType} Shift</span>
                    <div className="space-x-2">
                      {shiftTable.publishedTo ? (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => unpublishTable(shiftTable.id)}
                        >
                          Unpublish
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => publishTable(shiftTable.id)}
                        >
                          <Globe className="mr-2 h-4 w-4" /> Publish
                        </Button>
                      )}
                      <Button 
                        variant="outline"
                        size="icon"
                        onClick={() => toggleLock(shiftTable.id)}
                        aria-label={shiftTable.isLocked ? "Edit schedule" : "Save schedule"}
                      >
                        {shiftTable.isLocked ? <Edit className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => removeShiftTable(shiftTable.id)}
                        aria-label="Remove shift table"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <div className="flex flex-wrap gap-4 items-center text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {shiftTable.isLocked ? (
                        <span>{shiftTable.senior}</span>
                      ) : (
                        <Input
                          type="text"
                          value={shiftTable.senior}
                          onChange={(e) => updateShiftTable(shiftTable.id, 'senior', e.target.value)}
                          placeholder="Senior name"
                          className="w-40"
                        />
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {shiftDetails[shiftTable.shiftType].timeRange}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[150px] bg-white bg-opacity-30 backdrop-blur-sm sticky left-0 z-20">Agent's Name</TableHead>
                          {shiftTable.timeSlots.map((slot, index) => (
                            <TableHead 
                              key={index} 
                              className="text-center bg-white bg-opacity-30 backdrop-blur-sm"
                            >
                              {slot}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {shiftTable.agents.map((agent, agentIndex) => (
                          <TableRow key={agentIndex}>
                            <TableCell 
                              className={cn(
                                "bg-white bg-opacity-30 backdrop-blur-sm sticky left-0 z-10",
                                agent.highlight && "bg-orange-200 bg-opacity-60"
                              )}
                            >
                              {shiftTable.isLocked ? (
                                <span>{agent.name}</span>
                              ) : (
                                <Select
                                  value={agent.name}
                                  onValueChange={(value) => updateAgentName(shiftTable.id, agentIndex, value)}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select agent" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {agents[activeCountries.Egypt ? 'Egypt' : 'Morocco'].map((agentName) => (
                                      <SelectItem key={agentName} value={agentName}>
                                        {agentName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                            {agent.tasks.map((task, taskIndex) => (
                              <TableCell 
                                key={taskIndex} 
                                className="p-1"
                              >
                                {shiftTable.isLocked ? (
                                  <div className={cn(
                                    "w-full h-full p-2 rounded",
                                    task ? `bg-gradient-to-r ${taskColors[task.type]}` : "bg-white"
                                  )}>
                                    {task?.type || '-'}
                                  </div>
                                ) : (
                                  <Select
                                    value={task?.type || ''}
                                    onValueChange={(value: TaskType) => updateAgentTask(shiftTable.id, agentIndex, taskIndex, value)}
                                  >
                                    <SelectTrigger className={cn(
                                      "w-full h-full border-0 focus:ring-0",
                                      task ? `bg-gradient-to-r ${taskColors[task.type]}` : "bg-white"
                                    )}>
                                      <SelectValue placeholder="Select task" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {taskTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                          {type}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {!shiftTable.isLocked && (
                    <div className="p-4">
                      <Button onClick={() => addAgent(shiftTable.id)} variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" /> Add Agent
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {canArchiveDay(date) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => archiveDay(date)}
                  className="mt-4 mx-auto block w-full max-w-md bg-gradient-to-r from-purple-400 to-pink-500 text-white hover:from-purple-500 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                >
                  <Archive className="mr-2 h-5 w-5" /> Archive Day
                </Button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-4 w-full">
            <Plus className="mr-2 h-4 w-4" /> Add New Shift Table
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Shift Type</DialogTitle>
          </DialogHeader>
          <Select value={newShiftType} onValueChange={(value: ShiftType) => setNewShiftType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select shift type" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(shiftDetails).map((shift) => (
                <SelectItem key={shift} value={shift}>
                  {shift} ({shiftDetails[shift as ShiftType].timeRange})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => { addNewShiftTable(); }}>Create Shift Table</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PublishedView({ shiftTables, country }: { shiftTables: ShiftTable[], country: 'Egypt' | 'Morocco' }) {
  const publishedTables = shiftTables.filter(table => table.publishedTo === country && !table.isArchived)

  return (
    <div className="container mx-auto p-4 space-y-8">
      {publishedTables.map((shiftTable) => (
        <Card key={shiftTable.id} className={cn("overflow-hidden bg-gradient-to-br", shiftDetails[shiftTable.shiftType].theme)}>
          <CardHeader className="bg-white bg-opacity-30 backdrop-blur-sm">
            <CardTitle>{shiftTable.shiftType} Shift</CardTitle>
            <div className="flex flex-wrap gap-4 items-center text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{shiftTable.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{shiftTable.senior}</span>
              </div>
              <span className="text-sm font-medium">
                {shiftDetails[shiftTable.shiftType].timeRange}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px] bg-white bg-opacity-30 backdrop-blur-sm sticky left-0 z-20">Agent's Name</TableHead>
                    {shiftTable.timeSlots.map((slot, index) => (
                      <TableHead 
                        key={index} 
                        className="text-center bg-white bg-opacity-30 backdrop-blur-sm"
                      >
                        {slot}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shiftTable.agents.map((agent, agentIndex) => (
                    <TableRow key={agentIndex}>
                      <TableCell 
                        className={cn(
                          "bg-white bg-opacity-30 backdrop-blur-sm sticky left-0 z-10",
                          agent.highlight && "bg-orange-200 bg-opacity-60"
                        )}
                      >
                        <span>{agent.name}</span>
                      </TableCell>
                      {agent.tasks.map((task, taskIndex) => (
                        <TableCell 
                          key={taskIndex} 
                          className="p-1"
                        >
                          <div className={cn(
                            "w-full h-full p-2 rounded",
                            task ? `bg-gradient-to-r ${taskColors[task.type]}` : "bg-white"
                          )}>
                            {task?.type || '-'}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
      {publishedTables.length === 0 && (
        <div className="text-center text-gray-500">No published schedules for {country}</div>
      )}
    </div>
  )
}

function AnalyticsView({ shiftTables }: { shiftTables: ShiftTable[] }) {
  const [selectedCountry, setSelectedCountry] = useState<'Egypt' | 'Morocco'>('Egypt')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filterType, setFilterType] = useState<'date-range' | 'all-time'>('all-time')

  const calculateAgentHours = (country: 'Egypt' | 'Morocco') => {
    const agentHours: Record<string, Record<TaskType, number>> = {}

    shiftTables.forEach(table => {
      if (table.publishedTo === country) {
        if (
          filterType === 'all-time' ||
          (filterType === 'date-range' && 
           (!startDate || table.date >= startDate) && 
           (!endDate || table.date <= endDate))
        ) {
          table.agents.forEach(agent => {
            if (!agentHours[agent.name]) {
              agentHours[agent.name] = {
                'Chat': 0,
                'Emails': 0,
                'All tasks': 0,
                'All tasks/Chat assist': 0
              }
            }

            agent.tasks.forEach(task => {
              if (task) {
                agentHours[agent.name][task.type] += 1 // Assuming each task is 1 hour
              }
            })
          })
        }
      }
    })

    return agentHours
  }

  const agentHours = calculateAgentHours(selectedCountry)

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Analytics</h2>
          <div className="flex items-center space-x-4">
            <Select value={selectedCountry} onValueChange={(value: 'Egypt' | 'Morocco') => setSelectedCountry(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Egypt">Egypt</SelectItem>
                <SelectItem value="Morocco">Morocco</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={(value: 'date-range' | 'all-time') => setFilterType(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-range">Date Range</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {filterType === 'date-range' && (
          <div className="flex items-center space-x-4 mt-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Work Hours - {selectedCountry}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent Name</TableHead>
                <TableHead>Chat</TableHead>
                <TableHead>Emails</TableHead>
                <TableHead>All tasks</TableHead>
                <TableHead>All tasks/Chat assist</TableHead>
                <TableHead>Total Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(agentHours).map(([agentName, hours]) => (
                <TableRow key={agentName}>
                  <TableCell>{agentName}</TableCell>
                  <TableCell>{hours['Chat']}</TableCell>
                  <TableCell>{hours['Emails']}</TableCell>
                  <TableCell>{hours['All tasks']}</TableCell>
                  <TableCell>{hours['All tasks/Chat assist']}</TableCell>
                  <TableCell>{Object.values(hours).reduce((a, b) => a + b, 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function ArchiveView({ shiftTables }: { shiftTables: ShiftTable[] }) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null)

  const archivedDates = [...new Set(shiftTables.filter(table => table.isArchived).map(table => table.date))]

  const toggleExpand = (date: string) => {
    setExpandedDate(expandedDate === date ? null : date)
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h2 className="text-2xl font-bold mb-4">Archived Schedules</h2>
      {archivedDates.map(date => (
        <Card key={date} className="overflow-hidden">
          <CardHeader 
            className="cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors"
            onClick={() => toggleExpand(date)}
          >
            <CardTitle className="flex justify-between items-center">
              <span>{date}</span>
              {expandedDate === date ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
          <AnimatePresence>
            {expandedDate === date && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent>
                  {shiftTables
                    .filter(table => table.date === date && table.isArchived)
                    .map(shiftTable => (
                      <Card key={shiftTable.id} className={cn("mt-4 overflow-hidden bg-gradient-to-br", shiftDetails[shiftTable.shiftType].theme)}>
                        <CardHeader className="bg-white bg-opacity-30 backdrop-blur-sm">
                          <CardTitle>{shiftTable.shiftType} Shift</CardTitle>
                          <div className="flex flex-wrap gap-4 items-center text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{shiftTable.senior}</span>
                            </div>
                            <span className="text-sm font-medium">
                              {shiftDetails[shiftTable.shiftType].timeRange}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[150px] bg-white bg-opacity-30 backdrop-blur-sm sticky left-0 z-20">Agent's Name</TableHead>
                                  {shiftTable.timeSlots.map((slot, index) => (
                                    <TableHead 
                                      key={index} 
                                      className="text-center bg-white bg-opacity-30 backdrop-blur-sm"
                                    >
                                      {slot}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {shiftTable.agents.map((agent, agentIndex) => (
                                  <TableRow key={agentIndex}>
                                    <TableCell 
                                      className={cn(
                                        "bg-white bg-opacity-30 backdrop-blur-sm sticky left-0 z-10",
                                        agent.highlight && "bg-orange-200 bg-opacity-60"
                                      )}
                                    >
                                      <span>{agent.name}</span>
                                    </TableCell>
                                    {agent.tasks.map((task, taskIndex) => (
                                      <TableCell 
                                        key={taskIndex} 
                                        className="p-1"
                                      >
                                        <div className={cn(
                                          "w-full h-full p-2 rounded",
                                          task ? `bg-gradient-to-r ${taskColors[task.type]}` : "bg-white"
                                        )}>
                                          {task?.type || '-'}
                                        </div>
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      ))}
      {archivedDates.length === 0 && (
        <div className="text-center text-gray-500">No archived schedules</div>
      )}
    </div>
  )
}

export default function ModernScheduleMaker() {
  const [shiftTables, setShiftTables] = useState<ShiftTable[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkLoginStatus = () => {
      const expirationTime = localStorage.getItem('loginExpiration')
      if (expirationTime && new Date().getTime() < parseInt(expirationTime)) {
        setIsLoggedIn(true)
      } else {
        setIsLoggedIn(false)
        localStorage.removeItem('loginExpiration')
      }
    }

    checkLoginStatus()
    const interval = setInterval(checkLoginStatus, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  return (
    <Tabs defaultValue="admin" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="admin">Admin</TabsTrigger>
        <TabsTrigger value="analytics" disabled={!isLoggedIn}>
          {isLoggedIn ? 'Analytics' : <Lock className="h-4 w-4" />}
        </TabsTrigger>
        <TabsTrigger value="archive" disabled={!isLoggedIn}>
          {isLoggedIn ? 'Archive' : <Lock className="h-4 w-4" />}
        </TabsTrigger>
        <TabsTrigger value="egypt">Egypt</TabsTrigger>
        <TabsTrigger value="morocco">Morocco</TabsTrigger>
      </TabsList>
      <TabsContent value="admin">
        {isLoggedIn ? (
          <AdminView shiftTables={shiftTables} setShiftTables={setShiftTables} />
        ) : (
          <LoginForm onLogin={handleLogin} />
        )}
      </TabsContent>
      <TabsContent value="analytics">
        {isLoggedIn && <AnalyticsView shiftTables={shiftTables} />}
      </TabsContent>
      <TabsContent value="archive">
        {isLoggedIn && <ArchiveView shiftTables={shiftTables} />}
      </TabsContent>
      <TabsContent value="egypt">
        <PublishedView shiftTables={shiftTables} country="Egypt" />
      </TabsContent>
      <TabsContent value="morocco">
        <PublishedView shiftTables={shiftTables} country="Morocco" />
      </TabsContent>
    </Tabs>
  )
}