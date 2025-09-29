import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";
import { Sprout, Menu, Settings } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
function NavContent({ onLinkClick, onSettingsClick }: { onLinkClick?: () => void; onSettingsClick?: () => void; }) {
  const handleSettings = () => {
    onLinkClick?.();
    onSettingsClick?.();
  }
  return (
    <div className="flex flex-col h-full">
      <div className="flex h-16 items-center justify-center border-b border-brand-green/20 px-6 flex-shrink-0">
        <NavLink to="/" onClick={onLinkClick} className="flex items-center gap-2 font-display text-2xl font-semibold text-brand-green">
          <Sprout className="h-8 w-8 text-brand-ochre" />
          Verdant
        </NavLink>
      </div>
      <nav className="flex flex-col gap-4 p-4 flex-grow">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.href}
            to={link.href}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-brand-green transition-all hover:bg-brand-green/10",
                isActive && "bg-brand-green/10 font-bold"
              )
            }
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t border-brand-green/20">
        <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleSettings}>
          <Settings className="h-5 w-5" />
          Settings
        </Button>
      </div>
    </div>
  );
}
export function SideNav({ onSettingsClick }: { onSettingsClick: () => void }) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  if (isMobile) {
    return (
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-brand-cream px-4 md:hidden">
        <NavLink to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-brand-green">
          <Sprout className="h-6 w-6 text-brand-ochre" />
          Verdant
        </NavLink>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col w-64 bg-brand-cream p-0">
            <NavContent onLinkClick={() => setIsOpen(false)} onSettingsClick={onSettingsClick} />
          </SheetContent>
        </Sheet>
      </header>
    );
  }
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-brand-green/20 bg-brand-cream md:flex">
      <NavContent onSettingsClick={onSettingsClick} />
    </aside>
  );
}