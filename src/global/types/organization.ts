import { ThemeOptions } from '@material-ui/core';
import { Maybe } from './misc';

export type OrganizationMetadata = {
  id: string;
  slug: string;
  accessCode: string;
  name: string;
  image: Maybe<string>;
};

export type Organization = OrganizationMetadata & {
  databaseUrl: string;
  storageUrl: string;
  theme: ThemeOptions;
};
