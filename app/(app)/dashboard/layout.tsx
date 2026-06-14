import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { EventReminderWatcher } from "@/components/layout/EventReminderWatcher";
import { Footer } from "@/components/layout/Footer";
import { FocalIcon } from "@/components/ui/FocalLogo";

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
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl sticky top-0 z-30">
          <FocalIcon size={26} />
          <span className="text-lg font-semibold tracking-tight text-[#0D1B2A] dark:text-white">
            Focal<span className="text-[#D4A017]">.</span>
          </span>
        </div>
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
