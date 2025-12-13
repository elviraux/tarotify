// Date formatting utilities

export const formatDateLong = (date: Date): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
};

export const formatDateShort = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
};

export const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

export const formatDateWithOrdinal = (date: Date): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
};

export const formatTime12Hour = (hours: number, minutes: number): string => {
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  const minutesStr = minutes.toString().padStart(2, '0');

  return `${hour12}:${minutesStr} ${period}`;
};

export const getZodiacSign = (date: Date): string => {
  const day = date.getDate();
  const month = date.getMonth() + 1;

  const signs = [
    { sign: 'Capricorn', endMonth: 1, endDay: 19 },
    { sign: 'Aquarius', endMonth: 2, endDay: 18 },
    { sign: 'Pisces', endMonth: 3, endDay: 20 },
    { sign: 'Aries', endMonth: 4, endDay: 19 },
    { sign: 'Taurus', endMonth: 5, endDay: 20 },
    { sign: 'Gemini', endMonth: 6, endDay: 20 },
    { sign: 'Cancer', endMonth: 7, endDay: 22 },
    { sign: 'Leo', endMonth: 8, endDay: 22 },
    { sign: 'Virgo', endMonth: 9, endDay: 22 },
    { sign: 'Libra', endMonth: 10, endDay: 22 },
    { sign: 'Scorpio', endMonth: 11, endDay: 21 },
    { sign: 'Sagittarius', endMonth: 12, endDay: 21 },
    { sign: 'Capricorn', endMonth: 12, endDay: 31 },
  ];

  for (const { sign, endMonth, endDay } of signs) {
    if (month < endMonth || (month === endMonth && day <= endDay)) {
      return sign;
    }
  }

  return 'Capricorn';
};
