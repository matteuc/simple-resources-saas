import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createMuiTheme,
  Theme,
  ThemeProvider as MuiThemeProvider
} from '@material-ui/core/styles';
import customTheme from '../global/constants/theme';
import { useOrganization } from './Organization';

const ThemeContext = createContext(null);

const theme = createMuiTheme(customTheme);

const ThemeProvider: React.FC = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(theme);

  const { organization } = useOrganization();

  useEffect(() => {
    if (organization) {
      const orgTheme = createMuiTheme(organization.theme);

      setCurrentTheme(orgTheme);
    }
  }, [organization]);

  return (
    <ThemeContext.Provider value={null}>
      <MuiThemeProvider theme={currentTheme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(`useTheme must be used within an ThemeProvider`);
  }

  return context;
};

export { ThemeProvider, useTheme };
