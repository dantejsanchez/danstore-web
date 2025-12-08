import { Routes, Route } from 'react-router-dom'
import Home from './Home'
import ProductDetail from './ProductDetail'
import CartPage from './CartPage'
import SuccessPage from './SuccessPage' // <--- IMPORTAR

// ... otros imports ...
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage' // <--- IMPORTAR

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} /> {/* <--- NUEVA RUTA */}
    </Routes>
  )
}
export default App