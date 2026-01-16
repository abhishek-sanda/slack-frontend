import React, { createContext, useContext, useEffect, useState } from "react";

const themes = { light: "light", dark: "dark", reading: "reading" };
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || themes.light);

  useEffect(() => {
    document.documentElement.classList.remove("dark", "reading");
    if (theme === themes.dark) document.documentElement.classList.add("dark");
    else if (theme === themes.reading) document.documentElement.classList.add("reading");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const nextTheme = () => {
    if (theme === themes.light) setTheme(themes.dark);
    else if (theme === themes.dark) setTheme(themes.reading);
    else setTheme(themes.light);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, nextTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  return useContext(ThemeContext);
}