import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTimeBasedGreeting, formatTimeAgo, formatCurrentDateTime } from '@/utils/dateUtils.js';

describe('dateUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getTimeBasedGreeting', () => {
    it('returns "Bom dia" before 12:00', () => {
      vi.setSystemTime(new Date('2026-11-14T08:30:00'));
      expect(getTimeBasedGreeting()).toBe('Bom dia');
    });

    it('returns "Boa tarde" between 12:00 and 17:59', () => {
      vi.setSystemTime(new Date('2026-11-14T14:15:00'));
      expect(getTimeBasedGreeting()).toBe('Boa tarde');
    });

    it('returns "Boa noite" at and after 18:00', () => {
      vi.setSystemTime(new Date('2026-11-14T19:45:00'));
      expect(getTimeBasedGreeting()).toBe('Boa noite');
    });
  });

  describe('formatTimeAgo', () => {
    it('returns "Recente" when dateString is missing or empty', () => {
      expect(formatTimeAgo(null)).toBe('Recente');
      expect(formatTimeAgo(undefined)).toBe('Recente');
      expect(formatTimeAgo('')).toBe('Recente');
    });

    it('returns "Agora mesmo" when difference is less than 1 minute', () => {
      const now = new Date('2026-11-14T12:00:30Z');
      vi.setSystemTime(now);
      const thirtySecondsAgo = new Date('2026-11-14T12:00:00Z');
      expect(formatTimeAgo(thirtySecondsAgo)).toBe('Agora mesmo');
    });

    it('returns relative minutes when difference is under 60 minutes', () => {
      const now = new Date('2026-11-14T12:35:00Z');
      vi.setSystemTime(now);
      const thirtyMinutesAgo = new Date('2026-11-14T12:05:00Z');
      expect(formatTimeAgo(thirtyMinutesAgo)).toBe('Há 30 min');
    });

    it('returns relative hours when difference is between 1 and 23 hours', () => {
      const now = new Date('2026-11-14T18:00:00Z');
      vi.setSystemTime(now);
      const fourHoursAgo = new Date('2026-11-14T14:00:00Z');
      expect(formatTimeAgo(fourHoursAgo)).toBe('Há 4 h');
    });

    it('returns "Há 1 dia" when difference is 1 day', () => {
      const now = new Date('2026-11-14T12:00:00Z');
      vi.setSystemTime(now);
      const oneDayAgo = new Date('2026-11-13T12:00:00Z');
      expect(formatTimeAgo(oneDayAgo)).toBe('Há 1 dia');
    });

    it('returns "Há X dias" in plural when difference is more than 1 day', () => {
      const now = new Date('2026-11-14T12:00:00Z');
      vi.setSystemTime(now);
      const fiveDaysAgo = new Date('2026-11-09T12:00:00Z');
      expect(formatTimeAgo(fiveDaysAgo)).toBe('Há 5 dias');
    });
  });

  describe('formatCurrentDateTime', () => {
    it('returns a non-empty formatted date-time string in pt-BR', () => {
      vi.setSystemTime(new Date('2026-11-14T10:30:00'));
      const formatted = formatCurrentDateTime();
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });
});
