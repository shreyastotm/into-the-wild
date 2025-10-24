/**
 * Hand-drawn nature-inspired icon set
 * All icons designed to look organic and hand-drawn
 */

// Tent Icon - Hand-drawn style
export const TentIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Main tent body - hand-drawn curves */}
    <path d="M3 20 L12 4 L21 20" strokeWidth="2" />
    {/* Base line - slightly wavy */}
    <path d="M2 21 L22 21" strokeWidth="1" opacity="0.7" />
    {/* Door flap - irregular shape */}
    <path d="M10 20 L14 20 L13 16 L11 16 Z" fill="currentColor" opacity="0.3" />
    {/* Support lines - organic curves */}
    <path d="M12 4 L8 20" strokeWidth="1" opacity="0.5" />
    <path d="M12 4 L16 20" strokeWidth="1" opacity="0.5" />
    {/* Ground stakes - hand-drawn */}
    <circle cx="4" cy="21" r="0.5" fill="currentColor" opacity="0.6" />
    <circle cx="20" cy="21" r="0.5" fill="currentColor" opacity="0.6" />
  </svg>
);

// Compass Icon - Hand-drawn with organic needle
export const CompassIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Outer circle - hand-drawn */}
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    {/* Inner compass rose */}
    <circle cx="12" cy="12" r="6" strokeWidth="1" opacity="0.6" />
    {/* Cardinal directions - hand-drawn lines */}
    <path d="M12 2 L12 6" strokeWidth="1.5" />
    <path d="M12 18 L12 22" strokeWidth="1.5" />
    <path d="M6 12 L2 12" strokeWidth="1.5" />
    <path d="M22 12 L18 12" strokeWidth="1.5" />
    {/* Diagonal lines - organic curves */}
    <path d="M8.5 8.5 L15.5 15.5" strokeWidth="1" opacity="0.7" />
    <path d="M15.5 8.5 L8.5 15.5" strokeWidth="1" opacity="0.7" />
    {/* Compass needle - hand-drawn arrow */}
    <path d="M12 8 L12 16 M10 14 L14 14" strokeWidth="2" />
    {/* Center point */}
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

// Mountain Icon - Hand-drawn peaks
export const MountainIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Multiple peaks - hand-drawn irregular shapes */}
    <path d="M4 16 L8 8 L12 14 L16 6 L20 16" strokeWidth="2" />
    {/* Base line - slightly wavy */}
    <path d="M2 20 L22 20" strokeWidth="1" opacity="0.7" />
    {/* Snow caps - organic shapes */}
    <path d="M8 8 L9 6 L11 8 L10 7 L9 8" fill="currentColor" opacity="0.3" />
    <path d="M16 6 L17 4 L19 6 L18 5 L17 6" fill="currentColor" opacity="0.3" />
    {/* Tree silhouettes */}
    <path d="M6 16 L6 20 L7 20 L7 16" strokeWidth="1" opacity="0.5" />
    <path d="M18 16 L18 20 L19 20 L19 16" strokeWidth="1" opacity="0.5" />
  </svg>
);

// Tree Icon - Hand-drawn pine tree
export const TreeIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Tree trunk - hand-drawn */}
    <path d="M12 16 L12 22" strokeWidth="2" />
    {/* Tree layers - organic triangle shapes */}
    <path d="M8 12 L12 8 L16 12" strokeWidth="1.5" />
    <path d="M7 16 L12 10 L17 16" strokeWidth="1.5" />
    <path d="M6 20 L12 12 L18 20" strokeWidth="1.5" />
    {/* Branches - irregular lines */}
    <path d="M10 14 L8 16" strokeWidth="1" opacity="0.6" />
    <path d="M14 14 L16 16" strokeWidth="1" opacity="0.6" />
    <path d="M9 18 L7 20" strokeWidth="1" opacity="0.6" />
    <path d="M15 18 L17 20" strokeWidth="1" opacity="0.6" />
  </svg>
);

// Campfire Icon - Hand-drawn flames
export const CampfireIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Wood logs - hand-drawn ovals */}
    <ellipse cx="8" cy="20" rx="3" ry="1" strokeWidth="1.5" />
    <ellipse cx="16" cy="20" rx="3" ry="1" strokeWidth="1.5" />
    {/* Main flame - organic shape */}
    <path
      d="M12 6 C10 8 8 12 8 16 C8 18 10 20 12 20 C14 20 16 18 16 16 C16 12 14 8 12 6 Z"
      strokeWidth="2"
    />
    {/* Inner flame details */}
    <path d="M12 8 C11 10 10 12 10 14" strokeWidth="1" opacity="0.7" />
    <path d="M12 8 C13 10 14 12 14 14" strokeWidth="1" opacity="0.7" />
    {/* Sparks - small dots */}
    <circle cx="10" cy="10" r="0.5" fill="currentColor" opacity="0.6" />
    <circle cx="14" cy="11" r="0.5" fill="currentColor" opacity="0.6" />
  </svg>
);

// River Icon - Hand-drawn water
export const RiverIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Water surface - wavy organic lines */}
    <path d="M2 14 Q6 12 10 14 T18 14 Q22 12 24 14" strokeWidth="2" />
    <path
      d="M2 16 Q6 14 10 16 T18 16 Q22 14 24 16"
      strokeWidth="1.5"
      opacity="0.7"
    />
    <path
      d="M2 18 Q6 16 10 18 T18 18 Q22 16 24 18"
      strokeWidth="1"
      opacity="0.5"
    />
    {/* River banks - irregular curves */}
    <path d="M2 12 L2 22" strokeWidth="1" opacity="0.6" />
    <path d="M22 12 L22 22" strokeWidth="1" opacity="0.6" />
    {/* Rocks - organic shapes */}
    <circle cx="6" cy="17" r="1" fill="currentColor" opacity="0.4" />
    <circle cx="18" cy="15" r="1" fill="currentColor" opacity="0.4" />
  </svg>
);

// Sun Icon - Hand-drawn with rays
export const SunIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Sun center */}
    <circle cx="12" cy="12" r="4" strokeWidth="2" />
    {/* Sun rays - hand-drawn irregular lines */}
    <path d="M12 2 L12 5" strokeWidth="1.5" />
    <path d="M12 19 L12 22" strokeWidth="1.5" />
    <path d="M5 12 L2 12" strokeWidth="1.5" />
    <path d="M22 12 L19 12" strokeWidth="1.5" />
    <path d="M7 7 L5 5" strokeWidth="1" opacity="0.8" />
    <path d="M19 19 L17 17" strokeWidth="1" opacity="0.8" />
    <path d="M17 7 L19 5" strokeWidth="1" opacity="0.8" />
    <path d="M5 19 L7 17" strokeWidth="1" opacity="0.8" />
  </svg>
);

// Moon Icon - Hand-drawn crescent
export const MoonIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Moon crescent - hand-drawn curve */}
    <path
      d="M12 2 C16 2 20 6 20 12 C20 18 16 22 12 22 C8 22 4 18 4 12 C4 8 6 4 10 3"
      strokeWidth="2"
    />
    {/* Inner shadow */}
    <path
      d="M12 4 C15 4 18 7 18 12 C18 17 15 20 12 20 C9 20 6 17 6 12 C6 8 8 5 11 4.5"
      strokeWidth="1"
      opacity="0.3"
    />
  </svg>
);

// Star Icon - Hand-drawn with organic points
export const StarIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Star - hand-drawn irregular points */}
    <path
      d="M12 2 L14 8 L20 8 L15 12 L17 18 L12 14 L7 18 L9 12 L4 8 L10 8 Z"
      strokeWidth="2"
    />
    {/* Inner details - organic lines */}
    <path d="M12 4 L12.5 7 L13.5 7 L13 4" strokeWidth="1" opacity="0.5" />
    <path d="M12 16 L12.5 13 L13.5 13 L13 16" strokeWidth="1" opacity="0.5" />
  </svg>
);

// Trail Icon - Hand-drawn path
export const TrailIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Winding trail - organic curves */}
    <path d="M2 12 Q8 8 12 12 Q16 16 20 12" strokeWidth="2" />
    {/* Trail markers - hand-drawn circles */}
    <circle cx="6" cy="12" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="18" cy="12" r="1" fill="currentColor" opacity="0.6" />
    {/* Footprints - organic shapes */}
    <ellipse cx="4" cy="11" rx="2" ry="1" fill="currentColor" opacity="0.3" />
    <ellipse cx="8" cy="13" rx="2" ry="1" fill="currentColor" opacity="0.3" />
  </svg>
);

// Backpack Icon - Hand-drawn hiking gear
export const BackpackIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Backpack body - hand-drawn rectangle */}
    <path d="M6 6 L18 6 L18 18 L6 18 Z" strokeWidth="2" />
    {/* Backpack flap */}
    <path d="M8 6 L16 6 L15 4 L9 4 Z" strokeWidth="1.5" />
    {/* Straps - organic curves */}
    <path d="M9 8 C9 4 15 4 15 8" strokeWidth="1.5" />
    <path d="M8 12 C8 8 16 8 16 12" strokeWidth="1.5" />
    {/* Buckles - hand-drawn circles */}
    <circle cx="12" cy="10" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="12" cy="14" r="1" fill="currentColor" opacity="0.6" />
  </svg>
);

// Camera Icon - Hand-drawn photography gear
export const CameraIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Camera body - hand-drawn rectangle */}
    <rect x="4" y="8" width="16" height="12" rx="2" strokeWidth="2" />
    {/* Lens - organic circle */}
    <circle cx="12" cy="14" r="4" strokeWidth="2" />
    {/* Inner lens details */}
    <circle cx="12" cy="14" r="2" strokeWidth="1" opacity="0.6" />
    {/* Viewfinder */}
    <rect x="16" y="6" width="4" height="3" rx="1" strokeWidth="1.5" />
    {/* Strap attachment */}
    <path d="M6 10 L6 8" strokeWidth="1" opacity="0.7" />
    <path d="M18 10 L18 8" strokeWidth="1" opacity="0.7" />
  </svg>
);

// Binoculars Icon - Hand-drawn observation gear
export const BinocularsIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Left lens tube */}
    <ellipse cx="8" cy="12" rx="3" ry="4" strokeWidth="2" />
    <ellipse cx="8" cy="12" rx="1.5" ry="2" strokeWidth="1" opacity="0.6" />
    {/* Right lens tube */}
    <ellipse cx="16" cy="12" rx="3" ry="4" strokeWidth="2" />
    <ellipse cx="16" cy="12" rx="1.5" ry="2" strokeWidth="1" opacity="0.6" />
    {/* Bridge - hand-drawn curve */}
    <path d="M11 12 Q12 10 13 12" strokeWidth="2" />
    {/* Focus knobs */}
    <circle cx="6" cy="12" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="18" cy="12" r="1" fill="currentColor" opacity="0.6" />
    {/* Strap - organic line */}
    <path d="M4 8 Q12 6 20 8" strokeWidth="1.5" opacity="0.7" />
  </svg>
);

// Leaf Icon - Hand-drawn foliage
export const LeafIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Leaf shape - organic curve */}
    <path
      d="M12 2 C8 4 6 8 8 12 C10 16 14 18 16 14 C18 10 16 6 12 2 Z"
      strokeWidth="2"
    />
    {/* Central vein - hand-drawn line */}
    <path d="M12 4 L12 16" strokeWidth="1" opacity="0.7" />
    {/* Side veins - organic branches */}
    <path d="M10 6 L12 4 L14 6" strokeWidth="1" opacity="0.6" />
    <path d="M9 8 L12 6 L15 8" strokeWidth="1" opacity="0.6" />
    <path d="M8 10 L12 8 L16 10" strokeWidth="1" opacity="0.6" />
    <path d="M9 12 L12 10 L15 12" strokeWidth="1" opacity="0.6" />
    <path d="M10 14 L12 12 L14 14" strokeWidth="1" opacity="0.6" />
  </svg>
);

// Water Drop Icon - Hand-drawn dew drop
export const WaterDropIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Water drop - organic teardrop shape */}
    <path d="M12 2 C8 6 8 10 12 18 C16 10 16 6 12 2 Z" strokeWidth="2" />
    {/* Surface tension - hand-drawn curve */}
    <path
      d="M12 4 C10 6 10 8 12 10 C14 8 14 6 12 4 Z"
      strokeWidth="1"
      opacity="0.6"
    />
    {/* Highlight */}
    <path d="M10 6 Q12 4 14 6" strokeWidth="1" opacity="0.4" />
  </svg>
);

// Wind Icon - Hand-drawn air currents
export const WindIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Wind lines - organic curves */}
    <path d="M4 8 Q8 6 12 8 Q16 10 20 8" strokeWidth="2" />
    <path d="M4 12 Q8 10 12 12 Q16 14 20 12" strokeWidth="1.5" opacity="0.7" />
    <path d="M4 16 Q8 14 12 16 Q16 18 20 16" strokeWidth="1" opacity="0.5" />
    {/* Wind origin - hand-drawn circle */}
    <circle cx="2" cy="12" r="1" fill="currentColor" opacity="0.6" />
  </svg>
);

// Heart Icon - Hand-drawn love for nature
export const HeartIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Heart shape - hand-drawn curves */}
    <path
      d="M12 4 C8 4 4 8 4 12 C4 16 8 20 12 20 C16 20 20 16 20 12 C20 8 16 4 12 4 Z"
      strokeWidth="2"
    />
    {/* Heart details - organic lines */}
    <path
      d="M12 6 C10 6 8 8 8 12 C8 14 10 16 12 16 C14 16 16 14 16 12 C16 8 14 6 12 6 Z"
      strokeWidth="1"
      opacity="0.5"
    />
  </svg>
);

// Award Icon - Hand-drawn achievement badge
export const AwardIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Badge shape - hand-drawn star-like */}
    <path
      d="M12 2 L16 8 L22 8 L17 13 L19 19 L12 15 L5 19 L7 13 L2 8 L8 8 Z"
      strokeWidth="2"
    />
    {/* Inner details */}
    <path
      d="M12 4 L14 7 L17 7 L14 10 L15 13 L12 11 L9 13 L10 10 L7 7 L10 7 Z"
      strokeWidth="1"
      opacity="0.6"
    />
    {/* Ribbon - organic curves */}
    <path d="M12 15 L12 22" strokeWidth="2" />
    <path d="M10 20 L14 20" strokeWidth="1.5" />
  </svg>
);

// Users Icon - Hand-drawn people silhouettes
export const UsersIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Person 1 - hand-drawn head and body */}
    <circle cx="8" cy="8" r="3" strokeWidth="2" />
    <path d="M5 14 C5 11 6 9 8 9 C10 9 11 11 11 14" strokeWidth="2" />
    {/* Person 2 - slightly different */}
    <circle cx="16" cy="8" r="3" strokeWidth="2" />
    <path d="M13 14 C13 11 14 9 16 9 C18 9 19 11 19 14" strokeWidth="2" />
    {/* Ground line */}
    <path d="M2 20 L22 20" strokeWidth="1" opacity="0.6" />
  </svg>
);

// Clock Icon - Hand-drawn timepiece
export const ClockIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Clock face - hand-drawn circle */}
    <circle cx="12" cy="12" r="8" strokeWidth="2" />
    {/* Hour marks - organic dots */}
    <circle cx="12" cy="4" r="0.5" fill="currentColor" opacity="0.6" />
    <circle cx="20" cy="12" r="0.5" fill="currentColor" opacity="0.6" />
    <circle cx="12" cy="20" r="0.5" fill="currentColor" opacity="0.6" />
    <circle cx="4" cy="12" r="0.5" fill="currentColor" opacity="0.6" />
    {/* Hands - hand-drawn lines */}
    <path d="M12 12 L12 8" strokeWidth="2" />
    <path d="M12 12 L16 12" strokeWidth="1.5" />
    {/* Center */}
    <circle cx="12" cy="12" r="0.5" fill="currentColor" />
  </svg>
);

// Map Icon - Hand-drawn trail map
export const MapIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Map outline - hand-drawn irregular shape */}
    <path
      d="M2 4 L6 2 L18 4 L22 8 L20 18 L16 20 L8 18 L4 14 Z"
      strokeWidth="2"
    />
    {/* Trail lines - organic curves */}
    <path d="M6 8 Q10 6 14 8 Q18 10 18 14" strokeWidth="1" opacity="0.7" />
    <path d="M8 12 Q12 10 16 12" strokeWidth="1" opacity="0.7" />
    {/* Location markers - hand-drawn circles */}
    <circle cx="10" cy="8" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="14" cy="14" r="1" fill="currentColor" opacity="0.6" />
  </svg>
);

// Home Icon - Hand-drawn cabin
export const HomeIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Cabin structure - hand-drawn triangle roof */}
    <path d="M4 16 L12 8 L20 16" strokeWidth="2" />
    {/* Base - hand-drawn rectangle */}
    <path d="M2 18 L22 18 L22 20 L2 20 Z" strokeWidth="2" />
    {/* Walls */}
    <path d="M4 16 L4 18" strokeWidth="1.5" />
    <path d="M20 16 L20 18" strokeWidth="1.5" />
    {/* Door - organic rectangle */}
    <path d="M10 16 L14 16 L14 20 L10 20 Z" strokeWidth="1.5" />
    {/* Window - hand-drawn square */}
    <rect x="16" y="14" width="3" height="3" strokeWidth="1" opacity="0.7" />
    {/* Chimney - hand-drawn rectangle */}
    <rect x="6" y="10" width="2" height="4" strokeWidth="1" opacity="0.6" />
  </svg>
);

// Settings Icon - Hand-drawn gear
export const SettingsIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Gear center */}
    <circle cx="12" cy="12" r="3" strokeWidth="2" />
    {/* Gear teeth - hand-drawn spikes */}
    <path d="M12 7 L13 5 L15 7 L14 9" strokeWidth="1.5" />
    <path d="M12 7 L11 5 L9 7 L10 9" strokeWidth="1.5" />
    <path d="M12 17 L13 19 L15 17 L14 15" strokeWidth="1.5" />
    <path d="M12 17 L11 19 L9 17 L10 15" strokeWidth="1.5" />
    <path d="M7 12 L5 13 L7 15 L9 14" strokeWidth="1.5" />
    <path d="M17 12 L19 13 L17 15 L15 14" strokeWidth="1.5" />
    <path d="M7 12 L5 11 L7 9 L9 10" strokeWidth="1.5" />
    <path d="M17 12 L19 11 L17 9 L15 10" strokeWidth="1.5" />
  </svg>
);

// Bell Icon - Hand-drawn notification
export const BellIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Bell body - hand-drawn curves */}
    <path
      d="M6 8 C6 4 9 2 12 2 C15 2 18 4 18 8 C18 12 20 14 20 16 L4 16 C4 14 6 12 6 8 Z"
      strokeWidth="2"
    />
    {/* Bell handle - organic curve */}
    <path d="M10 2 Q12 0 14 2" strokeWidth="2" />
    {/* Clapper - hand-drawn line */}
    <path d="M12 10 L12 14" strokeWidth="1.5" opacity="0.7" />
    {/* Notification dot */}
    <circle cx="18" cy="6" r="2" fill="currentColor" opacity="0.8" />
  </svg>
);

// Search Icon - Hand-drawn magnifying glass
export const SearchIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Lens - hand-drawn circle */}
    <circle cx="11" cy="11" r="8" strokeWidth="2" />
    {/* Handle - organic curve */}
    <path d="M21 21 L16.65 16.65" strokeWidth="2" />
    {/* Crosshairs - hand-drawn lines */}
    <path d="M11 8 L11 14" strokeWidth="1" opacity="0.6" />
    <path d="M8 11 L14 11" strokeWidth="1" opacity="0.6" />
  </svg>
);

// Plus Icon - Hand-drawn addition symbol
export const PlusIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Plus sign - hand-drawn lines */}
    <path d="M12 2 L12 22" strokeWidth="2" />
    <path d="M2 12 L22 12" strokeWidth="2" />
    {/* Center intersection - organic circle */}
    <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.3" />
  </svg>
);

// Minus Icon - Hand-drawn subtraction symbol
export const MinusIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Minus sign - hand-drawn line */}
    <path d="M4 12 L20 12" strokeWidth="2" />
    {/* Center dot - organic circle */}
    <circle cx="12" cy="12" r="0.5" fill="currentColor" opacity="0.5" />
  </svg>
);

// Check Icon - Hand-drawn checkmark
export const CheckIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Checkmark - hand-drawn curve */}
    <path d="M4 12 L9 17 L20 6" strokeWidth="2" />
    {/* Completion dot */}
    <circle cx="20" cy="6" r="1" fill="currentColor" opacity="0.6" />
  </svg>
);

// X Icon - Hand-drawn close symbol
export const XIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* X mark - hand-drawn lines */}
    <path d="M18 6 L6 18" strokeWidth="2" />
    <path d="M6 6 L18 18" strokeWidth="2" />
    {/* Center intersection */}
    <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.3" />
  </svg>
);

// Arrow Right Icon - Hand-drawn direction
export const ArrowRightIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Arrow shaft - hand-drawn line */}
    <path d="M5 12 L19 12" strokeWidth="2" />
    {/* Arrow head - organic triangle */}
    <path d="M13 6 L19 12 L13 18" strokeWidth="2" />
  </svg>
);

// Arrow Left Icon - Hand-drawn direction
export const ArrowLeftIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Arrow shaft - hand-drawn line */}
    <path d="M19 12 L5 12" strokeWidth="2" />
    {/* Arrow head - organic triangle */}
    <path d="M11 6 L5 12 L11 18" strokeWidth="2" />
  </svg>
);

// Chevron Down Icon - Hand-drawn dropdown
export const ChevronDownIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Chevron - hand-drawn V shape */}
    <path d="M6 9 L12 15 L18 9" strokeWidth="2" />
  </svg>
);

// Chevron Up Icon - Hand-drawn dropdown (reversed)
export const ChevronUpIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Chevron - hand-drawn inverted V shape */}
    <path d="M18 15 L12 9 L6 15" strokeWidth="2" />
  </svg>
);

// Menu Icon - Hand-drawn hamburger menu
export const MenuIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Menu lines - hand-drawn horizontal lines */}
    <path d="M3 6 L21 6" strokeWidth="2" />
    <path d="M3 12 L21 12" strokeWidth="2" />
    <path d="M3 18 L21 18" strokeWidth="2" />
  </svg>
);

// Filter Icon - Hand-drawn filter funnel
export const FilterIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Funnel - hand-drawn triangle */}
    <path d="M4 6 L12 18 L20 6" strokeWidth="2" />
    {/* Funnel base - hand-drawn line */}
    <path d="M2 20 L22 20" strokeWidth="1.5" />
    {/* Filter lines - organic lines */}
    <path d="M8 10 L16 10" strokeWidth="1" opacity="0.7" />
    <path d="M10 14 L14 14" strokeWidth="1" opacity="0.7" />
  </svg>
);

// Sort Icon - Hand-drawn sorting arrows
export const SortIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Sort arrows - hand-drawn lines */}
    <path d="M8 6 L12 2 L16 6" strokeWidth="2" />
    <path d="M8 18 L12 22 L16 18" strokeWidth="2" />
    {/* Connecting line - organic curve */}
    <path d="M12 4 L12 20" strokeWidth="1.5" opacity="0.6" />
  </svg>
);

// Edit Icon - Hand-drawn pencil
export const EditIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Pencil tip - hand-drawn triangle */}
    <path d="M12 2 L20 10 L18 12 L10 4 Z" strokeWidth="2" />
    {/* Pencil body - hand-drawn rectangle */}
    <path d="M10 4 L8 6 L8 16 L12 16 L12 6 Z" strokeWidth="2" />
    {/* Eraser - hand-drawn rectangle */}
    <rect x="8" y="16" width="4" height="2" strokeWidth="1.5" />
    {/* Pencil lead - hand-drawn line */}
    <path d="M14 8 L16 6" strokeWidth="1" opacity="0.7" />
  </svg>
);

// Delete Icon - Hand-drawn trash can
export const DeleteIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Trash can - hand-drawn rectangle */}
    <path d="M6 6 L18 6 L18 20 L6 20 Z" strokeWidth="2" />
    {/* Trash can lid - hand-drawn line */}
    <path d="M4 6 L20 6" strokeWidth="2" />
    {/* Handle - organic curve */}
    <path d="M9 4 Q12 2 15 4" strokeWidth="2" />
    {/* Trash lines - hand-drawn lines */}
    <path d="M9 10 L9 16" strokeWidth="1" opacity="0.7" />
    <path d="M12 10 L12 16" strokeWidth="1" opacity="0.7" />
    <path d="M15 10 L15 16" strokeWidth="1" opacity="0.7" />
  </svg>
);

// Share Icon - Hand-drawn sharing arrows
export const ShareIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Share arrows - hand-drawn lines radiating out */}
    <path d="M12 2 L12 12" strokeWidth="2" />
    <path d="M8 6 L12 2 L16 6" strokeWidth="2" />
    <path d="M6 8 L2 12 L6 16" strokeWidth="1.5" opacity="0.8" />
    <path d="M18 8 L22 12 L18 16" strokeWidth="1.5" opacity="0.8" />
    {/* Center point */}
    <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.6" />
  </svg>
);

// Bookmark Icon - Hand-drawn bookmark
export const BookmarkIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Bookmark shape - hand-drawn triangle with base */}
    <path d="M5 4 L12 20 L19 4 L19 20 L5 20 Z" strokeWidth="2" />
    {/* Bookmark details - organic lines */}
    <path d="M8 8 L16 8" strokeWidth="1" opacity="0.7" />
    <path d="M8 12 L16 12" strokeWidth="1" opacity="0.7" />
  </svg>
);

// Like Icon - Hand-drawn heart (for likes)
export const LikeIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Heart shape - hand-drawn curves */}
    <path
      d="M12 4 C8 4 4 8 4 12 C4 16 8 20 12 20 C16 20 20 16 20 12 C20 8 16 4 12 4 Z"
      strokeWidth="2"
    />
    {/* Heart details - organic lines */}
    <path
      d="M12 6 C10 6 8 8 8 12 C8 14 10 16 12 16 C14 16 16 14 16 12 C16 8 14 6 12 6 Z"
      strokeWidth="1"
      opacity="0.5"
    />
  </svg>
);

// Message Icon - Hand-drawn speech bubble
export const MessageIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Speech bubble - hand-drawn oval */}
    <path
      d="M4 10 C4 6 8 4 12 4 C16 4 20 6 20 10 C20 14 16 16 12 16 C8 16 4 14 4 10 Z"
      strokeWidth="2"
    />
    {/* Speech bubble tail - hand-drawn triangle */}
    <path d="M8 16 L12 20 L16 16" strokeWidth="2" />
    {/* Message lines - hand-drawn lines */}
    <path d="M8 8 L16 8" strokeWidth="1" opacity="0.7" />
    <path d="M8 12 L14 12" strokeWidth="1" opacity="0.7" />
  </svg>
);

// Export Icon - Hand-drawn upload symbol
export const ExportIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Upload arrow - hand-drawn lines */}
    <path d="M12 2 L12 16" strokeWidth="2" />
    <path d="M8 6 L12 2 L16 6" strokeWidth="2" />
    {/* Container - hand-drawn rectangle */}
    <path d="M4 18 L20 18 L20 20 L4 20 Z" strokeWidth="2" />
    {/* Container lines - organic lines */}
    <path d="M6 16 L6 18" strokeWidth="1" opacity="0.7" />
    <path d="M18 16 L18 18" strokeWidth="1" opacity="0.7" />
  </svg>
);

// Import Icon - Hand-drawn download symbol
export const ImportIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Download arrow - hand-drawn lines */}
    <path d="M12 6 L12 20" strokeWidth="2" />
    <path d="M8 16 L12 20 L16 16" strokeWidth="2" />
    {/* Container - hand-drawn rectangle */}
    <path d="M4 2 L20 2 L20 4 L4 4 Z" strokeWidth="2" />
    {/* Container lines - organic lines */}
    <path d="M6 4 L6 2" strokeWidth="1" opacity="0.7" />
    <path d="M18 4 L18 2" strokeWidth="1" opacity="0.7" />
  </svg>
);

// Play Icon - Hand-drawn play button
export const PlayIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Play triangle - hand-drawn triangle */}
    <path d="M8 5 L19 12 L8 19 Z" strokeWidth="2" />
    {/* Play button circle - hand-drawn circle */}
    <circle cx="12" cy="12" r="10" strokeWidth="1.5" opacity="0.3" />
  </svg>
);

// Pause Icon - Hand-drawn pause button
export const PauseIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Pause bars - hand-drawn rectangles */}
    <rect x="6" y="4" width="4" height="16" strokeWidth="2" />
    <rect x="14" y="4" width="4" height="16" strokeWidth="2" />
    {/* Pause button circle - hand-drawn circle */}
    <circle cx="12" cy="12" r="10" strokeWidth="1.5" opacity="0.3" />
  </svg>
);

// Volume Icon - Hand-drawn speaker
export const VolumeIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Speaker cone - hand-drawn triangle */}
    <path d="M4 9 L12 5 L12 19 L4 15 Z" strokeWidth="2" />
    {/* Sound waves - organic curves */}
    <path d="M16 8 Q18 6 20 8" strokeWidth="1.5" />
    <path d="M16 12 Q19 10 21 12" strokeWidth="1.5" />
    <path d="M16 16 Q18 14 20 16" strokeWidth="1.5" />
  </svg>
);

// Mute Icon - Hand-drawn muted speaker
export const MuteIcon = ({
  className = "h-6 w-6",
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Speaker cone - hand-drawn triangle */}
    <path d="M4 9 L12 5 L12 19 L4 15 Z" strokeWidth="2" />
    {/* Mute line - hand-drawn diagonal */}
    <path d="M16 6 L22 18" strokeWidth="2" />
    {/* Mute indicator - hand-drawn circle */}
    <circle cx="19" cy="9" r="1" fill="currentColor" opacity="0.6" />
  </svg>
);
