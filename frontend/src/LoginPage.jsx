import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await loginUser(email, password);
    if (success) navigate('/'); // Si entra bien, va al Home
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-32 flex flex-col items-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-100">
            <h2 className="text-3xl font-bold text-center mb-2">Hola de nuevo.</h2>
            <p className="text-center text-gray-500 mb-8">Ingresa para gestionar tus compras.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <input 
                        type="email" 
                        required
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-black focus:ring-0 outline-none transition"
                        placeholder="tu@email.com"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input 
                        type="password" 
                        required
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-black focus:ring-0 outline-none transition"
                        placeholder="••••••••"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                
                <button type="submit" className="w-full bg-black text-white py-3.5 rounded-lg font-bold hover:bg-gray-800 transition">
                    Iniciar Sesión
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
                ¿No tienes cuenta? <Link to="/register" className="text-blue-600 font-bold cursor-pointer hover:underline">Regístrate ahora</Link>
            </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;