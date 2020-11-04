import { Maybe } from './misc';
import { Organization } from './organization';

export type User = {
  id: string;
  name: string;
  image: Maybe<string>;
  organizations?: Record<Organization['id'], boolean>;
};
