const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/smartstore', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ DB error:', err));

// ===== SCHEMAS =====
const categorySchema = new mongoose.Schema({ name: { type: String, required: true, unique: true } });
const Category = mongoose.model('Category', categorySchema);

const warehouseSchema = new mongoose.Schema({ name: { type: String, required: true, unique: true } });
const Warehouse = mongoose.model('Warehouse', warehouseSchema);

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  phone: String, notes: String,
  createdAt: { type: Date, default: Date.now }
});
const Customer = mongoose.model('Customer', customerSchema);

const productSchema = new mongoose.Schema({
  name: String, price: Number, costPrice: Number,
  unit: { type: String, default: 'قطعة' },
  barcode: { type: String, default: '' },
  expiryDate: { type: Date, default: null },
  categoryId: { type: mongoose.Schema.Types.ObjectId, default: null }, categoryName: { type: String, default: '' },
  warehouses: [{ warehouseId: mongoose.Schema.Types.ObjectId, warehouseName: String, quantity: { type: Number, default: 0 } }]
});
const Product = mongoose.model('Product', productSchema);

const saleInvoiceSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, default: null },
  customerName: { type: String, default: 'زبون نقدي' },
  items: [{ productId: mongoose.Schema.Types.ObjectId, productName: String, price: Number, costPrice: Number, quantity: Number, warehouseId: mongoose.Schema.Types.ObjectId, warehouseName: String, subtotal: Number }],
  totalAmount: Number, paidAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['cash', 'bank', 'debt'], default: 'cash' },
  notes: String, date: { type: Date, default: Date.now },
  status: { type: String, enum: ['paid', 'partial', 'debt'], default: 'paid' }
});
const SaleInvoice = mongoose.model('SaleInvoice', saleInvoiceSchema);

const purchaseInvoiceSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  supplierName: { type: String, default: 'مورد' },
  items: [{ productId: mongoose.Schema.Types.ObjectId, productName: String, costPrice: Number, quantity: Number, warehouseId: mongoose.Schema.Types.ObjectId, warehouseName: String, subtotal: Number }],
  totalAmount: Number, paidAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['cash', 'bank', 'debt'], default: 'cash' },
  notes: String, date: { type: Date, default: Date.now },
  status: { type: String, enum: ['paid', 'partial', 'debt'], default: 'paid' }
});
const PurchaseInvoice = mongoose.model('PurchaseInvoice', purchaseInvoiceSchema);

const sellLogSchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId, productName: String,
  price: Number, costPrice: Number, quantity: Number,
  warehouseId: { type: mongoose.Schema.Types.ObjectId, default: null }, warehouseName: { type: String, default: '' },
  customerId: { type: mongoose.Schema.Types.ObjectId, default: null }, customerName: { type: String, default: '' },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, default: null }, invoiceNumber: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});
const SellLog = mongoose.model('SellLog', sellLogSchema);

const purchaseLogSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, default: null }, productName: String,
  categoryName: { type: String, default: '' },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, default: null }, warehouseName: { type: String, default: '' },
  costPrice: Number, quantity: Number,
  paymentMethod: { type: String, enum: ['cash', 'bank', 'debt'], default: 'cash' },
  supplierId: { type: mongoose.Schema.Types.ObjectId, default: null }, supplierName: { type: String, default: '' },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, default: null }, invoiceNumber: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});
const PurchaseLog = mongoose.model('PurchaseLog', purchaseLogSchema);

const debtSchema = new mongoose.Schema({
  type: { type: String, enum: ['علي', 'لي'] }, personName: String,
  personId: { type: mongoose.Schema.Types.ObjectId, default: null },
  totalAmount: Number, paidAmount: { type: Number, default: 0 },
  notes: String, date: { type: Date, default: Date.now },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, default: null },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' }
});
const Debt = mongoose.model('Debt', debtSchema);

const cashSchema = new mongoose.Schema({
  type: { type: String, enum: ['in', 'out'] }, amount: Number,
  note: String, source: { type: String, enum: ['cash', 'bank'], default: 'cash' },
  date: { type: Date, default: Date.now }
});
const Cash = mongoose.model('Cash', cashSchema);

const voucherLineSchema = new mongoose.Schema({
  account: String,
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  notes: String
});

const voucherSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  description: String,
  personName: { type: String, default: '' },
  voucherType: { type: String, default: '' },
  lines: [voucherLineSchema],
  totalDebit: { type: Number, default: 0 },
  totalCredit: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'posted'], default: 'draft' }
});
const Voucher = mongoose.model('Voucher', voucherSchema);

const settingsSchema = new mongoose.Schema({ key: { type: String, unique: true }, value: mongoose.Schema.Types.Mixed });
const Settings = mongoose.model('Settings', settingsSchema);

// ===== SEED =====
async function seedData() {
  try {
    if (await Product.countDocuments() === 0) {
      const wh = await new Warehouse({ name: 'المستودع الرئيسي' }).save();
      await Product.insertMany([
        { name: 'منتج 1', price: 100, costPrice: 60, warehouses: [{ warehouseId: wh._id, warehouseName: wh.name, quantity: 20 }] },
        { name: 'منتج 2', price: 200, costPrice: 130, warehouses: [{ warehouseId: wh._id, warehouseName: wh.name, quantity: 15 }] },
      ]);
    }
    if (await Settings.countDocuments() === 0) {
      await Settings.insertMany([{ key: 'currency', value: 'USD' }, { key: 'language', value: 'ar' }]);
    }
  } catch (e) { console.error('Seed error:', e.message); }
}
mongoose.connection.once('open', seedData);

// ===== SETTINGS =====
app.get('/api/settings', async (req, res) => {
  try { const all = await Settings.find(); const obj = {}; all.forEach(s => obj[s.key] = s.value); res.json(obj); }
  catch { res.status(500).json({ error: 'خطأ' }); }
});
app.patch('/api/settings/:key', async (req, res) => {
  try { const s = await Settings.findOneAndUpdate({ key: req.params.key }, { value: req.body.value }, { new: true, upsert: true }); res.json(s); }
  catch { res.status(500).json({ error: 'خطأ' }); }
});

// ===== CATEGORIES =====
app.get('/api/categories', async (req, res) => { try { res.json(await Category.find()); } catch { res.status(500).json({ error: 'خطأ' }); } });
app.post('/api/categories', async (req, res) => {
  try { const c = new Category(req.body); await c.save(); res.json(c); }
  catch (e) { if (e.code === 11000) return res.status(400).json({ error: 'موجود' }); res.status(500).json({ error: 'خطأ' }); }
});
app.delete('/api/categories/:id', async (req, res) => {
  try { await Category.findByIdAndDelete(req.params.id); res.json({ message: 'تم' }); }
  catch { res.status(500).json({ error: 'خطأ' }); }
});

// ===== WAREHOUSES =====
app.get('/api/warehouses', async (req, res) => { try { res.json(await Warehouse.find()); } catch { res.status(500).json({ error: 'خطأ' }); } });
app.post('/api/warehouses', async (req, res) => {
  try { const w = new Warehouse(req.body); await w.save(); res.json(w); }
  catch (e) { if (e.code === 11000) return res.status(400).json({ error: 'موجود' }); res.status(500).json({ error: 'خطأ' }); }
});
app.delete('/api/warehouses/:id', async (req, res) => {
  try { await Warehouse.findByIdAndDelete(req.params.id); res.json({ message: 'تم' }); }
  catch { res.status(500).json({ error: 'خطأ' }); }
});

// ===== CUSTOMERS =====
app.get('/api/customers', async (req, res) => { try { res.json(await Customer.find().sort({ name: 1 })); } catch { res.status(500).json({ error: 'خطأ' }); } });
app.post('/api/customers', async (req, res) => {
  try { const c = new Customer(req.body); await c.save(); res.json(c); }
  catch (e) { if (e.code === 11000) return res.status(400).json({ error: 'اسم الزبون موجود مسبقاً' }); res.status(500).json({ error: 'خطأ' }); }
});
app.delete('/api/customers/:id', async (req, res) => {
  try { await Customer.findByIdAndDelete(req.params.id); res.json({ message: 'تم' }); }
  catch { res.status(500).json({ error: 'خطأ' }); }
});

// بحث عن زبون مع كل سجلاته
app.get('/api/customers/:id/history', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'غير موجود' });
    const salesInvoices = await SaleInvoice.find({ customerId: req.params.id }).sort({ date: -1 });
    const purchaseInvoices = await PurchaseInvoice.find({ supplierName: customer.name }).sort({ date: -1 });
    const debts = await Debt.find({ personId: req.params.id }).sort({ date: -1 });
    const totalSales = salesInvoices.reduce((s, i) => s + i.totalAmount, 0);
    const totalPurchases = purchaseInvoices.reduce((s, i) => s + i.totalAmount, 0);
    const totalDebt = debts.filter(d => d.status === 'pending').reduce((s, d) => s + (d.totalAmount - d.paidAmount), 0);
    res.json({ customer, salesInvoices, purchaseInvoices, debts, totalSales, totalPurchases, totalDebt });
  } catch { res.status(500).json({ error: 'خطأ' }); }
});

// ===== PRODUCTS =====
app.get('/api/products', async (req, res) => { try { res.json(await Product.find()); } catch { res.status(500).json({ error: 'خطأ' }); } });
app.post('/api/products', async (req, res) => {
  try {
    const p = new Product(req.body);
    await p.save();
    // تسجيل مشتريات بدون خصم من الصندوق
    if (req.body.costPrice && req.body.warehouses?.length) {
      for (const w of req.body.warehouses) {
        if (w.quantity > 0) {
          await new PurchaseLog({
            productId: p._id, productName: p.name, categoryName: p.categoryName || '',
            warehouseId: w.warehouseId, warehouseName: w.warehouseName,
            costPrice: p.costPrice, quantity: w.quantity,
            paymentMethod: req.body.paymentMethod || 'cash'
          }).save();
        }
      }
    }
    res.json(p);
  } catch { res.status(500).json({ error: 'خطأ' }); }
});
app.put('/api/products/:id', async (req, res) => {
  try { const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(p); }
  catch { res.status(500).json({ error: 'خطأ' }); }
});
app.delete('/api/products/:id', async (req, res) => {
  try { await Product.findByIdAndDelete(req.params.id); res.json({ message: 'تم' }); }
  catch { res.status(500).json({ error: 'خطأ' }); }
});

// ===== SALE INVOICES =====
app.get('/api/sale-invoices', async (req, res) => {
  try {
    let q = {};
    if (req.query.from) q.date = { ...q.date, $gte: new Date(req.query.from) };
    if (req.query.to) q.date = { ...q.date, $lte: new Date(req.query.to + 'T23:59:59') };
    if (req.query.customer) q.customerName = { $regex: req.query.customer, $options: 'i' };
    res.json(await SaleInvoice.find(q).sort({ date: -1 }));
  } catch { res.status(500).json({ error: 'خطأ' }); }
});

app.post('/api/sale-invoices', async (req, res) => {
  try {
    const { number, customerId, customerName, items, paidAmount, paymentMethod, notes, date } = req.body;
    const totalAmount = items.reduce((s, i) => s + (i.subtotal || 0), 0);
    const paid = parseFloat(paidAmount || 0);
    let status = paid >= totalAmount ? 'paid' : (paymentMethod === 'debt' ? 'debt' : 'partial');

    // خصم الكميات من المستودعات
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;
      const wh = product.warehouses.find(w => String(w.warehouseId) === String(item.warehouseId)) || product.warehouses[0];
      if (wh) { wh.quantity = Math.max(0, wh.quantity - item.quantity); await product.save(); }
    }

    const invoice = new SaleInvoice({
      number, customerId: customerId || null, customerName: customerName || 'زبون نقدي',
      items, totalAmount, paidAmount: paid, paymentMethod, notes,
      date: date ? new Date(date) : new Date(), status
    });
    await invoice.save();

    // سجل مبيعات
    for (const item of items) {
      await new SellLog({
        productId: item.productId, productName: item.productName,
        price: item.price, costPrice: item.costPrice || 0, quantity: item.quantity,
        warehouseId: item.warehouseId, warehouseName: item.warehouseName || '',
        customerId: customerId || null, customerName: customerName || 'زبون نقدي',
        invoiceId: invoice._id, invoiceNumber: invoice.number
      }).save();
    }

    // دين تلقائي
    if (status !== 'paid' && totalAmount > paid) {
      await new Debt({
        type: 'علي', personName: customerName || 'زبون نقدي',
        personId: customerId || null,
        totalAmount: totalAmount - paid, paidAmount: 0,
        notes: `فاتورة بيع ${number}`, invoiceId: invoice._id
      }).save();
    }

    // تسجيل في الصندوق إذا في دفع
    if (paid > 0 && paymentMethod !== 'debt') {
      await new Cash({
        type: 'in', amount: paid,
        note: `فاتورة بيع ${number} - ${customerName || 'زبون نقدي'}`,
        source: paymentMethod === 'bank' ? 'bank' : 'cash'
      }).save();
    }

    res.json({ invoice });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ error: 'رقم الفاتورة موجود مسبقاً' });
    res.status(500).json({ error: 'خطأ: ' + e.message });
  }
});

app.delete('/api/sale-invoices/:id', async (req, res) => {
  try {
    const invoice = await SaleInvoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'غير موجود' });
    for (const item of invoice.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const wh = product.warehouses.find(w => String(w.warehouseId) === String(item.warehouseId));
        if (wh) wh.quantity += item.quantity; else if (product.warehouses[0]) product.warehouses[0].quantity += item.quantity;
        await product.save();
      }
    }
    await SellLog.deleteMany({ invoiceId: req.params.id });
    await Debt.deleteMany({ invoiceId: req.params.id });
    await SaleInvoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم' });
  } catch { res.status(500).json({ error: 'خطأ' }); }
});

// ===== PURCHASE INVOICES =====
app.get('/api/purchase-invoices', async (req, res) => {
  try {
    let q = {};
    if (req.query.from) q.date = { ...q.date, $gte: new Date(req.query.from) };
    if (req.query.to) q.date = { ...q.date, $lte: new Date(req.query.to + 'T23:59:59') };
    res.json(await PurchaseInvoice.find(q).sort({ date: -1 }));
  } catch { res.status(500).json({ error: 'خطأ' }); }
});

app.post('/api/purchase-invoices', async (req, res) => {
  try {
    const { number, supplierName, items, paidAmount, paymentMethod, notes, date } = req.body;
    const totalAmount = items.reduce((s, i) => s + (i.subtotal || 0), 0);
    const paid = parseFloat(paidAmount || 0);
    let status = paid >= totalAmount ? 'paid' : (paymentMethod === 'debt' ? 'debt' : 'partial');

    // زيادة الكميات + انشاء منتجات جديدة
    for (const item of items) {
      let product;
      if (item.isNew) {
        const warehouse = await Warehouse.findById(item.warehouseId);
        product = new Product({
          name: item.productName,
          price: parseFloat(item.newSellPrice || 0),
          costPrice: parseFloat(item.costPrice || 0),
          warehouses: [{ warehouseId: item.warehouseId, warehouseName: warehouse?.name || '', quantity: parseInt(item.quantity) }]
        });
        await product.save();
        item.productId = product._id;
        item.warehouseName = warehouse?.name || '';
      } else {
        product = await Product.findById(item.productId);
        if (!product) continue;
        const wh = product.warehouses.find(w => String(w.warehouseId) === String(item.warehouseId));
        if (wh) { wh.quantity += item.quantity; }
        else { const warehouse = await Warehouse.findById(item.warehouseId); product.warehouses.push({ warehouseId: item.warehouseId, warehouseName: warehouse?.name || '', quantity: item.quantity }); }
        if (item.costPrice) product.costPrice = item.costPrice;
        await product.save();
      }
    }

    const invoice = new PurchaseInvoice({
      number, supplierName: supplierName || 'مورد',
      items, totalAmount, paidAmount: paid, paymentMethod, notes,
      date: date ? new Date(date) : new Date(), status
    });
    await invoice.save();

    // سجل مشتريات
    for (const item of items) {
      await new PurchaseLog({
        productId: item.productId, productName: item.productName,
        warehouseId: item.warehouseId, warehouseName: item.warehouseName || '',
        costPrice: item.costPrice, quantity: item.quantity,
        paymentMethod, supplierName: supplierName || 'مورد',
        invoiceId: invoice._id, invoiceNumber: invoice.number
      }).save();
    }

    // دين تلقائي للمورد
    if (status !== 'paid' && totalAmount > paid) {
      await new Debt({
        type: 'لي', personName: supplierName || 'مورد',
        totalAmount: totalAmount - paid, paidAmount: 0,
        notes: `فاتورة شراء ${number}`, invoiceId: invoice._id
      }).save();
    }

    // تسجيل في الصندوق
    if (paid > 0 && paymentMethod !== 'debt') {
      await new Cash({
        type: 'out', amount: paid,
        note: `فاتورة شراء ${number} - ${supplierName || 'مورد'}`,
        source: paymentMethod === 'bank' ? 'bank' : 'cash'
      }).save();
    }

    res.json({ invoice });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ error: 'رقم الفاتورة موجود' });
    res.status(500).json({ error: 'خطأ: ' + e.message });
  }
});

app.delete('/api/purchase-invoices/:id', async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'غير موجود' });
    for (const item of invoice.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const wh = product.warehouses.find(w => String(w.warehouseId) === String(item.warehouseId));
        if (wh) wh.quantity = Math.max(0, wh.quantity - item.quantity);
        await product.save();
      }
    }
    await PurchaseLog.deleteMany({ invoiceId: req.params.id });
    await Debt.deleteMany({ invoiceId: req.params.id });
    await PurchaseInvoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم' });
  } catch { res.status(500).json({ error: 'خطأ' }); }
});

// ===== SELL LOGS =====
app.get('/api/sell-logs', async (req, res) => {
  try {
    let q = {};
    if (req.query.from) q.date = { ...q.date, $gte: new Date(req.query.from) };
    if (req.query.to) q.date = { ...q.date, $lte: new Date(req.query.to + 'T23:59:59') };
    res.json(await SellLog.find(q).sort({ date: -1 }));
  } catch { res.status(500).json({ error: 'خطأ' }); }
});

// ===== PURCHASE LOGS =====
app.get('/api/purchase-logs', async (req, res) => {
  try {
    let q = {};
    if (req.query.from) q.date = { ...q.date, $gte: new Date(req.query.from) };
    if (req.query.to) q.date = { ...q.date, $lte: new Date(req.query.to + 'T23:59:59') };
    res.json(await PurchaseLog.find(q).sort({ date: -1 }));
  } catch { res.status(500).json({ error: 'خطأ' }); }
});

// ===== DEBTS =====
app.get('/api/debts', async (req, res) => {
  try {
    let q = {};
    if (req.query.from) q.date = { ...q.date, $gte: new Date(req.query.from) };
    if (req.query.to) q.date = { ...q.date, $lte: new Date(req.query.to + 'T23:59:59') };
    res.json(await Debt.find(q).sort({ date: -1 }));
  } catch { res.status(500).json({ error: 'خطأ' }); }
});
app.post('/api/debts', async (req, res) => {
  try { const d = new Debt(req.body); await d.save(); res.json(d); }
  catch { res.status(500).json({ error: 'خطأ' }); }
});
app.patch('/api/debts/:id/pay', async (req, res) => {
  try {
    const d = await Debt.findById(req.params.id);
    if (!d) return res.status(404).json({ error: 'غير موجود' });
    d.paidAmount = Math.min(d.totalAmount, d.paidAmount + parseFloat(req.body.amount || 0));
    if (d.paidAmount >= d.totalAmount) d.status = 'paid';
    await d.save(); res.json(d);
  } catch { res.status(500).json({ error: 'خطأ' }); }
});
app.delete('/api/debts/:id', async (req, res) => {
  try { await Debt.findByIdAndDelete(req.params.id); res.json({ message: 'تم' }); }
  catch { res.status(500).json({ error: 'خطأ' }); }
});

// ===== CASH =====
app.get('/api/cash', async (req, res) => {
  try {
    let q = {};
    if (req.query.from) q.date = { ...q.date, $gte: new Date(req.query.from) };
    if (req.query.to) q.date = { ...q.date, $lte: new Date(req.query.to + 'T23:59:59') };
    res.json(await Cash.find(q).sort({ date: -1 }));
  } catch { res.status(500).json({ error: 'خطأ' }); }
});
app.post('/api/cash', async (req, res) => {
  try { const c = new Cash(req.body); await c.save(); res.json(c); }
  catch { res.status(500).json({ error: 'خطأ' }); }
});
app.delete('/api/cash/:id', async (req, res) => {
  try { await Cash.findByIdAndDelete(req.params.id); res.json({ message: 'تم' }); }
  catch { res.status(500).json({ error: 'خطأ' }); }
});

// ===== VOUCHERS =====
app.get('/api/vouchers', async (req, res) => {
  try {
    let q = {};
    if (req.query.from) q.date = { ...q.date, $gte: new Date(req.query.from) };
    if (req.query.to) q.date = { ...q.date, $lte: new Date(req.query.to + 'T23:59:59') };
    res.json(await Voucher.find(q).sort({ date: -1 }));
  } catch { res.status(500).json({ error: 'خطأ' }); }
});

app.post('/api/vouchers', async (req, res) => {
  try {
    const lines = req.body.lines || [];
    const totalDebit = lines.reduce((s, l) => s + parseFloat(l.debit || 0), 0);
    const totalCredit = lines.reduce((s, l) => s + parseFloat(l.credit || 0), 0);
    const v = new Voucher({
      number: req.body.number,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      description: req.body.description || '',
      personName: req.body.personName || '',
      voucherType: req.body.voucherType || '',
      lines,
      totalDebit,
      totalCredit,
      status: 'draft'
    });
    await v.save();
    res.json(v);
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ error: 'رقم السند موجود مسبقاً' });
    res.status(500).json({ error: 'خطأ: ' + e.message });
  }
});

app.patch('/api/vouchers/:id/post', async (req, res) => {
  try { const v = await Voucher.findByIdAndUpdate(req.params.id, { status: 'posted' }, { new: true }); res.json(v); }
  catch { res.status(500).json({ error: 'خطأ' }); }
});

app.delete('/api/vouchers/:id', async (req, res) => {
  try { await Voucher.findByIdAndDelete(req.params.id); res.json({ message: 'تم' }); }
  catch { res.status(500).json({ error: 'خطأ' }); }
});

// ===== EXPORT =====
// بحث بالباركود
app.get('/api/products/barcode/:code', async (req, res) => {
  try {
    const p = await Product.findOne({ barcode: req.params.code });
    if (!p) return res.status(404).json({ error: 'غير موجود' });
    res.json(p);
  } catch { res.status(500).json({ error: 'خطأ' }); }
});

app.get('/api/export', async (req, res) => {
  try {
    const [products, sellLogs, purchaseLogs, debts, cash, vouchers, saleInvoices, purchaseInvoices, customers] = await Promise.all([
      Product.find(), SellLog.find().sort({ date: -1 }), PurchaseLog.find().sort({ date: -1 }),
      Debt.find().sort({ date: -1 }), Cash.find().sort({ date: -1 }), Voucher.find().sort({ date: -1 }),
      SaleInvoice.find().sort({ date: -1 }), PurchaseInvoice.find().sort({ date: -1 }), Customer.find()
    ]);
    res.json({ products, sellLogs, purchaseLogs, debts, cash, vouchers, saleInvoices, purchaseInvoices, customers, exportDate: new Date() });
  } catch { res.status(500).json({ error: 'خطأ' }); }
});


// ===== QUICK PURCHASE (بدون فاتورة) =====
app.post('/api/quick-purchase', async (req, res) => {
  try {
    const { productId, warehouseId, quantity, costPrice, paymentMethod, supplierName } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
    const warehouse = await Warehouse.findById(warehouseId);
    const wh = product.warehouses.find(w => String(w.warehouseId) === String(warehouseId));
    if (wh) { wh.quantity += parseInt(quantity); }
    else { product.warehouses.push({ warehouseId, warehouseName: warehouse?.name || '', quantity: parseInt(quantity) }); }
    if (costPrice) product.costPrice = parseFloat(costPrice);
    await product.save();
    const log = new PurchaseLog({
      productId: product._id, productName: product.name,
      categoryName: product.categoryName || '',
      warehouseId, warehouseName: warehouse?.name || '',
      costPrice: parseFloat(costPrice) || product.costPrice || 0,
      quantity: parseInt(quantity),
      paymentMethod: paymentMethod || 'cash',
      supplierName: supplierName || ''
    });
    await log.save();
    res.json({ product, log });
  } catch (e) { res.status(500).json({ error: 'خطأ: ' + e.message }); }
});

// ===== DELETE SELL LOG =====
app.delete('/api/sell-logs/:id', async (req, res) => {
  try {
    const log = await SellLog.findById(req.params.id);
    if (!log) return res.status(404).json({ error: 'غير موجود' });
    const product = await Product.findById(log.productId);
    if (product) {
      const wh = product.warehouses.find(w => String(w.warehouseId) === String(log.warehouseId));
      if (wh) wh.quantity += log.quantity;
      else if (product.warehouses[0]) product.warehouses[0].quantity += log.quantity;
      await product.save();
    }
    await SellLog.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم' });
  } catch { res.status(500).json({ error: 'خطأ' }); }
});

// ===== DELETE PURCHASE LOG =====
app.delete('/api/purchase-logs/:id', async (req, res) => {
  try {
    const log = await PurchaseLog.findById(req.params.id);
    if (!log) return res.status(404).json({ error: 'غير موجود' });
    if (log.productId) {
      const p = await Product.findById(log.productId);
      if (p) {
        const wh = p.warehouses.find(w => String(w.warehouseId) === String(log.warehouseId));
        if (wh) wh.quantity = Math.max(0, wh.quantity - log.quantity);
        await p.save();
      }
    }
    await PurchaseLog.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم' });
  } catch { res.status(500).json({ error: 'خطأ' }); }
});


// ===== TRANSFER BETWEEN WAREHOUSES =====
app.post('/api/products/:id/transfer', async (req, res) => {
  try {
    const { fromWarehouseId, toWarehouseId, quantity } = req.body;
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) return res.status(400).json({ error: 'كمية غير صالحة' });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });

    const fromWh = product.warehouses.find(w => String(w.warehouseId) === String(fromWarehouseId));
    if (!fromWh) return res.status(400).json({ error: 'المستودع المصدر غير موجود' });
    if (fromWh.quantity < qty) return res.status(400).json({ error: 'الكمية المتاحة: ' + fromWh.quantity });

    const toWarehouse = await Warehouse.findById(toWarehouseId);
    if (!toWarehouse) return res.status(400).json({ error: 'المستودع الهدف غير موجود' });

    fromWh.quantity -= qty;

    const toWh = product.warehouses.find(w => String(w.warehouseId) === String(toWarehouseId));
    if (toWh) { toWh.quantity += qty; }
    else { product.warehouses.push({ warehouseId: toWarehouseId, warehouseName: toWarehouse.name, quantity: qty }); }

    await product.save();
    res.json({ product, message: 'تم النقل بنجاح' });
  } catch (e) { res.status(500).json({ error: 'خطأ: ' + e.message }); }
});

// ===== EXPIRY CHECK =====
app.get('/api/products/expiring', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const limit = new Date();
    limit.setDate(limit.getDate() + days);
    const products = await Product.find({
      expiryDate: { $ne: null, $lte: limit, $gte: new Date() }
    }).sort({ expiryDate: 1 });
    const expired = await Product.find({
      expiryDate: { $ne: null, $lt: new Date() }
    });
    res.json({ expiring: products, expired });
  } catch { res.status(500).json({ error: 'خطأ' }); }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));