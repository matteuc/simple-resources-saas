import React from 'react';
import { Box, makeStyles } from '@material-ui/core';
import ReactLoading from 'react-loading';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.grey[100],
    flex: 1,
    display: 'flex'
  },
  loading: {
    margin: 'auto'
  }
}));

const LoadingPage: React.FC = () => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <ReactLoading
        className={classes.loading}
        type="bubbles"
        color="red"
        height="20%"
        width="20%"
      />
    </Box>
  );
};

export default LoadingPage;
