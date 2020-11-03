import * as React from 'react';
import logo from './logo.svg';
import './App.css';
import { AuthProvider } from './context/Auth';
import { OrganizationProvider } from './context/Organization';
import { ThemeProvider } from './context/Theme';

const Main: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
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
