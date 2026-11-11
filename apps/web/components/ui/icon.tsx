import type { SVGProps } from "react";

/**
 * Line-icon set matching the mocks: 24px grid, stroked, round caps.
 * Icons inherit colour from the parent via currentColor.
 */

export type IconName =
  | "home"
  | "wallet"
  | "card"
  | "activity"
  | "profile"
  | "eye"
  | "eye-off"
  | "plus"
  | "arrow-up-right"
  | "arrow-down"
  | "arrow-left"
  | "chevron-right"
  | "mail"
  | "lock"
  | "snowflake"
  | "settings"
  | "sliders"
  | "shield"
  | "layers"
  | "more"
  | "copy"
  | "check"
  | "check-circle"
  | "close"
  | "face-id"
  | "fingerprint"
  | "phone"
  | "document"
  | "help"
  | "scale"
  | "user"
  | "devices"
  | "key"
  | "alert"
  | "share"
  | "qr"
  | "scan"
  | "trash"
  | "external";

const PATHS: Record<IconName, React.ReactNode> = {
  home: <path d="M3.5 10.5 12 3.5l8.5 7M5.5 9v10.5h13V9" />,
  wallet: (
    <>
      <path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h11a2 2 0 0 1 2 2v1" />
      <path d="M3.5 7.5v9a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-13" />
      <circle cx="16.5" cy="13" r="1.15" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 10h18" />
    </>
  ),
  activity: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="10" r="2.75" />
      <path d="M6.8 18.4a6 6 0 0 1 10.4 0" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </>
  ),
  "eye-off": (
    <>
      <path d="M9.9 5.8A9.5 9.5 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.9 3.6" />
      <path d="M6.4 7.6A16 16 0 0 0 2.5 12S6 18.5 12 18.5a9.4 9.4 0 0 0 4-.86" />
      <path d="m9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="m3.5 3.5 17 17" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  "arrow-up-right": <path d="M7 17 17 7M8.5 7H17v8.5" />,
  "arrow-down": <path d="M12 5v14M6 12.5l6 6 6-6" />,
  "arrow-left": <path d="M19 12H5M11 5.5 4.5 12l6.5 6.5" />,
  "chevron-right": <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m3.8 7 7.2 5.6a1.6 1.6 0 0 0 2 0L20.2 7" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10" width="15" height="10" rx="2.5" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
      <circle cx="12" cy="15" r="1.1" />
    </>
  ),
  snowflake: (
    <>
      <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
      <path d="M9.5 4.6 12 6.9l2.5-2.3M9.5 19.4 12 17.1l2.5 2.3" />
      <path d="m4.6 10.6.6 3.3-3 1.4M19.4 10.6l-.6 3.3 3 1.4" />
      <path d="m5.2 8.8-3-1.3.5-3.2M18.8 8.8l3-1.3-.5-3.2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
    </>
  ),
  sliders: (
    <>
      <path d="M3.5 8.5h11M18 8.5h2.5M3.5 15.5h4M11 15.5h9.5" />
      <circle cx="16" cy="8.5" r="2" />
      <circle cx="9" cy="15.5" r="2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 5 6.2v5.3c0 4.2 2.8 7.6 7 9 4.2-1.4 7-4.8 7-9V6.2Z" />
      <path d="m9 12 2.2 2.2L15.2 10" />
    </>
  ),
  layers: (
    <>
      <rect x="3.5" y="4.5" width="17" height="6" rx="2" />
      <rect x="3.5" y="13.5" width="17" height="6" rx="2" />
      <path d="M7 7.5h.01M7 16.5h.01" />
    </>
  ),
  more: (
    <>
      <circle cx="5.5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="18.5" cy="12" r="1.4" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M15.5 8.5v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.4 12.2 2.5 2.5 4.7-4.9" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  "face-id": (
    <>
      <path d="M4 8.5V6a2 2 0 0 1 2-2h2.5M15.5 4H18a2 2 0 0 1 2 2v2.5M20 15.5V18a2 2 0 0 1-2 2h-2.5M8.5 20H6a2 2 0 0 1-2-2v-2.5" />
      <path d="M9 10v1.5M15 10v1.5M12 10v3.2h-1" />
      <path d="M9.4 15.6a3.6 3.6 0 0 0 5.2 0" />
    </>
  ),
  fingerprint: (
    <>
      <path d="M12 4.5a7.5 7.5 0 0 0-7.5 7.5v1.5" />
      <path d="M19.5 12a7.5 7.5 0 0 0-3.4-6.3" />
      <path d="M8 12a4 4 0 0 1 8 0v3.5" />
      <path d="M12 12v5.5M8.2 16v2.2M15.8 18.4c.4-1 .5-1.6.5-2.4" />
    </>
  ),
  phone: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M10.5 5.5h3M11 18.5h2" />
    </>
  ),
  document: (
    <>
      <path d="M6 3.5h7l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
      <path d="M13 3.5v5h5M8.5 13h7M8.5 16.5h5" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.7 9.6a2.4 2.4 0 0 1 4.6.8c0 1.6-2.3 2-2.3 3.4" />
      <path d="M12 17.2h.01" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4v16M7 20h10M4 8.5h16M12 4.5 4 8.5M12 4.5l8 4" />
      <path d="M4 8.5 1.8 13.5a2.6 2.6 0 0 0 4.4 0ZM20 8.5l-2.2 5a2.6 2.6 0 0 0 4.4 0Z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.75" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  devices: (
    <>
      <rect x="2.5" y="5" width="13" height="10" rx="2" />
      <rect x="16.5" y="9" width="5" height="10" rx="1.6" />
      <path d="M6 19h6M9 15v4" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="12" r="4" />
      <path d="M12 12h9M18 12v3M15.5 12v2.2" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4.5 2.8 20h18.4Z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  share: (
    <>
      <path d="M12 15V3.5M8.5 7 12 3.5 15.5 7" />
      <path d="M6 11.5H5a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 5 20.5h14a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5h-1" />
    </>
  ),
  qr: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <path d="M13.5 13.5h3v3h-3zM20.5 13.5v3M17.5 20.5h3M13.5 20.5h.01" />
    </>
  ),
  scan: (
    <>
      <path d="M3.5 8.5V5.5a2 2 0 0 1 2-2h3M15.5 3.5h3a2 2 0 0 1 2 2v3M20.5 15.5v3a2 2 0 0 1-2 2h-3M8.5 20.5h-3a2 2 0 0 1-2-2v-3" />
      <path d="M3.5 12h17" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 6.5h15M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5" />
      <path d="M6.5 6.5 7.4 19a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-12.5" />
      <path d="M10.5 10v6.5M13.5 10v6.5" />
    </>
  ),
  external: (
    <>
      <path d="M14 4.5h5.5V10" />
      <path d="M19.5 4.5 11 13" />
      <path d="M18 14v4.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h4.5" />
    </>
  ),
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
  /** Filled icons (used for the active bottom-nav tab). */
  filled?: boolean;
}

export function Icon({
  name,
  size = 24,
  filled = false,
  strokeWidth = 1.75,
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {PATHS[name]}
    </svg>
  );
}
