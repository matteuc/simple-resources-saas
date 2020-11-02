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

/**
 * Return a connection to an organization's resources
 * @param databaseURL URL to the organization's RTDB
 * @param storageURL URL to the organization's bucket
 */
export const initializeOrganizationResources = (
  databaseURL: string,
  storageURL: string
) => {
  const app = firebase.initializeApp({
    databaseURL,
    storageBucket: storageURL
  });

  return {
    db: firebase.database(app),
    storage: firebase.storage(app)
  };
};

export type OrganizationConnection = ReturnType<
  typeof initializeOrganizationResources
>;
