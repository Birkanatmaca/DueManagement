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

export const listPlayers = async () =>
  makeApiRequest({ category: 'child', type: 'listChildren' });

export const addPlayer = async (player) =>
  makeApiRequest({
    category: 'child',
    type: 'addChild',
    name: player.name,
    surname: player.surname,
    birth_date: player.birthdate,
    athlete_number: player.number,
    parent_name: player.parent,
    contact: player.contact,
  });

export const updatePlayer = async (player) =>
  makeApiRequest({
    category: 'child',
    type: 'updateChild',
    child_id: player.id.toString(),
    name: player.name,
    surname: player.surname,
    birth_date: player.birthdate,
    athlete_number: player.number,
    parent_name: player.parent,
    contact: player.contact,
  });

export const deletePlayer = async (playerId) =>
  makeApiRequest({
    category: 'child',
    type: 'deleteChild',
    child_id: playerId.toString(),
  }); 