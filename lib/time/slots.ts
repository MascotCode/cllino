/**
 * Time slot generation utilities for Africa/Casablanca timezone
 */

export interface Slot {
  id: string;
  startISO: string;
  display: string;
  disabled: boolean;
}

export interface SlotOptions {
  date: Date;
  startHour?: number;
  endHour?: number;
  stepMin?: number;
  leadMin?: number;
  timeZone?: string;
}

/**
 * Round up a date to the next interval
 * @param date - The date to round up
 * @param minutes - The interval in minutes (e.g., 30 for 30-minute intervals)
 */
export function roundUp(date: Date, minutes: number): Date {
  const ms = 1000 * 60 * minutes;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
}

/**
 * Generate time slots for a given day
 * @param options - Configuration options
 * @returns Array of slot objects
 */
export function generateSlots(options: SlotOptions): Slot[] {
  const {
    date,
    startHour = 9,
    endHour = 18,
    stepMin = 30,
    leadMin = 15,
    timeZone = 'Africa/Casablanca',
  } = options;

  const slots: Slot[] = [];
  
  // Get the current time and calculate the minimum start time (now + lead time)
  const now = new Date();
  const minStartTime = new Date(now.getTime() + leadMin * 60 * 1000);
  
  // Create slots for the given day
  const slotDate = new Date(date);
  
  // Generate slots from startHour to endHour
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += stepMin) {
      // Create a date in the local timezone
      const slotDateTime = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate(), hour, minute, 0, 0);
      
      // Check if this slot is in the past (considering lead time)
      const isDisabled = slotDateTime <= minStartTime;
      
      // Format the display time
      const display = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone,
      }).format(slotDateTime);
      
      // Create slot ID (HHmm format)
      const id = `${hour.toString().padStart(2, '0')}${minute.toString().padStart(2, '0')}`;
      
      // Convert to ISO string for consistent storage
      const startISO = slotDateTime.toISOString();
      
      slots.push({
        id,
        startISO,
        display,
        disabled: isDisabled,
      });
    }
  }
  
  return slots;
}
