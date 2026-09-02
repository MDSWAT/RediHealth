import type { Metadata } from "next";
import { FindHelpPageContent } from "@/components/find-help/FindHelpPageContent";

export const metadata: Metadata = {
  title: "Find Medical Help — RediHealth",
  description:
    "Find medical institutes near you. Browse hospitals, clinics, GP practices, pharmacies, and more with addresses and an interactive map.",
};

export default function FindHelpPage() {
  return <FindHelpPageContent />;
}
