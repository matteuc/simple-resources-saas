import { ThemeOptions } from '@material-ui/core';

export type Organization = {
  id: string;
  accessCode: string;
  name: string;
  databaseUrl: string;
  storageUrl: string;
  theme: ThemeOptions;
};
