import React, { useState, createContext, useContext, useEffect } from 'react';
import firebase from 'firebase';
import { main } from '../connection';
import AuthErrors from '../global/errors/auth';
import { Maybe } from '../global/types/misc';
import { Organization } from '../global/types/organization';
import { User } from '../global/types/user';
import Database from '../global/functions/database';
import {
  generateOrganizationsPath,
  generateUserPath,
  generateOrganizationMetadataPath
} from '../global/constants/database';
import { loadImage } from '../global/functions/storage';

export type AuthState = {
  user: Maybe<User>;
  organization: Maybe<Organization>;
  login: (email: string, password: string, orgId?: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    form: {
      name: string;
      image?: string;
    },
    orgForm?: {
      orgId: string;
      accessCode: string;
    }
  ) => Promise<void>;
};

const initialState: AuthState = {
  user: null,
  organization: null,
  login: async () => undefined,
  signUp: async () => undefined
};

const AuthContext = createContext<AuthState>(initialState);

const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<AuthState['user']>(null);

  const [organization, setOrganization] = useState<AuthState['organization']>(
    null
  );

  const _clear = () => {
    setUser(null);
    setOrganization(null);
  };

  /**
   * Login the specified user
   * @param email
   * @param password
   * @param orgId
   */
  const login: AuthState['login'] = async (email, password, orgId) => {
    let cred: firebase.auth.UserCredential;
    try {
      cred = await main.auth.signInWithEmailAndPassword(email, password);
    } catch (e) {
      // Throw error if email/password combo incorrect
      throw new Error(AuthErrors.WRONG_EMAIL_PASSWORD);
    }

    try {
      const userId = cred.user?.uid;

      // Throw error if no user ID exists
      if (!userId) {
        throw new Error(AuthErrors.LOGIN_FAILED);
      }

      const retrievedUser: Maybe<User> = await Database.getDocument<User>(
        generateUserPath(userId)
      );

      if (!retrievedUser) {
        // Throw error if the associated user's document DNE
        throw new Error(AuthErrors.LOGIN_FAILED);
      }

      // If the user wants to login into a specific organization
      if (orgId) {
        // If the user is in the specified org...
        if (retrievedUser.organizations?.[orgId]) {
          const org: Maybe<Organization> = await Database.getDocument<
            Organization
          >(generateOrganizationsPath(orgId));

          // If the organization DNE...
          if (!org) {
            // Throw error if the organization no longer exists
            throw new Error(AuthErrors.ORGANIZATION_DNE);
          }

          setOrganization(org);
        }
        // Otherwise...
        else {
          // Throw error if the user is not in the specified organization
          throw new Error(AuthErrors.NOT_IN_ORGANIZATION);
        }
      }

      setUser(retrievedUser);
    } catch (e) {
      main.auth.signOut();
      throw e;
    }
  };

  /**
   * Sign up and login the user
   * @param email
   * @param password
   * @param form
   * @param orgForm
   */
  const signUp: AuthState['signUp'] = async (
    email,
    password,
    { name, image },
    orgForm
  ) => {
    let organizationId: User['currentOrganizationId'];

    if (orgForm) {
      const orgMeta = await Database.getDocument<Organization>(
        generateOrganizationMetadataPath(orgForm.orgId)
      );

      if (!orgMeta) {
        throw new Error(AuthErrors.ORGANIZATION_DNE);
      }

      if (orgMeta.accessCode !== orgForm.accessCode) {
        throw new Error(AuthErrors.ACCESS_CODE_INCORRECT);
      }

      organizationId = orgMeta.id;
    }

    if ((await main.auth.fetchSignInMethodsForEmail(email)).length) {
      throw new Error(AuthErrors.USER_EXISTS);
    }

    const cred = await main.auth.createUserWithEmailAndPassword(
      email,
      password
    );

    const userId = cred.user?.uid;

    if (!userId) {
      throw new Error(AuthErrors.SIGNUP_FAILED);
    }
    try {
      // Save user in main Firestore
      await Database.setDocument<User>(generateUserPath(userId), {
        id: userId,
        currentOrganizationId: organizationId,
        name,
        image,
        organizations: {
          ...(organizationId
            ? {
                [organizationId]: true
              }
            : {})
        }
      });
      return;
    } catch (e) {
      throw new Error(AuthErrors.SIGNUP_FAILED);
    }
  };

  // Properly set user and org. if auth status changes
  useEffect(() => {
    const unsubscribe = main.auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        // Retrieve user's organization (if applicable) and profile
        const userId = currentUser.uid;

        const retrievedUser: Maybe<User> = await Database.getDocument<User>(
          generateUserPath(userId)
        );

        if (!retrievedUser) {
          _clear();
        }

        const orgId = retrievedUser?.currentOrganizationId;

        // If the user is already signed into a specific organization...
        if (orgId) {
          const org: Maybe<Organization> = await Database.getDocument<
            Organization
          >(generateOrganizationsPath(orgId));

          setOrganization(org ? await loadImage(org) : null);
        }

        setUser(retrievedUser ? await loadImage(retrievedUser) : null);
      } else {
        // Reset the stored organization (if applicable) and user profile
        _clear();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      return Database.watchDocument<User>(
        generateUserPath(user.id),
        async (u) => {
          setUser(u ? await loadImage(u) : null);
        }
      );
    }
    return () => {};
  }, [user]);

  useEffect(() => {
    if (organization) {
      return Database.watchDocument<Organization>(
        generateOrganizationsPath(organization.id),
        async (o) => {
          setUser(o ? await loadImage(o) : null);
        }
      );
    }
    return () => {};
  }, [organization]);
  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        login,
        signUp
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(`useAuth must be used within an AuthProvider`);
  }

  return context;
};

export { AuthProvider, useAuth };
