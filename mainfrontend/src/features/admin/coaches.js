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
    if (response.data?.data?.status === 'OK') {
      return { success: true, data: response.data.data.response };
    } else {
      throw new Error(response.data?.data?.message || 'API connect error.');
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const listCoaches = async () =>
  makeApiRequest({ category: 'coach', type: 'listCoaches' });

export const addCoach = async (coach) =>
  makeApiRequest({
    category: 'coach',
    type: 'addCoach',
    name: coach.name,
    surname: coach.surname,
    birth_date: coach.birthdate,
    coach_number: coach.number,
    contact: coach.contact,
  });

export const updateCoach = async (coach) =>
  makeApiRequest({
    category: 'coach',
    type: 'updateCoach',
    coach_id: coach.id.toString(),
    name: coach.name,
    surname: coach.surname,
    birth_date: coach.birthdate,
    coach_number: coach.number,
    contact: coach.contact,
  });

export const deleteCoach = async (coachId) =>
  makeApiRequest({
    category: 'coach',
    type: 'deleteCoach',
    coach_id: coachId.toString(),
  }); 