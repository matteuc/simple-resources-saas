import { Organization } from './organization';

export type User = {
  id: string;
  organizationId?: string;
  organizations?: Record<Organization['id'], User['id']>;
};
