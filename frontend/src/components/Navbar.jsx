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

  // Efecto Scroll
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const timer = setTimeout(() => {
        fetch(`https://danstore-backend.onrender.com/api/products/?search=${searchTerm}`)
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

  // --- LÓGICA DE NOMBRE (Blindada) ---
  const getDisplayName = () => {
      if (!user) return "";
      if (user.name && user.name.trim() !== "") return user.name;
      if (user.first_name && user.first_name.trim() !== "") return user.first_name;
      if (user.email) return user.email.split('@')[0];
      return "Usuario";
  };

  const getUserInitial = () => {
      const name = getDisplayName();
      return name ? name.charAt(0).toUpperCase() : "U";
  };

  const displayName = getDisplayName();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    // NAVBAR: Glassmorphism limpio (Blanco/Transparente)
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent ${scrolled ? 'bg-white/90 backdrop-blur-md border-gray-200 shadow-sm py-2' : 'bg-[#D9D9D9] border-gray-100 py-3'}`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center gap-8 h-12">
          
          {/* 1. MARCA (Ahora sobria en Negro/Gris) */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
             <span className="text-2xl font-bold text-gray-900 tracking-tighter">
               Dan<span className="text-gray-500">Shop</span>
             </span>
          </Link>

          {/* 2. BUSCADOR INTELIGENTE (Neutro) */}
          <div className="flex-1 max-w-2xl relative hidden md:block">
            <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Busca tu detalle favorito" 
                  className="w-full bg-white/80 border border-transparent focus:border-gray-300 focus:bg-white rounded-full py-2 pl-12 pr-4 text-sm transition-all outline-none shadow-sm focus:ring-4 focus:ring-gray-100"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <svg className="absolute left-4 top-2.5 h-5 w-5 text-gray-400 group-focus-within:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* SUGERENCIAS */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-12 left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-fade-in-up">
                    {suggestions.map((prod) => (
                        <div 
                            key={prod.id}
                            onClick={() => {
                                navigate(`/product/${prod.id}`);
                                setShowSuggestions(false);
                            }}
                            className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            <img src={`https://danstore-backend.onrender.com${prod.image}`} className="w-10 h-10 object-cover rounded-lg bg-gray-100 mix-blend-multiply" alt={prod.name}/>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">{prod.name}</p>
                                <p className="text-xs text-gray-400 font-bold uppercase">{prod.category_name || "Producto"}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* 3. ICONOS DERECHA (Negro y Gris) */}
          <div className="flex items-center space-x-6">
            
            {/* LÓGICA DE USUARIO */}
            {user ? (
                <div className="relative">
                    <button 
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 hover:bg-black/5 px-2 py-1.5 rounded-full transition-all duration-200"
                    >
                        {/* Avatar Negro/Blanco (Más elegante) */}
                        <div className="h-8 w-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                            {getUserInitial()}
                        </div>
                        
                        <div className="text-left hidden lg:block">
                            <p className="text-[10px] text-gray-500 font-bold uppercase leading-none">Hola</p>
                            <p className="text-sm font-bold text-gray-900 leading-none mt-0.5 max-w-[100px] truncate">
                                {displayName}
                            </p>
                        </div>
                    </button>

                    {/* Menú Desplegable */}
                    {showUserMenu && (
                        <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden z-50 animate-fade-in-up">
                            <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                                <p className="text-xs text-gray-500 font-medium">Conectado como</p>
                                <p className="text-sm font-bold text-[#1d1d1f] truncate">{user.email}</p>
                            </div>
                            
                            <div className="py-1">
                                <Link to="/catalogo" className="block px-5 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                                    Ir al catálogo
                                </Link>
                                <button className="w-full text-left px-5 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                                    Mis Pedidos
                                </button>
                            </div>

                            <div className="border-t border-gray-100 mt-1 pt-1">
                                <button 
                                    onClick={() => {
                                        logoutUser();
                                        setShowUserMenu(false);
                                        navigate('/login');
                                    }}
                                    className="w-full text-left px-5 py-2 text-sm text-red-600 font-medium hover:bg-red-50 flex items-center gap-2"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <Link to="/login" className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-sm font-bold text-gray-700 hover:text-black hover:border-gray-400 transition-all">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Ingresar</span>
                </Link>
            )}

            <Link to="/cart" className="relative group">
              <div className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full hover:border-black hover:text-black transition-all duration-300 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 group-hover:text-black transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
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