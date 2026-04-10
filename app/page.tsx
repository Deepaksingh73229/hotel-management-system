import { redirect } from "next/navigation";

// The root URL just redirects.
// AuthProvider + layout guards handle the login vs dashboard decision.
export default function RootPage() {
  redirect("/dashboard");
}