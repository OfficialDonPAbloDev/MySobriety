// Services
export {
  goalsService,
  type Goal,
  type GoalStep,
  type GoalCategory,
  type GoalStatus,
  type CreateGoalInput,
  type UpdateGoalInput,
  GOAL_CATEGORIES,
  SUGGESTED_GOALS,
} from './services/goalsService';

// Hooks
export { useGoals, useGoalDetail } from './hooks/useGoals';

// Components
export { GoalCard } from './components/GoalCard';
export { GoalEditor } from './components/GoalEditor';
export { GoalDetail } from './components/GoalDetail';
