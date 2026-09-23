import { useTheme } from '../../context/ThemeContext';

export default function Card({ children, title, className = '' }) {
  const { themeStyles } = useTheme();

  return (
    <div className={`p-6 rounded-xl border transition-all duration-300 ${themeStyles.card} ${className}`}>
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      {children}
    </div>
  );
}