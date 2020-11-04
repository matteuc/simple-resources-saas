import { Box, makeStyles, Paper, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import ResourceCard from '../components/ResourceCard';
import { useOrganization } from '../context/Organization';
import database from '../global/functions/database';
import { Resource } from '../global/types/resource';

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
    width: '70%',
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    height: '100%'
  }
}));

const Home: React.FC = () => {
  const classes = useStyles();
  const { db, organization } = useOrganization();
  const [resources, setResources] = useState<Array<Resource>>([]);
  const [loading, setLoading] = useState(true); // TODO - Add loading screen

  useEffect(() => {
    const loadResources = async () => {
      const data = await database.queryGroupDocuments<Resource>(
        'resources',
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

  return (
    <Box className={classes.root}>
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
            {resources.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Home;
