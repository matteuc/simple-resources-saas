import { Organization } from './organization';

export type User = {
  id: string;
  name: string;
  image?: string;
  currentOrganizationId?: string;
  organizations?: Record<Organization['id'], boolean>;
};
