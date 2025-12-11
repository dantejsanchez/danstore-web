import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  
  // Estados para el formulario y feedback
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulamos un pequeño delay para que se aprecie la animación de carga (opcional)
    // await new Promise(resolve => setTimeout(resolve, 500));

    const success = await loginUser(email, password);
    
    if (success) {
        navigate('/'); // Redirige al Home
    } else {
        setError("El correo o la contraseña son incorrectos.");
        setIsLoading(false);
    }
  };

  // Colores de marca
  const BRAND_BLUE = "text-[#0071e3]";
  const BG_BLUE_HOVER = "hover:bg-[#0077ED]";

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans text-[#1d1d1f]">
      <Navbar />
      
      <div className="pt-32 pb-20 flex flex-col items-center justify-center px-4 min-h-[80vh]">
        
        {/* TARJETA DE LOGIN */}
        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 max-w-[420px] w-full border border-gray-100 relative overflow-hidden">
            
            {/* Decoración sutil superior */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-[#0071e3]"></div>

            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold tracking-tight mb-2">Bienvenido</h2>
                <p className="text-gray-500 text-sm">Ingresa tus credenciales para continuar.</p>
            </div>

            {/* Mensaje de Error (Si existe) */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in-down">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Input Email */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Correo Electrónico</label>
                    <div className="relative">
                        <input 
                            type="email" 
                            required
                            className="w-full pl-4 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#0071e3] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                            placeholder="nombre@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                {/* Input Password */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Contraseña</label>
                        <a href="#" className="text-xs text-[#0071e3] hover:underline font-medium">¿Olvidaste tu clave?</a>
                    </div>
                    <div className="relative">
                        <input 
                            type="password" 
                            required
                            className="w-full pl-4 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#0071e3] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>
                
                {/* Botón Submit con Estado de Carga */}
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className={`w-full bg-[#0071e3] text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2
                        ${isLoading ? 'opacity-80 cursor-not-allowed' : BG_BLUE_HOVER}
                    `}
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Entrando...</span>
                        </>
                    ) : (
                        "Iniciar Sesión"
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                    ¿Aún no tienes cuenta? <Link to="/register" className={`font-bold ${BRAND_BLUE} hover:underline`}>Regístrate gratis</Link>
                </p>
            </div>
        </div>
        
        {/* Footer simple (opcional) */}
        <p className="mt-8 text-xs text-gray-400">Protegido por reCAPTCHA y sujeto a la Política de Privacidad.</p>
      </div>
    </div>
  );
}

export default LoginPage;