// frontend/src/config.js

// Detectamos si estamos corriendo en localhost (tu PC de desarrollo)
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Si es local, usa localhost:8000. 
// Si es Oracle, usa tu IP CON EL PUERTO 8000 (¡Esto era lo que faltaba!)
export const API_URL = isLocal 
    ? 'http://129.151.109.180' 
    : 'http://129.151.109.180'; 

// Función auxiliar para las imágenes
export const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path; 
    return `${API_URL}${path}`; 
};