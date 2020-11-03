import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeOrgConnection, OrganizationConnection } from '../connection';
import { Maybe } from '../global/types/misc';
import { Organization } from '../global/types/organization';
import { useAuth } from './Auth';

export type OrganizationState = {
  connection: Maybe<OrganizationConnection>;
  organization: Maybe<Organization>;
};

const initialState: OrganizationState = {
  connection: null,
  organization: null
};

const OrganizationContext = createContext(initialState);

const OrganizationProvider: React.FC = ({ children }) => {
  const [connection, setConnection] = useState<OrganizationState['connection']>(
    null
  );
  const { organization } = useAuth();

  useEffect(() => {
    if (organization) {
      const { db, storage, disconnect } = initializeOrgConnection(
        organization.name,
        organization.databaseUrl,
        organization.storageUrl
      );
      setConnection({
        db,
        storage
      });

      return disconnect;
    }

    return () => {};
  }, [organization]);

  return (
    <OrganizationContext.Provider value={{ connection, organization }}>
      {children}
    </OrganizationContext.Provider>
  );
};

const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      `useOrganization must be used within an OrganizationProvider`
    );
  }

  return context;
};

export { OrganizationProvider, useOrganization };
