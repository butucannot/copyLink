export const FooterLink = ({ 
  href, 
  isDarkMode, 
  children 
}: { 
  href: string; 
  isDarkMode: boolean; 
  children: React.ReactNode 
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`text-gray-400 transition-colors duration-200 flex-1 text-center ${
      isDarkMode ? "hover:text-white" : "hover:text-black"
    }`}
  >
    {children}
  </a>
);