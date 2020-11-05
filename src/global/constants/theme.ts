declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    resourcePaper: {
      main: string;
    };
  }
  // allow configuration using `createMuiTheme`
  interface ThemeOptions {
    resourcePaper?: {
      main?: string;
    };
  }
}

const theme = {
  resourcePaper: {
    main: '#9e9e9e'
  },
  palette: {
    primary: {
      main: '#0ABAB5'
    }
  }
};

export default theme;
