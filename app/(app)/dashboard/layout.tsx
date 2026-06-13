import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { EventReminderWatcher } from "@/components/layout/EventReminderWatcher";
import { Footer } from "@/components/layout/Footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Desktop sidebar */}
      <Sidebar />
      <EventReminderWatcher />
      <main className="flex-1 md:ml-64 min-h-screen pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
          {children}
          <Footer />
        </div>
      </main>
      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
