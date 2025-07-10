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
    if (response.data?.data?.status === 'OK') {
      return { success: true, data: response.data.data.response };
    } else {
      throw new Error(response.data?.data?.message || 'API connect error.');
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const listDues = async (params = {}) =>
  makeApiRequest({ category: 'due', type: 'listDues', ...params });

export const getDue = async (due_id) =>
  makeApiRequest({ category: 'due', type: 'getDue', due_id });

export const addDue = async (due) =>
  makeApiRequest({
    category: 'due',
    type: 'addDue',
    child_id: due.child_id,
    month: due.month,
    year: due.year,
    amount: due.amount,
    due_date: due.due_date,
  });

export const updateDue = async (due) =>
  makeApiRequest({
    category: 'due',
    type: 'updateDue',
    due_id: due.due_id,
    amount: due.amount,
    is_paid: due.is_paid,
  });

export const deleteDue = async (dueId) =>
  makeApiRequest({
    category: 'due',
    type: 'deleteDue',
    due_id: dueId.toString(),
  }); 