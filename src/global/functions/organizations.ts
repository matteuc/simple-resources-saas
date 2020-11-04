import { ORGANIZATIONS_METADATA_COLLECTION } from '../constants/database';
import { Maybe } from '../types/misc';
import { OrganizationMetadata } from '../types/organization';
import Database from './database';

export const getOrganizationMetaFromSubdomain = async (): Promise<
  Maybe<OrganizationMetadata>
> => {
  const { hostname: domain } = window.location;

  const containsSubdomain = domain.includes('.');

  if (containsSubdomain) {
    const domainParts = domain.split('.');
    const orgSlug = domainParts[0];

    const res = await Database.queryGroupDocuments<OrganizationMetadata>(
      ORGANIZATIONS_METADATA_COLLECTION,
      {
        slug: orgSlug
      }
    );

    if (res) {
      const org = res[0];

      return org;
    }
  }

  return null;
};

export const verifyAccessCode = async (
  code: string,
  orgId: string
): Promise<boolean> => {
  const res = await Database.queryGroupDocuments<OrganizationMetadata>(
    ORGANIZATIONS_METADATA_COLLECTION,
    {
      accessCode: code,
      id: orgId
    }
  );

  if (res) {
    const org = res[0];

    return Boolean(org);
  }

  return false;
};
