import { Home, MessageSquare, Mountain, User } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useHaptic } from "@/hooks/use-haptic";
import { cn } from "@/lib/utils";

export function BottomTabBar() {
  const haptic = useHaptic();

  const tabs = [
    { to: "/", label: "Home", Icon: Home, exact: true },
    { to: "/events", label: "Treks", Icon: Mountain, exact: false },
    { to: "/forum", label: "Community", Icon: MessageSquare, exact: false },
    { to: "/profile", label: "Profile", Icon: User, exact: false },
  ];

  const handleTabClick = () => {
    haptic.light();
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom))",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      {/* Glass Morphism Background */}
      <div className="absolute inset-0 glass border-t border-gray-200/50 dark:border-gray-700/50" />

      {/* Active Tab Indicator Line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />

      <ul className="relative flex items-center justify-around h-16 px-2">
        {tabs.map(({ to, label, Icon, exact }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={exact}
              onClick={handleTabClick}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-300 relative",
                  isActive
                    ? "text-primary scale-105"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 active:scale-95",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      "p-2 rounded-full transition-all duration-300",
                      isActive && "bg-primary/10 dark:bg-primary/20",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-all duration-300",
                        isActive && "animate-bounce-in",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-all duration-300",
                      isActive && "font-bold",
                    )}
                  >
                    {label}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
