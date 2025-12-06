import api from "./api";

// usersRouter.get('/:userId', authenticate, getUserById);
// usersRouter.patch('/:userId', authenticate, updateUser);
// usersRouter.delete('/:userId', authenticate, deleteUser);

export const getUser = async (userId) => {
    return api.get(`/users/${userId}`);
};

export const updateUser = async (userId) => {
    return api.patch(`/users/${userId}`);
}

export const deleteUser = async (userId) => {
    return api.delete(`/users/${userId}`);
};
