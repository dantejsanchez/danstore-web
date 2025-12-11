import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  
  // Estados
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validación básica antes de enviar
    if (formData.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        setIsLoading(false);
        return;
    }

    const success = await registerUser(formData);
    
    if (success) {
        navigate('/login'); // Éxito
    } else {
        setError("No se pudo crear la cuenta. Intenta con otro correo.");
        setIsLoading(false);
    }
  };

  // Colores de marca (Coherencia con toda la app)
  const BRAND_BLUE = "text-[#0071e3]";
  const BG_BLUE = "bg-[#0071e3]";
  const BG_BLUE_HOVER = "hover:bg-[#0077ED]";

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans text-[#1d1d1f]">
      <Navbar />
      
      <div className="pt-32 pb-20 flex flex-col items-center justify-center px-4 min-h-[85vh]">
        
        {/* TARJETA DE REGISTRO */}
        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 max-w-[480px] w-full border border-gray-100 relative overflow-hidden">
            
            {/* Decoración superior */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-[#0071e3]`}></div>

            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight mb-2">Crear Cuenta</h2>
                <p className="text-gray-500 text-sm">Únete para una experiencia de compra más rápida.</p>
            </div>

            {/* Mensaje de Error */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in-down">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Nombre y Apellido (Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nombre</label>
                        <input 
                            type="text" name="first_name" required
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#0071e3] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                            placeholder="Juan"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Apellido</label>
                        <input 
                            type="text" name="last_name" required
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#0071e3] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                            placeholder="Pérez"
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Correo Electrónico</label>
                    <input 
                        type="email" name="email" required
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#0071e3] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                        placeholder="nombre@ejemplo.com"
                        onChange={handleChange}
                    />
                </div>

                {/* Contraseña */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Contraseña</label>
                    <input 
                        type="password" name="password" required
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#0071e3] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                        placeholder="Mínimo 6 caracteres"
                        onChange={handleChange}
                    />
                </div>
                
                {/* Botón de Registro */}
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className={`w-full text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4
                        ${isLoading ? 'opacity-70 cursor-not-allowed bg-gray-400' : `${BG_BLUE} ${BG_BLUE_HOVER}`}
                    `}
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Creando cuenta...</span>
                        </>
                    ) : (
                        "Registrarme"
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                    ¿Ya tienes cuenta? <Link to="/login" className={`font-bold ${BRAND_BLUE} hover:underline`}>Inicia Sesión</Link>
                </p>
            </div>
        </div>
        
        <p className="mt-8 text-xs text-gray-400 text-center max-w-xs leading-relaxed">
            Al registrarte, aceptas nuestros Términos de Servicio y Política de Privacidad.
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;