import { format, subYears, subDays } from 'date-fns';

export const getDefaultDateRange = () => {
  const endDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const startDate = format(subYears(new Date(), 10), 'yyyy-MM-dd');
  return { startDate, endDate };
}; 