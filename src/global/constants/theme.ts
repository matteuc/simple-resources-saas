declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    status: {
      danger: string;
    };
  }
  // allow configuration using `createMuiTheme`
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}

const theme = {
  status: {
    danger: 'red'
  },
  palette: {
    primary: {
      main: '#0ABAB5'
    }
  }
};

export default theme;
