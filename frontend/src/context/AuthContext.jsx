import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authTokens, setAuthTokens] = useState(null);
    const [loading, setLoading] = useState(true);

    // LOGIN (Ya lo tenías)
    const loginUser = async (email, password) => {
        const response = await fetch('https://dansshop.duckdns.org/api/login/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: email, password: password})
        });
        const data = await response.json();

        if(response.status === 200){
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            localStorage.setItem('authTokens', JSON.stringify(data));
            return true;
        } else {
            alert('Correo o contraseña incorrectos');
            return false;
        }
    };

    // NUEVO: FUNCIÓN DE REGISTRO
    const registerUser = async (userData) => {
        try {
            const response = await fetch('https://dansshop.duckdns.org/api/register/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if(response.status === 200 || response.status === 201){
                alert("Cuenta creada con éxito. Ahora inicia sesión.");
                return true;
            } else {
                alert(data.message || "Error al registrar");
                return false;
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error de conexión");
            return false;
        }
    };

    // LOGOUT (Ya lo tenías)
    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        window.location.href = '/login';
    };

    // VERIFICAR SESIÓN AL RECARGAR
    useEffect(() => {
        const storedTokens = localStorage.getItem('authTokens');
        if (storedTokens) {
            const tokens = JSON.parse(storedTokens);
            setAuthTokens(tokens);
            setUser(jwtDecode(tokens.access));
        }
        setLoading(false);
    }, []);

    const contextData = {
        user,
        loginUser,
        logoutUser,
        registerUser, // <--- Exportamos la nueva función
        authTokens
    };

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};