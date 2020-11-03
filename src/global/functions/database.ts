import firebase from 'firebase';
import { main } from '../../connection';
import DatabaseErrors from '../errors/database';
import { Maybe } from '../types/misc';

/**
 * Retrieve the document at the specified path, defaulting first to using the main firestore connection
 * @param path Path to document to retrieve
 * @param db Connection to RTDB instance
 */
const getDocument = async <T>(
  path: string,
  db?: firebase.database.Database
): Promise<Maybe<T>> => {
  if (db) {
    const res = (await db.ref(path).once('value')).val() as T;

    return res;
  }

  const res = (await main.store.doc(path).get()).data() as T;

  return res;
};

/**
 * Update document at the specified path, defaulting first to using the main firestore connection
 * @param path Path to document to update
 * @param payload Update payload
 * @param db Connection to RTDB instance
 */
const updateDocument = async <T>(
  path: string,
  payload: Partial<T>,
  db?: firebase.database.Database
): Promise<Maybe<Partial<T>>> => {
  if (db) {
    await db.ref(path).update(payload);
  } else {
    await main.store.doc(path).update(payload);
  }

  return payload;
};

/**
 * Delete document at the specified path, defaulting first to using the main firestore connection
 * @param path The document path to delete
 * @param db Connection to RTDB instance
 */
const deleteDocument = async (
  path: string,
  db?: firebase.database.Database
) => {
  if (db) {
    await db.ref(path).remove();
  } else {
    await main.store.doc(path).delete();
  }
};

/**
 * Set document at the specified path, defaulting first to using the main firestore connection
 * @param path
 * @param payload Create payload
 * @param db Connection to RTDB instance
 * @param overwrite A boolean indicating whether or not to overwrite the document at this path
 */
const setDocument = async <T>(
  path: string,
  payload: T,
  db?: firebase.database.Database,
  overwrite = false
): Promise<T> => {
  if (!overwrite) {
    const doc = await getDocument(path, db);

    if (doc) {
      throw new Error(DatabaseErrors.DOCUMENT_EXISTS);
    }
  }

  if (db) {
    await db.ref(path).set(payload);
  } else {
    await main.store.doc(path).set(payload);
  }

  return payload;
};

/**
 * Generate a unique document key for the specified group
 * @param groupPath Path to object or collection to generate a unique key for
 * @param db Connection to RTDB instance
 */
const getUniqueGroupKey = (
  groupPath: string,
  db?: firebase.database.Database
): Maybe<string> => {
  if (db) {
    return db.ref(groupPath).push().key;
  }

  return main.store.collection(groupPath).doc().id;
};

/**
 * Listen for updates to the document at the specified path
 * @param path Path to the document to watch
 * @param callback Function to call with the changed document
 * @param db Connection to RTDB instance
 */
const watchDocument = <T>(
  path: string,
  callback: (doc: T) => void,
  db?: firebase.database.Database
): (() => any) => {
  if (db) {
    const ref = db.ref(path);

    ref.on('value', (snapshot) => {
      callback(snapshot.val() as T);
    });

    return () => ref.off('value');
  }

  const unsubscribe = main.store
    .doc(path)
    .onSnapshot((snap) => callback(snap.data() as T));

  return () => unsubscribe();
};

export default {
  getDocument,
  setDocument,
  deleteDocument,
  updateDocument,
  getUniqueGroupKey,
  watchDocument
};
