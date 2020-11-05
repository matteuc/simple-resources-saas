const inquirer = require('inquirer');
const admin = require('firebase-admin');

inquirer
  .prompt([
    {
      type: 'list',
      message:
        'First, create a service account (checkout the README for instructions). Move the secret config file to "/serviceAccount.json".',
      name: 'configured',
      choices: [
        {
          name: 'All done!',
          value: true
        },
        {
          name: 'Exit',
          value: false
        }
      ]
    }
  ])
  .then(
    ({
      configured,
      mainStoreUrl,
      mainStorageUrl,
      orgDatabaseUrl,
      orgStorageUrl
    }) => {
      if (!configured) {
        process.exit(0);
      }

      const serviceAccount = require('./serviceAccount.json');

      admin.app();

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),

        databaseURL: 'https://simple-resources-saas.firebaseio.com'
      });
    }
  );
