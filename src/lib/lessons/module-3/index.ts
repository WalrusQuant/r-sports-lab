import { LessonModule } from '../types';
import step1 from './step-1';
import step2 from './step-2';
import step3 from './step-3';
import step4 from './step-4';
import step5 from './step-5';
import step6 from './step-6';

const module3: LessonModule = {
  id: 'module-3',
  title: 'Hybrid Models & Forecasting',
  description:
    'Combine Bradley-Terry ratings with offensive/defensive strength to predict spreads and win probabilities, then forecast a full week.',
  steps: [step1, step2, step3, step4, step5, step6],
};

export default module3;
