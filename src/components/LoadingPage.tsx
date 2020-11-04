import React from 'react';
import { Box, makeStyles, useTheme } from '@material-ui/core';
import ReactLoading from 'react-loading';

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    display: 'flex',
    backgroundColor: theme.palette.background.default
  },
  loading: {
    margin: 'auto'
  }
}));

const LoadingPage: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Box className={classes.root}>
      <ReactLoading
        className={classes.loading}
        type="bubbles"
        color={theme.palette.primary.light}
        height="20%"
        width="20%"
      />
    </Box>
  );
};

export default LoadingPage;
