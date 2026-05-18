import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { Navbar } from "./components/Navbar";
import { CategoryBar } from "./components/CategoryBar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Chatbot } from "./components/Chatbot";

import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ProductDetail } from "./pages/ProductDetail";
import { CartPage } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { CheckoutResult } from "./pages/CheckoutResult";
import { Subscriptions } from "./pages/Subscriptions";
import { MisPedidos } from "./pages/MisPedidos";
import { Cuenta } from "./pages/Cuenta";
import { Direcciones } from "./pages/Direcciones";
import { Admin } from "./pages/Admin";
import { Repositor } from "./pages/Repositor";

import "./styles/theme.css";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CategoryBar />
      <main>{children}</main>
      <Chatbot />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/login" element={<Layout><Login /></Layout>} />
              <Route path="/register" element={<Layout><Register /></Layout>} />
              <Route path="/producto/:id" element={<Layout><ProductDetail /></Layout>} />
              <Route path="/suscripciones" element={<Layout><Subscriptions /></Layout>} />

              <Route path="/cart" element={
                <Layout>
                  <ProtectedRoute roles={["CUSTOMER"]}><CartPage /></ProtectedRoute>
                </Layout>
              } />
              <Route path="/checkout" element={
                <Layout>
                  <ProtectedRoute roles={["CUSTOMER"]}><Checkout /></ProtectedRoute>
                </Layout>
              } />
              <Route path="/checkout/result" element={
                <Layout>
                  <ProtectedRoute roles={["CUSTOMER"]}><CheckoutResult /></ProtectedRoute>
                </Layout>
              } />
              <Route path="/mis-pedidos" element={
                <Layout>
                  <ProtectedRoute roles={["CUSTOMER"]}><MisPedidos /></ProtectedRoute>
                </Layout>
              } />
              <Route path="/cuenta" element={
                <Layout>
                  <ProtectedRoute roles={["CUSTOMER"]}><Cuenta /></ProtectedRoute>
                </Layout>
              } />
              <Route path="/direcciones" element={
                <Layout>
                  <ProtectedRoute roles={["CUSTOMER"]}><Direcciones /></ProtectedRoute>
                </Layout>
              } />
              <Route path="/admin" element={
                <Layout>
                  <ProtectedRoute roles={["ADMIN"]}><Admin /></ProtectedRoute>
                </Layout>
              } />
              <Route path="/repositor" element={
                <Layout>
                  <ProtectedRoute roles={["RESTOCKER"]}><Repositor /></ProtectedRoute>
                </Layout>
              } />

              <Route path="*" element={
                <Layout>
                  <div className="container">
                    <div className="empty" style={{ marginTop: 40 }}>
                      <div className="empty-emoji">🔍</div>
                      <p style={{ fontSize: 22, fontWeight: 600 }}>Página no encontrada</p>
                      <a href="/" className="btn-primary" style={{ display: "inline-block", marginTop: 16, padding: "10px 24px", borderRadius: 6 }}>
                        Ir al inicio
                      </a>
                    </div>
                  </div>
                </Layout>
              } />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
