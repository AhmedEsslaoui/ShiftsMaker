const loadShiftTables = async () => {
  try {
    const response = await fetch('/api/loadShiftTables');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.shiftTables;
  } catch (error: any) {
    console.error('Error loading shift tables:', error.message);
    throw error;
  }
};

export default loadShiftTables;