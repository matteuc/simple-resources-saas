import React, { useEffect, useState } from 'react';
import { ORGANIZATIONS_METADATA_COLLECTION } from '../global/constants/database';
import Database from '../global/functions/database';
import { loadImage } from '../global/functions/storage';
import { Maybe } from '../global/types/misc';
import { OrganizationMetadata } from '../global/types/organization';
import defaultLogo from '../assets/default-logo.png';

const Login: React.FC = () => {
  const [initializing, setIntitializing] = useState(true);
  const [organizationMeta, setOrganizationMeta] = useState<
    Maybe<OrganizationMetadata>
  >(null);

  useEffect(() => {
    const initializeLogin = async () => {
      const { hostname: domain } = window.location;

      const containsSubdomain = domain.includes('.');

      if (containsSubdomain) {
        const domainParts = domain.split('.');
        const orgSlug = domainParts[0];

        const res = await Database.queryGroupDocuments<OrganizationMetadata>(
          ORGANIZATIONS_METADATA_COLLECTION,
          {
            slug: orgSlug
          }
        );

        if (res) {
          const org = res[0];

          setOrganizationMeta(await loadImage(org));
        }
      }

      setIntitializing(false);
    };

    try {
      initializeLogin();
    } catch (e) {
      console.error(e);
      setIntitializing(false);
    }
  }, []);

  const showView = () => {
    if (initializing) {
      return <>Loading</>;
    }

    if (organizationMeta) {
      return (
        <>
          Login for the {organizationMeta.name}
          <img
            alt="Organization Logo"
            src={organizationMeta.image || defaultLogo}
            style={{
              height: 200
            }}
          />
        </>
      );
    }

    return (
      <>
        Login
        <img
          alt="App Logo"
          src={defaultLogo}
          style={{
            height: 200
          }}
        />
      </>
    );
  };

  return showView();
};

export default Login;
