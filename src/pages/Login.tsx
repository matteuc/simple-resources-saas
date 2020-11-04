import React, { useEffect, useState } from 'react';
import {
  Box,
  Fab,
  IconButton,
  InputAdornment,
  makeStyles,
  Paper,
  TextField,
  TextFieldProps,
  Typography
} from '@material-ui/core';
import { Visibility, VisibilityOff, VpnKey } from '@material-ui/icons';
import { useDebouncedCallback } from 'use-debounce';

import AuthErrors from '../global/errors/auth';
import { loadImage } from '../global/functions/storage';
import { Maybe } from '../global/types/misc';
import { OrganizationMetadata } from '../global/types/organization';
import defaultLogo from '../assets/default-logo.png';
import LoadingPage from '../components/LoadingPage';
import { useAuth } from '../context/Auth';
import { getOrganizationMetaFromSubdomain } from '../global/functions/organizations';
import { main } from '../connection';

type FormFieldData = {
  message: Maybe<string>;
  error: boolean;
  validating: boolean;
  value: any;
};

type FormData = {
  [key: string]: FormFieldData;
};

type ValidationMap = {
  [key: string]:
    | ((value: any) => Maybe<string>)
    | ((value: any) => Promise<Maybe<string>>);
};

const initialFormFieldData: FormFieldData = {
  message: '',
  error: false,
  value: '',
  validating: false
};

const initialForm: FormData = {
  email: initialFormFieldData,
  password: initialFormFieldData
};

const loginValidationMap: ValidationMap = {
  email: (value: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return !re.test(value.toLowerCase()) ? 'Please enter a valid email' : null;
  },
  password: (value: string) => {
    return !value.length ? 'Please enter a password' : null;
  }
};

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.grey[100],
    flex: 1,
    display: 'flex',
    padding: theme.spacing(3)
  },
  paper: {
    padding: theme.spacing(2),
    margin: 'auto',
    minHeight: '90%',
    width: '90%',
    maxWidth: theme.breakpoints.values.sm,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  logo: {
    maxWidth: 200,
    width: '50%',
    height: 'fit-content'
  },
  field: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '70%'
  },
  fieldContainer: {
    width: '90%',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 3
  },
  title: {
    fontWeight: 'lighter',
    textAlign: 'center'
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    flex: 2
  },
  subtitle: {
    fontWeight: 'lighter',
    textAlign: 'center',
    margin: '2rem 0'
  },
  submit: {
    flex: 1
  }
}));

const Login: React.FC = () => {
  const [initializing, setIntitializing] = useState(true);
  const [organizationMeta, setOrganizationMeta] = useState<
    Maybe<OrganizationMetadata>
  >(null);

  const classes = useStyles();
  const [securePassword, setSecurePassword] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [form, setForm] = useState(initialForm);
  const { login } = useAuth();

  const checkUserExistsUnderEmail = useDebouncedCallback(
    async (email: string) => {
      const error = !(await main.auth.fetchSignInMethodsForEmail(email)).length;
      setForm((currentForm) => ({
        ...currentForm,
        email: {
          ...currentForm.email,
          error,
          message: error ? AuthErrors.USER_DNE : null
        }
      }));
    },
    800
  );

  useEffect(() => {
    const initializeLogin = async () => {
      const org = await getOrganizationMetaFromSubdomain();

      if (org) {
        setOrganizationMeta(await loadImage(org));
      }

      setIntitializing(false);
    };

    try {
      initializeLogin();
    } catch (e) {
      console.error(e);
      setIntitializing(false);
    }
  }, []);

  const handleValidation = async (name: string, value: any) =>
    loginValidationMap[name](value);

  const handleFormChange: TextFieldProps['onChange'] = async (e) => {
    const {
      target: { name, value }
    } = e;

    if (!Object.keys(form).includes(name)) {
      throw new Error(
        `The specified form field '${name}' is not compatible with this form.`
      );
    }

    setForm(
      (newForm) =>
        ({
          ...newForm,
          [name]: {
            ...newForm[name],
            validating: true
          }
        } as FormData)
    );

    const errorMessage = await handleValidation(name, value);

    if (name === 'email' && !errorMessage) {
      checkUserExistsUnderEmail.callback(e.target.value);
    }

    setForm(
      (newForm) =>
        ({
          ...newForm,
          [name]: {
            value,
            message: errorMessage,
            error: Boolean(errorMessage),
            validating: false
          }
        } as FormData)
    );
  };

  const handleLogin = async () => {
    try {
      setLoggingIn(true);
      await login(form.email.value, form.password.value, organizationMeta?.id);
    } catch (e) {
      setForm((currentForm) => ({
        ...currentForm,
        email: {
          ...currentForm.email,
          message: e.message,
          error: true
        }
      }));
    }

    setLoggingIn(false);
  };

  const showView = () => {
    if (initializing) {
      return <LoadingPage />;
    }

    return (
      <Box className={classes.root}>
        <Paper className={classes.paper}>
          <Box className={classes.titleContainer}>
            <Typography variant="h3" className={classes.title}>
              Login
            </Typography>
            {organizationMeta?.name ? (
              <Typography variant="subtitle1" className={classes.subtitle}>
                {organizationMeta.name}
              </Typography>
            ) : (
              ''
            )}
          </Box>
          <img
            alt="Organization Logo"
            src={organizationMeta?.image || defaultLogo}
            className={classes.logo}
          />
          <Box className={classes.fieldContainer}>
            <TextField
              className={classes.field}
              value={form.email.value}
              disabled={loggingIn}
              helperText={form.email.message}
              error={form.email.error}
              onChange={handleFormChange}
              type="email"
              name="email"
              label="Email"
              variant="outlined"
              placeholder="Your email"
              InputLabelProps={{
                shrink: true
              }}
            />
            <TextField
              className={classes.field}
              disabled={loggingIn}
              type={securePassword ? 'password' : 'input'}
              value={form.password.value}
              helperText={form.password.message}
              error={form.password.error}
              onChange={handleFormChange}
              label="Password"
              name="password"
              placeholder="Your password"
              variant="outlined"
              InputLabelProps={{
                shrink: true
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setSecurePassword(!securePassword)}
                      edge="end"
                    >
                      {!securePassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>

          <Box className={classes.submit}>
            <Fab
              disabled={loggingIn || !Object.values(form).every((f) => f.error)}
              onClick={handleLogin}
              color="secondary"
              aria-label="edit"
            >
              <VpnKey />
            </Fab>
          </Box>
        </Paper>
      </Box>
    );
  };

  return showView();
};

export default Login;
