export type Reza = 'test';

export const environmentStatus = {
  project: 'angular-signal-forms',
  status: 'ready',
} as const;

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`${environmentStatus.project}: development environment ${environmentStatus.status}`);
}
