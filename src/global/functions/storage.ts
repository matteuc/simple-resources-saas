import firebase from 'firebase';
import { main } from '../../connection';
import { Maybe } from '../types/misc';

const getObjectUrl = async (
  path: string,
  storage?: firebase.storage.Storage
): Promise<Maybe<string>> => {
  try {
    return await (storage
      ? storage.ref(path).getDownloadURL()
      : main.storage.ref(path).getDownloadURL());
  } catch (e) {
    console.error(e);
    return null;
  }
};

const loadImage = async <
  T extends {
    image: Maybe<string>; // Storage Object Key
  }
>(
  imageDoc: T,
  storage?: firebase.storage.Storage
): Promise<T> => ({
  ...imageDoc,
  image: imageDoc.image ? await getObjectUrl(imageDoc.image, storage) : null
});

export { getObjectUrl, loadImage };
