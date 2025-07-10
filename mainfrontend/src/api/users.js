import api from '../api';

const makeApiRequest = async (requestData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token bulunamadı');
    const response = await api.post('/admin', {
      data: {
        request: { token, ...requestData }
      }
    });
    
    console.log('Users API Response:', response.data);
    
    if (response.data?.data?.status === 'OK') {
      return { success: true, data: response.data.data.response };
    } else {
      const errorMessage = response.data?.data?.message || 'API connect error.';
      console.error('Users API Error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    console.error('Users API Request Error:', error);
    return { success: false, error: error.message };
  }
};

export const listUsers = async () =>
  makeApiRequest({ category: 'user', type: 'listUsers' });

export const addUser = async (user) =>
  makeApiRequest({
    category: 'user',
    type: 'addUser',
    name: user.name,
    last_name: user.surname,
    email: user.email,
    phone: user.contact,
    password: user.password,
  });

export const updateUser = async (user) =>
  makeApiRequest({
    category: 'user',
    type: 'updateUser',
    user_id: user.id,
    name: user.name,
    last_name: user.surname,
    email: user.email,
    phone: user.contact,
    password: user.password,
  });

export const deleteUser = async (userId) =>
  makeApiRequest({
    category: 'user',
    type: 'deleteUser',
    user_id: userId,
  }); 