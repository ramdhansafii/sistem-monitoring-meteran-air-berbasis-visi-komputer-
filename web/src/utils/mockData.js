import { format, subDays } from 'date-fns';
import { id } from 'date-fns/locale';

export const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function generateWeeklyData() {
  const data = [];
  const today = new Date();
  const values = [18, 16, 14, 20, 22, 19, 12];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    data.push({
      day: DAYS_ID[date.getDay()],
      date: format(date, 'dd/MM/yyyy'),
      usage: values[6 - i],
    });
  }
  return data;
}

export function generateHistoryData(days = 30) {
  const data = [];
  const today = new Date();
  let cumulative = 300;
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const daily = Math.round(10 + Math.random() * 15);
    cumulative += daily;
    data.push({
      date: format(date, 'dd MMM yyyy', { locale: id }),
      shortDate: format(date, 'dd/MM'),
      day: format(date, 'EEEE', { locale: id }),
      usage: daily,
      cumulative,
      status: daily > 20 ? 'Tinggi' : daily > 15 ? 'Normal' : 'Rendah',
    });
  }
  return data;
}

export const MOCK_STATE = {
  dailyUsage: 12.4,
  monthlyUsage: 320,
  meterReading: [3, 4, 2, 5, 7, 8],
  weeklyData: generateWeeklyData(),
  historyData: generateHistoryData(30),
};
