// Components
export { SobrietyCounter } from './components/SobrietyCounter';
export { MilestoneCard } from './components/MilestoneCard';
export { DatePickerModal } from './components/DatePickerModal';

// Hooks
export { useSobrietyTracker } from './hooks/useSobrietyTracker';

// Services
export { sobrietyService } from './services/sobrietyService';
export type { SobrietyRecord, MilestoneRecord, CreateSobrietyRecordInput } from './services/sobrietyService';

// Utils
export {
  calculateSobrietyTime,
  formatSobrietyTime,
  getAchievedMilestones,
  getNextMilestone,
  getDaysUntilNextMilestone,
  MILESTONES,
} from './utils/timeCalculations';
export type { SobrietyTime, Milestone } from './utils/timeCalculations';
