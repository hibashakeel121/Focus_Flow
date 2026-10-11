import { NavLink } from 'react-router-dom';
import { useTheme, themes } from '../../context/ThemeContext';

export default function Navbar() {
  const { theme, setTheme, themeStyles } = useTheme();

  const links = [
    { to: '/', label: 'Tasks' },
    { to: '/stopwatch', label: 'Stopwatch' },
    { to: '/timer', label: 'Timer' },
    { to: '/notepad', label: 'Notes' },
    { to: '/habits', label: 'Habits' },
    { to: '/word-counter', label: 'Word Counter' },
    { to: '/calculator', label: 'Calculator' },
  ];

  return (
    <nav className={`p-4 transition-colors duration-300 ${themeStyles.navbar}`}>
      <div className="max-w-5xl mx-auto flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-xl font-bold tracking-wide">Focus Flow</h1>
        
        <div className="flex items-center gap-3">
          <div className="flex space-x-1 flex-wrap gap-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive ? themeStyles.navActive : themeStyles.navInactive
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <select
            aria-label="Color theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="text-xs px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent cursor-pointer font-medium focus:outline-none"
          >
            {Object.keys(themes).map((key) => (
              <option key={key} value={key} className="text-black">
                {themes[key].name} Mode
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
}
