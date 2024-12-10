'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch";
import { 
  Lock, 
  LogOut, 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  Save, 
  Edit, 
  Globe, 
  BarChart, 
  Archive, 
  ChevronDown, 
  ChevronUp,
  Flag,
  ArrowUpFromLine,
  Clock
} from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import toast from 'react-hot-toast'
import { loadShiftTables, saveShiftTables, loadAgents, saveAgents } from '@/lib/firebase'
import type { ShiftTable, ShiftType, Task, Agent } from '@/types/types'
import type { TaskType as ImportedTaskType } from '@/types/types'

type TaskType = ImportedTaskType;

const shiftDetails: Record<ShiftType, { timeRange: string, timeSlots: string[], theme: string }> = {
  'Morning': { 
    timeRange: '8 AM to 4 PM', 
    timeSlots: ['8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00'], 
    theme: 'from-yellow-100 to-orange-100' 
  },
  'Day': { 
    timeRange: '4 PM to 12 AM', 
    timeSlots: ['16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:00', '22:00-23:00', '23:00-00:00'], 
    theme: 'from-green-100 to-emerald-100' 
  },
  'Afternoon': { 
    timeRange: '12 PM to 8 PM', 
    timeSlots: ['12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00'], 
    theme: 'from-blue-100 to-cyan-100' 
  },
  'Evening': { 
    timeRange: '8 PM to 4 AM', 
    timeSlots: ['20:00-21:00', '21:00-22:00', '22:00-23:00', '23:00-00:00', '00:00-01:00', '01:00-02:00', '02:00-03:00', '03:00-04:00'], 
    theme: 'from-purple-100 to-pink-100' 
  },
  'Night': { 
    timeRange: '12 AM to 8 AM', 
    timeSlots: ['00:00-01:00', '01:00-02:00', '02:00-03:00', '03:00-04:00', '04:00-05:00', '05:00-06:00', '06:00-07:00', '07:00-08:00'], 
    theme: 'from-gray-100 to-slate-200' 
  },
}

const shiftOrder: Record<ShiftType, number> = {
  'Morning': 0,
  'Day': 1,
  'Afternoon': 2,
  'Evening': 3,
  'Night': 4
};

const taskTypesByCountry: Record<string, TaskType[]> = {
  'Egypt': [
    'Chat',
    'Appeals/Reviews',
    'Appeals/Reviews/Calls',
    'Calls',
    'Calls /App follow',
    'Emails',
    'Appeals/Reviews/Calls/App follow',
    'App follow',
    'Break',
    'Sick'
  ],
  'Morocco': [
    'Morocco_Chat',
    'Morocco_Chat_Appeals',
    'Morocco_Chat_Emails',
    'Morocco_Emails_Appeals',
    'Morocco_Emails_Reviews',
    'Morocco_All_Tasks',
    'Morocco_Break',
    'Sick'
  ]
};

const taskOptions = {
  Egypt: [
    { value: 'Chat', label: 'Chat' },
    { value: 'Appeals/Reviews', label: 'Appeals/Reviews' },
    { value: 'Appeals/Reviews/Calls', label: 'Appeals/Reviews/Calls' },
    { value: 'Calls', label: 'Calls' },
    { value: 'Calls /App follow', label: 'Calls /App follow' },
    { value: 'Emails', label: 'Emails' },
    { value: 'Appeals/Reviews/Calls/App follow', label: 'Appeals/Reviews/Calls/App follow' },
    { value: 'App follow', label: 'App follow' },
    { value: 'Break', label: 'Break' },
    { value: 'Sick', label: 'Sick' }
  ],
  Morocco: [
    { value: 'Morocco_Chat', label: 'Chat' },
    { value: 'Morocco_Chat_Appeals', label: 'Chat/Appeals+Reviews' },
    { value: 'Morocco_Chat_Emails', label: 'Chat /Emails+Groups+ Calls' },
    { value: 'Morocco_Emails_Appeals', label: 'Emails ( New ) + Appeals+ Calls' },
    { value: 'Morocco_Emails_Reviews', label: 'Emails (Need attention) + Reviews + Groups' },
    { value: 'Morocco_All_Tasks', label: 'All tasks + Calls' },
    { value: 'Morocco_Break', label: 'Break' },
    { value: 'Sick', label: 'Sick' }
  ]
};

const taskColors: Record<TaskType, string> = {
  // Egypt Tasks
  'Chat': 'from-emerald-200 to-teal-200',
  'Appeals/Reviews': 'from-blue-200 to-cyan-200',
  'Appeals/Reviews/Calls': 'from-indigo-200 to-blue-200',
  'Calls': 'from-violet-200 to-purple-200',
  'Calls /App follow': 'from-purple-200 to-pink-200',
  'Emails': 'from-amber-200 to-yellow-200',
  'Appeals/Reviews/Calls/App follow': 'from-rose-200 to-pink-200',
  'App follow': 'from-sky-200 to-blue-200',
  'Break': 'from-gray-200 to-slate-200',
  'Sick': 'from-red-200 to-rose-200',
  
  // Morocco Tasks
  'Morocco_Chat': 'from-emerald-200 to-teal-200',
  'Morocco_Chat_Appeals': 'from-blue-200 to-cyan-200',
  'Morocco_Chat_Emails': 'from-blue-200 to-cyan-200',
  'Morocco_Emails_Appeals': 'from-amber-200 to-yellow-200',
  'Morocco_Emails_Reviews': 'from-violet-200 to-purple-200',
  'Morocco_All_Tasks': 'from-rose-200 to-pink-200',
  'Morocco_Break': 'from-gray-200 to-slate-200'
}

const initialAgents = {
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
  ],
  Morocco: [
    "Yasser Marrou", "Mariem Abdelhakmi", "Zaynab Adil", "Meryem Mazroui", "Mohammad Aznague",
    "Achraf Tazi", "Mohamed Elhachmi", "Mohamed ougrni", "Kenza Abbadi", "Marouan Bajbouji",
    "Hamza Sahraoui", "Nouhaila Essalih", "Nada Bennis", "Anis Boujmil"
  ]
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (username === 'admin' && password === 'Thinkdiffrent@123369') {
        onLogin()
      } else {
        setError('Invalid username or password')
      }
    } catch (error) {
      setError('An error occurred during login')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
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
              disabled={isLoading}
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
              disabled={isLoading}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>Loading...</>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" /> Login
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function AdminView({ 
  shiftTables, 
  setShiftTables,
  publishedTables,
  setPublishedTables,
  updateTablesAndSync
}: { 
  shiftTables: ShiftTable[], 
  setShiftTables: React.Dispatch<React.SetStateAction<ShiftTable[]>>,
  publishedTables: ShiftTable[],
  setPublishedTables: React.Dispatch<React.SetStateAction<ShiftTable[]>>,
  updateTablesAndSync: (tables: ShiftTable[]) => Promise<void>
}) {
  const [newShiftType, setNewShiftType] = useState<ShiftType>('Morning')
  const [splitInterval, setSplitInterval] = useState<number>(1);
  const [splitIntervalInput, setSplitIntervalInput] = useState<string>("1");
  const [previewTimeSlots, setPreviewTimeSlots] = useState<string[]>([]);
  const [splitWarning, setSplitWarning] = useState<string>('');
  const [activeCountries, setActiveCountries] = useState({ Egypt: true, Morocco: false });
  const [agents, setAgents] = useState<Record<'Egypt' | 'Morocco', string[]>>(initialAgents);
  const [newAgentName, setNewAgentName] = useState('')
  const [newAgentCountry, setNewAgentCountry] = useState<'Egypt' | 'Morocco'>('Egypt')

  // Load agents from Firebase
  useEffect(() => {
    const loadSavedAgents = async () => {
      try {
        const savedAgents = await loadAgents();
        if (Object.keys(savedAgents).length > 0) {
          setAgents(savedAgents);
        }
      } catch (error) {
        console.error('Error loading agents:', error);
        toast.error('Failed to load agents');
      }
    };

    loadSavedAgents();
  }, []);

  // Save agents whenever they change
  useEffect(() => {
    const saveAgentsToFirebase = async () => {
      try {
        await saveAgents(agents);
      } catch (error) {
        console.error('Error saving agents:', error);
      }
    };

    saveAgentsToFirebase();
  }, [agents]);

  const updateShiftTable = (id: string, field: keyof ShiftTable, value: string | boolean | null) => {
    const updatedTable = shiftTables.find(table => table.id === id);
    if (updatedTable) {
      const newTable = { ...updatedTable, [field]: value };
      updateTablesAndSync([newTable]);
    }
  };

  const addAgent = (tableId: string) => {
    const updatedTable = shiftTables.find(table => table.id === tableId);
    if (updatedTable) {
      const newAgent: Agent = {
        name: '',
        tasks: Array(updatedTable.timeSlots.length).fill(null)
      };
      const newTable = { 
        ...updatedTable, 
        agents: [...updatedTable.agents, newAgent] 
      };
      updateTablesAndSync([newTable]);
    }
  };

  const updateAgentName = async (tableId: string, agentIndex: number, agentName: string) => {
    try {
      const updatedTables = shiftTables.map(table => {
        if (table.id === tableId) {
          const tableAgents = getAvailableAgents(table.country);
          if (!tableAgents.includes(agentName)) {
            throw new Error(`Agent ${agentName} is not available for ${table.country}`);
          }

          const newAgents = [...table.agents];
          newAgents[agentIndex] = {
            name: agentName,
            tasks: Array(table.timeSlots.length).fill(null)
          };
          return { ...table, agents: newAgents };
        }
        return table;
      });

      setShiftTables(updatedTables);
      await saveShiftTables(updatedTables);
      
      toast.success('Agent updated successfully');
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error('Failed to update agent');
    }
  };

  const updateAgentTask = async (tableId: string, agentIndex: number, taskIndex: number, taskType: TaskType) => {
    try {
      const updatedTables = shiftTables.map(table => {
        if (table.id === tableId) {
          const updatedAgents = [...table.agents];
          if (!updatedAgents[agentIndex].tasks) {
            updatedAgents[agentIndex].tasks = [];
          }
          updatedAgents[agentIndex].tasks[taskIndex] = { type: taskType };
          return { ...table, agents: updatedAgents };
        }
        return table;
      });

      await updateTablesAndSync(updatedTables);
    } catch (error) {
      console.error('Error updating agent task:', error);
      toast.error('Failed to update task');
    }
  };

  const toggleLock = async (id: string) => {
    const updatedTable = shiftTables.find(table => table.id === id);
    if (updatedTable) {
      const newTable = { ...updatedTable, isLocked: !updatedTable.isLocked };
      
      // Update in Drive immediately
      try {
        const updatedTables = shiftTables.map(table => 
          table.id === id ? newTable : table
        );
        await saveShiftTables(updatedTables);
        
        // Update local state
        setShiftTables(updatedTables);
        
        toast.success(`Table ${newTable.isLocked ? 'locked' : 'unlocked'} successfully`);
      } catch (error) {
        console.error('Error updating lock state:', error);
        toast.error('Failed to update lock state');
      }
    }
  };

  const removeShiftTable = async (id: string) => {
    if (!id) {
      console.error('Invalid table ID provided to removeShiftTable');
      return;
    }

    try {
      // Remove from current state
      const updatedTables = shiftTables.filter(table => table.id !== id);
      
      // Update Drive first
      try {
        await saveShiftTables(updatedTables);
      } catch (driveError) {
        console.error('Error saving to Drive:', driveError);
        toast.error('Failed to delete table from Drive');
        return;
      }
      
      // Update local state
      setShiftTables(updatedTables);
      
      // Update published tables if necessary
      const newPublished = updatedTables.filter(table => 
        !table.isArchived && 
        (table.publishedTo === 'Egypt' || table.publishedTo === 'Morocco')
      );
      setPublishedTables(newPublished);
      
      toast.success('Table deleted successfully');
    } catch (error) {
      console.error('Error deleting table:', error);
      toast.error('Failed to delete table');
    }
  };

  const updateShiftTables = async (updatedShiftTables: ShiftTable[]) => {
    try {
      await saveShiftTables(updatedShiftTables);
      setShiftTables(updatedShiftTables);
      toast.success('Changes saved successfully');
    } catch (error: any) {
      console.error('Error saving shift tables:', error.message);
      toast.error('Failed to save changes');
    }
  };

  const handleArchiveTable = async (id: string) => {
    if (!id) {
      console.error('Invalid table ID provided to handleArchiveTable');
      return;
    }

    try {
      // Find the table to archive
      const tableToArchive = shiftTables.find(table => table.id === id);
      if (!tableToArchive) {
        toast.error('Table not found');
        return;
      }

      // Create updated tables array
      const updatedTables = shiftTables.map(table => 
        table.id === id ? { ...table, isArchived: !table.isArchived } : table
      );
      
      // Save to Drive first
      try {
        await saveShiftTables(updatedTables);
      } catch (driveError) {
        console.error('Error saving to Drive:', driveError);
        toast.error('Failed to archive table in Drive');
        return;
      }
      
      // Update local state
      setShiftTables(updatedTables);
      
      // Update published tables if necessary
      if (tableToArchive.publishedTo) {
        const newPublished = updatedTables.filter(table => 
          !table.isArchived && 
          (table.publishedTo === 'Egypt' || table.publishedTo === 'Morocco')
        );
        setPublishedTables(newPublished);
      }
      
      toast.success(`Table ${updatedTables.find(t => t.id === id)?.isArchived ? 'archived' : 'restored'} successfully`);
    } catch (error) {
      console.error('Error archiving table:', error);
      toast.error('Failed to archive table');
    }
  };

  const formatTime = useCallback((hour: number, minute: number = 0): string => {
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  }, []);

  const validateSplitInterval = (interval: number, shiftType: ShiftType) => {
    if (isNaN(interval) || interval <= 0) {
      return "Split interval must be a positive number";
    }
    if (interval > 8) {
      return "Split interval cannot be longer than the shift duration (8 hours)";
    }
    
    // Calculate total shift duration in hours
    const totalHours = 8;
    
    // Calculate how many slots this interval would create
    const numberOfSlots = totalHours / interval;
    
    // If it's already a valid interval (divides evenly), return no warning
    if (Math.abs(Math.round(numberOfSlots) - numberOfSlots) < 0.000001) {
      return "";
    }
    
    // Calculate total minutes for the desired interval
    const desiredMinutes = interval * 60;
    
    // Define valid intervals in minutes (1.6h = 96min, 2h = 120min, 1h = 60min)
    const validIntervals = [
      { hours: 1.6, minutes: 96 },   // 5 slots
      { hours: 2, minutes: 120 },    // 4 slots
      { hours: 1, minutes: 60 }      // 8 slots
    ];
    
    // Find the closest valid interval by comparing minutes
    const closestInterval = validIntervals.reduce((prev, curr) => {
      const prevDiff = Math.abs(desiredMinutes - prev.minutes);
      const currDiff = Math.abs(desiredMinutes - curr.minutes);
      return currDiff < prevDiff ? curr : prev;
    });
    
    return `This interval (${interval} hours) doesn't divide evenly into an 8-hour shift. The closest valid interval is ${closestInterval.hours} hours`;
  };

  const generateTimeSlots = useCallback((shiftType: ShiftType, interval: number) => {
    const shift = shiftDetails[shiftType];
    const [startTime] = shift.timeRange.split(' to ');
    let [startHour, period] = startTime.split(' ');
    let currentHour = parseInt(startHour);
    if (period === 'PM' && currentHour !== 12) currentHour += 12;
    if (period === 'AM' && currentHour === 12) currentHour = 0;
    
    const slots: string[] = [];
    let currentMinutes = 0;
    
    // Calculate how many complete intervals we need
    const numberOfSlots = Math.floor(8 / interval);
    
    for (let i = 0; i < numberOfSlots; i++) {
      const startH = Math.floor(currentHour);
      const startM = Math.floor(currentMinutes);
      
      // Calculate end time
      let totalMinutes = currentMinutes + (interval * 60);
      let endH = currentHour + Math.floor(totalMinutes / 60);
      let endM = Math.floor(totalMinutes % 60);
      
      const formattedStart = formatTime(startH, startM);
      const formattedEnd = formatTime(endH, endM);
      
      slots.push(`${formattedStart} - ${formattedEnd}`);
      
      // Update current time for next slot
      currentHour = endH;
      currentMinutes = endM;
    }
    
    return slots;
  }, [formatTime]);

  const handleSplitIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSplitIntervalInput(inputValue);
    
    // Convert to number and validate
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue > 0) {
      setSplitInterval(numValue);
    }
  };

  useEffect(() => {
    if (newShiftType && splitInterval) {
      const warning = validateSplitInterval(splitInterval, newShiftType);
      setSplitWarning(warning);
      
      if (!warning) {
        const slots = generateTimeSlots(newShiftType, splitInterval);
        setPreviewTimeSlots(slots);
      } else {
        setPreviewTimeSlots([]);
      }
    }
  }, [newShiftType, splitInterval, generateTimeSlots]);

  const addNewShiftTable = async () => {
    const date = new Date().toISOString().split('T')[0];
    const id = Date.now().toString();
    let timeSlots = shiftDetails[newShiftType].timeSlots;
    
    // Apply custom split interval
    if (splitInterval !== 1) {
      timeSlots = generateTimeSlots(newShiftType, splitInterval);
    }

    const newTable: ShiftTable = {
      id,
      date,
      shiftType: newShiftType,
      shifts: {
        Morning: newShiftType === 'Morning' ? timeSlots : [],
        Day: newShiftType === 'Day' ? timeSlots : [],
        Afternoon: newShiftType === 'Afternoon' ? timeSlots : [],
        Evening: newShiftType === 'Evening' ? timeSlots : [],
        Night: newShiftType === 'Night' ? timeSlots : []
      },
      timeSlots,
      agents: [],
      senior: '',
      country: activeCountries.Egypt ? 'Egypt' : 'Morocco',
      publishedTo: null,
      isArchived: false,
      isLocked: false
    };

    const updatedTables = [...shiftTables, newTable];
    await updateTablesAndSync(updatedTables);
    
    // Show success message with the country
    toast.success(`New ${newShiftType} shift table has been created for ${activeCountries.Egypt ? 'Egypt' : 'Morocco'}`);
  };

  const publishTable = async (id: string) => {
    const activeCountry = activeCountries.Egypt ? 'Egypt' : 'Morocco' as const;
    const updatedTables: ShiftTable[] = shiftTables.map(table => ({
      ...table,
      publishedTo: table.id === id ? activeCountry : table.publishedTo
    }));
    
    await updateTablesAndSync(updatedTables);
  };

  const unpublishTable = async (id: string) => {
    const updatedTables: ShiftTable[] = shiftTables.map(table => ({
      ...table,
      publishedTo: table.id === id ? null : table.publishedTo
    }));
    
    await updateTablesAndSync(updatedTables);
  };

  const addNewAgent = async () => {
    if (newAgentName.trim()) {
      try {
        const updatedAgents = {
          ...agents,
          [newAgentCountry]: [...(agents[newAgentCountry] || []), newAgentName.trim()]
        };
        
        // Save to Firebase
        await saveAgents(updatedAgents);
        
        // Update local state
        setAgents(updatedAgents);
        
        // Clear input
        setNewAgentName('');
        
        toast.success('Agent added successfully');
      } catch (error) {
        console.error('Error adding agent:', error);
        toast.error('Failed to add agent. Please try again.');
      }
    }
  };

  const canArchiveDay = (date: string) => {
    const tablesForDay = shiftTables.filter(table => table.date === date && !table.isArchived)
    const shiftTypes = new Set(tablesForDay.map(table => table.shiftType))
    return shiftTypes.has('Morning') && shiftTypes.has('Night')
  }

  const tablesByDate = shiftTables
    .filter(table => !table.isArchived)
    .reduce((acc, table) => {
      if (!acc[table.date]) {
        acc[table.date] = [];
      }
      acc[table.date].push(table);
      return acc;
    }, {} as Record<string, ShiftTable[]>);

  const toggleActiveCountry = (country: 'Egypt' | 'Morocco') => {
    if (activeCountries[country]) return;

    const newActiveCountries = {
      Egypt: country === 'Egypt',
      Morocco: country === 'Morocco'
    };
    
    setActiveCountries(newActiveCountries);
    toast.success('Country preference saved');
  }

  const getAvailableAgents = (tableCountry: 'Egypt' | 'Morocco') => {
    return agents[tableCountry] || initialAgents[tableCountry] || [];
  }

  const TaskSelect = ({ value, onChange, country }: { value: string, onChange: (value: string) => void, country: string }) => {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {taskOptions[country as keyof typeof taskOptions].map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  const renderAgentSelect = (shiftTable: ShiftTable, agent: Agent | null, index: number) => {
    const tableAgents = getAvailableAgents(shiftTable.country);
    
    return (
      <Select
        value={agent?.name || ''}
        onValueChange={(value) => updateAgentName(shiftTable.id, index, value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select agent" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Agents</SelectLabel>
            {tableAgents.map((agent) => (
              <SelectItem
                key={agent}
                value={agent}
                disabled={shiftTable.agents.some(a => a?.name === agent && a?.name !== agent)}
              >
                {agent}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
    </Select>
    );
  };

  useEffect(() => {
    const savedCountries = localStorage.getItem('activeCountries');
    if (savedCountries) {
      setActiveCountries(JSON.parse(savedCountries));
    }

    const savedAgents = localStorage.getItem('agents');
    if (savedAgents) {
      setAgents(JSON.parse(savedAgents));
    }
  }, []);

  useEffect(() => {
    const loadTempChanges = () => {
      const tempTablesStr = localStorage.getItem('tempShiftTables');
      if (tempTablesStr) {
        try {
          const tempTables = JSON.parse(tempTablesStr);
          if (Array.isArray(tempTables)) {
            setShiftTables(tempTables);
          }
        } catch (error) {
          console.error('Error loading temporary changes:', error);
        }
      }
    };

    loadTempChanges();
  }, [setShiftTables]);

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

      {Object.entries(tablesByDate).map(([date, tables]) => (
        <Card key={date} className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div className="flex-1 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tables.map(shiftTable => (
              <Card key={shiftTable.id} className={cn("overflow-hidden bg-gradient-to-br", shiftDetails[shiftTable.shiftType].theme)}>
                <CardHeader className="bg-white bg-opacity-30 backdrop-blur-sm">
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span>{shiftTable.shiftType} Shift</span>
                      <Badge variant="outline" className="bg-white/50 backdrop-blur-sm">
                        <Globe className="mr-1 h-3 w-3" />
                        {shiftTable.country}
                      </Badge>
                      {shiftTable.publishedTo && (
                        <Badge variant="default" className="bg-green-500">
                          Published
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
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
                        size="sm"
                        onClick={() => toggleLock(shiftTable.id)}
                        aria-label={shiftTable.isLocked ? "Edit schedule" : "Lock schedule"}
                      >
                        {shiftTable.isLocked ? <Edit className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => removeShiftTable(shiftTable.id)}
                        aria-label="Remove shift table"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleArchiveTable(shiftTable.id)}
                        className="hover:bg-purple-100"
                      >
                        <Archive className="h-4 w-4" />
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
                        {shiftTable.agents.map((agent, index) => {
                          const isAgentSick = agent.tasks.some(task => task?.type === 'Sick');
                          return (
                            <TableRow 
                              key={index}
                              className={cn(
                                isAgentSick && "bg-gray-100"
                              )}
                            >
                              <TableCell 
                                className={cn(
                                  "bg-white bg-opacity-30 backdrop-blur-sm sticky left-0 z-10",
                                  agent.highlight && "bg-orange-200 bg-opacity-60"
                                )}
                              >
                                {shiftTable.isLocked ? (
                                  <span>{agent.name}</span>
                                ) : (
                                  renderAgentSelect(shiftTable, agent, index)
                                )}
                              </TableCell>
                              {shiftTable.timeSlots.map((_, taskIndex) => (
                                <TableCell 
                                  key={taskIndex} 
                                  className="p-1"
                                >
                                  {shiftTable.isLocked ? (
                                    <div className={cn(
                                      "w-full h-full p-2 rounded",
                                      agent.tasks[taskIndex] ? `bg-gradient-to-r ${taskColors[agent.tasks[taskIndex].type]}` : "bg-white"
                                    )}>
                                      {agent.tasks[taskIndex]?.type || '-'}
                                    </div>
                                  ) : (
                                    <div className="h-full">
                                      <Select
                                        value={agent.tasks[taskIndex]?.type || ''}
                                        onValueChange={(value: TaskType) => updateAgentTask(shiftTable.id, index, taskIndex, value)}
                                      >
                                        <SelectTrigger className={cn(
                                          "w-full h-full border-0 focus:ring-0",
                                          agent.tasks[taskIndex] ? `bg-gradient-to-r ${taskColors[agent.tasks[taskIndex].type]}` : "bg-white"
                                        )}>
                                          <SelectValue placeholder="Select task" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {taskTypesByCountry[shiftTable.country].map((type) => (
                                            <SelectItem key={type} value={type}>
                                              {type}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          );
                        })}
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
          </CardContent>
        </Card>
      ))}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-4 w-full">
            <Plus className="mr-2 h-4 w-4" /> Create New Shift Table
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Shift Table</DialogTitle>
            <div className="space-y-2">
              <DialogDescription>
                Fill in the details for your new shift table.
              </DialogDescription>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <Globe className="mr-1 h-3 w-3" />
                  Creating for: {activeCountries.Egypt ? 'Egypt' : 'Morocco'}
                </Badge>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Shift Type</Label>
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
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Default hours: {shiftDetails[newShiftType].timeRange}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="8"
                    value={splitIntervalInput}
                    onChange={handleSplitIntervalChange}
                    className={cn(
                      "w-20",
                      splitWarning ? "border-red-500 focus:ring-red-500" : ""
                    )}
                  />
                  <Label className="text-sm text-muted-foreground">Hour intervals</Label>
                </div>
              </div>
            </div>
            {/* Preview section */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview Time Slots:</Label>
              <div className="bg-muted/50 p-3 rounded-md">
                {previewTimeSlots.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {previewTimeSlots.map((slot, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        {slot}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    Enter a valid interval to see time slots
                  </div>
                )}
              </div>
              {splitWarning && (
                <div className="text-sm text-yellow-600 dark:text-yellow-500 flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {splitWarning}
                </div>
              )}
            </div>
          </div>
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
            <CardTitle>
              <div className="flex items-center gap-2">
                <span>{shiftTable.shiftType} Shift</span>
              </div>
            </CardTitle>
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
                    <TableHead>Agent's Name</TableHead>
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
                      <TableCell>{agent.name}</TableCell>
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

function ArchiveView({ shiftTables, setShiftTables, updateTablesAndSync }: { shiftTables: ShiftTable[], setShiftTables: React.Dispatch<React.SetStateAction<ShiftTable[]>>, updateTablesAndSync: (tables: ShiftTable[]) => Promise<void> }) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null)

  // Get unique dates from archived tables
  const archivedDates = [...new Set(shiftTables.filter(table => table.isArchived).map(table => table.date))]

  const toggleExpand = (date: string) => {
    setExpandedDate(expandedDate === date ? null : date)
  }

  const handleDeleteDay = async (date: string) => {
    try {
      const updatedShiftTables = shiftTables.filter(table => table.date !== date);
      await saveShiftTables(updatedShiftTables);
      setShiftTables(updatedShiftTables);
      toast.success('Day deleted successfully');
    } catch (error) {
      console.error('Error deleting day:', error);
      toast.error('Failed to delete day');
    }
  }

  // Group tables by date and country
  const getTablesForDateAndCountry = (date: string, country: string) => {
    return shiftTables.filter(table => 
      table.isArchived && 
      table.date === date && 
      table.publishedTo === country
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h2 className="text-2xl font-bold mb-4">Archived Schedules</h2>
      {archivedDates.map(date => (
        <Card key={date} className="overflow-hidden">
          <CardHeader 
            className="cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <CardTitle className="flex justify-between items-center">
              <div 
                className="flex-1 flex items-center gap-2"
                onClick={() => toggleExpand(date)}
              >
                <span>{date}</span>
                {expandedDate === date ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDay(date);
                }}
                className="hover:bg-red-100 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <AnimatePresence>
            {expandedDate === date && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent className="pt-4">
                  {/* Egypt Section */}
                  {getTablesForDateAndCountry(date, "Egypt").length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <Flag className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Egypt</h3>
                      </div>
                      <div className="space-y-4">
                        {getTablesForDateAndCountry(date, "Egypt")
                          .sort((a, b) => {
                            const orderA = shiftOrder[a.shiftType] ?? 0;
                            const orderB = shiftOrder[b.shiftType] ?? 0;
                            return orderA - orderB;
                          })
                          .map(shiftTable => (
                            <Card key={shiftTable.id} className={cn("overflow-hidden bg-gradient-to-br", shiftDetails[shiftTable.shiftType].theme)}>
                              <CardHeader className="bg-white bg-opacity-30 backdrop-blur-sm">
                                <CardTitle>
                                  <div className="flex items-center gap-2">
                                    <span>{shiftTable.shiftType} Shift</span>
                                  </div>
                                </CardTitle>
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
                                      {shiftTable.agents.map((agent, agentIndex) => {
                                        const isAgentSick = agent.tasks.some(task => task?.type === 'Sick');
                                        return (
                                          <TableRow 
                                            key={agentIndex}
                                            className={cn(
                                              isAgentSick && "bg-gray-100"
                                            )}
                                          >
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
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Morocco Section */}
                  {getTablesForDateAndCountry(date, "Morocco").length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Flag className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Morocco</h3>
                      </div>
                      <div className="space-y-4">
                        {getTablesForDateAndCountry(date, "Morocco")
                          .sort((a, b) => {
                            const orderA = shiftOrder[a.shiftType] ?? 0;
                            const orderB = shiftOrder[b.shiftType] ?? 0;
                            return orderA - orderB;
                          })
                          .map(shiftTable => (
                            <Card key={shiftTable.id} className={cn("overflow-hidden bg-gradient-to-br", shiftDetails[shiftTable.shiftType].theme)}>
                              <CardHeader className="bg-white bg-opacity-30 backdrop-blur-sm">
                                <CardTitle>
                                  <div className="flex items-center gap-2">
                                    <span>{shiftTable.shiftType} Shift</span>
                                  </div>
                                </CardTitle>
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
                                      {shiftTable.agents.map((agent, agentIndex) => {
                                        const isAgentSick = agent.tasks.some(task => task?.type === 'Sick');
                                        return (
                                          <TableRow 
                                            key={agentIndex}
                                            className={cn(
                                              isAgentSick && "bg-gray-100"
                                            )}
                                          >
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
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      ))}
    </div>
  )
}

function AnalyticsView({ shiftTables }: { shiftTables: ShiftTable[] }) {
  const [selectedCountry, setSelectedCountry] = useState<'Egypt' | 'Morocco'>('Egypt');
  const [filterType, setFilterType] = useState<'all-time' | 'date-range'>('all-time');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const timeToMinutes = (timeStr: string) => {
    const [time, period] = timeStr.trim().split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + (minutes || 0); // Handle cases where minutes might be undefined
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const startMinutes = timeToMinutes(startTime);
    let endMinutes = timeToMinutes(endTime);
    
    // Handle cross-midnight shifts
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60; // Add 24 hours worth of minutes
    }
    
    return (endMinutes - startMinutes) / 60;
  };

  const calculateTaskHours = (table: ShiftTable, agent: Agent, taskType: TaskType) => {
    if (!agent.tasks || !table.timeSlots) return 0;
    
    let totalHours = 0;
    
    agent.tasks.forEach((task, index) => {
      if (task?.type === taskType && table.timeSlots[index]) {
        const timeRange = table.timeSlots[index];
        const [startTime, endTime] = timeRange.split('-').map(t => t.trim());
        if (startTime && endTime) {
          // Extract just the time part (remove AM/PM)
          const startParts = startTime.split(':');
          const endParts = endTime.split(':');
          if (startParts.length === 2 && endParts.length === 2) {
            const hours = calculateDuration(startTime, endTime);
            console.log(`${agent.name} - ${taskType} for slot ${timeRange}: ${hours} hours`);
            if (hours > 0) {
              totalHours += hours;
            }
          }
        }
      }
    });
    
    console.log(`Total hours for ${agent.name} - ${taskType}: ${totalHours}`);
    return Number(totalHours.toFixed(2));
  };

  const calculateAnalytics = (tables: ShiftTable[], country: 'Egypt' | 'Morocco') => {
    console.log(`Starting analytics calculation for ${country}`);
    
    const filteredTables = tables.filter(table => {
      const isValidTable = 
        table.country === country && 
        table.publishedTo === country; // Removed !table.isArchived check
      
      if (filterType === 'date-range' && startDate && endDate) {
        const tableDate = new Date(table.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return isValidTable && tableDate >= start && tableDate <= end;
      }
    
      return isValidTable;
    });

    console.log(`Found ${filteredTables.length} valid tables for ${country}`, {
      tables: filteredTables.map(t => ({
        date: t.date,
        archived: t.isArchived,
        agentCount: t.agents.length
      }))
    });
    
    const analytics: Record<string, { 
      name: string, 
      tasks: Record<TaskType, number>,
      breakHours: number 
    }> = {};

    filteredTables.forEach(table => {
      console.log(`Processing table: ${table.date}, Shift: ${table.shiftType}`);
    
      table.agents.forEach(agent => {
        if (!agent.name) return;
        
        // Initialize agent analytics if not exists
        if (!analytics[agent.name]) {
          analytics[agent.name] = {
            name: agent.name,
            tasks: taskTypesByCountry[country].reduce((acc, type) => {
              acc[type] = 0;
              return acc;
            }, {} as Record<TaskType, number>),
            breakHours: 0
          };
        }

        // Process each task
        agent.tasks.forEach((task, index) => {
          if (task && table.timeSlots[index]) {
            const timeRange = table.timeSlots[index];
            const [startTime, endTime] = timeRange.split('-').map(t => t.trim());
            
            if (startTime && endTime) {
              const hours = calculateDuration(startTime, endTime);
              if (hours > 0) {
                console.log(`Adding ${hours} hours for ${agent.name} - ${task.type} (${timeRange})`);
                analytics[agent.name].tasks[task.type] += hours;
                
                if (task.type === 'Sick') {
                  analytics[agent.name].breakHours += hours;
                }
              }
            }
          }
        });
      });
    });

    console.log('Final analytics:', analytics);
    return analytics;
  };

  const uniqueTaskTypes = Array.from(new Set(taskTypesByCountry[selectedCountry]));

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>View work hours by agent and task type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <Label>Country</Label>
                <Select value={selectedCountry} onValueChange={(value: 'Egypt' | 'Morocco') => setSelectedCountry(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Egypt">Egypt</SelectItem>
                    <SelectItem value="Morocco">Morocco</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Filter Type</Label>
                <Select value={filterType} onValueChange={(value: 'all-time' | 'date-range') => setFilterType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-time">All Time</SelectItem>
                    <SelectItem value="date-range">Date Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filterType === 'date-range' && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-white sticky left-0">Agent Name</TableHead>
                  {uniqueTaskTypes.map((type) => (
                    <TableHead key={type} className="text-center">
                      {type}
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Total Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(calculateAnalytics(shiftTables, selectedCountry)).map((agent) => {
                  const totalHours = uniqueTaskTypes.reduce(
                    (sum, type) => sum + agent.tasks[type],
                    0
                  );
                  return (
                    <TableRow key={agent.name}>
                      <TableCell className="bg-white sticky left-0 font-medium">
                        {agent.name}
                      </TableCell>
                      {uniqueTaskTypes.map((type) => (
                        <TableCell key={type} className="text-center">
                          {agent.tasks[type]}
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        {totalHours}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 22) return "Good Evening";
  return "Good Night";
}

const motivationalMessages = [
  "Transform your ideas into perfect schedules!",
  "Ready to make today amazing?",
  "Let's organize your day efficiently!",
  "Create schedules that work for everyone!",
  "Make scheduling simple and effective!"
];

function getRandomMessage() {
  const messages = [
    'Transform your ideas into perfect schedules!',
    'Ready to make today amazing?',
    'Let\'s organize your day efficiently!',
    'Create schedules that work for everyone!',
    'Make scheduling simple and effective!'
  ];
  
  // Get current hour to use as seed
  const currentHour = new Date().getHours();
  // Use hour as index to ensure same message during the hour
  return messages[currentHour % messages.length];
};

export default function ModernScheduleMaker() {
  const [shiftTables, setShiftTables] = useState<ShiftTable[]>([])
  const [publishedTables, setPublishedTables] = useState<ShiftTable[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState<'admin' | 'egypt' | 'morocco' | 'archive' | 'analytics'>('admin')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [motivationalMessage, setMotivationalMessage] = useState('Welcome to Schedule Maker')
  const [activeCountries, setActiveCountries] = useState({ Egypt: true, Morocco: false })
  const [pendingChanges, setPendingChanges] = useState(0);
  const [lastNotificationTime, setLastNotificationTime] = useState(0);
  const NOTIFICATION_COOLDOWN = 5000; // 5 seconds cooldown between notifications

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const now = Date.now();
    if (now - lastNotificationTime > NOTIFICATION_COOLDOWN) {
      if (type === 'success') {
        toast.success(message);
      } else {
        toast.error(message);
      }
      setLastNotificationTime(now);
    }
  }, [lastNotificationTime]);

  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const updateTablesAndSync = async (newTables: ShiftTable[], showToast: boolean = false) => {
    try {
      setSyncStatus('syncing');
      // Update local states immediately
      setShiftTables(newTables);
      const newPublished = newTables.filter(table => 
        !table.isArchived && 
        (table.publishedTo === 'Egypt' || table.publishedTo === 'Morocco')
      );
      setPublishedTables(newPublished);

      // Save to Firebase
      await saveShiftTables(newTables);
      setSyncStatus('synced');
      setLastSyncTime(new Date());
      
      if (showToast) {
        showNotification('Changes saved successfully');
      }
    } catch (error) {
      console.error('Error updating tables:', error);
      setSyncStatus('error');
      showNotification('Failed to save changes', 'error');
      throw error;
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'synced': return 'text-green-500';
      case 'syncing': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'synced':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'syncing':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'synced':
        return `Synced${lastSyncTime ? ` at ${lastSyncTime.toLocaleTimeString()}` : ''}`;
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return 'Sync failed';
      default:
        return 'Unknown status';
    }
  };

  const SyncStatusIndicator = () => {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <span className={`flex items-center ${getStatusColor()}`}>
          {getStatusIcon()}
        </span>
        <span className={`${getStatusColor()} hidden sm:inline`}>{getStatusText()}</span>
      </div>
    );
  };

  // Function to load all tables from Firestore
  const loadAllTables = useCallback(async () => {
    setIsLoading(true);
    try {
      const tables = await loadShiftTables();
      setShiftTables(tables);
      const published = tables.filter(table => 
        !table.isArchived && 
        (table.publishedTo === 'Egypt' || table.publishedTo === 'Morocco')
      );
      setPublishedTables(published);
    } catch (error) {
      console.error('Error loading tables:', error);
      showNotification('Failed to load tables', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [setShiftTables, setPublishedTables, showNotification]);

  // Initialize active tab from localStorage after mount
  useEffect(() => {
    // Load tables regardless of login status for public views
    loadAllTables();
  }, [loadAllTables]);

  // Function to update both states instantly and sync with Firestore
  const handlePublishTable = async (id: string) => {
    try {
      const table = shiftTables.find(t => t.id === id);
      if (!table) return;

      const updatedTables = shiftTables.map(table => 
        table.id === id ? { ...table, publishedTo: table.publishedTo ? null : table.country } : table
      );
      
      await updateTablesAndSync(updatedTables, true);
    } catch (error) {
      console.error('Error publishing table:', error);
      showNotification('Failed to publish table', 'error');
    }
  };

  const handleArchiveTable = async (id: string) => {
    try {
      const updatedTables = shiftTables.map(table => 
        table.id === id ? { ...table, isArchived: !table.isArchived } : table
      );
      
      await updateTablesAndSync(updatedTables, true);
    } catch (error) {
      console.error('Error archiving table:', error);
      showNotification('Failed to archive table', 'error');
    }
  };

  const updateAgentTask = async (tableId: string, agentIndex: number, taskIndex: number, taskType: TaskType) => {
    try {
      const updatedTables = shiftTables.map(table => {
        if (table.id === tableId) {
          const updatedAgents = [...table.agents];
          if (!updatedAgents[agentIndex].tasks) {
            updatedAgents[agentIndex].tasks = [];
          }
          updatedAgents[agentIndex].tasks[taskIndex] = { type: taskType };
          return { ...table, agents: updatedAgents };
        }
        return table;
      });

      await updateTablesAndSync(updatedTables, false); // Don't show notification for task updates
    } catch (error) {
      console.error('Error updating agent task:', error);
      showNotification('Failed to update task', 'error');
    }
  };

  const updateAgentName = async (tableId: string, agentIndex: number, name: string) => {
    try {
      const updatedTables = shiftTables.map(table => {
        if (table.id === tableId) {
          const updatedAgents = [...table.agents];
          if (!updatedAgents[agentIndex]) {
            updatedAgents[agentIndex] = { name, tasks: [] };
          } else {
            updatedAgents[agentIndex] = { ...updatedAgents[agentIndex], name };
          }
          return { ...table, agents: updatedAgents };
        }
        return table;
      });

      await updateTablesAndSync(updatedTables, false); // Don't show notification for name updates
    } catch (error) {
      console.error('Error updating agent name:', error);
      showNotification('Failed to update agent', 'error');
    }
  };

  const removeShiftTable = async (id: string) => {
    if (!id) return;
    
    try {
      const updatedTables = shiftTables.filter(table => table.id !== id);
      await updateTablesAndSync(updatedTables, true); // Show notification for table deletion
    } catch (error) {
      console.error('Error deleting table:', error);
      showNotification('Failed to delete table', 'error');
    }
  };

  // Get published tables for a specific country
  const getPublishedTables = (country: 'Egypt' | 'Morocco') => {
    return publishedTables.filter(table => table.publishedTo === country);
  };

  // Handle tab changes and persist to localStorage
  const handleTabChange = (value: string) => {
    const newTab = value as 'admin' | 'egypt' | 'morocco' | 'archive' | 'analytics';
    setActiveTab(newTab);
    localStorage.setItem('activeTab', newTab);
    // Reload tables when switching tabs
    loadAllTables();
  };

  // Check session status on component mount
  useEffect(() => {
    const checkSession = () => {
      const sessionExpiry = localStorage.getItem('sessionExpiry');
      if (sessionExpiry) {
        const expiryTime = parseInt(sessionExpiry);
        if (Date.now() < expiryTime) {
          setIsLoggedIn(true);
          const newExpiryTime = Date.now() + 86400000;
          localStorage.setItem('sessionExpiry', newExpiryTime.toString());
        } else {
          setIsLoggedIn(false);
          localStorage.removeItem('sessionExpiry');
        }
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    const expiryTime = Date.now() + 86400000;
    localStorage.setItem('sessionExpiry', expiryTime.toString());
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('sessionExpiry');
    setIsLoggedIn(false);
  };

  return (
    <div className="relative min-h-screen">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-lg font-medium text-primary animate-pulse">Loading your schedules...</p>
          </div>
        </div>
      )}

      {/* Saving indicator */}
      {isSaving && (
        <div className="fixed top-4 right-4 bg-primary/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2 z-50">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm font-medium text-primary">Saving changes...</span>
        </div>
      )}

      {isLoggedIn && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="absolute top-4 right-4 flex items-center gap-2 hover:bg-red-100 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      )}
      <div className="container mx-auto p-4">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
            {getGreeting()} 👋
          </h1>
          <p className="mt-2 text-lg text-gray-600 animate-fade-in">
            {motivationalMessage}
          </p>
        </div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Schedule Maker</h1>
          <SyncStatusIndicator />
        </div>
        <Tabs value={activeTab} className="space-y-4" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="admin">
              {isLoggedIn ? 'Admin' : <Lock className="h-4 w-4" />}
            </TabsTrigger>
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
              <AdminView 
                shiftTables={shiftTables} 
                setShiftTables={setShiftTables}
                publishedTables={publishedTables}
                setPublishedTables={setPublishedTables}
                updateTablesAndSync={updateTablesAndSync}
              />
            ) : (
              <LoginForm onLogin={handleLogin} />
            )}
          </TabsContent>
          <TabsContent value="analytics">
            {isLoggedIn && <AnalyticsView shiftTables={shiftTables} />}
          </TabsContent>
          <TabsContent value="archive">
            {isLoggedIn && (
              <ArchiveView 
                shiftTables={shiftTables} 
                setShiftTables={setShiftTables}
                updateTablesAndSync={updateTablesAndSync}
              />
            )}
          </TabsContent>
          <TabsContent value="egypt">
            <PublishedView shiftTables={getPublishedTables('Egypt')} country="Egypt" />
          </TabsContent>
          <TabsContent value="morocco">
            <PublishedView shiftTables={getPublishedTables('Morocco')} country="Morocco" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}