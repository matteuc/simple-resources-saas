## A Simple Firebase Resources SaaS

### Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Installation and Setup](#installation-and-setup)
- [Seeding Data](#seeding-data)
- [Configuring the Firebase SDK](#configuring-the-firebase-sdk)
- [Run the App](#run-the-app)
- [Deploying the App](#deploying-the-app)

#### Overview

This project is a demonstration of how to build a simple SaaS (Software as a Service) on the Google Firebase platform. Most of the time, one Cloud Firestore instance and one single Cloud Storage bucket is enough to accomodate your application's users. However, this may not be enough to accomodate large organizations wishing to join your platform. One way to provide lower latency to your growing user base, is to store each organization's data in its own separate database.

#### Tech Stack

Currently, only one **Cloud Firestore** instance can be added to a Firebase project. To keep things simple and not require the creation of multiple Firebase projects, we will be using Firebase's other database solution: **Realtime Database**. We will also be creating one Cloud Storage instance for every organization that is on the platform. Interaction with the database instances and storage buckets will be secured via Firebase Security Rules, which can be found in the `/rules` folder.

For the front-end, I have built out a simple UI with Create React App and Typescript. To manage global state, I have opted for React Context over Redux.

#### Installation and Setup

In order to run this app, you will need to [create a Firebase account](https://firebase.google.com/). Once you have created your account, you will to do a number of things:

> To initialize some of the resources, you will need to [upgrade your project to the **Blaze** plan](https://firebase.google.com/pricing); your project will actually remain free until your surpass **Spark** plan usage

1. [Enable authentication and the email/password sign-in provider](https://firebase.google.com/docs/auth/web/password-auth#before_you_begin)

2. [Create a Cloud Firestore instance](https://firebase.google.com/docs/firestore/quickstart#create)

   - This is the database the app will use to store information about the main app's users and how to connect to the organization-specific resources (alias `store-default`)

3. [Create one Realtime Database instance](https://firebase.google.com/docs/database/web/start#create_a_database)

   - One will be the default instance (this instance won't be used in the project)
   - The instance will be for the sample organization on our platform (alias `rtdb-org`)

4. [Create two Storage Bucket instances](https://firebase.google.com/docs/storage/web/start#create-default-bucket)

   - One will be the default instance (alias `bucket-default`)
   - The other instance will be for the sample organization on our platform (alias `bucket-org`)

5. Update the security rules of each database ([RTDB]() and [Firestore]()) and [storage bucket]() (rules can be found in `/rules`)
   - `main-store.rules` should be set to Firestore instance `store-default`
   - `main-storage.rules` should be set to the Storage bucket `bucket-default`
   - `org-rtdb.rules` should be set to the RTDB instance `rtdb-org`
   - `org-storage.rules` should be set to the Storage bucket `bucket-org`

#### Seeding Data

If you don't want to insert your own data, you can run the provided seed script `/scripts/seed.js`.

> Before you run the script, you will need to [create a service account](https://firebase.google.com/docs/admin/setup#initialize-sdk) and copy the generated JSON file to the path `/serviceAccount.json`. This will allow the script to read/write to your project's resources

1. Once you have copied over the config. file to `/serviceAccount.json`, run the command `yarn seed`
2. The script will ask you to provide the storage bucket and database URLS generated from **Step 5** in [Installation and Setup](#installation-and-setup)
3. After completing the prompts, your project will be seeded with example data and images!

#### Configuring the Firebase SDK

Follow the instructions from [Step 2](https://firebase.google.com/docs/web/setup#register-app) of the [Add Firebase to your JavaScript project](https://firebase.google.com/docs/web/setup) tutorial. You will basically do the following

1. Add a web app to your project
2. Copy the SDK config into a file at `/src/firebase.config.json`

#### Run the App

Last two steps!

1. Run `yarn` to install the project's dependencies
2. Run `yarn start` to start the project!

#### Deploying the App

1. `yarn global add firebase-tools`
2. `firebase login`
3. `firebase init`
4. `yarn deploy`
