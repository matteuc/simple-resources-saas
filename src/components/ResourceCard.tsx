import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import { Skeleton } from '@material-ui/lab';
import { Resource } from '../global/types/resource';
import { Maybe } from '../global/types/misc';
import { loadImage } from '../global/functions/storage';
import { useOrganization } from '../context/Organization';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    backgroundColor: theme.resourcePaper.main
  },
  contrastTitle: {
    color: theme.palette.getContrastText(theme.resourcePaper.main)
  },
  contrastDescription: {
    color: theme.palette.getContrastText(theme.resourcePaper.main)
  }
}));

type ResourceCardProps = {
  resource: Resource;
};

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const { storage } = useOrganization();

  const [loadedResource, setLoadedResource] = useState<Maybe<Resource>>(null);

  useEffect(() => {
    const load = async () => {
      const res = await loadImage(resource, storage || undefined);

      setLoadedResource(res);

      setLoading(false);
    };

    try {
      load();
    } catch (e) {
      setLoading(false);
      console.error(e);
    }
  }, [resource]);

  const showView = () => {
    if (loading) {
      return <Skeleton variant="rect" width="100%" height={200} />;
    }

    if (loadedResource) {
      return (
        <Card className={classes.root}>
          <CardActionArea target="__blank" href={loadedResource.url}>
            <CardMedia
              component="img"
              alt={loadedResource.title}
              height="140"
              image={loadedResource.image}
              title={resource.title}
            />
            <CardContent>
              <Typography
                className={classes.contrastTitle}
                gutterBottom
                variant="h5"
                component="h2"
              >
                {loadedResource.title}
              </Typography>
              <Typography
                className={classes.contrastDescription}
                variant="body2"
                color="textSecondary"
                component="p"
              >
                {loadedResource.description}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      );
    }

    return <></>;
  };

  return showView();
};

export default ResourceCard;
