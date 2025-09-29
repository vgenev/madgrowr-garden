import { Outlet, useLocation } from "react-router-dom";
import { SideNav } from "@/components/SideNav";
import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "framer-motion";
import { SettingsModal } from "./components/SettingsModal";
import { useState } from "react";
export default function App() {
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  return (
    <div className="min-h-screen w-full bg-brand-cream text-brand-green">
      <SettingsModal isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <div className="flex">
        <SideNav onSettingsClick={() => setIsSettingsOpen(true)} />
        <main className="flex-1 md:pl-64">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      <Toaster richColors closeButton theme="light" />
    </div>
  );
}