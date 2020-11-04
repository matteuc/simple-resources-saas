import { Box, makeStyles, Paper, Typography } from '@material-ui/core';
import React from 'react';
import ResourceCard from '../components/ResourceCard';
import { useOrganization } from '../context/Organization';

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
    flexDirection: 'column',
    flex: 5,
    width: '70%',
    maxHeight: '100%',
    overflow: 'auto'
  }
}));

const Home: React.FC = () => {
  const classes = useStyles();
  const { db, storage, organization } = useOrganization();

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
          {[0, 1, 2].map(() => (
            <ResourceCard />
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default Home;
