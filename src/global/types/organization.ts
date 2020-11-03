import { ThemeOptions } from '@material-ui/core';

export type OrganizationMetadata = {
  id: string;
  slug: string;
  accessCode: string;
  name: string;
};

export type Organization = OrganizationMetadata & {
  databaseUrl: string;
  storageUrl: string;
  theme: ThemeOptions;
};
