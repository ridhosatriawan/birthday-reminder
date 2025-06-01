import {
  formatDate,
  getTimezonesAtNineAM,
  getTodayString,
} from '../../../src/utils/timezone';

describe('Time Utilities', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('getTimezonesAtNineAM', () => {
    it('should include Asia/Jakarta when it is 9 AM there', () => {
      jest.setSystemTime(new Date(Date.UTC(2023, 0, 1, 2, 0)));

      const result = getTimezonesAtNineAM();

      expect(result).toContain('Asia/Jakarta');
    });
  });

  describe('getTodayString', () => {
    it("should return today's date in default format MM-DD", () => {
      const mockDate = new Date('2023-12-25T10:00:00Z');
      jest.setSystemTime(mockDate);

      const result = getTodayString();
      expect(result).toBe('12-25');
    });

    it("should return today's date in custom format", () => {
      const mockDate = new Date('2023-07-15T10:00:00Z');
      jest.setSystemTime(mockDate);

      const result = getTodayString('YYYY/MM/DD');
      expect(result).toBe('2023/07/15');
    });
  });

  describe('formatDate', () => {
    it('should format the date string in default format', () => {
      const result = formatDate('2023-11-05');
      expect(result).toBe('11-05');
    });

    it('should format the date string in custom format', () => {
      const result = formatDate('2023-08-20', 'YYYY/MM/DD');
      expect(result).toBe('2023/08/20');
    });
  });
});
