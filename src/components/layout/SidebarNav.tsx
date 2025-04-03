
import {
  Home,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
  Activity,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Dispatch, SetStateAction } from "react";

interface SidebarItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarNavProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const sidebarItems: SidebarItemProps[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    href: "/people",
    label: "People",
    icon: <Users className="h-4 w-4" />,
  },
  {
    href: "/departments",
    label: "Departments",
    icon: <Home className="h-4 w-4" />,
  },
  {
    href: "/kpis",
    label: "KPIs",
    icon: <ListChecks className="h-4 w-4" />,
  },
  {
    href: "/performance",
    label: "Performance",
    icon: <Activity className="h-4 w-4" />,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: <Settings className="h-4 w-4" />,
  },
];

export const SidebarNav = ({ isOpen, setIsOpen }: SidebarNavProps) => {
  return (
    <div className={`flex flex-col space-y-1 ${isOpen ? 'w-64' : 'w-16'} transition-all duration-300 p-2 border-r border-border h-full`}>
      {sidebarItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            `flex items-center space-x-2 rounded-md p-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-accent-foreground focus:outline-none ${
              isActive
                ? "bg-secondary text-accent-foreground"
                : "text-muted-foreground"
            }`
          }
        >
          {item.icon}
          {isOpen && <span>{item.label}</span>}
        </NavLink>
      ))}
    </div>
  );
};
