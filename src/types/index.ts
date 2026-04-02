/* ══════════════════════════════════════════
   Original Filter — TypeScript Interfaces
   ══════════════════════════════════════════ */

// ── Product ──
export interface IProductApplication {
  brand: string;
  models: {
    name: string;
    years?: string[];
  }[];
}

export interface IProductDimensions {
  height?: number;
  innerWidth?: number;
  outerComp?: number;
  thread?: string;
}

export interface IProduct {
  _id: string;
  code: string;
  slug: string;
  name: string;
  category: string;
  line: string[];
  image: string;
  conversions: string[];
  applications: IProductApplication[];
  dimensions?: IProductDimensions;
  sets: string[];
  components: string[];
  isNewRelease: boolean;
  isComingSoon: boolean;
  price?: number;
  stock?: number;
  createdAt: string;
  updatedAt: string;
}

// ── Brand ──
export interface IBrand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  type: string;
}

// ── Post (Blog) ──
export interface IPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  category?: string;
  tags: string[];
  author: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Contact (Leads) ──
export interface IContact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: 'duvidas' | 'orcamento' | 'elogios' | 'sugestoes' | 'reclamacoes';
  message: string;
  status: 'pending' | 'read' | 'replied';
  createdAt: string;
}

// ── Order ──
export interface IOrderItem {
  product: string;
  code: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface IOrderAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    cpfCnpj: string;
  };
  items: IOrderItem[];
  shippingAddress: IOrderAddress;
  shipping: {
    service: string;
    price: number;
    estimatedDays: number;
    trackingCode?: string;
  };
  payment: {
    method: 'credit_card' | 'boleto' | 'pix';
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    transactionId?: string;
  };
  subtotal: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// ── User (Admin) ──
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  createdAt: string;
}

// ── Navigation ──
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

// ── Cart ──
export interface CartItem {
  product: IProduct;
  quantity: number;
}
