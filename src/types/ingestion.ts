/**
 * File: src/types/ingestion.ts
 * Description: Defines optional Advanced Ingestion override structures for manual inclusion, exclusion, and emphasis locking.
 * Author: Luke Frohling
 */

export interface SectionOverrideState {
  manualMode: boolean;
  includedIds: string[];
  excludedIds: string[];
}

export interface IngestionOverrides {
  emphasisOverride: {
    enabled: boolean;
    value: string;
  };
  certifications: SectionOverrideState;
  training: SectionOverrideState;
  licenses: SectionOverrideState;
  skills: SectionOverrideState;
  languages: SectionOverrideState;
  hobbies: SectionOverrideState;
  experiences: SectionOverrideState;
}

export const createDefaultIngestionOverrides = (): IngestionOverrides => ({
  emphasisOverride: { enabled: false, value: 'cross_industry_ai' },
  certifications: { manualMode: false, includedIds: [], excludedIds: [] },
  training: { manualMode: false, includedIds: [], excludedIds: [] },
  licenses: { manualMode: false, includedIds: [], excludedIds: [] },
  skills: { manualMode: false, includedIds: [], excludedIds: [] },
  languages: { manualMode: false, includedIds: [], excludedIds: [] },
  hobbies: { manualMode: false, includedIds: [], excludedIds: [] },
  experiences: { manualMode: false, includedIds: [], excludedIds: [] },
});
