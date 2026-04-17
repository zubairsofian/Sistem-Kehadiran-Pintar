/**
 * API Service untuk integrasi Google Apps Script
 */

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzj8UXbHnVXezybVPwmyxqgDreZLX_BHz3Ly-YMN4fEEUTPQ_RfGVKUDTC5QSizlJYnZA/exec';

export interface AttendanceData {
  action: 'MASUK' | 'KELUAR';
  id: string;
  lat: number;
  lng: number;
  photo: string; // Base64 string
}

export const submitAttendance = async (data: AttendanceData): Promise<void> => {
  try {
    // Google Apps Script Web App memerlukan mode 'no-cors' jika tidak menguruskan CORS headers secara manual
    // Disebabkan 'no-cors', kita tidak boleh membaca respon JSON yang dikembalikan (Opaque Response)
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    // Kerana 'no-cors' tidak memulangkan status 200/400 yang boleh dibaca, 
    // kita andaikan berjaya jika fetch tidak melontar error.
  } catch (error) {
    console.error('Ralat semasa menghantar data:', error);
    throw error;
  }
};
