import firebase from 'firebase';
import React, { createContext, useContext, useEffect, useState } from 'react';
import LoadingPage from '../components/LoadingPage';
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

  const [initializing, setInitializing] = useState<boolean>(true);

  const { organization, firebaseUser } = useAuth();

  useEffect(() => {
    setInitializing(true);
    let unsubscribe = () => {};
    let organizationApp: Maybe<firebase.app.App>;

    if (organization) {
      organizationApp = firebase.apps.find((a) => a.name === organization.name);

      // If no app found...
      if (!organizationApp) {
        const { auth, db, storage, disconnect } = initializeOrgConnection(
          organization.name,
          organization.databaseUrl,
          organization.storageUrl
        );

        organizationApp = firebase.apps.find(
          (a) => a.name === organization.name
        );

        setConnection({
          db,
          storage,
          auth
        });

        unsubscribe = disconnect;
      }
      // Otherwise reuse the previous connection
      else {
        setConnection({
          db: organizationApp.database(),
          storage: organizationApp.storage(),
          auth: organizationApp.auth()
        });

        unsubscribe = () => organizationApp?.delete();
      }
    }

    if (organizationApp && firebaseUser) {
      organizationApp
        .auth()
        .updateCurrentUser(firebaseUser)
        .then(() => {
          setInitializing(false);
        });

      return unsubscribe;
    }

    setInitializing(false);

    return unsubscribe;
  }, [
    organization?.name,
    organization?.storageUrl,
    organization?.databaseUrl,
    firebaseUser
  ]);

  return (
    <OrganizationContext.Provider
      value={{ db: connection?.db, storage: connection?.storage, organization }}
    >
      {initializing ? <LoadingPage /> : children}
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
