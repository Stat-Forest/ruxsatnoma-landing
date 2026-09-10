import React, { forwardRef } from 'react';

export interface ServiceIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  className?: string;
}

/**
 * 1. Grazing / Cow Icon
 * Line-style cow face with horns, drooped ears, forehead, wide muzzle, eyes, and nostrils.
 */
export const GrazingIcon = forwardRef<SVGSVGElement, ServiceIconProps>(
  (
    {
      size = 24,
      color = 'currentColor',
      strokeWidth = 2,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...props}
      >
        {/* Horns */}
        <path d="M7 8 C5 6 4 3 6.5 2" />
        <path d="M17 8 C19 6 20 3 17.5 2" />
        {/* Ears */}
        <path d="M7 10 C3 9.5 2 11.5 3 13 C4.5 14.5 6.5 13 7 12" />
        <path d="M17 10 C21 9.5 22 11.5 21 13 C19.5 14.5 17.5 13 17 12" />
        {/* Head outline / forehead & cheeks */}
        <path d="M7 12 V8 H17 V12" />
        {/* Muzzle / snout */}
        <rect x="5.5" y="13" width="13" height="7.5" rx="3.5" />
        {/* Eyes */}
        <path d="M9.5 10.5h.01" />
        <path d="M14.5 10.5h.01" />
        {/* Nostrils */}
        <path d="M9 17h1" />
        <path d="M14 17h1" />
      </svg>
    );
  },
);
GrazingIcon.displayName = 'GrazingIcon';
export const CowIcon = GrazingIcon;

/**
 * 2. Hay-making / Scythe Icon
 * Curved scythe blade with tapered edge, wooden snath with dual hand-grips (nibs), and cut hay accents.
 */
export const HaymakingIcon = forwardRef<SVGSVGElement, ServiceIconProps>(
  (
    {
      size = 24,
      color = 'currentColor',
      strokeWidth = 2,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...props}
      >
        {/* Curved cutting blade */}
        <path d="M3 7 C7 3.5 13 2.5 19 4 L18 6.5 C13 5 8 5.5 3 7 Z" />
        {/* Snath / curved wooden handle */}
        <path d="M18.5 4.5 C16 10 13 15 6 21" />
        {/* Hand grips (nibs) */}
        <path d="M14.5 9 L17.5 10" />
        <path d="M11 14.5 L14 15.5" />
        {/* Cut hay / grass stalks */}
        <path d="M14 21 C14.5 18.5 16 17 18 16" />
        <path d="M17 21 C17.5 19.5 19 18.5 21 18" />
      </svg>
    );
  },
);
HaymakingIcon.displayName = 'HaymakingIcon';
export const ScytheIcon = HaymakingIcon;

/**
 * 3. Beekeeping / Bee Icon
 * Detailed honeybee with head, antennae, striped abdomen, stinger, and dual pairs of wings.
 */
export const BeekeepingIcon = forwardRef<SVGSVGElement, ServiceIconProps>(
  (
    {
      size = 24,
      color = 'currentColor',
      strokeWidth = 2,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...props}
      >
        {/* Head */}
        <circle cx="12" cy="6" r="2" />
        {/* Antennae */}
        <path d="M11 4.5 C10 3 8 2.5 6.5 3.5" />
        <path d="M13 4.5 C14 3 16 2.5 17.5 3.5" />
        {/* Thorax & Abdomen */}
        <path d="M9.5 10.5 C9.5 8.8 10.6 8 12 8 C13.4 8 14.5 8.8 14.5 10.5 V17 C14.5 18.8 13.4 20 12 21 C10.6 20 9.5 18.8 9.5 17 Z" />
        {/* Abdomen stripes */}
        <path d="M9.5 13 H14.5" />
        <path d="M9.8 16 H14.2" />
        {/* Stinger */}
        <path d="M12 21 V23" />
        {/* Forewings */}
        <path d="M9.5 10 C6 6 2 8 3.5 12.5 C4.5 15.5 7.5 14.5 9.5 13" />
        <path d="M14.5 10 C18 6 22 8 20.5 12.5 C19.5 15.5 16.5 14.5 14.5 13" />
        {/* Hindwings */}
        <path d="M9.5 13.5 C7 14.5 5 16.5 6.5 18.5 C7.8 20 9.5 18.5 9.5 16.5" />
        <path d="M14.5 13.5 C17 14.5 19 16.5 17.5 18.5 C16.2 20 14.5 18.5 14.5 16.5" />
      </svg>
    );
  },
);
BeekeepingIcon.displayName = 'BeekeepingIcon';
export const BeeIcon = BeekeepingIcon;
export const ApiaryIcon = BeekeepingIcon;

/**
 * 4. Recreation / Tent Icon
 * Camping tent with crossed frame poles, central zipper, open entrance flaps, and ground line.
 */
export const RecreationIcon = forwardRef<SVGSVGElement, ServiceIconProps>(
  (
    {
      size = 24,
      color = 'currentColor',
      strokeWidth = 2,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...props}
      >
        {/* Crossed tent frame poles */}
        <path d="M3.5 21 L14 3" />
        <path d="M20.5 21 L10 3" />
        {/* Open entrance flaps */}
        <path d="M15.5 21 L12 14 L8.5 21" />
        {/* Ground baseline */}
        <path d="M2 21 H22" />
        {/* Ridge zipper */}
        <path d="M12 5.5 V14" />
      </svg>
    );
  },
);
RecreationIcon.displayName = 'RecreationIcon';
export const TentIcon = RecreationIcon;
export const TourismIcon = RecreationIcon;

/**
 * 5. Deadwood / Branch Icon
 * Fallen forest tree branch with natural forks, twigs, cut base, and subtle bud accents.
 */
export const DeadwoodIcon = forwardRef<SVGSVGElement, ServiceIconProps>(
  (
    {
      size = 24,
      color = 'currentColor',
      strokeWidth = 2,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...props}
      >
        {/* Main branch trunk */}
        <path d="M3 21 C6 19 9 16 12 12 C15 8 18 5.5 21 4" />
        {/* Upper-left primary fork & sub-twig */}
        <path d="M9 15 C8 11.5 6 8.5 4 6.5" />
        <path d="M7 11 C9 10 11 9.5 12 8" />
        {/* Lower-right branch & side shoot */}
        <path d="M13 11 C16 12 18.5 14 20 17" />
        <path d="M16.5 12.5 C18 11 19 9.5 21 9" />
        {/* Delicate twig end buds */}
        <path d="M4 6.5 C3 5 3.5 3.5 5 3.5 C6 3.5 6 4.5 5 6" />
        <path d="M21 9 C22 7.5 21.5 6 20 6 C19 6 19 7 20 8.5" />
      </svg>
    );
  },
);
DeadwoodIcon.displayName = 'DeadwoodIcon';
export const BranchIcon = DeadwoodIcon;

/**
 * 6. Scientific / Magnifying-Glass-Leaf Icon
 * Magnifying lens examining a detailed specimen leaf with central vein.
 */
export const ScientificIcon = forwardRef<SVGSVGElement, ServiceIconProps>(
  (
    {
      size = 24,
      color = 'currentColor',
      strokeWidth = 2,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...props}
      >
        {/* Circular magnifying lens */}
        <circle cx="10" cy="10" r="7" />
        {/* Lens handle */}
        <path d="M15 15 L21 21" />
        {/* Specimen leaf contour inside the lens */}
        <path d="M6.5 13.5 C7 10 9 7.5 13.5 6.5 C12.5 11 10 13 6.5 13.5 Z" />
        {/* Leaf central vein */}
        <path d="M6.5 13.5 L12 8" />
      </svg>
    );
  },
);
ScientificIcon.displayName = 'ScientificIcon';
export const ScienceIcon = ScientificIcon;
export const ResearchIcon = ScientificIcon;
export const MagnifyingGlassLeafIcon = ScientificIcon;

/**
 * ServiceIcon: Convenient dispatcher component rendering the appropriate service icon by code.
 */
export interface ServiceIconByCodeProps extends ServiceIconProps {
  code: string;
}

export const ServiceIcon = forwardRef<SVGSVGElement, ServiceIconByCodeProps>(
  ({ code, ...props }, ref) => {
    const Component = SERVICE_ICONS[code?.toLowerCase()] ?? ScientificIcon;
    return <Component ref={ref} {...props} />;
  },
);
ServiceIcon.displayName = 'ServiceIcon';

/**
 * Keyed dictionary of all service icon components for dynamic lookup.
 */
const SERVICE_ICONS: Record<
  string,
  React.ForwardRefExoticComponent<
    ServiceIconProps & React.RefAttributes<SVGSVGElement>
  >
> = {
  grazing: GrazingIcon,
  cow: CowIcon,
  haymaking: HaymakingIcon,
  scythe: ScytheIcon,
  apiary: ApiaryIcon,
  beekeeping: BeekeepingIcon,
  bee: BeeIcon,
  recreation: RecreationIcon,
  tourism: TourismIcon,
  tent: TentIcon,
  deadwood: DeadwoodIcon,
  branch: BranchIcon,
  science: ScienceIcon,
  scientific: ScientificIcon,
  research: ResearchIcon,
  magnifying_glass_leaf: MagnifyingGlassLeafIcon,
};

export default ServiceIcon;
