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
import { HOME, LOGIN, SIGN_UP } from './global/constants/routes';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';

const useStyles = makeStyles(() => ({
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
            <Route component={() => <Redirect to={HOME} />} />
          </Switch>
        </Router>
      ) : (
        <Router>
          <Switch>
            <Route exact path={LOGIN} component={Login} />
            <Route exact path={SIGN_UP} component={SignUp} />
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
