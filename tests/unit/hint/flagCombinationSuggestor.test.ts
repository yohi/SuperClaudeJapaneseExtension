import { FlagCombinationSuggestor } from '../../../src/hint/flagCombinationSuggestor';
import { I18nManager } from '../../../src/i18n/i18nManager';

describe('FlagCombinationSuggestor', () => {
  let suggestor: FlagCombinationSuggestor;
  let i18nManager: I18nManager;

  beforeEach(() => {
    i18nManager = new I18nManager('./translations');
    suggestor = new FlagCombinationSuggestor(i18nManager);
  });

  describe('suggestRelatedFlags', () => {
    it('should suggest related flags for --think', () => {
      const result = suggestor.suggestRelatedFlags('--think');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBeGreaterThan(0);
        expect(result.value).toContainEqual(
          expect.objectContaining({
            flag: '--seq',
            reason: 'complex_analysis',
          })
        );
      }
    });

    it('should suggest related flags for --magic', () => {
      const result = suggestor.suggestRelatedFlags('--magic');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContainEqual(
          expect.objectContaining({
            flag: '--persona-frontend',
            reason: 'ui_development',
          })
        );
      }
    });

    it('should return empty array for unknown flag', () => {
      const result = suggestor.suggestRelatedFlags('--unknown');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });
  });

  describe('detectConflicts', () => {
    it('should detect conflict between --no-mcp and --seq', () => {
      const result = suggestor.detectConflicts(['--no-mcp', '--seq']);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBeGreaterThan(0);
        expect(result.value[0]).toEqual(
          expect.objectContaining({
            flags: ['--no-mcp', '--seq'],
            severity: 'error',
          })
        );
      }
    });

    it('should detect conflict between --uc and --verbose', () => {
      const result = suggestor.detectConflicts(['--uc', '--verbose']);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBeGreaterThan(0);
        expect(result.value[0].severity).toBe('warning');
      }
    });

    it('should return empty array for no conflicts', () => {
      const result = suggestor.detectConflicts(['--think', '--seq']);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });
  });

  describe('getSuggestionWithExample', () => {
    it('should return suggestion with example usage', async () => {
      await i18nManager.initialize('en');
      const result = suggestor.getSuggestionWithExample('--think', '--seq');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.suggestion).toContain('--seq');
        expect(result.value.example).toBeDefined();
        expect(result.value.description).toBeDefined();
      }
    });

    it('should return localized suggestion in Japanese', async () => {
      await i18nManager.initialize('ja');
      const result = suggestor.getSuggestionWithExample('--think', '--seq');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.description).toMatch(/複雑|分析/);
      }
    });
  });
});
