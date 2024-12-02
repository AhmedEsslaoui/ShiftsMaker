'use client'

import React, { useState, useEffect } from 'react'
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
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import { loadShiftTables, saveShiftTables } from '@/lib/firebase'
import type { ShiftTable, ShiftType, Task, TaskType, Agent } from '@/types/types'
import { CustomizeShiftDialog } from '@/components/CustomizeShiftDialog'

const SESSION_COOKIE = 'session_expiry';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const shiftDetails: Record<ShiftType, { timeRange: string, timeSlots: string[], theme: string }> = {
  'Morning': { timeRange: '8 AM to 4 PM', timeSlots: ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'], theme: 'from-yellow-100 to-orange-100' },
  'Day': { timeRange: '4 PM to 12 AM', timeSlots: ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00'], theme: 'from-green-100 to-emerald-100' },
  'Afternoon': { timeRange: '12 PM to 8 PM', timeSlots: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'], theme: 'from-blue-100 to-cyan-100' },
  'Evening': { timeRange: '8 PM to 4 AM', timeSlots: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00'], theme: 'from-purple-100 to-pink-100' },
  'Night': { timeRange: '12 AM to 8 AM', timeSlots: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00'], theme: 'from-gray-100 to-slate-200' },
}

const shiftOrder: Record<ShiftType, number> = {
  'Morning': 0,
  'Day': 1,
  'Afternoon': 2,
  'Evening': 3,
  'Night': 4
};

const taskTypes: TaskType[] = ['Chat', 'Emails', 'All tasks', 'All tasks/Chat assist']
const taskColors: Record<TaskType, string> = {
  'Chat': 'from-emerald-200 to-teal-200',
  'Emails': 'from-amber-200 to-yellow-200',
  'All tasks': 'from-rose-200 to-pink-200',
  'All tasks/Chat assist': 'from-violet-200 to-purple-200'
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
  const loadActiveCountries = () => {
    const savedCountries = Cookies.get('activeCountries');
    if (savedCountries) {
      return JSON.parse(savedCountries);
    }
    return { Egypt: true, Morocco: false }; // Default values
  };

  const [activeCountries, setActiveCountries] = useState(loadActiveCountries())
  const [agents, setAgents] = useState<Record<'Egypt' | 'Morocco', string[]>>(initialAgents);
  const [newAgentName, setNewAgentName] = useState('')
  const [newAgentCountry, setNewAgentCountry] = useState<'Egypt' | 'Morocco'>('Egypt')
  const [customizeShiftOpen, setCustomizeShiftOpen] = useState(false);
  const [customTimeSlots, setCustomTimeSlots] = useState<string[]>([]);

  // Load agents from cookies or use initial agents if none saved
  useEffect(() => {
    const savedAgents = Cookies.get('agents');
    if (savedAgents) {
      try {
        const parsedAgents = JSON.parse(savedAgents);
        setAgents(parsedAgents);
      } catch (error) {
        console.error('Error parsing agents:', error);
        Cookies.remove('agents');
        setAgents(initialAgents); // Fallback to initial agents if parsing fails
      }
    }
  }, []);

  // Save agents whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Cookies.set('agents', JSON.stringify(agents), { expires: 7 });
    }
  }, [agents]);

  const saveTableToCookies = (updatedTable: ShiftTable) => {
    try {
      // Get current tables from cookies
      const tempTablesStr = Cookies.get('tempShiftTables');
      let tempTables = [...shiftTables];
      
      if (tempTablesStr) {
        try {
          const parsed = JSON.parse(tempTablesStr);
          if (Array.isArray(parsed)) {
            tempTables = parsed;
          }
        } catch (error) {
          console.error('Error parsing temp tables:', error);
        }
      }

      // Create a deep copy of the updated table to ensure all nested data is captured
      const tableCopy = JSON.parse(JSON.stringify(updatedTable));
      
      // Update or add the table in temp tables
      const tableIndex = tempTables.findIndex(t => t.id === updatedTable.id);
      if (tableIndex !== -1) {
        tempTables[tableIndex] = tableCopy;
      } else {
        tempTables.push(tableCopy);
      }

      // Update local state and cookies
      const updatedTables = shiftTables.map(table => 
        table.id === updatedTable.id ? tableCopy : table
      );
      setShiftTables(updatedTables);
      Cookies.set('tempShiftTables', JSON.stringify(tempTables), { expires: 1 });
    } catch (error) {
      console.error('Error saving to cookies:', error);
      toast.error('Failed to save temporary changes');
    }
  };

  const updateShiftTable = (id: string, field: keyof ShiftTable, value: string | boolean | null) => {
    const updatedTable = shiftTables.find(table => table.id === id);
    if (updatedTable) {
      const newTable = { ...updatedTable, [field]: value };
      saveTableToCookies(newTable);
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
      saveTableToCookies(newTable);
    }
  };

  const updateAgentName = (tableId: string, agentIndex: number, name: string) => {
    const updatedTable = shiftTables.find(table => table.id === tableId);
    if (updatedTable) {
      const updatedAgents = [...updatedTable.agents];
      updatedAgents[agentIndex] = { ...updatedAgents[agentIndex], name };
      const newTable = { ...updatedTable, agents: updatedAgents };
      saveTableToCookies(newTable);
    }
  };

  const updateAgentTask = (tableId: string, agentIndex: number, taskIndex: number, taskType: TaskType) => {
    const updatedTable = shiftTables.find(table => table.id === tableId);
    if (updatedTable) {
      const updatedAgents = [...updatedTable.agents];
      updatedAgents[agentIndex].tasks[taskIndex] = { type: taskType };
      const newTable = { ...updatedTable, agents: updatedAgents };
      saveTableToCookies(newTable);
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
        
        // Update in cookies
        saveTableToCookies(newTable);
        
        toast.success(`Table ${newTable.isLocked ? 'locked' : 'unlocked'} successfully`, {
          duration: 2000,
          position: 'bottom-right',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
          icon: newTable.isLocked ? '🔒' : '🔓'
        });
      } catch (error) {
        console.error('Error updating lock state:', error);
        toast.error('Failed to update lock state');
      }
    }
  };

  const updateCookies = (tables: ShiftTable[]) => {
    try {
      if (tables.length > 0) {
        Cookies.set('tempShiftTables', JSON.stringify(tables), { expires: 1 });
      } else {
        Cookies.remove('tempShiftTables');
      }
    } catch (error) {
      console.error('Error updating cookies:', error);
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
      
      // Remove from cookies if present
      const tempTablesStr = Cookies.get('tempShiftTables');
      if (tempTablesStr) {
        try {
          const tempTables = JSON.parse(tempTablesStr);
          if (Array.isArray(tempTables)) {
            const updatedTempTables = tempTables.filter(table => table.id !== id);
            updateCookies(updatedTempTables);
          }
        } catch (cookieError) {
          console.error('Error updating cookies after delete:', cookieError);
          // Don't throw here as the main operation succeeded
        }
      }

      toast.success('Table deleted successfully', {
        duration: 2000,
        position: 'bottom-right',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        icon: '🗑️'
      });
    } catch (error) {
      console.error('Error deleting table:', error);
      toast.error('Failed to delete table');
    }
  };

  const updateShiftTables = async (updatedShiftTables: ShiftTable[]) => {
    try {
      await saveShiftTables(updatedShiftTables);
      setShiftTables(updatedShiftTables);
      toast.success('Changes saved successfully', {
        duration: 2000,
        position: 'bottom-right',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        icon: '💾'
      });
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
        table.id === id ? { ...table, isArchived: true } : table
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
      
      // Update cookies if present
      const tempTablesStr = Cookies.get('tempShiftTables');
      if (tempTablesStr) {
        try {
          const tempTables = JSON.parse(tempTablesStr);
          if (Array.isArray(tempTables)) {
            const updatedTempTables = tempTables.map(table => 
              table.id === id ? { ...table, isArchived: true } : table
            );
            updateCookies(updatedTempTables);
          }
        } catch (cookieError) {
          console.error('Error updating cookies after archive:', cookieError);
        }
      }

      toast.success('Table archived successfully', {
        duration: 2000,
        position: 'bottom-right',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        icon: '📦'
      });
    } catch (error) {
      console.error('Error archiving table:', error);
      toast.error('Failed to archive table');
    }
  };

  const handleArchiveDay = async (date: string) => {
    try {
      // Find tables for the given date
      const tablesToArchive = shiftTables.filter(table => table.date === date && !table.isArchived)
      if (tablesToArchive.length === 0) {
        toast.error('No tables found for the selected date');
        return;
      }

      // Create updated tables array and update immediately
      const updatedTables = shiftTables.map(table => 
        table.date === date ? { ...table, isArchived: true } : table
      );
      
      // Update states and sync with Firestore
      await updateTablesAndSync(updatedTables);

      toast.success(`All tables for ${date} archived successfully`, {
        duration: 2000,
        position: 'bottom-right',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        icon: '📅'
      });
    } catch (error) {
      console.error('Error archiving day:', error);
      toast.error('Failed to archive day');
    }
  };

  const addNewShiftTable = async () => {
    const date = new Date().toISOString().split('T')[0];
    const id = Math.random().toString(36).substr(2, 9);
    const timeSlots = customTimeSlots.length > 0 ? customTimeSlots : shiftDetails[newShiftType].timeSlots;
    
    const newTable: ShiftTable = {
      id,
      date,
      senior: '',
      shiftType: newShiftType,
      timeSlots,
      agents: [],
      isLocked: false,
      publishedTo: null,
      isArchived: false
    };

    const updatedTables = [...shiftTables, newTable];
    await updateTablesAndSync(updatedTables);
    setCustomTimeSlots([]);
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

  const addNewAgent = () => {
    if (newAgentName.trim()) {
      const updatedAgents = {
        ...agents,
        [newAgentCountry]: [...(agents[newAgentCountry] || []), newAgentName.trim()]
      };
      
      setAgents(updatedAgents);
      Cookies.set('agents', JSON.stringify(updatedAgents), { expires: 7 });
      setNewAgentName('');
      toast.success('Agent added successfully', {
        duration: 2000,
        position: 'bottom-right',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        icon: '✨'
      });
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
    Cookies.set('activeCountries', JSON.stringify(newActiveCountries), { expires: 7 });
    toast.success('Country preference saved', {
      duration: 2000,
      position: 'bottom-right',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
      icon: '🌍'
    });
  }

  const getAvailableAgents = () => {
    const activeCountry = activeCountries.Egypt ? 'Egypt' : 'Morocco';
    return agents[activeCountry] || initialAgents[activeCountry] || [];
  }

  const handleCustomizeTimeSlots = (timeSlots: string[]) => {
    setCustomTimeSlots(timeSlots);
  };

  const handleOpenCustomizeDialog = () => {
    setCustomTimeSlots([]); // Reset custom time slots
    setCustomizeShiftOpen(true);
  };

  const handleSaveTable = async (tableId: string) => {
    try {
      // Get current state from cookies
      const tempTablesStr = Cookies.get('tempShiftTables');
      let tempTables = [...shiftTables];
      let tableToSave;
      
      if (tempTablesStr) {
        try {
          const parsed = JSON.parse(tempTablesStr);
          if (Array.isArray(parsed)) {
            tempTables = parsed;
            // Find the table in temp tables first
            tableToSave = parsed.find(t => t.id === tableId);
          }
        } catch (error) {
          console.error('Error parsing temp tables:', error);
        }
      }

      // If not found in temp tables, get from current state
      if (!tableToSave) {
        tableToSave = shiftTables.find(t => t.id === tableId);
      }

      if (!tableToSave) {
        toast.error('Table not found');
        return;
      }

      // Create a deep copy to ensure all nested data is captured
      const tableToSaveCopy = JSON.parse(JSON.stringify(tableToSave));

      // Save to Drive
      try {
        // Create updated tables array for Drive
        const updatedTables = shiftTables.map(table => 
          table.id === tableId ? tableToSaveCopy : table
        );

        // Ensure the save operation captures all data
        await saveShiftTables(updatedTables);
        
        // Update local state with the complete data
        setShiftTables(updatedTables);

        // Update published tables if necessary
        if (tableToSaveCopy.publishedTo) {
          const newPublished = updatedTables.filter(table => 
            !table.isArchived && 
            (table.publishedTo === 'Egypt' || table.publishedTo === 'Morocco')
          );
          setPublishedTables(newPublished);
        }

        // Remove only this table from cookies and keep other temporary changes
        if (tempTablesStr) {
          const remainingTempTables = tempTables.filter(t => t.id !== tableId);
          if (remainingTempTables.length > 0) {
            Cookies.set('tempShiftTables', JSON.stringify(remainingTempTables), { expires: 1 });
          } else {
            Cookies.remove('tempShiftTables');
          }
        }

        toast.success('Changes saved successfully', {
          duration: 2000,
          position: 'bottom-right',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
          icon: '💾'
        });
      } catch (saveError) {
        console.error('Error saving to Drive:', saveError);
        toast.error('Failed to save to Drive');
      }
    } catch (error) {
      console.error('Error in save operation:', error);
      toast.error('Failed to save changes');
    }
  };

  useEffect(() => {
    const savedCountries = Cookies.get('activeCountries');
    if (savedCountries) {
      setActiveCountries(JSON.parse(savedCountries));
    }

    const savedAgents = Cookies.get('agents');
    if (savedAgents) {
      setAgents(JSON.parse(savedAgents));
    }
  }, []);

  useEffect(() => {
    const tempTables = Cookies.get('tempShiftTables');
    if (tempTables) {
      try {
        const parsed = JSON.parse(tempTables);
        setShiftTables(parsed);
      } catch (error) {
        console.error('Error parsing temporary tables:', error);
        Cookies.remove('tempShiftTables');
      }
    }
  }, [setShiftTables]);

  useEffect(() => {
    const loadTempChanges = () => {
      const tempTablesStr = Cookies.get('tempShiftTables');
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
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <Button
                variant="outline"
                onClick={() => handleArchiveDay(date)}
                className="bg-gradient-to-r from-purple-400 to-pink-500 text-white hover:from-purple-500 hover:to-pink-600"
              >
                <Archive className="mr-2 h-4 w-4" /> Archive Day
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tables.map(shiftTable => (
              <Card key={shiftTable.id} className={cn("overflow-hidden bg-gradient-to-br", shiftDetails[shiftTable.shiftType].theme)}>
                <CardHeader className="bg-white bg-opacity-30 backdrop-blur-sm">
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span>{shiftTable.shiftType} Shift</span>
                      {shiftTable.publishedTo && (
                        <Badge variant="outline" className="bg-white/50 backdrop-blur-sm">
                          <Globe className="mr-1 h-3 w-3" />
                          {shiftTable.publishedTo}
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
                        onClick={() => handleSaveTable(shiftTable.id)}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save to Drive
                      </Button>
                      <Button 
                        variant="outline"
                        size="icon"
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
                        {shiftTable.agents.map((agent, index) => (
                          <TableRow key={index}>
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
                                  onValueChange={(value) => updateAgentName(shiftTable.id, index, value)}
                                >
                                  <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select agent" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getAvailableAgents().map((agentName) => (
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
                                    onValueChange={(value: TaskType) => updateAgentTask(shiftTable.id, index, taskIndex, value)}
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
          </CardContent>
        </Card>
      ))}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-4 w-full">
            <Plus className="mr-2 h-4 w-4" /> Add New Shift Table
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Shift Table</DialogTitle>
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
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Default hours: {shiftDetails[newShiftType].timeRange}
              </div>
              <Button
                variant="outline"
                onClick={handleOpenCustomizeDialog}
              >
                <Clock className="mr-2 h-4 w-4" />
                Customize Hours
              </Button>
            </div>
          </div>
          <Button onClick={() => { addNewShiftTable(); }}>Create Shift Table</Button>
        </DialogContent>
      </Dialog>

      <CustomizeShiftDialog
        open={customizeShiftOpen}
        onOpenChange={setCustomizeShiftOpen}
        shiftType={newShiftType}
        timeSlots={customTimeSlots.length > 0 ? customTimeSlots : shiftDetails[newShiftType].timeSlots}
        onSave={handleCustomizeTimeSlots}
      />
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
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span>{shiftTable.shiftType} Shift</span>
                                      <Badge variant="outline" className="bg-white/50 backdrop-blur-sm">
                                        <Globe className="mr-1 h-3 w-3" />
                                        Egypt
                                      </Badge>
                                    </div>
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
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span>{shiftTable.shiftType} Shift</span>
                                      <Badge variant="outline" className="bg-white/50 backdrop-blur-sm">
                                        <Globe className="mr-1 h-3 w-3" />
                                        Morocco
                                      </Badge>
                                    </div>
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

  // Function to load all tables from Firestore
  const loadAllTables = async () => {
    setIsLoading(true);
    try {
      const tables = await loadShiftTables();
      // Set all tables for admin view
      setShiftTables(tables);
      // Set published tables separately
      const published = tables.filter(table => 
        !table.isArchived && 
        (table.publishedTo === 'Egypt' || table.publishedTo === 'Morocco')
      );
      setPublishedTables(published);
    } catch (error) {
      console.error('Error loading tables:', error);
      toast.error('Failed to load tables');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize active tab from localStorage after mount
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab && ['admin', 'egypt', 'morocco', 'archive', 'analytics'].includes(savedTab)) {
      setActiveTab(savedTab as 'admin' | 'egypt' | 'morocco' | 'archive' | 'analytics');
    }
    // Load tables when component mounts
    loadAllTables();
  }, []);

  // Function to update both states instantly and sync with Firestore
  const updateTablesAndSync = async (newTables: ShiftTable[]) => {
    // Update local states immediately
    setShiftTables(newTables);
    const newPublished = newTables.filter(table => 
      !table.isArchived && 
      (table.publishedTo === 'Egypt' || table.publishedTo === 'Morocco')
    );
    setPublishedTables(newPublished);

    // Start saving animation
    setIsSaving(true);

    try {
      // Save to Firestore
      await saveShiftTables(newTables);
      toast.success('Changes saved successfully', {
        duration: 2000,
        position: 'bottom-right',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        icon: '💾'
      });
      // Reload tables to ensure consistency
      await loadAllTables();
    } catch (error) {
      console.error('Error saving tables:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
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
      const sessionExpiry = Cookies.get(SESSION_COOKIE);
      if (sessionExpiry) {
        const expiryTime = parseInt(sessionExpiry);
        if (Date.now() < expiryTime) {
          setIsLoggedIn(true);
          const newExpiryTime = Date.now() + SESSION_DURATION;
          Cookies.set(SESSION_COOKIE, newExpiryTime.toString(), {
            expires: new Date(newExpiryTime)
          });
        } else {
          setIsLoggedIn(false);
          Cookies.remove(SESSION_COOKIE);
        }
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    const expiryTime = Date.now() + SESSION_DURATION;
    Cookies.set(SESSION_COOKIE, expiryTime.toString(), {
      expires: new Date(expiryTime)
    });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    Cookies.remove(SESSION_COOKIE);
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