'use strict';
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: []
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                  ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var __spreadArrays =
  (this && this.__spreadArrays) ||
  function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++)
      s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
        r[k] = a[j];
    return r;
  };
exports.__esModule = true;
var inquirer = require('inquirer');
var admin = require('firebase-admin');
var path = require('path');
var util = require('util');
var fs_1 = require('fs');
var orgLogoPath = path.join(__dirname, './org-logo.png');
var newsImagePath = path.join(__dirname, './news.png');
var NUM_RESOURCES = 3;
var RESOURCE_LINK = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
var ORGANIZATIONS_COLLECTION = 'organizations';
var ORGANIZATIONS_METADATA_COLLECTION = 'organizations-metadata';
var RESOURCES_COLLECTION = 'resources';
var RESOURCE_DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
var serviceAccount;
try {
  serviceAccount = JSON.parse(
    fs_1.readFileSync('./serviceAccount.json', 'utf-8')
  );
  if (serviceAccount) {
    if (
      ![
        'type',
        'project_id',
        'private_key_id',
        'private_key',
        'client_email',
        'client_id',
        'auth_uri',
        'token_uri',
        'auth_provider_x509_cert_url',
        'client_x509_cert_url'
      ].every(function (key) {
        return Object.keys(serviceAccount).includes(key);
      })
    ) {
      throw new Error();
    }
  } else {
    throw new Error();
  }
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
        "What is the URL to the organization's database? (alias: rtdb-org)",
      name: 'orgDatabaseUrl'
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
        "What is the URL to the organization's storage bucket? (alias: storage-org)",
      name: 'orgStorageUrl'
    }
  ])
  .then(function (_a) {
    var mainStoreUrl = _a.mainStoreUrl,
      mainStorageUrl = _a.mainStorageUrl,
      orgDatabaseUrl = _a.orgDatabaseUrl,
      orgStorageUrl = _a.orgStorageUrl;
    return __awaiter(void 0, void 0, void 0, function () {
      var mainApp,
        orgApp,
        orgLogoStoragePath,
        mainResourceStoragePath,
        orgResourceStoragePath_1,
        mainStore,
        mainBatch,
        organizationId,
        orgMeta,
        org,
        i,
        resourceId,
        orgDb,
        startId_1,
        e_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 8, , 9]);
            console.log(
              '\x1b[36m%s\x1b[0m',
              'We are seeding your database!',
              'This may take a couple seconds.'
            );
            mainApp = admin.initializeApp(
              {
                credential: admin.credential.cert(serviceAccount),
                databaseURL: mainStoreUrl,
                storageBucket: mainStorageUrl
              },
              'main'
            );
            orgApp = admin.initializeApp(
              {
                credential: admin.credential.cert(serviceAccount),
                databaseURL: orgDatabaseUrl,
                storageBucket: orgStorageUrl
              },
              'org'
            );
            return [
              4 /*yield*/,
              mainApp
                .storage()
                .bucket()
                .upload(orgLogoPath, {
                  destination:
                    ORGANIZATIONS_COLLECTION + '/' + Date.now() + '.png'
                })
            ];
          case 1:
            orgLogoStoragePath = _b.sent()[0].name;
            return [
              4 /*yield*/,
              mainApp
                .storage()
                .bucket()
                .upload(newsImagePath, {
                  destination: RESOURCES_COLLECTION + '/' + Date.now() + '.png'
                })
            ];
          case 2:
            mainResourceStoragePath = _b.sent()[0].name;
            return [
              4 /*yield*/,
              orgApp
                .storage()
                .bucket()
                .upload(newsImagePath, {
                  destination: RESOURCES_COLLECTION + '/' + Date.now() + '.png'
                })
            ];
          case 3:
            orgResourceStoragePath_1 = _b.sent()[0].name;
            mainStore = mainApp.firestore();
            mainBatch = mainStore.batch();
            organizationId = mainStore
              .collection(ORGANIZATIONS_COLLECTION)
              .doc().id;
            orgMeta = {
              id: organizationId,
              name: 'Company Name',
              slug: ('company-' + organizationId).toLowerCase(),
              accessCode: '123',
              image: orgLogoStoragePath
            };
            org = __assign(__assign({}, orgMeta), {
              databaseUrl: orgDatabaseUrl,
              storageUrl: orgStorageUrl,
              theme: {}
            });
            // Create organization meta. and organization in main store
            mainBatch.create(
              mainStore
                .collection(ORGANIZATIONS_METADATA_COLLECTION)
                .doc(organizationId),
              orgMeta
            );
            mainBatch.create(
              mainStore
                .collection(ORGANIZATIONS_COLLECTION)
                .doc(organizationId),
              org
            );
            // Create resources in main store
            for (i = 0; i < NUM_RESOURCES; i += 1) {
              resourceId = mainStore.collection(RESOURCES_COLLECTION).doc().id;
              mainBatch.create(
                mainStore.collection(RESOURCES_COLLECTION).doc(resourceId),
                {
                  id: resourceId,
                  description: RESOURCE_DESCRIPTION,
                  image: mainResourceStoragePath,
                  title: 'Resource ' + i,
                  url: RESOURCE_LINK
                }
              );
            }
            return [4 /*yield*/, mainBatch.commit()];
          case 4:
            _b.sent();
            orgDb = orgApp.database();
            startId_1 = Date.now();
            return [
              4 /*yield*/,
              orgDb.ref(RESOURCES_COLLECTION).set(
                __spreadArrays(Array(NUM_RESOURCES)).reduce(function (
                  all,
                  _,
                  index
                ) {
                  var _a;
                  var resourceId = startId_1 + index;
                  return __assign(
                    __assign({}, all),
                    ((_a = {}),
                    (_a[resourceId] = {
                      id: resourceId,
                      description: RESOURCE_DESCRIPTION,
                      image: orgResourceStoragePath_1,
                      title: 'Company Resource ' + index,
                      url: RESOURCE_LINK
                    }),
                    _a)
                  );
                },
                {})
              )
            ];
          case 5:
            _b.sent();
            // Clean up app connections
            return [4 /*yield*/, mainApp['delete']()];
          case 6:
            // Clean up app connections
            _b.sent();
            return [4 /*yield*/, orgApp['delete']()];
          case 7:
            _b.sent();
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
            return [3 /*break*/, 9];
          case 8:
            e_1 = _b.sent();
            console.error(e_1.message);
            return [3 /*break*/, 9];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  });
