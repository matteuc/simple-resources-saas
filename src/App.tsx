import * as React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import { Box, makeStyles } from '@material-ui/core';

import { AuthProvider, useAuth } from './context/Auth';
import { OrganizationProvider } from './context/Organization';
import { ThemeProvider } from './context/Theme';
import { HOME, LOGIN } from './global/constants/routes';
import Login from './pages/Login';
import Home from './pages/Home';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    minHeight: '100%',
    minWidth: '100%'
  }
}));

const Main: React.FC = () => {
  const { user } = useAuth();
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      {user ? (
        <Router>
          <Switch>
            <Route exact path={HOME} component={Home} />
            <Route component={() => <Redirect to={LOGIN} />} />
          </Switch>
        </Router>
      ) : (
        <Router>
          <Switch>
            <Route exact path={LOGIN} component={Login} />
            <Route component={() => <Redirect to={LOGIN} />} />
          </Switch>
        </Router>
      )}
    </Box>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <OrganizationProvider>
      <ThemeProvider>
        <Main />
      </ThemeProvider>
    </OrganizationProvider>
  </AuthProvider>
);

export default App;
