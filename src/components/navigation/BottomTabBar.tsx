import { NavLink } from 'react-router-dom';
import { Mountain, Calendar, MessageSquare } from 'lucide-react';

export function BottomTabBar() {
  const tabs = [
    { to: '/events', label: 'Treks', Icon: Mountain },
    { to: '/gallery', label: 'Past', Icon: Calendar },
    { to: '/forum', label: 'Forum', Icon: MessageSquare },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur border-t border-gray-200"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom))' }}
    >
      <ul className="flex items-center justify-around h-16">
        {tabs.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-xs ${isActive ? 'text-primary' : 'text-gray-500'}`
              }
            >
              <Icon className="h-6 w-6" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}


