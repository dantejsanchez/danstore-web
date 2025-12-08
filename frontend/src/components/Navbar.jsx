import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { cart } = useCart();
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate(); 
  
  // --- LÓGICA DEL BUSCADOR ---
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const timer = setTimeout(() => {
        fetch(`http://127.0.0.1:8000/api/products/?search=${searchTerm}`)
          .then(res => res.json())
          .then(data => {
            setSuggestions(data.slice(0, 5));
            setShowSuggestions(true);
          })
          .catch(err => console.error(err));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  const handleSearch = (term = searchTerm) => {
    setShowSuggestions(false);
    navigate(`/?search=${term}`);
    window.location.reload(); 
  };

  // --- LÓGICA SEGURA PARA LA INICIAL DEL USUARIO ---
  const getUserInitial = () => {
      if (user && user.first_name && user.first_name.length > 0) {
          return user.first_name[0].toUpperCase();
      }
      if (user && user.email && user.email.length > 0) {
          return user.email[0].toUpperCase();
      }
      return "U"; // "U" por defecto si falla todo
  };

  return (
    <nav className="fixed top-0 w-full bg-[#D9D9D9] backdrop-blur-sm border-b border-gray-100 z-50 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-8">
          
          {/* 1. MARCA */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
             <span className="text-2xl font-bold text-gray-900 tracking-tighter">
               Dan<span className="text-gray-400">Store</span>
             </span>
          </Link>

          {/* 2. BUSCADOR INTELIGENTE */}
          <div className="flex-1 max-w-2xl relative hidden md:block">
            <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Buscar en Dan Store..." 
                  className="w-full bg-gray-50 border-transparent focus:bg-white border focus:border-gray-300 rounded-full py-2.5 pl-12 pr-4 text-sm transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <svg className="absolute left-4 top-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* SUGERENCIAS */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-12 left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2">
                    {suggestions.map((prod) => (
                        <div 
                            key={prod.id}
                            onClick={() => {
                                navigate(`/product/${prod.id}`);
                                setShowSuggestions(false);
                            }}
                            className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            <img src={`http://127.0.0.1:8000${prod.image}`} className="w-10 h-10 object-cover rounded-lg bg-gray-200"/>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">{prod.name}</p>
                                <p className="text-xs text-gray-500">Dan Store</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* 3. ICONOS DERECHA */}
          <div className="flex items-center space-x-6">
            
            {/* LÓGICA DE USUARIO */}
            {user ? (
                <div className="relative">
                    <button 
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 hover:bg-white/50 px-2 py-1 rounded-full transition"
                    >
                        {/* Círculo con la inicial (CORREGIDO) */}
                        <div className="h-8 w-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {getUserInitial()}
                        </div>
                        {/* Nombre del usuario (Oculto en móvil) */}
                        <span className="text-sm font-medium text-gray-900 hidden lg:block">
                            Hola, {user.first_name || "Usuario"}
                        </span>
                    </button>

                    {/* Menú Desplegable */}
                    {showUserMenu && (
                        <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden z-50">
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-xs text-gray-500">Conectado como</p>
                                <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                            </div>
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Mis Compras</button>
                            <div className="border-t border-gray-100 mt-1">
                                <button 
                                    onClick={() => {
                                        logoutUser();
                                        setShowUserMenu(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // SI NO ESTÁ LOGUEADO:
                <Link to="/login" className="text-gray-500 hover:text-black transition flex items-center gap-2">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-medium hidden lg:block">Mi Cuenta</span>
                </Link>
            )}

            <Link to="/cart" className="relative group">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-50 rounded-full group-hover:bg-black transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cart.length}
                  </span>
                )}
              </div>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;