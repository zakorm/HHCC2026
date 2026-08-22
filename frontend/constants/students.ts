export type TopicStatus = 'strong' | 'weak' | 'neutral';

export type StudentProfile = {
  name: string;
  yearShort: string;
  subjects: string;
  strongArea: { topic: string; percent: number };
  weakArea: { topic: string; percent: number };
  topics: { name: string; percent: number; status: TopicStatus }[];
  recommended: { subject: string; name: string; description: string }[];
};

export const STUDENTS: Record<string, StudentProfile> = {
  'Amara Osei': {
    name: 'Amara Osei',
    yearShort: 'Year 7',
    subjects: 'Maths, English, Science',
    strongArea: { topic: 'Persuasive writing', percent: 100 },
    weakArea: { topic: 'Fractions', percent: 10 },
    topics: [
      { name: 'Fractions', percent: 10, status: 'weak' },
      { name: 'Persuasive writing', percent: 100, status: 'strong' },
      { name: 'Cell structure', percent: 45, status: 'weak' },
      { name: 'Algebra basics', percent: 70, status: 'strong' },
      { name: 'Reading comprehension', percent: 0, status: 'neutral' },
    ],
    recommended: [
      { subject: 'Biology', name: 'Cell Structure Explainer', description: 'Video + quiz · 10 min' },
      { subject: 'Maths', name: 'Fraction Fundamentals', description: 'Interactive practice set · 15 min' },
      { subject: 'Maths', name: 'Algebra Warm-up', description: 'Daily drill · 5 min' },
      { subject: 'English', name: 'Reading Comprehension Boost', description: 'Interactive practice set · 15 min' },
    ],
  },
  'Liam Chen': {
    name: 'Liam Chen',
    yearShort: 'Year 8',
    subjects: 'Maths, English, Science',
    strongArea: { topic: 'Algebra basics', percent: 88 },
    weakArea: { topic: 'Persuasive writing', percent: 32 },
    topics: [
      { name: 'Persuasive writing', percent: 32, status: 'weak' },
      { name: 'Cell structure', percent: 40, status: 'weak' },
      { name: 'Algebra basics', percent: 88, status: 'strong' },
      { name: 'Fractions', percent: 65, status: 'strong' },
      { name: 'Reading comprehension', percent: 0, status: 'neutral' },
    ],
    recommended: [
      { subject: 'Biology', name: 'Cell Structure Explainer', description: 'Video + quiz · 10 min' },
      { subject: 'Maths', name: 'Algebra Extension Pack', description: 'Challenge set · 15 min' },
      { subject: 'Maths', name: 'Fraction Practice Set', description: 'Interactive practice set · 12 min' },
      { subject: 'English', name: 'Persuasive Writing Toolkit', description: 'Guided templates · 12 min' },
    ],
  },
  'Priya Nair': {
    name: 'Priya Nair',
    yearShort: 'Year 7',
    subjects: 'Maths, English, Science',
    strongArea: { topic: 'Reading comprehension', percent: 92 },
    weakArea: { topic: 'Cell structure', percent: 38 },
    topics: [
      { name: 'Cell structure', percent: 38, status: 'weak' },
      { name: 'Reading comprehension', percent: 92, status: 'strong' },
      { name: 'Algebra basics', percent: 60, status: 'strong' },
      { name: 'Persuasive writing', percent: 66, status: 'strong' },
      { name: 'Fractions', percent: 0, status: 'neutral' },
    ],
    recommended: [
      { subject: 'Biology', name: 'Cell Structure Explainer', description: 'Video + quiz · 10 min' },
      { subject: 'Maths', name: 'Fraction Fundamentals', description: 'Interactive practice set · 15 min' },
      { subject: 'English', name: 'Reading Comprehension Boost', description: 'Interactive practice set · 15 min' },
      { subject: 'English', name: 'Persuasive Writing Enrichment', description: 'Extension activity · 10 min' },
    ],
  },
  'Ethan Brooks': {
    name: 'Ethan Brooks',
    yearShort: 'Year 8',
    subjects: 'Maths, English, Science',
    strongArea: { topic: 'Cell structure', percent: 80 },
    weakArea: { topic: 'Fractions', percent: 18 },
    topics: [
      { name: 'Fractions', percent: 18, status: 'weak' },
      { name: 'Cell structure', percent: 80, status: 'strong' },
      { name: 'Algebra basics', percent: 55, status: 'strong' },
      { name: 'Reading comprehension', percent: 70, status: 'strong' },
      { name: 'Persuasive writing', percent: 0, status: 'neutral' },
    ],
    recommended: [
      { subject: 'Biology', name: 'Cell Structure Deep Dive', description: 'Video + quiz · 12 min' },
      { subject: 'Maths', name: 'Fraction Fundamentals', description: 'Interactive practice set · 15 min' },
      { subject: 'Maths', name: 'Algebra Warm-up', description: 'Daily drill · 5 min' },
      { subject: 'English', name: 'Persuasive Writing Starter', description: 'Guided templates · 10 min' },
    ],
  },
};

export const DEFAULT_STUDENT = STUDENTS['Amara Osei'];
