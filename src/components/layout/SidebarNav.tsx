
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BarChart3, ChevronLeft, Gauge, Settings, Users } from "lucide-react";

interface SidebarNavProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function SidebarNav({ isOpen, setIsOpen }: SidebarNavProps) {
  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: <Gauge className="h-5 w-5" />,
    },
    {
      title: "People",
      href: "/people",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Departments",
      href: "/departments",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "KPIs",
      href: "/kpis",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <aside
      className={cn(
        "border-r bg-card fixed inset-y-0 z-20 flex flex-col transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-[70px]",
        "md:left-0 md:relative"
      )}
      style={{
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        visibility: isOpen ? "visible" : "hidden",
        "@media (min-width: 768px)": {
          transform: "translateX(0)",
          visibility: "visible",
        },
      }}
    >
      <div className="flex h-14 items-center border-b px-3 justify-between">
        <h2 className={cn("font-semibold tracking-tight transition-all", 
          isOpen ? "text-lg" : "invisible opacity-0 w-0")}>
          PerfTrack
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronLeft className={cn("h-5 w-5 transition-transform", !isOpen && "rotate-180")} />
        </Button>
      </div>
      
      <nav className="flex-1 overflow-auto py-4">
        <ul className="grid gap-1 px-2">
          {navItems.map((item, index) => (
            <li key={index}>
              <NavLink 
                to={item.href}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.icon}
                <span className={cn("transition-opacity", 
                  isOpen ? "opacity-100" : "opacity-0 hidden md:inline-block")}>{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="border-t p-4">
        <div className={cn("flex items-center gap-3", !isOpen && "justify-center")}>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">PT</span>
          </div>
          <div className={cn(isOpen ? "block" : "hidden md:hidden")}>
            <p className="text-sm font-medium">User</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
