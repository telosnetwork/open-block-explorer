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
  'color-header-background'?: string;
  'color-header-text'?: string;
  'color-header-border'?: string;
  'color-header-support-background'?: string;
  'color-graph-shadow'?: string;
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
    'color-header-background',
    'color-header-text',
    'color-header-border',
    'color-header-support-background',
    'color-graph-shadow',
];
