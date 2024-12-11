import { ShiftTable } from '@/types/types';

const saveShiftTables = async (shiftTables: ShiftTable[]): Promise<void> => {
  try {
    const response = await fetch('/api/saveShiftTables', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shiftTables }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ Shift tables saved successfully');
  } catch (error: any) {
    console.error('Error saving shift tables:', error.message);
    throw error;
  }
};

export default saveShiftTables;