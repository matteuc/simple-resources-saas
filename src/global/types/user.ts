import { Organization } from './organization';

export type User = {
  id: string;
  currentOrganizationId?: string;
  organizations?: Record<Organization['id'], User['id']>;
};
