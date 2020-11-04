import firebase from 'firebase';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeOrgConnection, OrganizationConnection } from '../connection';
import { Maybe } from '../global/types/misc';
import { Organization } from '../global/types/organization';
import { useAuth } from './Auth';

export type OrganizationState = {
  db: Maybe<OrganizationConnection['db']>;
  storage: Maybe<OrganizationConnection['storage']>;
  organization: Maybe<Organization>;
};

const initialState: OrganizationState = {
  db: null,
  storage: null,
  organization: null
};

const OrganizationContext = createContext(initialState);

const OrganizationProvider: React.FC = ({ children }) => {
  const [connection, setConnection] = useState<Maybe<OrganizationConnection>>(
    null
  );
  const { organization } = useAuth();

  useEffect(() => {
    if (organization) {
      const organizationApp = firebase.apps.find(
        (a) => a.name === organization.name
      );

      if (!organizationApp) {
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
    }

    return () => {};
  }, [organization?.name, organization?.databaseUrl, organization?.storageUrl]);

  return (
    <OrganizationContext.Provider
      value={{ db: connection?.db, storage: connection?.storage, organization }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

const useOrganization = (): OrganizationState => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      `useOrganization must be used within an OrganizationProvider`
    );
  }

  return context;
};

export { OrganizationProvider, useOrganization };
