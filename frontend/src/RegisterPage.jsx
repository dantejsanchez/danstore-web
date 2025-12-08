import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await registerUser(formData);
    if (success) {
        navigate('/login'); // Si se registra bien, lo mandamos al login
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-32 flex flex-col items-center px-4 pb-10">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-100">
            <h2 className="text-3xl font-bold text-center mb-2">Crear Cuenta</h2>
            <p className="text-center text-gray-500 mb-8">Únete para compras más rápidas.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input 
                            type="text" name="first_name" required
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-black outline-none"
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                        <input 
                            type="text" name="last_name" required
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-black outline-none"
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <input 
                        type="email" name="email" required
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-black outline-none"
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input 
                        type="password" name="password" required
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-black outline-none"
                        onChange={handleChange}
                    />
                </div>
                
                <button type="submit" className="w-full bg-black text-white py-3.5 rounded-lg font-bold hover:bg-gray-800 transition">
                    Registrarme
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
                ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600 font-bold hover:underline">Inicia Sesión</Link>
            </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;