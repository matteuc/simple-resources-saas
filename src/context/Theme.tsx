import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createMuiTheme,
  Theme,
  ThemeOptions,
  ThemeProvider as MuiThemeProvider
} from '@material-ui/core/styles';
import { CssBaseline, useMediaQuery } from '@material-ui/core';
import customTheme from '../global/constants/theme';
import { useOrganization } from './Organization';

const ThemeContext = createContext(null);

const defaultTheme = createMuiTheme({ ...customTheme });

const ThemeProvider: React.FC = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);

  const { organization } = useOrganization();

  const defaultThemeOptions: ThemeOptions = {
    ...customTheme,
    palette: {
      ...customTheme.palette,
      type: prefersDarkMode ? 'dark' : 'light'
    }
  };

  useEffect(() => {
    if (organization) {
      const orgTheme = createMuiTheme({
        ...defaultThemeOptions,
        ...organization.theme
      });

      setCurrentTheme(orgTheme);
    }
  }, [organization]);

  useEffect(() => {
    const newTheme = createMuiTheme(defaultThemeOptions);

    setCurrentTheme(newTheme);
  }, [prefersDarkMode]);

  return (
    <ThemeContext.Provider value={null}>
      <CssBaseline />
      <MuiThemeProvider theme={currentTheme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

const useTheme = (): null => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(`useTheme must be used within an ThemeProvider`);
  }

  return context;
};

export { ThemeProvider, useTheme };
