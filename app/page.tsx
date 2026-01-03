import { redirect } from "next/navigation";

export default function Home() {
  // Temporary redirect to login until we build auth
  redirect("/login");
}

