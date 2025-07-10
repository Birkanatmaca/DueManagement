import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080',
});

// Response interceptor - tüm API yanıtlarını kontrol et
api.interceptors.response.use(
  (response) => {
    // Başarılı yanıtlar için herhangi bir işlem yapma
    return response;
  },
  (error) => {
    // Hata durumunda yetkilendirme kontrolü
    if (error.response && error.response.data) {
      const errorData = error.response.data;
      
      // API yanıtındaki hata mesajını kontrol et
      if (errorData.data && errorData.data.message) {
        const errorMessage = errorData.data.message;
        
        // Yetkilendirme hatalarını kontrol et
        if (errorMessage.includes('Unauthorized') || 
            errorMessage.includes('Admin only') ||
            errorMessage.includes('Access denied') ||
            errorMessage.includes('Token expired') ||
            errorMessage.includes('Invalid token')) {
          
          console.log('API Interceptor: Yetkilendirme hatası tespit edildi');
          localStorage.removeItem('token'); // Token'ı temizle
          
          // Login sayfasına yönlendir
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

export const fetchChildren = async (category = 'child') => {
  const token = localStorage.getItem('token');
  console.log('KULLANILAN TOKEN:', token);
  const body = {
    data: {
      request: {
        token,
        category,
        type: 'listChildren'
      }
    }
  };
  console.log('FETCH CHILDREN BODY:', body);
  const response = await api.post('/admin', body);
  return response.data;
};

export const addChild = async ({ name, surname, birth_date }) => {
  const token = localStorage.getItem('token');
  const body = {
    data: {
      request: {
        token,
        category: 'child',
        type: 'addChild',
        name,
        surname,
        birth_date
      }
    }
  };
  return api.post('/admin', body);
}; 