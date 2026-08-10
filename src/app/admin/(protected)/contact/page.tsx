import { redirect } from "next/navigation";

export default function AdminContactRedirectPage() {
  redirect("/admin/contact-messages");
}