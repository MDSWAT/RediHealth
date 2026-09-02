import type { Metadata } from "next";
import { GetHelpPageContent } from "@/components/get-help/GetHelpPageContent";

export const metadata: Metadata = {
  title: "Request Medical Help — RediHealth",
  description:
    "Request help arranging medical care. Share your phone number, email, and a brief description of what's wrong, and a support worker will get in touch.",
};

export default function GetHelpPage() {
  return <GetHelpPageContent />;
}
