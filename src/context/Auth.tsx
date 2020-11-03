import React, { useState, createContext, useContext, useEffect } from 'react';
import firebase from 'firebase';
import { main } from '../connection';
import AuthErrors from '../global/errors/auth';
import { Maybe } from '../global/types/misc';
import { Organization } from '../global/types/organization';
import { User } from '../global/types/user';

export type AuthState = {
  user: Maybe<User>;
  organization: Maybe<Organization>;
  login: (email: string, password: string, orgId?: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
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

    const userId = cred.user?.uid;

    // Throw error if no user ID exists
    if (!userId) {
      throw new Error(AuthErrors.LOGIN_FAILED);
    }

    const retrievedUser: Maybe<User> = (
      await main.store.collection('users').doc(userId).get()
    ).data() as User;

    if (!retrievedUser) {
      // Throw error if the associated user's document DNE
      throw new Error(AuthErrors.LOGIN_FAILED);
    }

    // If the user wants to login into a specific organization
    if (orgId) {
      // If the user is in the specified org...
      if (retrievedUser.organizations?.[orgId]) {
        const org: Maybe<Organization> = (
          await main.store.collection('organizations').doc(orgId).get()
        ).data() as Organization;

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
  };

  /**
   * Sign up and login the user
   * @param email
   * @param password
   * @param orgForm
   */
  const signUp: AuthState['signUp'] = async (email, password, orgForm) => {
    console.log(email, password, orgForm);
  };

  // Properly set user and org. if auth status changes
  useEffect(() => {
    const unsubscribe = main.auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        // Retrieve user's organization (if applicable) and profile
        const userId = currentUser.uid;

        const retrievedUser: Maybe<User> = (
          await main.store.collection('users').doc(userId).get()
        ).data() as User;

        if (!retrievedUser) {
          _clear();
        }

        const orgId = retrievedUser?.organizationId;

        // If the user is already signed into a specific organization...
        if (orgId) {
          const org: Maybe<Organization> = (
            await main.store.collection('organizations').doc(orgId).get()
          ).data() as Organization;

          setOrganization(org);
        }

        setUser(retrievedUser);
      } else {
        // Reset the stored organization (if applicable) and user profile
        _clear();
      }
    });

    return () => unsubscribe();
  }, []);

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
