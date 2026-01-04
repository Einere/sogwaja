import { Gowun_Dodum } from "next/font/google";

export const gowunDodum = Gowun_Dodum({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-gowun-dodum",
  fallback: ["system-ui", "arial"],
});
