import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/auth-button";
import Link from "next/link";
import { Suspense } from "react";

async function AuthCheck() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return null;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <AuthCheck />
      </Suspense>
      <main className="min-h-screen flex flex-col">
        <nav className="w-full border-b border-b-foreground/10 h-16 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex gap-6 items-center">
              <Link href="/" className="font-semibold text-lg">
                A-BullCity-Z
              </Link>
              <Link
                href="/admin/locations"
                className="text-sm text-foreground/70 hover:text-foreground"
              >
                Locations
              </Link>
            </div>
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </nav>
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </>
  );
}
