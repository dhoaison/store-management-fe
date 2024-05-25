/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { paramCase } from 'change-case';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
// material
import { Container } from '@material-ui/core';
// redux
import { useDispatch, useSelector } from '../../redux/store';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import ProductNewForm from '../../components/_dashboard/e-commerce/ProductNewForm';
import { authDomain } from '../../config';

// ----------------------------------------------------------------------

export default function EcommerceProductCreate() {
  const { themeStretch } = useSettings();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { name } = useParams();
  const { products } = useSelector((state) => state.product);
  const isEdit = pathname.includes('edit');

  const [currentProduct, $currentProduct] = useState({});

  useEffect(() => {
    const getProducts = async () => {
      const response = await axios.get(`${authDomain}product/?id=${name}`, {
        headers: {
          Authorization: localStorage.getItem('accessToken')
        }
      });
      $currentProduct(response.data);
    };
    getProducts();
  }, [name]);

  return (
    <Page title="Ecommerce: Create a new product">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Create a new product' : 'Edit product'}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            {
              name: 'E-Commerce',
              href: PATH_DASHBOARD.eCommerce.root
            },
            { name: !isEdit ? 'New product' : name }
          ]}
        />

        <ProductNewForm isEdit={isEdit} currentProduct={currentProduct} />
      </Container>
    </Page>
  );
}
