/* ══════════════════════════════════════════
   Original Filter — Model Order
   ══════════════════════════════════════════
   Refundação completa com:
   - orderNumber público (OF-2026-00001) gerado via contador atômico
   - Snapshot dos produtos (preço, nome, sku congelados no momento da compra)
   - Endereço de entrega/cobrança congelados
   - Dual status: paymentStatus + fulfillmentStatus
   - appliedDiscountTier no item (auditoria)
   - Abstração de provider de pagamento (pagarme | mercadopago)
   - Campos de frete (Melhor Envio)
   - Campos de NF-e manual (Gagari emite no sistema dele e cola aqui)
   - subtotal/discount/shipping/total separados
   ══════════════════════════════════════════ */

import mongoose, { Schema, type Document, type Model } from 'mongoose';
import type {
  PaymentStatus,
  FulfillmentStatus,
  PaymentMethod,
  PaymentProvider,
  DiscountTier,
  UserRole,
} from '@/types';

// ─── Snapshot do item no momento da compra ───
export interface IOrderItem {
  product: mongoose.Types.ObjectId;

  // Snapshot (congelado — imune a mudanças posteriores no Product)
  productSku: string;
  productTitle: string;
  productImage: string;
  productSlug: string;

  quantity: number;
  unitRetailPrice: number; // preço cheio no momento
  appliedDiscountTier: DiscountTier; // 0/5/10/15/20 aplicado
  unitFinalPrice: number; // unitRetailPrice * (1 - discountTier/100)
  lineTotal: number; // unitFinalPrice * quantity
  weight: number; // kg unitário (para conferência frete)
}

// ─── Snapshot de endereço ───
export interface IOrderAddress {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

// ─── Snapshot do cliente (para guest checkout) ───
export interface IOrderCustomer {
  name: string;
  email: string;
  phone: string;
  document: string; // CPF (retail) ou CNPJ (reseller)
  documentType: 'cpf' | 'cnpj';
  role: UserRole;
  discountTier: DiscountTier;
}

// ─── Frete ───
export interface IOrderShipping {
  method: string; // ex: "PAC", "SEDEX", "Jadlog .Package"
  provider: string; // ex: "correios", "jadlog"
  cost: number;
  estimatedDays: number;
  melhorEnvioId?: string; // ID da cotação ou ordem
  trackingCode?: string;
  trackingUrl?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  address: IOrderAddress;
}

// ─── Pagamento (abstrato) ───
export interface IOrderPayment {
  provider: PaymentProvider;
  method: PaymentMethod;
  status: PaymentStatus;

  // IDs externos
  externalId?: string; // transaction ID do gateway
  externalReference?: string;

  // Boleto/Pix
  boletoUrl?: string;
  boletoBarcode?: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  pixExpiresAt?: Date;

  // Cartão (NÃO armazenar dados de cartão — só metadados)
  cardBrand?: string;
  cardLastFour?: string;
  installments?: number;

  paidAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
  failureReason?: string;

  // Webhook events recebidos (auditoria)
  webhookEvents: Array<{
    event: string;
    receivedAt: Date;
    payload: Record<string, unknown>;
  }>;
}

// ─── Nota Fiscal manual (Gagari emite no sistema dele) ───
export interface IOrderInvoice {
  number?: string;
  series?: string;
  accessKey?: string; // chave de acesso 44 dígitos
  issuedAt?: Date;
  pdfUrl?: string;
  xmlUrl?: string;
  uploadedBy?: mongoose.Types.ObjectId;
}

export interface IOrder extends Document {
  orderNumber: string; // OF-2026-00001

  customer: mongoose.Types.ObjectId; // ref User (sempre existe — guest cria User auto)
  customerSnapshot: IOrderCustomer;

  items: IOrderItem[];

  // Valores (em centavos? não — usar Number com 2 casas. Doc abaixo)
  subtotal: number; // soma de lineTotal antes de frete
  discountTotal: number; // total economizado (sum of (unitRetail - unitFinal) * qty)
  shippingCost: number;
  total: number; // subtotal + shippingCost

  payment: IOrderPayment;
  shipping: IOrderShipping;
  invoice: IOrderInvoice;

  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;

  notes?: string; // notas internas do admin
  customerNote?: string; // observação do cliente

  cancelledAt?: Date;
  cancelledBy?: mongoose.Types.ObjectId;
  cancellationReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productSku: { type: String, required: true },
    productTitle: { type: String, required: true },
    productImage: { type: String, default: '' },
    productSlug: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitRetailPrice: { type: Number, required: true, min: 0 },
    appliedDiscountTier: {
      type: Number,
      enum: [0, 5, 10, 15, 20],
      default: 0,
      required: true,
    },
    unitFinalPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const OrderAddressSchema = new Schema<IOrderAddress>(
  {
    cep: { type: String, required: true },
    logradouro: { type: String, required: true },
    numero: { type: String, required: true },
    complemento: { type: String },
    bairro: { type: String, required: true },
    cidade: { type: String, required: true },
    uf: { type: String, required: true, uppercase: true, maxlength: 2 },
  },
  { _id: false },
);

const OrderCustomerSchema = new Schema<IOrderCustomer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    document: { type: String, required: true },
    documentType: { type: String, enum: ['cpf', 'cnpj'], required: true },
    role: {
      type: String,
      enum: ['admin', 'retail', 'reseller'],
      required: true,
    },
    discountTier: { type: Number, enum: [0, 5, 10, 15, 20], default: 0 },
  },
  { _id: false },
);

const OrderShippingSchema = new Schema<IOrderShipping>(
  {
    method: { type: String, required: true },
    provider: { type: String, required: true },
    cost: { type: Number, required: true, min: 0 },
    estimatedDays: { type: Number, required: true, min: 0 },
    melhorEnvioId: { type: String },
    trackingCode: { type: String },
    trackingUrl: { type: String },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    address: { type: OrderAddressSchema, required: true },
  },
  { _id: false },
);

const OrderPaymentSchema = new Schema<IOrderPayment>(
  {
    provider: {
      type: String,
      enum: ['pagarme', 'mercadopago'],
      required: true,
    },
    method: {
      type: String,
      enum: ['credit_card', 'pix', 'boleto', 'bank_transfer'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'chargeback'],
      default: 'pending',
      required: true,
    },
    externalId: { type: String },
    externalReference: { type: String },
    boletoUrl: { type: String },
    boletoBarcode: { type: String },
    pixQrCode: { type: String },
    pixCopyPaste: { type: String },
    pixExpiresAt: { type: Date },
    cardBrand: { type: String },
    cardLastFour: { type: String, maxlength: 4 },
    installments: { type: Number, min: 1, max: 12 },
    paidAt: { type: Date },
    failedAt: { type: Date },
    refundedAt: { type: Date },
    failureReason: { type: String },
    webhookEvents: {
      type: [
        new Schema(
          {
            event: { type: String, required: true },
            receivedAt: { type: Date, default: Date.now },
            payload: { type: Schema.Types.Mixed },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
  },
  { _id: false },
);

const OrderInvoiceSchema = new Schema<IOrderInvoice>(
  {
    number: { type: String },
    series: { type: String },
    accessKey: { type: String, maxlength: 44 },
    issuedAt: { type: Date },
    pdfUrl: { type: String },
    xmlUrl: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },

    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerSnapshot: { type: OrderCustomerSchema, required: true },

    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(v: IOrderItem[]) => v.length > 0, 'Pedido precisa ter pelo menos 1 item'],
    },

    subtotal: { type: Number, required: true, min: 0 },
    discountTotal: { type: Number, required: true, min: 0, default: 0 },
    shippingCost: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },

    payment: { type: OrderPaymentSchema, required: true },
    shipping: { type: OrderShippingSchema, required: true },
    invoice: { type: OrderInvoiceSchema, default: () => ({}) },

    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'chargeback'],
      default: 'pending',
      required: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
      required: true,
    },

    notes: { type: String, maxlength: 2000 },
    customerNote: { type: String, maxlength: 1000 },

    cancelledAt: { type: Date },
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: { type: String, maxlength: 500 },
  },
  { timestamps: true },
);

// ─── Espelha payment.status em paymentStatus para queries mais simples ───
OrderSchema.pre('save', function () {
  if (this.payment?.status) {
    this.paymentStatus = this.payment.status;
  }
});

// ─── Índices ───
OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, fulfillmentStatus: 1 });
OrderSchema.index({ 'payment.externalId': 1 });
OrderSchema.index({ createdAt: -1 });

const Order: Model<IOrder> =
  (mongoose.models.Order as Model<IOrder>) || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;

/* ══════════════════════════════════════════
   NOTA SOBRE VALORES MONETÁRIOS
   ══════════════════════════════════════════
   Optei por Number com 2 casas (ex: 124.50) e NÃO por centavos integer.
   Razão: o stack já é assim no resto do projeto e MongoDB Number é
   double precision. Para somas até R$ 1 trilhão não há perda.
   
   Quando enviar ao gateway (Pagar.me espera centavos), converter no
   provider: Math.round(value * 100). Centralizar essa conversão em
   src/lib/payment/* evita bug recorrente.
   ══════════════════════════════════════════ */
