import { Routes, Route } from 'react-router-dom'

// Importamos tus páginas
import Home from './Home'
import Catalog from './Catalog'       // <--- 1. IMPORTAMOS EL CATÁLOGO
import ProductDetail from './ProductDetail'
import CartPage from './CartPage'
import SuccessPage from './SuccessPage'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'

function App() {
  return (
    <Routes>
      {/* Portada Nueva (Landing Page) */}
      <Route path="/" element={<Home />} />

      {/* Catálogo con Filtros (Donde estaba tu antiguo Home) */}
      <Route path="/catalogo" element={<Catalog />} />  {/* <--- 2. AGREGAMOS LA RUTA */}

      {/* Resto de rutas */}
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  )
}

export default App
