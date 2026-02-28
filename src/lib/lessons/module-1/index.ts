import { LessonModule } from '../types';
import step1 from './step-1';
import step2 from './step-2';
import step3 from './step-3';
import step4 from './step-4';
import step5 from './step-5';
import step6 from './step-6';

const module1: LessonModule = {
  id: 'module-1',
  title: 'Data & Team Strengths',
  description:
    'Load NFL game data, clean it up, and build offensive & defensive strength ratings for every team.',
  steps: [step1, step2, step3, step4, step5, step6],
};

export default module1;
