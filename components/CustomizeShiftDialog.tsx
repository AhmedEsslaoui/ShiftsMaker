'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Clock } from 'lucide-react';
import type { ShiftType } from '@/types/types';

interface CustomizeShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shiftType: ShiftType;
  timeSlots: string[];
  onSave: (timeSlots: string[]) => void;
}

const shiftRanges = {
  'Morning': { start: 8, end: 16 },
  'Day': { start: 16, end: 24 },
  'Afternoon': { start: 12, end: 20 },
  'Evening': { start: 20, end: 4 },
  'Night': { start: 0, end: 8 }
};

const generateTimeSlots = (start: number, end: number): string[] => {
  const slots: string[] = [];
  let current = start;

  // Handle shifts that cross midnight
  if (end < start) {
    // Add slots from start to midnight
    while (current < 24) {
      slots.push(`${current.toString().padStart(2, '0')}:00`);
      current++;
    }
    // Add slots from midnight to end
    current = 0;
    while (current <= end) {
      slots.push(`${current.toString().padStart(2, '0')}:00`);
      current++;
    }
  } else {
    // Normal case: start to end on the same day
    while (current <= end) {
      // Handle end time of 24:00 specially
      const timeStr = current === 24 ? '24:00' : `${current.toString().padStart(2, '0')}:00`;
      slots.push(timeStr);
      current++;
    }
  }
  
  return slots;
};

const isTimeInRange = (time: string, start: number, end: number): boolean => {
  const [hours] = time.split(':').map(Number);
  
  if (end < start) {
    // For shifts that cross midnight (e.g., Evening 20-4)
    return hours >= start || hours <= end;
  } else {
    // For normal shifts
    return hours >= start && hours <= end;
  }
};

const compareTimeSlots = (a: string, b: string): boolean => {
  const [hoursA] = a.split(':').map(Number);
  const [hoursB] = b.split(':').map(Number);
  
  // Handle special case where b is midnight (24:00)
  if (b === '24:00') {
    return hoursA <= 24;
  }
  
  // Handle cases crossing midnight
  if (hoursA > 20 && hoursB < 8) { // Assuming no shift spans more than 12 hours
    return true; // Early morning hours come after late night hours
  } else if (hoursA < 8 && hoursB > 20) {
    return false;
  }
  
  return hoursA < hoursB;
};

export function CustomizeShiftDialog({
  open,
  onOpenChange,
  shiftType,
  timeSlots,
  onSave
}: CustomizeShiftDialogProps) {
  const [slots, setSlots] = useState<string[]>([]);

  // Reset slots when dialog opens or shift type changes
  useEffect(() => {
    if (open) {
      const { start, end } = shiftRanges[shiftType];
      const initialSlots = generateTimeSlots(start, end);
      setSlots(initialSlots);
    }
  }, [open, shiftType]);

  const addTimeSlot = () => {
    const { start, end } = shiftRanges[shiftType];
    const lastSlot = slots[slots.length - 1];
    
    if (!lastSlot) {
      const startSlot = `${start.toString().padStart(2, '0')}:00`;
      setSlots([startSlot]);
      return;
    }

    const [hours] = lastSlot.split(':').map(Number);
    let nextHour = (hours + 1);
    
    if (shiftType === 'Evening' && nextHour > 23) {
      nextHour = nextHour % 24;
    }
    
    if (nextHour > end && shiftType !== 'Evening') {
      return;
    }
    
    if (shiftType === 'Evening' && nextHour > 4) {
      return;
    }

    const nextSlot = `${nextHour.toString().padStart(2, '0')}:00`;
    setSlots([...slots, nextSlot]);
  };

  const removeTimeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, value: string) => {
    const newSlots = [...slots];
    newSlots[index] = value;
    setSlots(newSlots);
  };

  const handleSave = () => {
    const { start, end } = shiftRanges[shiftType];
    
    // Check if all slots are within the valid range for this shift
    const inRange = slots.every(slot => isTimeInRange(slot, start, end));
    if (!inRange) {
      alert('All time slots must be within the shift hours');
      return;
    }

    // Check if slots are in sequential order
    const inOrder = slots.every((slot, index) => {
      if (index === 0) return true;
      return compareTimeSlots(slots[index - 1], slot);
    });

    if (!inOrder) {
      alert('Time slots must be in sequential order');
      return;
    }

    onSave(slots);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Customize {shiftType} Shift Hours
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label>Time Slots</Label>
            <Button onClick={addTimeSlot} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          </div>
          {slots.map((slot, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="time"
                value={slot === '24:00' ? '00:00' : slot}
                onChange={(e) => {
                  let newValue = e.target.value;
                  // If the user inputs midnight, store it as 24:00 for end times
                  if (newValue === '00:00' && index === slots.length - 1) {
                    newValue = '24:00';
                  }
                  updateTimeSlot(index, newValue);
                }}
                className="flex-1"
              />
              {slots.length > 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTimeSlot(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
