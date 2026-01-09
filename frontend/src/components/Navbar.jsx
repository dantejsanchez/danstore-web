import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

function Navbar() {
  const { cart } = useCart();
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Para saber en qué página estamos
  
  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]); 
  const [scrolled, setScrolled] = useState(false);

  // --- EFECTOS ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/categories/`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const timer = setTimeout(() => {
        fetch(`${API_URL}/api/products/?search=${searchTerm}`)
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
    setIsOpen(false); 
    navigate(`/?search=${term}`);
  };

  // --- HELPERS ---
  const getDisplayName = () => {
      if (!user) return "";
      if (user.name) return user.name;
      if (user.email) return user.email.split('@')[0];
      return "Usuario";
  };
  const getUserInitial = () => getDisplayName().charAt(0).toUpperCase();

  return (
    <>
    {/* Navbar Container GLOBAL - Todo vive aquí dentro para ser un bloque sólido */}
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b 
        ${scrolled ? 'bg-white/95 backdrop-blur-md border-gray-200 shadow-sm' : 'bg-white border-gray-100'}`
    }>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- FILA SUPERIOR: LOGO, BUSCADOR PC, ICONOS --- */}
        <div className="flex justify-between items-center gap-4 md:gap-8 h-14 md:h-16">
          
          {/* IZQUIERDA */}
          <div className="flex items-center gap-2">
             <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 rounded-full text-gray-700 hover:bg-black/5 md:hidden">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
             </button>
             {/* BOTÓN SANDWICH PC (Visible también) */}
             <button onClick={() => setIsOpen(true)} className="hidden md:block p-2 rounded-full text-gray-700 hover:bg-black/5 mr-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
             </button>

             <Link to="/" className="flex-shrink-0 flex items-center gap-1 group">
                <span className="text-2xl font-bold text-gray-900 tracking-tighter">
                  Dan<span className="text-gray-500">Shop</span>
                </span>
             </Link>
          </div>

          {/* CENTRO (PC) */}
          <div className="flex-1 max-w-2xl relative hidden md:block">
            <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Busca tu detalle favorito" 
                  className="w-full border-transparent bg-gray-100 focus:bg-white focus:border-gray-300 rounded-full py-2 pl-12 pr-4 text-sm outline-none shadow-sm focus:ring-4 focus:ring-gray-100 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <svg className="absolute left-4 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            {/* Sugerencias PC */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-12 left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2 z-50">
                    {suggestions.map((prod) => (
                        <div key={prod.id} onClick={() => { navigate(`/product/${prod.id}`); setShowSuggestions(false); }} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                            <img src={`${API_URL}${prod.image}`} className="w-10 h-10 object-cover rounded-lg" alt={prod.name}/>
                            <div><p className="font-semibold text-sm">{prod.name}</p></div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* DERECHA */}
          <div className="flex items-center space-x-2 md:space-x-6">
            {user ? (
                <div className="relative">
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 hover:bg-gray-100 p-1 pr-2 rounded-full transition-all">
                        <div className="h-8 w-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">{getUserInitial()}</div>
                        <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[100px] truncate">{getDisplayName()}</span>
                    </button>
                    {showUserMenu && (
                        <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden z-50">
                            <div className="px-5 py-3 border-b border-gray-50"><p className="text-xs text-gray-500">Conectado como</p><p className="text-sm font-bold truncate">{user.email}</p></div>
                            <button onClick={() => { logoutUser(); setShowUserMenu(false); navigate('/login'); }} className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50">Cerrar Sesión</button>
                        </div>
                    )}
                </div>
            ) : (
                <Link to="/login" className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-sm font-bold text-gray-700 hover:text-black transition-all">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="hidden md:inline">Iniciar Sesión</span>
                </Link>
            )}
            <Link to="/cart" className="relative group p-2 rounded-full hover:bg-gray-100">
              <svg className="w-6 h-6 text-gray-600 group-hover:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
              {cart.length > 0 && <span className="absolute top-1 right-0.5 w-4 h-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">{cart.length}</span>}
            </Link>
          </div>
        </div>

        {/* --- FILA MEDIA: BUSCADOR MÓVIL (OVALADO) --- */}
        <div className="pb-3 md:hidden">
            <div className="relative">
                <input 
                    type="text" placeholder="Busca en DanShop..." 
                    className="w-full bg-gray-100 border-transparent rounded-full py-2.5 pl-10 pr-4 text-sm outline-none focus:bg-white focus:border-gray-300 shadow-sm transition-all"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                {/* Sugerencias Móvil */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-12 left-0 w-full bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden py-2 z-50">
                        {suggestions.map((prod) => (
                            <div key={prod.id} onClick={() => { navigate(`/product/${prod.id}`); setShowSuggestions(false); }} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 active:bg-gray-50">
                                <img src={`${API_URL}${prod.image}`} className="w-10 h-10 object-cover rounded" />
                                <span className="text-sm font-medium">{prod.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* --- FILA INFERIOR: CATEGORÍAS (INTEGRADO) --- */}
      {/* Esta es la clave: Al estar DENTRO del <nav>, nunca se separará */}
      <div className="w-full border-t border-gray-100 overflow-x-auto no-scrollbar bg-white">
          <div className="max-w-[1400px] mx-auto px-4 flex items-center gap-6 h-[48px] whitespace-nowrap">
                <Link to="/catalogo" className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-1">
                    Ver Todo
                </Link>
                {categories.map((cat) => (
                    <Link 
                        key={cat.id} 
                        to={`/catalogo?category=${cat.id}`} 
                        className="text-[13px] text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                        {cat.name}
                    </Link>
                ))}
          </div>
      </div>
    </nav>

    {/* --- SIDEBAR / MENÚ LATERAL --- */}
    <div className={`fixed inset-0 z-[60] flex transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black/25" onClick={() => setIsOpen(false)}></div>
          <div className={`bg-white w-[300px] h-full shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="flex justify-between items-center p-5 border-b border-gray-100">
                  <span className="text-xl font-bold text-gray-900">Menú</span>
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                  <Link to="/catalogo" onClick={() => setIsOpen(false)} className="flex justify-between px-6 py-4 text-gray-800 hover:bg-gray-50 border-b border-gray-50"><span className="font-bold">Ver Catálogo</span><svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg></Link>
                  {categories.map((cat) => (
                      <Link key={cat.id} to={`/catalogo?category=${cat.id}`} onClick={() => setIsOpen(false)} className="flex justify-between px-6 py-4 text-gray-600 hover:bg-gray-50 border-b border-gray-50"><span className="font-medium">{cat.name}</span><svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg></Link>
                  ))}
              </div>
          </div>
      </div>
    </>
  );
}

export default Navbar;