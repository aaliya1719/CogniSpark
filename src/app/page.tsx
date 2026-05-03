import { Navbar } from "@/components/Navbar";
import { Pomodoro } from "@/components/dashboard/Pomodoro";
import { TodoList } from "@/components/dashboard/TodoList";
import { HydrationTracker } from "@/components/dashboard/HydrationTracker";
import { AISidebar } from "@/components/dashboard/AISidebar";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 p-6 md:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        {/* Left Column: Pomodoro */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Pomodoro />
        </div>

        {/* Center Column: Todos & Hydration */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <TodoList />
          <HydrationTracker />
        </div>

        {/* Right Column: AI Sidebar */}
        <div className="lg:col-span-4">
          <AISidebar />
        </div>
      </main>
    </div>
  );
}
