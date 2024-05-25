import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
// material
import { Container } from '@material-ui/core';
// redux
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import UserNewForm from '../../components/_dashboard/user/UserNewForm';
import { authDomain } from '../../config';

// ----------------------------------------------------------------------

export default function UserCreate() {
  const { themeStretch } = useSettings();
  const { pathname } = useLocation();
  const { name } = useParams();
  const isEdit = pathname.includes('edit');
  const [userDetails, $userDetails] = useState({});

  useEffect(() => {
    const getUserDetail = async () => {
      const response = await axios.get(`${authDomain}user/?id=${name}`, {
        headers: {
          Authorization: localStorage.getItem('accessToken')
        }
      });
      $userDetails(response.data);
    };
    getUserDetail();
  }, [name]);

  return (
    <Page title="User: Create a new user">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Create a new user' : 'Edit user'}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'User', href: PATH_DASHBOARD.user.root },
            { name: !isEdit ? 'New user' : name }
          ]}
        />

        <UserNewForm isEdit={isEdit} currentUser={userDetails} />
      </Container>
    </Page>
  );
}
