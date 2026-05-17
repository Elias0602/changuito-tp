export type Role = "CUSTOMER" | "ADMIN" | "RESTOCKER";

export interface User {
  id: number;
  nombre: string;
  email: string;
  role: Role;
  esJubilado?: boolean;
  esEstudiante?: boolean;
  twoFactorEnabled?: boolean;
  subscriptions?: Subscription[];
}

export interface Category {
  id: number;
  nombre: string;
  slug: string;
  icono?: string | null;
  _count?: { productos: number };
}

export interface Product {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  precioFinal: number;
  stock: number;
  imagenUrl?: string | null;
  category: Category;
  oferta?: { porcentaje: number; esImperdible: boolean } | null;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  cantidad: number;
  precioSnapshot: number;
  product: Product;
}

export interface CartResumen {
  subtotal: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  motivosDescuento: string[];
  envio: number;
  envioBase: number;
  descuentoEnvio: number;
  envioGratis: boolean;
  total: number;
}

export interface Cart {
  id: number;
  userId: number;
  estado: string;
  items: CartItem[];
  resumen: CartResumen;
}

export interface Order {
  id: number;
  subtotal: number;
  descuento: number;
  envio: number;
  montoFinal: number;
  metodoPago: string;
  estado: "PENDIENTE" | "LISTO" | "ENTREGADO" | "CANCELADO";
  fechaPago: string;
  items: Array<{ id: number; cantidad: number; precioSnapshot: number; product: Product }>;
  user?: { id: number; nombre: string; email: string };
}

export interface Offer {
  id: number;
  productId: number;
  porcentaje: number;
  fechaInicio: string;
  fechaFin: string;
  esImperdible: boolean;
  activa: boolean;
  product?: Product;
}

export interface Subscription {
  id: number;
  plan: "BASICO" | "ESTANDAR" | "PLUS";
  periodo: "MENSUAL" | "ANUAL";
  precio: number;
  fechaInicio: string;
  fechaVencimiento: string;
  activa: boolean;
}

export interface Plan {
  plan: "BASICO" | "ESTANDAR" | "PLUS";
  nombre: string;
  descripcion: string;
  descuentoEnvio: number;
  descuentoProductos: number;
  envioGratis: boolean;
  mensual: number | null;
  anual: number | null;
}
