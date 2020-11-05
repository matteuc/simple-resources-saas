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
import { PersonAdd, Visibility, VisibilityOff } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import AuthErrors from '../global/errors/auth';
import { loadImage } from '../global/functions/storage';
import {
  Maybe,
  FormData,
  ValidationMap,
  FormFieldData
} from '../global/types/misc';
import Database from '../global/functions/database';
import { OrganizationMetadata } from '../global/types/organization';
import LoadingPage from '../components/LoadingPage';
import { useAuth } from '../context/Auth';
import {
  getOrganizationMetaFromSubdomain,
  verifyAccessCode
} from '../global/functions/organizations';
import { main } from '../connection';
import { LOGIN } from '../global/constants/routes';

const initialFormFieldData: FormFieldData = {
  message: '',
  error: false,
  value: '',
  validating: false,
  valid: false
};

const initialForm: FormData = {
  email: initialFormFieldData,
  password: initialFormFieldData,
  accessCode: initialFormFieldData,
  name: initialFormFieldData
};

const signInValidationMap: ValidationMap = {
  email: (value: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return !re.test(value.toLowerCase()) ? 'Please enter a valid email' : null;
  },
  password: (value: string) => {
    return !(value.length > 5)
      ? 'Please enter a password longer than 5 characters.'
      : null;
  },
  name: (value: string) => {
    return !value.length ? 'Please enter a name' : null;
  },
  accessCode: (value: string) => {
    return !value.length ? 'Please enter an accessCode' : null;
  }
};

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    flex: 1,
    display: 'flex',
    padding: theme.spacing(2)
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
    justifyContent: 'center'
    // flex: 3
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
  },
  link: {
    color: theme.palette.text.primary,
    textDecoration: 'underline',
    textDecorationColor: theme.palette.text.primary
  }
}));

const SignUp: React.FC = () => {
  const [initializing, setIntitializing] = useState(true);
  const [organizationMeta, setOrganizationMeta] = useState<
    Maybe<OrganizationMetadata>
  >(null);

  const classes = useStyles();
  const [securePassword, setSecurePassword] = useState(true);
  const [signingUp, setSigningUp] = useState(false);
  const [form, setForm] = useState(initialForm);
  const { signUp } = useAuth();

  const checkUserExistsUnderEmail = useDebouncedCallback(
    async (email: string) => {
      const error =
        (await main.auth.fetchSignInMethodsForEmail(email)).length !== 0;
      setForm((currentForm) => ({
        ...currentForm,
        email: {
          ...currentForm.email,
          error,
          valid: !error,
          message: error ? AuthErrors.USER_EXISTS : null
        }
      }));
    },
    800
  );

  const checkAccessCode = useDebouncedCallback(async (code: string) => {
    if (organizationMeta) {
      const error = !(await verifyAccessCode(code, organizationMeta.id));

      setForm((currentForm) => ({
        ...currentForm,
        accessCode: {
          ...currentForm.accessCode,
          error,
          valid: !error,
          message: error ? AuthErrors.ACCESS_CODE_INCORRECT : null
        }
      }));
    }
  }, 800);

  useEffect(() => {
    const initializeSignUp = async () => {
      const org = await getOrganizationMetaFromSubdomain();

      if (org) {
        setOrganizationMeta(await loadImage(org));
      } else {
        setForm(({ email, name, password }) => {
          return {
            email,
            name,
            password
          };
        });
      }

      setIntitializing(false);
    };

    try {
      initializeSignUp();
    } catch (e) {
      console.error(e);
      setIntitializing(false);
    }
  }, []);

  const handleValidation = async (name: string, value: any) =>
    signInValidationMap[name](value);

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

    if (!errorMessage) {
      switch (name) {
        case 'email':
          await checkUserExistsUnderEmail.callback(value);
          break;
        case 'accessCode':
          await checkAccessCode.callback(value);
          break;
        default:
          break;
      }
    }

    setForm(
      (newForm) =>
        ({
          ...newForm,
          [name]: {
            value,
            message: errorMessage,
            error: Boolean(errorMessage),
            valid: !errorMessage,
            validating: false
          }
        } as FormData)
    );
  };

  const handleSignUp = async () => {
    try {
      setSigningUp(true);
      await signUp(
        form.email.value,
        form.password.value,
        {
          name: form.name.value
        },
        organizationMeta
          ? {
              orgId: organizationMeta.id,
              accessCode: form.accessCode.value
            }
          : undefined
      );
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

    setSigningUp(false);
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
              Sign Up
            </Typography>
            {organizationMeta?.name ? (
              <Typography variant="subtitle1" className={classes.subtitle}>
                {organizationMeta.name}
              </Typography>
            ) : (
              ''
            )}
          </Box>

          <Box className={classes.fieldContainer}>
            <TextField
              className={classes.field}
              value={form.name.value}
              disabled={signingUp}
              helperText={form.name.message}
              error={form.name.error}
              onChange={handleFormChange}
              type="input"
              name="name"
              color="primary"
              label="Name"
              variant="outlined"
              placeholder="Your name"
              InputLabelProps={{
                shrink: true
              }}
            />
            {organizationMeta && (
              <TextField
                className={classes.field}
                value={form.accessCode.value}
                disabled={signingUp}
                helperText={form.accessCode.message}
                error={form.accessCode.error}
                onChange={handleFormChange}
                type="email"
                name="accessCode"
                label="Access Code"
                variant="outlined"
                placeholder="Your code"
                InputLabelProps={{
                  shrink: true
                }}
              />
            )}
            <TextField
              className={classes.field}
              value={form.email.value}
              disabled={signingUp}
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
              disabled={signingUp}
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

          <Box m={1} className={classes.submit}>
            <Fab
              disabled={
                signingUp ||
                Object.values(form).some(
                  (f) => f.error || f.validating || !f.valid
                )
              }
              onClick={handleSignUp}
              color="primary"
              aria-label="edit"
            >
              <PersonAdd />
            </Fab>
          </Box>

          <Box mt={1} mb={1}>
            <Link to={LOGIN}>
              <Typography className={classes.link} variant="subtitle1">
                Have an account? Login!
              </Typography>
            </Link>
          </Box>
        </Paper>
      </Box>
    );
  };

  return showView();
};

export default SignUp;
