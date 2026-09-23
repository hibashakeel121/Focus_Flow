import { useTheme } from '../../context/ThemeContext';

export default function Button({ children, onClick, variant = 'primary', className = '', ...props }) {
  const { themeStyles } = useTheme();

  const base = "px-4 py-2 rounded-xl font-medium transition-all duration-150 disabled:opacity-50 active:scale-[0.98]";

  // Map variants to dynamic theme classes
  const variants = {
    // Primary maps directly to buttonPrimary theme setting
    primary: `${themeStyles.buttonPrimary} shadow-sm`,
    
    // Danger stays constant for functional clarity, but we use a theme-appropriate text shade
    danger: `bg-red-500 hover:bg-red-600 ${themeStyles.textInv} shadow-sm`,

    // Secondary uses the input/card background for a subtle look
    secondary: `${themeStyles.input} hover:brightness-95`,

    // Outline uses the input border
    outline: `border ${themeStyles.border} ${themeStyles.text} hover:brightness-95`,
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}