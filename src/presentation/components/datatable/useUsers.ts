import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/store/store";
import { fetchUsers, deleteUser } from "../../../app/store/states/user.slice";
import { selectAllUsers, selectUsersLoading, selectUsersError } from "../../../app/store/states/user.slice";

export const useUsers = () => {
  const dispatch = useAppDispatch();
  
  const users = useAppSelector(selectAllUsers);
  const loadingUsers = useAppSelector(selectUsersLoading);
  const error = useAppSelector(selectUsersError);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      await dispatch(deleteUser(userId));
    }
  };

  return {
    users,
    loadingUsers,
    error,
    handleDeleteUser,
    refreshUsers: () => dispatch(fetchUsers())
  };
};