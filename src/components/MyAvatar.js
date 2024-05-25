// hooks
import Avatar from '../assets/avatar.avif';
import useAuth from '../hooks/useAuth';
//
import { MAvatar } from './@material-extend';
import createAvatar from '../utils/createAvatar';

// ----------------------------------------------------------------------

export default function MyAvatar({ ...other }) {
  const { user } = useAuth();

  return (
    <MAvatar
      // src={user.photoURL}
      src={Avatar}
      alt={user.full_name}
      color={user.photoURL ? 'default' : createAvatar(user.full_name).color}
      {...other}
    >
      {createAvatar(user.full_name).name}
    </MAvatar>
  );
}
