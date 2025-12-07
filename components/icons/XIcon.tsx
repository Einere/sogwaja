import React from "react";
import { IconProps } from "./AppleIcon";

export default function XIcon({
  className = "w-4 h-4",
  "aria-hidden": ariaHidden = true,
}: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden={ariaHidden}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M18 6L6 18M6 6l12 12"
      />
    </svg>
  );
}
