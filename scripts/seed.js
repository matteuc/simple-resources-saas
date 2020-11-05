const inquirer = require('inquirer');
const admin = require('firebase-admin');
const path = require('path');
const util = require('util');

const orgLogoPath = path.join(__dirname, './org-logo.png');
const newsImagePath = path.join(__dirname, './news.png');
const NUM_RESOURCES = 3;
const RESOURCE_LINK = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const RESOURCE_DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

const ORGANIZATION_COLLECTION = 'organizations';
const ORGANIZATION_META_COLLECTION = 'organizations-metadata';
const RESOURCES_COLLECTION = 'resources';

let serviceAccount;

try {
  serviceAccount = require('../serviceAccount.json');
} catch (e) {
  console.error(
    '\x1b[31m%s\x1b[0m',
    'Please set up the service account first! (checkout the README for instructions)'
  );
  process.exit(1);
}

inquirer
  .prompt([
    {
      type: 'input',
      message: 'What is the URL to the main database? (alias: store-default)',
      name: 'mainStoreUrl'
    },
    {
      type: 'input',
      message:
        'What is the URL to the main storage bucket? (alias: storage-default)',
      name: 'mainStorageUrl'
    },
    {
      type: 'input',
      message:
        "What is the URL to the organization's database? (alias: rtdb-org)",
      name: 'orgDatabaseUrl'
    },
    {
      type: 'input',
      message:
        "What is the URL to the organization's storage bucket? (alias: storage-org)",
      name: 'orgStorageUrl'
    }
  ])
  .then(
    async ({ mainStoreUrl, mainStorageUrl, orgDatabaseUrl, orgStorageUrl }) => {
      try {
        console.log(
          '\x1b[36m%s\x1b[0m',
          'We are seeding your database! This may take a couple seconds.'
        );

        const mainApp = admin.initializeApp(
          {
            credential: admin.credential.cert(serviceAccount),
            databaseURL: mainStoreUrl.trim(),
            storageBucket: mainStorageUrl.trim()
          },
          'main'
        );

        const orgApp = admin.initializeApp(
          {
            credential: admin.credential.cert(serviceAccount),
            databaseURL: orgDatabaseUrl.trim(),
            storageBucket: orgStorageUrl.trim()
          },
          'org'
        );

        const mainStore = mainApp.firestore();

        if (
          !(await mainStore.collection(ORGANIZATION_META_COLLECTION).get())
            .empty
        ) {
          throw new Error(
            'The database is not empty. A non-empty database cannot be seeded.'
          );
        }

        // Upload organization logo
        const [{ name: orgLogoStoragePath }] = await mainApp
          .storage()
          .bucket()
          .upload(orgLogoPath, {
            destination: `${ORGANIZATION_COLLECTION}/${Date.now()}.png`
          });

        // Upload resource image to main storage
        const [{ name: mainResourceStoragePath }] = await mainApp
          .storage()
          .bucket()
          .upload(newsImagePath, {
            destination: `${RESOURCES_COLLECTION}/${Date.now()}.png`
          });

        // Upload resource image to org. storage
        const [{ name: orgResourceStoragePath }] = await orgApp
          .storage()
          .bucket()
          .upload(newsImagePath, {
            destination: `${RESOURCES_COLLECTION}/${Date.now()}.png`
          });

        const mainBatch = mainStore.batch();
        const organizationId = mainStore
          .collection(ORGANIZATION_COLLECTION)
          .doc().id;

        const orgMeta = {
          id: organizationId,
          name: 'Company Name',
          slug: `company-${organizationId.toLowerCase()}`,
          accessCode: '123',
          image: orgLogoStoragePath
        };

        const org = {
          ...orgMeta,
          databaseUrl: orgDatabaseUrl,
          storageUrl: orgStorageUrl
        };

        // Create organization meta. and organization in main store
        mainBatch.create(
          mainStore
            .collection(ORGANIZATION_META_COLLECTION)
            .doc(organizationId),
          orgMeta
        );

        mainBatch.create(
          mainStore.collection(ORGANIZATION_COLLECTION).doc(organizationId),
          org
        );

        // Create resources in main store
        for (let i = 0; i < NUM_RESOURCES; i++) {
          const resourceId = mainStore.collection(RESOURCES_COLLECTION).doc()
            .id;

          mainBatch.create(
            mainStore.collection(RESOURCES_COLLECTION).doc(resourceId),
            {
              id: resourceId,
              description: RESOURCE_DESCRIPTION,
              image: mainResourceStoragePath,
              title: `Resource ${i}`,
              url: RESOURCE_LINK
            }
          );
        }

        await mainBatch.commit();

        // Create resources in org. database
        const orgDb = orgApp.database();

        const startId = Date.now();

        await orgDb.ref(RESOURCES_COLLECTION).set(
          [...Array(NUM_RESOURCES)].reduce((all, _, index) => {
            const resourceId = startId + index;
            return {
              ...all,
              [resourceId]: {
                id: resourceId,
                description: RESOURCE_DESCRIPTION,
                image: orgResourceStoragePath,
                title: `Company Resource ${index}`,
                url: RESOURCE_LINK
              }
            };
          }, {})
        );

        // Clean up app connections
        await mainApp.delete();

        await orgApp.delete();

        console.log('\x1b[32m%s\x1b[0m', 'All done!');

        console.log(
          '\x1b[32m%s\x1b[0m',
          'Use the below information to help sign in to the organization!'
        );

        console.log(
          '\x1b[36m%s\x1b[0m',
          util.inspect(orgMeta, {
            depth: 5
          })
        );
      } catch (e) {
        console.error('\x1b[31m%s\x1b[0m', e.message);
      }
    }
  );
