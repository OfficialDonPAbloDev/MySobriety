/**
 * Calculate the time elapsed since a given date
 * Returns years, months, days, hours, minutes, and seconds
 */
export interface SobrietyTime {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
}

export function calculateSobrietyTime(startDate: Date): SobrietyTime {
  const now = new Date();
  const start = new Date(startDate);

  // If start date is in the future, return zeros
  if (start > now) {
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0,
      totalHours: 0,
      totalMinutes: 0,
      totalSeconds: 0,
    };
  }

  // Calculate total time difference in milliseconds
  const diffMs = now.getTime() - start.getTime();

  // Calculate totals
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  // Calculate years and remaining months
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  // Adjust if day hasn't been reached yet this month
  if (now.getDate() < start.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }

  // Calculate remaining days after years and months
  const tempDate = new Date(start);
  tempDate.setFullYear(tempDate.getFullYear() + years);
  tempDate.setMonth(tempDate.getMonth() + months);

  const remainingMs = now.getTime() - tempDate.getTime();
  const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));

  // Calculate hours, minutes, seconds from the remaining time after full days
  const dayMs = remainingMs % (1000 * 60 * 60 * 24);
  const hours = Math.floor(dayMs / (1000 * 60 * 60));
  const minuteMs = dayMs % (1000 * 60 * 60);
  const minutes = Math.floor(minuteMs / (1000 * 60));
  const secondMs = minuteMs % (1000 * 60);
  const seconds = Math.floor(secondMs / 1000);

  return {
    years,
    months,
    days: remainingDays,
    hours,
    minutes,
    seconds,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
  };
}

/**
 * Format sobriety time as a human-readable string
 */
export function formatSobrietyTime(time: SobrietyTime): string {
  const parts: string[] = [];

  if (time.years > 0) {
    parts.push(`${time.years} ${time.years === 1 ? 'year' : 'years'}`);
  }
  if (time.months > 0) {
    parts.push(`${time.months} ${time.months === 1 ? 'month' : 'months'}`);
  }
  if (time.days > 0) {
    parts.push(`${time.days} ${time.days === 1 ? 'day' : 'days'}`);
  }

  if (parts.length === 0) {
    if (time.hours > 0) {
      parts.push(`${time.hours} ${time.hours === 1 ? 'hour' : 'hours'}`);
    }
    if (time.minutes > 0) {
      parts.push(`${time.minutes} ${time.minutes === 1 ? 'minute' : 'minutes'}`);
    }
  }

  return parts.length > 0 ? parts.join(', ') : 'Just started';
}

/**
 * Get milestone achievements based on sobriety duration
 */
export interface Milestone {
  id: string;
  name: string;
  description: string;
  daysRequired: number;
  icon: string;
  achieved: boolean;
  achievedAt?: Date;
}

export const MILESTONES: Omit<Milestone, 'achieved' | 'achievedAt'>[] = [
  { id: '1_day', name: '24 Hours', description: 'First day complete!', daysRequired: 1, icon: '🌟' },
  { id: '3_days', name: '3 Days', description: 'Three days strong!', daysRequired: 3, icon: '💪' },
  { id: '1_week', name: '1 Week', description: 'One week milestone!', daysRequired: 7, icon: '🎯' },
  { id: '2_weeks', name: '2 Weeks', description: 'Two weeks of progress!', daysRequired: 14, icon: '🏆' },
  { id: '1_month', name: '1 Month', description: 'One month accomplished!', daysRequired: 30, icon: '🥇' },
  { id: '2_months', name: '2 Months', description: 'Two months of strength!', daysRequired: 60, icon: '⭐' },
  { id: '3_months', name: '3 Months', description: 'Quarter year milestone!', daysRequired: 90, icon: '🎖️' },
  { id: '6_months', name: '6 Months', description: 'Half year of sobriety!', daysRequired: 180, icon: '🏅' },
  { id: '9_months', name: '9 Months', description: 'Nine months strong!', daysRequired: 270, icon: '💎' },
  { id: '1_year', name: '1 Year', description: 'One full year!', daysRequired: 365, icon: '👑' },
  { id: '18_months', name: '18 Months', description: 'A year and a half!', daysRequired: 548, icon: '🌈' },
  { id: '2_years', name: '2 Years', description: 'Two years of freedom!', daysRequired: 730, icon: '🎊' },
  { id: '3_years', name: '3 Years', description: 'Three years accomplished!', daysRequired: 1095, icon: '🎉' },
  { id: '5_years', name: '5 Years', description: 'Five years of sobriety!', daysRequired: 1825, icon: '🏰' },
  { id: '10_years', name: '10 Years', description: 'A decade of strength!', daysRequired: 3650, icon: '🌟' },
];

export function getAchievedMilestones(totalDays: number, startDate: Date): Milestone[] {
  return MILESTONES.map((milestone) => {
    const achieved = totalDays >= milestone.daysRequired;
    const achievedAt = achieved
      ? new Date(startDate.getTime() + milestone.daysRequired * 24 * 60 * 60 * 1000)
      : undefined;

    return {
      ...milestone,
      achieved,
      achievedAt,
    };
  });
}

export function getNextMilestone(totalDays: number): (typeof MILESTONES)[0] | null {
  return MILESTONES.find((m) => m.daysRequired > totalDays) || null;
}

export function getDaysUntilNextMilestone(totalDays: number): number {
  const next = getNextMilestone(totalDays);
  return next ? next.daysRequired - totalDays : 0;
}
