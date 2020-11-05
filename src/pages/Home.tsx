import {
  Box,
  IconButton,
  makeStyles,
  Paper,
  Typography,
  useTheme
} from '@material-ui/core';
import { ExitToApp } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import ReactLoading from 'react-loading';
import ResourceCard from '../components/ResourceCard';
import { useAuth } from '../context/Auth';
import { useOrganization } from '../context/Organization';
import database from '../global/functions/database';
import { RESOURCES_COLLECTION } from '../global/constants/database';
import { Resource } from '../global/types/resource';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    flex: 1,
    display: 'flex',
    padding: theme.spacing(2),
    flexDirection: 'column'
  },
  paper: {
    padding: theme.spacing(2),
    margin: 'auto',
    height: '90%',
    width: '90%',
    maxWidth: theme.breakpoints.values.sm,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    flex: 1
  },
  title: {
    fontWeight: 'lighter',
    textAlign: 'center'
  },
  subtitle: {
    fontWeight: 'lighter',
    textAlign: 'center',
    margin: '2rem 0'
  },
  resourcesContainer: {
    flex: 5,
    width: '100%',
    maxHeight: '100%',
    overflow: 'auto',
    alignItems: 'center',
    display: 'flex',
    padding: theme.spacing(1)
  },
  resources: {
    overflow: 'auto',
    width: '100%',
    maxWidth: 350,
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto'
  },
  topBar: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  loading: {
    margin: 'auto'
  }
}));

const Home: React.FC = () => {
  const classes = useStyles();
  const { db, organization } = useOrganization();
  const [resources, setResources] = useState<Array<Resource>>([]);
  const [loading, setLoading] = useState(true); // TODO - Add loading screen
  const [loggingOut, setLoggingOut] = useState(false);
  const { logout } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const loadResources = async () => {
      const data = await database.queryGroupDocuments<Resource>(
        RESOURCES_COLLECTION,
        {},
        db || undefined
      );
      if (data) {
        setResources(data);
      }

      setLoading(false);
    };

    try {
      loadResources();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    if (db) {
      return database.watchDocument<Record<string, Resource>>(
        RESOURCES_COLLECTION,
        (resourceMap) => {
          setResources(Object.values(resourceMap));
        },
        db
      );
    }

    return () => {};
  }, [db]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.topBar}>
        <IconButton disabled={loggingOut} onClick={handleLogout}>
          <ExitToApp />
        </IconButton>
      </Box>
      <Paper className={classes.paper}>
        <Box className={classes.titleContainer}>
          <Typography variant="h4" className={classes.title}>
            Resources
          </Typography>
          {organization?.name ? (
            <Typography variant="subtitle1" className={classes.subtitle}>
              {organization.name}
            </Typography>
          ) : (
            ''
          )}
        </Box>
        <Box className={classes.resourcesContainer}>
          <Box className={classes.resources}>
            {loading ? (
              <ReactLoading
                className={classes.loading}
                type="spinningBubbles"
                color={theme.palette.primary.light}
                height="20%"
                width="20%"
              />
            ) : (
              resources.map((r) => <ResourceCard key={r.id} resource={r} />)
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Home;
