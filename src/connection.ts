import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/database';
import 'firebase/storage';
import config from './firebase.config.json';

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

export default firebase;

export const main = {
  store: firebase.firestore(),
  storage: firebase.storage(),
  auth: firebase.auth()
};

export type OrganizationConnection = {
  db: firebase.database.Database;
  storage: firebase.storage.Storage;
};

/**
 * Return a connection to an organization's resources
 * @param databaseURL URL to the organization's RTDB
 * @param storageURL URL to the organization's bucket
 */
export const initializeOrgConnection = (
  orgName: string,
  databaseURL: string,
  storageURL: string
): OrganizationConnection & {
  disconnect: () => void;
} => {
  const app =
    firebase.apps.find((a) => a.name === orgName) ||
    firebase.initializeApp(
      {
        databaseURL,
        storageBucket: storageURL
      },
      orgName
    );

  return {
    db: firebase.database(app),
    storage: firebase.storage(app),
    disconnect: () => app.delete()
  };
};

export type MainConnection = typeof main;
