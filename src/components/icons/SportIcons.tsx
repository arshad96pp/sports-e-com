import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function FootballIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="24" cy="24" r="19" stroke="currentColor" strokeWidth="2" />
      <path
        d="M24 13.5 32 19.5 29 29 19 29 16 19.5 24 13.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M24 13.5V6.5M32 19.5 38 15M29 29 33 37M19 29 15 37M16 19.5 10 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CricketIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M31 9 39 17 22 34C20 36 17 36 15 34C13 32 13 29 15 27L31 9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M28 12 36 20" stroke="currentColor" strokeWidth="2" />
      <circle cx="13" cy="36" r="4.5" stroke="currentColor" strokeWidth="2" />
      <path d="M16 33 20 29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function TennisIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="20" cy="18" r="11" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 11c3 3 3 11 0 14M28 11c-3 3-3 11 0 14"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M27 27 40 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="42" cy="42" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function DumbbellIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="6" y="18" width="6" height="12" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="36" y="18" width="6" height="12" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="12" y="21" width="6" height="6" stroke="currentColor" strokeWidth="2" />
      <rect x="30" y="21" width="6" height="6" stroke="currentColor" strokeWidth="2" />
      <path d="M18 24h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function BottleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M19 6h10v6.5l3 4V40a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3V16.5l3-4V6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 24h16" stroke="currentColor" strokeWidth="2" />
      <path d="M20 6h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function ShuttlecockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="24" cy="10" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M20 14 8 38M24 15 20 40M28 14 34 39" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 38 39 39" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export const OTHER_ICONS = [DumbbellIcon, BottleIcon, ShuttlecockIcon] as const;

export function categoryIcon(category: string) {
  switch (category) {
    case "football":
      return FootballIcon;
    case "cricket":
      return CricketIcon;
    case "tennis":
      return TennisIcon;
    default:
      return DumbbellIcon;
  }
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M16.02 3C9.4 3 4 8.37 4 14.98c0 2.2.6 4.28 1.65 6.07L4 29l8.16-1.6a12.95 12.95 0 0 0 3.86.58c6.63 0 12.02-5.36 12.02-11.98C28.04 8.37 22.65 3 16.02 3Zm0 21.7c-1.85 0-3.58-.5-5.07-1.4l-.36-.21-4.84.95.98-4.73-.24-.38a9.7 9.7 0 0 1-1.53-5.24c0-5.4 4.4-9.78 9.83-9.78 5.42 0 9.82 4.38 9.82 9.78 0 5.4-4.4 9.78-9.83 9.78Zm5.4-7.34c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.63.07-.3-.15-1.24-.46-2.36-1.46-.87-.78-1.46-1.74-1.63-2.03-.17-.3-.02-.46.13-.6.13-.13.3-.34.44-.51.15-.17.2-.3.3-.49.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.2-.24-.57-.48-.5-.66-.5h-.56c-.2 0-.52.07-.79.37-.27.3-1.03 1.01-1.03 2.46s1.06 2.85 1.2 3.05c.15.2 2.1 3.2 5.08 4.5.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.24-.7.24-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}
