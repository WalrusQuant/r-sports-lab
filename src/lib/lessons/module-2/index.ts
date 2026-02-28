import { LessonModule } from '../types';
import step1 from './step-1';
import step2 from './step-2';
import step3 from './step-3';
import step4 from './step-4';
import step5 from './step-5';
import step6 from './step-6';

const module2: LessonModule = {
  id: 'module-2',
  title: 'Bradley-Terry Ratings',
  description:
    'Fit a Bradley-Terry model to estimate team strength from win/loss outcomes, then evaluate it with a train/test split.',
  steps: [step1, step2, step3, step4, step5, step6],
};

export default module2;
