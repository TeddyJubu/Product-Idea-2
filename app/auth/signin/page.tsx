import { redirect } from "next/navigation";

export default function Page() {
  // Authentication disabled; send users to dashboard
  redirect("/");
}
