/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import { sentenceCase } from 'change-case';
import { useState, useEffect, useCallback } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack5';
// material
import { useTheme, styled } from '@material-ui/core/styles';
import {
  Box,
  Card,
  Table,
  Button,
  TableRow,
  Checkbox,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination
} from '@material-ui/core';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { deleteProduct } from '../../redux/slices/product';
// utils
import { fDate } from '../../utils/formatTime';
import { fCurrency } from '../../utils/formatNumber';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import {
  ProductListHead,
  ProductListToolbar,
  ProductMoreMenu
} from '../../components/_dashboard/e-commerce/product-list';
import { authDomain } from '../../config';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Product', alignRight: false },
  { id: 'created_at', label: 'Create at', alignRight: false },
  { id: 'price', label: 'Price', alignRight: true },
  { id: 'description', label: 'Description', alignRight: false },
  { id: '' }
];

const ThumbImgStyle = styled('img')(({ theme }) => ({
  width: 64,
  height: 64,
  objectFit: 'cover',
  borderRadius: theme.shape.borderRadiusSm
}));

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  if (query) {
    return filter(array, (_product) => _product.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }

  return stabilizedThis.map((el) => el[0]);
}

// ----------------------------------------------------------------------

export default function EcommerceProductList() {
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('created_at');

  const [products, $products] = useState([]);

  const getProducts = useCallback(async () => {
    const response = await axios.get(`${authDomain}product/load-all?page=${page + 1}&limit=${rowsPerPage}`, {
      headers: {
        Authorization: localStorage.getItem('accessToken')
      }
    });
    $products(response.data);
  }, [page, rowsPerPage]);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = products.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const handleDeleteProduct = async (userId) => {
    await axios
      .delete(`${authDomain}product`, {
        headers: {
          Authorization: localStorage.getItem('accessToken')
        },
        data: {
          id: userId
        }
      })
      .then(() => {
        enqueueSnackbar('Delete success', {
          variant: 'success'
        });
        getProducts();
      })
      .catch(() => {
        enqueueSnackbar('Error!', {
          variant: 'error'
        });
      });
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - products.length) : 0;

  const filteredProducts = applySortFilter(products, getComparator(order, orderBy), filterName);

  const isProductNotFound = filteredProducts.length === 0;

  return (
    <Page
      style={{
        padding: '20px'
      }}
      title="Ecommerce: Product List"
    >
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs heading="Product List" />

        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  rowGap: '16px',
                  padding: '8px',
                  justifyContent: 'space-between'
                }}
              >
                {filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                  const { id, name, images, price, created_at, description } = row;

                  const isItemSelected = selected.indexOf(name) !== -1;

                  return (
                    <div
                      key={id}
                      onClick={() => {
                        navigate(`/auth/e-commerce/product/${id}`);
                      }}
                      style={{ display: 'flex', width: 'calc(100% / 3 - 16px)', flexDirection: 'column' }}
                    >
                      <img
                        src={`${authDomain}static/${images[0]?.url}`}
                        alt=""
                        style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                      />
                      <div style={{ margin: '8px 0', fontSize: '16px', fontWeight: 'bold' }}>{name}</div>
                      <div style={{ color: 'red' }}>{price} VND</div>
                    </div>
                  );
                })}
              </div>
              {isProductNotFound && (
                <TableBody>
                  <TableRow>
                    <TableCell align="center" colSpan={6}>
                      <Box sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={products.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </Page>
  );
}
