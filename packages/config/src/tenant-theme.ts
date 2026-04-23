export const tenantThemePresets = ['forest', 'slate', 'sunrise'] as const;

export type TenantThemePreset = (typeof tenantThemePresets)[number];

