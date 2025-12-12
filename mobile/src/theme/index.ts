/**
 * Apple-inspired Design System for SmartLab HMI
 * 
 * This theme follows Apple's Human Interface Guidelines:
 * - Clean, minimalist aesthetics
 * - SF Pro typography styling
 * - Subtle depth with shadows and blur
 * - Semantic color system
 * - Rounded corners and smooth transitions
 */

export const Colors = {
  // Primary Colors (Apple Blue)
  primary: '#007AFF',
  primaryLight: '#5AC8FA',
  primaryDark: '#0051A8',

  // Semantic Colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#5AC8FA',

  // Grayscale (Apple System Colors)
  white: '#FFFFFF',
  background: '#F2F2F7',
  secondaryBackground: '#FFFFFF',
  tertiaryBackground: '#F2F2F7',
  groupedBackground: '#F2F2F7',
  
  // Label Colors
  label: '#000000',
  secondaryLabel: '#3C3C43',
  tertiaryLabel: '#3C3C4399',
  quaternaryLabel: '#3C3C434D',
  placeholderText: '#3C3C434D',

  // Separator Colors
  separator: '#3C3C4349',
  opaqueSeparator: '#C6C6C8',

  // Fill Colors
  fill: '#78788033',
  secondaryFill: '#78788029',
  tertiaryFill: '#7676801F',
  quaternaryFill: '#74748014',

  // System Colors
  systemGray: '#8E8E93',
  systemGray2: '#AEAEB2',
  systemGray3: '#C7C7CC',
  systemGray4: '#D1D1D6',
  systemGray5: '#E5E5EA',
  systemGray6: '#F2F2F7',

  // Accent Colors
  teal: '#30B0C7',
  green: '#34C759',
  mint: '#00C7BE',
  cyan: '#32ADE6',
  blue: '#007AFF',
  indigo: '#5856D6',
  purple: '#AF52DE',
  pink: '#FF2D55',
  red: '#FF3B30',
  orange: '#FF9500',
  yellow: '#FFCC00',
};

export const Typography = {
  // Large Title - Used for main titles
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.37,
    lineHeight: 41,
  },

  // Title 1
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.36,
    lineHeight: 34,
  },

  // Title 2
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: 0.35,
    lineHeight: 28,
  },

  // Title 3
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.38,
    lineHeight: 25,
  },

  // Headline
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
    lineHeight: 22,
  },

  // Body
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: -0.41,
    lineHeight: 22,
  },

  // Callout
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
    lineHeight: 21,
  },

  // Subheadline
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
    lineHeight: 20,
  },

  // Footnote
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
    lineHeight: 18,
  },

  // Caption 1
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 16,
  },

  // Caption 2
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    letterSpacing: 0.07,
    lineHeight: 13,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xl: 20,
  full: 9999,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Common component styles
export const CommonStyles = {
  // Card style following Apple's grouped content pattern
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    ...Shadows.medium,
  },

  // Primary button (filled)
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.medium,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  primaryButtonText: {
    color: Colors.white,
    ...Typography.headline,
  },

  // Secondary button (outline)
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  secondaryButtonText: {
    color: Colors.primary,
    ...Typography.headline,
  },

  // Tertiary button (text only)
  tertiaryButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center' as const,
  },

  tertiaryButtonText: {
    color: Colors.primary,
    ...Typography.body,
  },

  // Input field
  input: {
    backgroundColor: Colors.tertiaryFill,
    borderRadius: BorderRadius.medium,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    ...Typography.body,
    color: Colors.label,
  },

  // Screen container
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Section header
  sectionHeader: {
    ...Typography.footnote,
    color: Colors.secondaryLabel,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.lg,
  },
};

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  CommonStyles,
};
