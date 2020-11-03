export const USERS_COLLECTION = 'users';
export const ORGANIZATIONS_COLLECTION = 'organizations';
export const ORGANIZATIONS_METADATA_COLLECTION = 'organizations-metadata';

export const generateUserPath = (userId: string): string =>
  `${USERS_COLLECTION}/${userId}`;

export const generateOrganizationsPath = (orgId: string): string =>
  `${ORGANIZATIONS_COLLECTION}/${orgId}`;
