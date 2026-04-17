/**
 * API Service untuk integrasi Google Apps Script
 */

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzj8UXbHnVXezybVPwmyxqgDreZLX_BHz3Ly-YMN4fEEUTPQ_RfGVKUDTC5QSizlJYnZA/exec';

export interface AttendanceData {
  action: 'clockIn' | 'clockOut'; // Sesuai dengan if (action === "clockIn" || ...)
  id: string;
  type: 'MASUK' | 'KELUAR'; // Digunakan untuk logSheet.appendRow
  location: {
    lat: number;
    lng: number;
  };
  photoBase64: string; // Sesuai dengan const { photoBase64 } = data;
}

export const submitAttendance = async (data: AttendanceData): Promise<void> => {
  try {
    // Kita hantar sebagai text/plain supaya GAS tidak pening dengan CORS preflight
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(data),
    });
    
    console.log('Data dihantar mengikut format code.gs anda.');
  } catch (error) {
    console.error('Ralat:', error);
    throw error;
  }
};
