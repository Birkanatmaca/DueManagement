import api from '../../utils/api';

const makeApiRequest = async (requestData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token bulunamadı');
    const response = await api.post('/admin', {
      data: {
        request: { token, ...requestData }
      }
    });
    
    console.log('API Response:', response.data);
    
    if (response.data?.data?.status === 'OK') {
      return { success: true, data: response.data.data.response };
    } else {
      const errorMessage = response.data?.data?.message || 'API connect error.';
      console.error('API Error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    console.error('API Request Error:', error);
    return { success: false, error: error.message };
  }
};

export const addParent = async (parent) =>
  makeApiRequest({
    category: 'parent',
    type: 'addParent',
    name: parent.name,
    last_name: parent.surname,
    email: parent.email,
    phone: parent.contact,
    password: parent.password,
  });

export const updateParent = async (parent) =>
  makeApiRequest({
    category: 'parent',
    type: 'updateParent',
    parent_id: parent.id,
    name: parent.name,
    last_name: parent.surname,
    email: parent.email,
    phone: parent.contact,
    password: parent.password,
  });

export const deleteParent = async (parentId) =>
  makeApiRequest({
    category: 'parent',
    type: 'deleteParent',
    parent_id: parentId,
  });

export const listParents = async () =>
  makeApiRequest({ category: 'parent', type: 'listParents' });

export const getParentDetails = async (parentId) =>
  makeApiRequest({ category: 'parent', type: 'getParentDetails', parent_id: parentId });

export const matchChildToParentAdmin = async (childId, parentId) =>
  makeApiRequest({
    category: 'child',
    type: 'matchChildToParentAdmin',
    child_id: childId,
    parent_id: parentId,
  });

export const unmatchChildFromParent = async (childId, parentId) =>
  makeApiRequest({
    category: 'child',
    type: 'unmatchChildFromParentAdmin',
    child_id: childId,
    parent_id: parentId,
  }); 