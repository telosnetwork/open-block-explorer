export interface Theme {
  primary?: string;
  secondary?: string;
  accent?: string;
  dark?: string;
  positive?: string;
  negative?: string;
  info?: string;
  warning?: string;
  'color-map'?: string;
  'color-primary-gradient'?: string;
  'color-secondary-gradient'?: string;
  'color-tertiary-gradient'?: string;
  'color-progress-gradient'?: string;
  'color-producer-card-background'?: string;
  'color-select-box-background'?: string;
}

export const themeProps: (keyof Theme)[] = [
    'primary',
    'secondary',
    'accent',
    'dark',
    'positive',
    'negative',
    'info',
    'warning',
    'color-map',
    'color-primary-gradient',
    'color-secondary-gradient',
    'color-tertiary-gradient',
    'color-progress-gradient',
    'color-producer-card-background',
    'color-select-box-background',
];
