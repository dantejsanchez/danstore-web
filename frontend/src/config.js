// frontend/src/config.js

// Detectamos si estamos corriendo en localhost
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// Si es local, usa el puerto 8000. Si no, usa la URL de Render.
export const API_URL = isLocal 
    ? 'http://127.0.0.1:8000' 
    : 'https://danstore-backend.onrender.com';

// Función auxiliar para las imágenes
export const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path; // Ya es una URL completa (Cloudinary)
    return `${API_URL}${path}`; // Es una ruta relativa (Local/Render)
};