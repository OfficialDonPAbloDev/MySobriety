import {
  calculateSobrietyTime,
  formatSobrietyTime,
  getAchievedMilestones,
  getNextMilestone,
  getDaysUntilNextMilestone,
  MILESTONES,
} from '../../../../src/features/sobriety-tracker/utils/timeCalculations';

describe('Sobriety Time Calculations', () => {
  describe('calculateSobrietyTime', () => {
    it('should return zeros for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const result = calculateSobrietyTime(futureDate);

      expect(result.years).toBe(0);
      expect(result.months).toBe(0);
      expect(result.days).toBe(0);
      expect(result.totalDays).toBe(0);
    });

    it('should calculate duration for exactly 1 day', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(yesterday.getHours(), yesterday.getMinutes(), yesterday.getSeconds());

      const result = calculateSobrietyTime(yesterday);

      expect(result.totalDays).toBe(1);
    });

    it('should calculate duration for exactly 1 week', () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const result = calculateSobrietyTime(oneWeekAgo);

      expect(result.totalDays).toBe(7);
    });

    it('should calculate duration for 30 days', () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = calculateSobrietyTime(thirtyDaysAgo);

      expect(result.totalDays).toBe(30);
    });

    it('should calculate years correctly', () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      const result = calculateSobrietyTime(twoYearsAgo);

      expect(result.years).toBe(2);
    });

    it('should return totalHours, totalMinutes, totalSeconds', () => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const result = calculateSobrietyTime(oneDayAgo);

      expect(result.totalHours).toBeGreaterThanOrEqual(24);
      expect(result.totalMinutes).toBeGreaterThanOrEqual(24 * 60);
      expect(result.totalSeconds).toBeGreaterThanOrEqual(24 * 60 * 60);
    });
  });

  describe('formatSobrietyTime', () => {
    it('should format years and months', () => {
      const time = {
        years: 2,
        months: 3,
        days: 5,
        hours: 10,
        minutes: 30,
        seconds: 45,
        totalDays: 795,
        totalHours: 19080,
        totalMinutes: 1144830,
        totalSeconds: 68689845,
      };

      const result = formatSobrietyTime(time);

      expect(result).toContain('2 years');
      expect(result).toContain('3 months');
      expect(result).toContain('5 days');
    });

    it('should handle singular forms', () => {
      const time = {
        years: 1,
        months: 1,
        days: 1,
        hours: 1,
        minutes: 1,
        seconds: 1,
        totalDays: 396,
        totalHours: 9504,
        totalMinutes: 570241,
        totalSeconds: 34214461,
      };

      const result = formatSobrietyTime(time);

      expect(result).toContain('1 year');
      expect(result).toContain('1 month');
      expect(result).toContain('1 day');
    });

    it('should return "Just started" for zero time', () => {
      const time = {
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

      const result = formatSobrietyTime(time);

      expect(result).toBe('Just started');
    });

    it('should show hours and minutes when no days', () => {
      const time = {
        years: 0,
        months: 0,
        days: 0,
        hours: 5,
        minutes: 30,
        seconds: 0,
        totalDays: 0,
        totalHours: 5,
        totalMinutes: 330,
        totalSeconds: 19800,
      };

      const result = formatSobrietyTime(time);

      expect(result).toContain('5 hours');
      expect(result).toContain('30 minutes');
    });
  });

  describe('Milestone functions', () => {
    it('should have correct number of milestones', () => {
      expect(MILESTONES.length).toBeGreaterThan(10);
    });

    it('should return achieved milestones', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 35);

      const milestones = getAchievedMilestones(35, startDate);

      const achieved = milestones.filter((m) => m.achieved);
      expect(achieved.length).toBeGreaterThan(0);

      // Should have achieved 1 day, 3 days, 1 week, 2 weeks, 1 month
      const achievedNames = achieved.map((m) => m.name);
      expect(achievedNames).toContain('24 Hours');
      expect(achievedNames).toContain('3 Days');
      expect(achievedNames).toContain('1 Week');
      expect(achievedNames).toContain('2 Weeks');
      expect(achievedNames).toContain('1 Month');
    });

    it('should return next milestone', () => {
      const next = getNextMilestone(5);

      expect(next).not.toBeNull();
      expect(next?.name).toBe('1 Week');
      expect(next?.daysRequired).toBe(7);
    });

    it('should return null when all milestones achieved', () => {
      const next = getNextMilestone(10000);

      expect(next).toBeNull();
    });

    it('should calculate days until next milestone', () => {
      const daysUntil = getDaysUntilNextMilestone(5);

      expect(daysUntil).toBe(2); // 7 - 5 = 2 days until 1 week
    });

    it('should return 0 when all milestones achieved', () => {
      const daysUntil = getDaysUntilNextMilestone(10000);

      expect(daysUntil).toBe(0);
    });
  });
});
