const API_BASE_URL = 'http://localhost:8080';

export const getUserInfo = async (type) => {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Token not found');
        }

        const response = await fetch(`${API_BASE_URL}/user`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: {
                    request: {
                        token: token,
                        type: type
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (err) {
        return { success: false, message: 'Sunucuya bağlanılamadı.' };
    }
};

export const getParentInformation = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token not found');
        }
        const response = await fetch(`${API_BASE_URL}/user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: {
                    request: {
                        token: token,
                        type: 'parentinformation'
                    }
                }
            })
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (err) {
        return { success: false, message: 'Sunucuya bağlanılamadı.' };
    }
};

export const getUserDues = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token not found');
        }
        const response = await fetch(`${API_BASE_URL}/user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: {
                    request: {
                        token: token,
                        type: 'dues'
                    }
                }
            })
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (err) {
        return { success: false, message: 'Sunucuya bağlanılamadı.' };
    }
};

export const matchChildToParent = async (athlete_number, birth_date) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token not found');
        }
        const response = await fetch(`${API_BASE_URL}/user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: {
                    request: {
                        token: token,
                        type: 'matchChildToParent',
                        birth_date: birth_date,
                        athlete_number: athlete_number
                    }
                }
            })
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (err) {
        return { success: false, message: 'Sunucuya bağlanılamadı.' };
    }
};