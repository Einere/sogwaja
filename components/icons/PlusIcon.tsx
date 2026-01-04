import React from "react";
import { IconProps } from "./AppleIcon";

export default function PlusIcon({
  className = "w-4 h-4",
  "aria-hidden": ariaHidden = "true",
}: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden={ariaHidden}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
