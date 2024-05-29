/* eslint-disable camelcase */
import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import { useState, useEffect, useCallback } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack5';
// material
import {
  Card,
  Table,
  Stack,
  Button,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination
} from '@material-ui/core';
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import Scrollbar from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../../components/_dashboard/user/list';
import useAuth from '../../hooks/useAuth';
import { authDomain } from '../../config';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'full_name', label: 'Full name', alignRight: false },
  { id: 'email', label: 'Email', alignRight: false },
  { id: 'role', label: 'Role', alignRight: false },
  { id: 'phone', label: 'Phone', alignRight: false },
  { id: 'address', label: 'Address', alignRight: false },
  { id: '' }
];

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
    return filter(array, (_user) => _user.full_name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function UserList() {
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('full_name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [userList, $userList] = useState([]);
  const [totalUsers, $totalUsers] = useState(0);

  const getUserList = useCallback(async () => {
    const response = await axios.get(`${authDomain}user/get-all?page=${page + 1}&limit=${rowsPerPage}`, {
      headers: {
        Authorization: localStorage.getItem('accessToken')
      }
    });
    $userList(response.data.data);
    $totalUsers(response.data.total);
  }, [page, rowsPerPage]);

  useEffect(() => {
    getUserList();
  }, [getUserList]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
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

  const handleDeleteUser = async (userId) => {
    await axios
      .delete(`${authDomain}user/?id=${userId}`, {
        headers: {
          Authorization: localStorage.getItem('accessToken')
        }
      })
      .then(() => {
        enqueueSnackbar('Delete success', {
          variant: 'success'
        });
        getUserList();
      })
      .catch(() => {
        enqueueSnackbar('Error!', {
          variant: 'error'
        });
      });
  };

  // const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - userList.length) : 0;

  const filteredUsers = applySortFilter(userList, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  return (
    <Page title="User: List">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="User List"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'User', href: PATH_DASHBOARD.user.root },
            { name: 'List' }
          ]}
          action={
            user?.role === 'admin' ? (
              <Button
                variant="contained"
                component={RouterLink}
                to={PATH_DASHBOARD.user.newUser}
                startIcon={<Icon icon={plusFill} />}
              >
                New User
              </Button>
            ) : (
              <></>
            )
          }
        />

        <Card>
          <UserListToolbar filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={userList.length}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {filteredUsers.map((row) => {
                    const { id, full_name, role, address, phone, email } = row;

                    return (
                      <TableRow hover key={id} tabIndex={-1}>
                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {full_name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{address}</TableCell>
                        <TableCell style={{ textTransform: 'capitalize' }} align="left">
                          {role}
                        </TableCell>
                        <TableCell align="left">{phone}</TableCell>
                        <TableCell align="left">{email}</TableCell>

                        {user?.role === 'admin' && (
                          <TableCell align="right">
                            <UserMoreMenu onDelete={() => handleDeleteUser(id)} userName={id} />
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
                {isUserNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalUsers}
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
