// @ts-nocheck
// Este archivo se portó de un proyecto JSX sin tipado estricto.
// Al ser código 100% de interfaz, se desactiva el chequeo de tipos solo aquí.
'use client';

import React, { useState, useEffect } from 'react';
import LeadWidget from './LeadWidget';
import { 
  Flame, 
  ShieldCheck, 
  Truck, 
  Clock, 
  PhoneCall, 
  Calculator, 
  CheckCircle2, 
  Upload, 
  MapPin, 
  AlertCircle, 
  Wrench, 
  Building2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Award, 
  ArrowRight, 
  X,
  Hammer,
  Layers,
  FileText,
  DollarSign,
  Printer,
  MessageCircle,
  Plus,
  Trash2,
  Receipt
} from 'lucide-react';

// Estilos reutilizables para la tabla del documento imprimible (PDF)
const printTh = { padding: '8px 10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#334155', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '11px', textAlign: 'left' };
const printTd = { padding: '10px', border: '1px solid #e2e8f0', color: '#0f172a', verticalAlign: 'top' };

export default function App() {
  // Navigation & Modal states
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('all');
  const [activeFaq, setActiveFaq] = useState(null);

  // Estimator Form state
  const [estimatorData, setEstimatorData] = useState({
    serviceType: 'repair',
    metalType: 'carbon_steel',
    urgency: 'standard',
    estimatedHours: 3,
    requiresGenPower: false
  });

  const [calculatedCost, setCalculatedCost] = useState(0);

  // Formulario de cliente (compartido por presupuesto, cotización y factura)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    serviceType: 'Mobile Repair / Patch Work',
    urgency: 'Standard Schedule (1-3 Days)',
    description: ''
  });

  // Generador de documentos: tipo (presupuesto/cotización/factura), líneas e impuestos
  const [docType, setDocType] = useState('estimate');
  const [docItems, setDocItems] = useState([{ id: 1, description: '', qty: 1, unit: 'hr', price: 0 }]);
  const [taxRate, setTaxRate] = useState(8);
  const [docResult, setDocResult] = useState(null);

  // Etiquetas y tarifas usadas tanto por el estimador como por el generador de PDF
  const SERVICE_LABELS = {
    repair: 'Mobile Repair / Patch Work',
    structural: 'Structural Steel Beam Welding',
    heavy_eq: 'Heavy Machinery Hardfacing',
    tig_pipe: 'Pipe & Pressure Vessel TIG'
  };

  const METAL_LABELS = {
    carbon_steel: { label: 'Carbon Steel', mult: 1.0 },
    stainless: { label: 'Stainless Steel', mult: 1.25 },
    aluminum: { label: 'Structural Aluminum', mult: 1.35 }
  };

  const URGENCY_FEES = {
    standard: { label: 'Standard Schedule (1-3 Days)', fee: 0 },
    same_day: { label: 'Same-Day Priority', fee: 150 },
    emergency: { label: '24/7 Immediate Emergency', fee: 300 }
  };

  const COMPANY = {
    name: 'Semper Iron Design',
    phone: '(809) 256-3749',
    phoneHref: '18092563749',
    email: 'dispatch@semperirondesign.com',
    address: 'Central Hub, Metro Service Area',
    tagline: 'AWS D1.1 Certified • OSHA 30 • Fully Insured'
  };

  // Datos bancarios para cobro (método de pago habitual del soldador)
  const BANK = {
    bank: 'Banreservas',
    accountNumber: '9605023620',
    accountName: 'Milton Rafael Semper Ortiz',
    identification: '023-0102370-7'
  };

  // Tipos de documento: presupuesto, cotización y factura. Cada uno adapta
  // el título del encabezado, el prefijo del número, los impuestos y los términos.
  const DOC_TYPES = {
    estimate: {
      label: 'Cost Estimate',
      title: 'COST ESTIMATE',
      numberPrefix: 'EST',
      validity: 'This cost estimate is valid for 15 days from the date above. Final charges may vary with on-site conditions, material prices, and power access.',
      payTerms: 'Advance: 50% deposit to schedule the job. Balance due upon completion.',
      footer: 'Estimates are non-binding and become a fixed quotation only after written acceptance.'
    },
    quote: {
      label: 'Quotation',
      title: 'QUOTATION',
      numberPrefix: 'QTE',
      validity: 'This quotation is valid for 30 days from the date above. Changes to scope, material, or site conditions may adjust the quoted price.',
      payTerms: 'Advance: 50% deposit to confirm the job and order materials. Balance due on completion.',
      footer: 'Work is authorized upon confirmation of accepted terms. Labor warranty covers workmanship only.'
    },
    invoice: {
      label: 'Invoice',
      title: 'INVOICE',
      numberPrefix: 'INV',
      validity: 'Please remit payment within 15 days of the invoice date. Late payments are subject to a 1.5% monthly service charge.',
      payTerms: 'Advance paid at booking was deducted from this balance. Payment due within 15 days.',
      footer: 'Thank you for your business. Mobile dispatch (809) 256-3749.'
    }
  };

  // Formatea un número como moneda en dólares
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

  // Calcula el desglose completo de un presupuesto a partir de los datos del estimador
  const computeQuote = (est, serviceLabel) => {
    let baseRate = 120; // tarifa por hora base
    if (est.serviceType === 'structural') baseRate = 150;
    if (est.serviceType === 'tig_pipe') baseRate = 175;
    if (est.serviceType === 'heavy_eq') baseRate = 160;

    const metal = METAL_LABELS[est.metalType] || METAL_LABELS.carbon_steel;
    const urgency = URGENCY_FEES[est.urgency] || URGENCY_FEES.standard;

    const labor = baseRate * est.estimatedHours * metal.mult;
    const generatorFee = est.requiresGenPower ? 75 : 0;
    const subtotal = labor + urgency.fee + generatorFee;

    return {
      serviceLabel,
      serviceType: est.serviceType,
      baseRate,
      metalLabel: metal.label,
      metalMult: metal.mult,
      hours: est.estimatedHours,
      urgencyLabel: urgency.label,
      urgencyFee: urgency.fee,
      generatorFee,
      needsGenerator: est.requiresGenPower,
      labor,
      subtotal,
      total: subtotal
    };
  };

  // Genera un número de documento único según su prefijo: EST-2026-4821, QTE-2026-7731 o INV-2026-9044
  const generateDocNumber = (prefix) => {
    const year = new Date().getFullYear();
    const seq = String(Math.floor(1000 + Math.random() * 9000));
    return `${prefix}-${year}-${seq}`;
  };

  // Abre el modal del generador en modo de formulario vacío
  const openQuoteModal = () => {
    setDocResult(null);
    setDocType('estimate');
    setDocItems([{ id: Date.now(), description: '', qty: 1, unit: 'hr', price: 0 }]);
    setIsQuoteModalOpen(true);
  };

  // Llena el generador con los datos elegidos en el estimador (una línea por concepto)
  const handleBookEstimate = () => {
    const est = estimatorData;
    const serviceLabel = SERVICE_LABELS[est.serviceType];
    const metal = METAL_LABELS[est.metalType] || METAL_LABELS.carbon_steel;
    const urgency = URGENCY_FEES[est.urgency] || URGENCY_FEES.standard;
    const quote = computeQuote(est, serviceLabel);
    const rateWithMaterial = Math.round(quote.baseRate * metal.mult);

    const lines = [{
      id: Date.now(),
      description: `On-site ${serviceLabel} on ${metal.label}${metal.mult > 1 ? ` (material factor ×${metal.mult})` : ''}`,
      qty: est.estimatedHours,
      unit: 'hr',
      price: rateWithMaterial
    }];
    if (urgency.fee > 0) lines.push({ id: Date.now() + 1, description: `Urgency surcharge — ${urgency.label}`, qty: 1, unit: 'flat', price: urgency.fee });
    if (est.requiresGenPower) lines.push({ id: Date.now() + 2, description: 'Mobile 12kW generator power supply', qty: 1, unit: 'flat', price: 75 });

    setDocType('estimate');
    setDocResult(null);
    setDocItems(lines);
    setFormData((prev) => ({
      ...prev,
      serviceType: serviceLabel,
      urgency: urgency.label,
      description: `Estimated ${est.estimatedHours} hrs of work on ${metal.label}. Materials, consumables and site conditions to be confirmed on arrival.`
    }));
    setIsQuoteModalOpen(true);
  };

  // Envía por WhatsApp un resumen legible del documento generado
  const sendViaWhatsApp = () => {
    if (!docResult) return;
    const d = docResult;
    const meta = DOC_TYPES[d.type];
    const lines = d.items.map((it) => `• ${it.description} — ${it.qty} ${it.unit} × ${money(it.price)} = ${money(it.qty * it.price)}`);
    const msg = [
      `*${meta.title} #${d.number}* - ${COMPANY.name}`,
      `Date: ${d.date}`,
      d.dueDate ? `Due: ${d.dueDate}` : '',
      ``,
      `*Client:* ${d.customer.fullName}`,
      `*Phone:* ${d.customer.phone}`,
      d.customer.address ? `*Site:* ${d.customer.address}` : '',
      d.customer.email ? `*Email:* ${d.customer.email}` : '',
      ``,
      ...lines,
      ``,
      d.type === 'invoice' ? `*Subtotal: ${money(d.subtotal)}*` : '',
      d.type === 'invoice' ? `*Tax (${d.taxRate}%): ${money(d.tax)}*` : '',
      `*TOTAL: ${money(d.total)}*`,
      ``,
      `*Payment:* ${BANK.bank} — Account ${BANK.accountNumber}`,
      `Name: ${BANK.accountName} (Cédula ${BANK.identification})`,
      meta.payTerms,
      ``,
      d.type === 'invoice' ? 'Payment due within 15 days of the invoice date.' : `Hi ${d.customer.fullName.split(' ')[0]}, confirming the above ${meta.label.toLowerCase()}. Is the schedule good for us to dispatch?`
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${COMPANY.phoneHref}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Real-time dynamic cost calculation logic
  useEffect(() => {
    let baseRate = 120; // base hourly rate
    if (estimatorData.serviceType === 'structural') baseRate = 150;
    if (estimatorData.serviceType === 'tig_pipe') baseRate = 175;
    if (estimatorData.serviceType === 'heavy_eq') baseRate = 160;

    let metalMultiplier = 1.0;
    if (estimatorData.metalType === 'aluminum') metalMultiplier = 1.35;
    if (estimatorData.metalType === 'stainless') metalMultiplier = 1.25;

    let urgencyFee = 0;
    if (estimatorData.urgency === 'same_day') urgencyFee = 150;
    if (estimatorData.urgency === 'emergency') urgencyFee = 300;

    let powerFee = estimatorData.requiresGenPower ? 75 : 0;

    const total = (baseRate * estimatorData.estimatedHours * metalMultiplier) + urgencyFee + powerFee;
    setCalculatedCost(Math.round(total));
  }, [estimatorData]);

  // Añade, elimina o actualiza líneas de ítems del documento
  const addDocItem = () => setDocItems([...docItems, { id: Date.now(), description: '', qty: 1, unit: 'hr', price: 0 }]);
  const removeDocItem = (id) => setDocItems(docItems.length > 1 ? docItems.filter((it) => it.id !== id) : docItems);
  const updateDocItem = (id, field, value) => setDocItems(docItems.map((it) => (it.id === id ? { ...it, [field]: value } : it)));

  // Total en vivo de las líneas (y del impuesto si es factura)
  const itemsTotal = docItems.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  const itemsTax = (Number(taxRate) || 0) / 100 * itemsTotal;
  const grandTotal = docType === 'invoice' ? itemsTotal + itemsTax : itemsTotal;

  // Genera el documento final (presupuesto, cotización o factura) con su desglose
  const handleDocSubmit = (e) => {
    e.preventDefault();
    const validItems = docItems.filter((it) => it.description.trim());
    const subtotal = validItems.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
    const useTax = docType === 'invoice';
    const tax = useTax ? subtotal * (Number(taxRate) || 0) / 100 : 0;
    const meta = DOC_TYPES[docType];
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const due = new Date(today);
    due.setDate(due.getDate() + 15);
    const dueStr = due.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const docNumber = generateDocNumber(meta.numberPrefix);

    setDocResult({
      type: docType,
      number: docNumber,
      date: dateStr,
      dueDate: useTax ? dueStr : null,
      customer: {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address
      },
      items: validItems,
      description: formData.description,
      taxRate: useTax ? Number(taxRate) : 0,
      subtotal,
      tax,
      total: subtotal + tax
    });

    // Captura el lead silenciosamente (si la API falla, la landing sigue funcionando normal)
    try {
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          zone: formData.address,
          projectType: docType,
          preferredDate: '',
          message: `Solicitud de ${meta.label} (${docNumber})`,
          source: 'form-cotizacion'
        })
      }).catch((err) => {});
    } catch (err) {}
  };

  const projects = [
    {
      id: 1,
      title: "Commercial Structural Beam Repair",
      category: "structural",
      location: "Downtown Warehouse",
      image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80",
      description: "Emergency high-altitude column repair on heavy steel beam structure following site impact.",
      specs: ["AWS D1.1 Certified", "Full Penetration Weld", "Ultrasonic Tested"]
    },
    {
      id: 2,
      title: "Custom Wrought Iron Driveway Gate",
      category: "architectural",
      location: "North Suburbs",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      description: "Custom TIG-welded ornamental steel gate with integrated hydraulic automated opening system.",
      specs: ["Precision TIG", "Powder Coated finish", "Custom Gate Lock"]
    },
    {
      id: 3,
      title: "Excavator Boom Bucket Hardfacing",
      category: "heavy_equipment",
      location: "Quarry Operations Site",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
      description: "Field hardfacing and high-stress crack repair on 45-ton excavator bucket.",
      specs: ["7018 Stick Process", "AR400 Wear Plates", "Same-Day Turnaround"]
    },
    {
      id: 4,
      title: "Rooftop HVAC Support Frame Fabrication",
      category: "structural",
      location: "Industrial Center",
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
      description: "On-site mobile fabrication and hoisting assembly for structural chillers frame.",
      specs: ["Structural Steel", "Crane Supported", "Galvanized Finish"]
    },
    {
      id: 5,
      title: "High-Pressure Stainless Steel Pipe Spool",
      category: "repair",
      location: "Chemical Processing Plant",
      image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80",
      description: "6-inch 316L Stainless Steel sanitary pipe modification and pressure purge TIG welding.",
      specs: ["ASME IX Certified", "100% X-Ray Weld", "High Purity TIG"]
    },
    {
      id: 6,
      title: "Emergency Fleet Trailer Chassis Weld",
      category: "repair",
      location: "Interstate I-95 Rest Area",
      image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
      description: "24/7 roadside mobile repair for fractured main chassis crossmember on semi-truck.",
      specs: ["Dual-Shield Flux-Core", "Mobile Rig On-site", "Under 2 Hours Response"]
    }
  ];

  const filteredProjects = selectedServiceFilter === 'all' 
    ? projects 
    : projects.filter(p => p.category === selectedServiceFilter);

  const faqs = [
    {
      q: "Do you provide electrical power for on-site welding?",
      a: "Yes! Our mobile rig is equipped with high-output 12kW diesel generators capable of running heavy-duty SMAW, GMAW, and FCAW welding machines anywhere, eliminating the need for client power source access."
    },
    {
      q: "How fast can you respond to emergency repair calls?",
      a: "We maintain a dedicated 24/7 emergency hotline. Typical response time for local emergency dispatches is under 60 minutes depending on traffic and current dispatch locations."
    },
    {
      q: "Are your welders certified for structural building codes?",
      a: "Absolutely. All our technicians hold active AWS D1.1 (Steel) and AWS D1.2 (Structural Aluminum) certifications, with full insurance and OSHA 30-hour site safety compliance."
    },
    {
      q: "What metal materials can you repair on-site?",
      a: "We work with Carbon Steel, Stainless Steel (304/316), Cast Iron, Aluminum, Chrome-Moly, and various high-wear alloy plates like AR400."
    },
    {
      q: "How does project pricing work for mobile welding?",
      a: "We offer transparent upfront quotes. Jobs are billed on either a fixed project contract or standard hourly rate ($120 - $160/hr depending on process) plus a modest local service dispatch fee."
    }
  ];

  return (
    <>
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950 print:hidden">
      
      {}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-slate-950 text-xs sm:text-sm font-semibold py-2 px-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-slate-950 animate-ping" />
            <span className="uppercase tracking-wider font-extrabold text-slate-950">24/7 Dispatch active</span>
            <span className="hidden md:inline text-slate-900">• Rapid On-Site Mobile Unit Ready in Tri-State Area</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:18092563749" className="flex items-center gap-1.5 font-extrabold hover:underline text-slate-950">
              <PhoneCall className="w-4 h-4 fill-slate-950" />
              <span>(809) 256-3749</span>
            </a>
            <span className="text-slate-900/40">|</span>
            <button 
              onClick={openQuoteModal}
              className="text-xs bg-slate-950 text-amber-400 px-3 py-1 rounded-md font-bold hover:bg-slate-900 transition-colors"
            >
              Dispatch Rig
            </button>
          </div>
        </div>
      </div>

      {}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-[36px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/20 text-slate-950">
              <Flame className="w-7 h-7 fill-slate-950 stroke-slate-950" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white block uppercase leading-none">
                SEMPER<span className="text-amber-500">IRON</span>
              </span>
              <span className="text-[10px] tracking-widest text-slate-400 font-bold uppercase">Design • Mobile Welding & Fab</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#services" className="hover:text-amber-400 transition-colors">Services</a>
            <a href="#portfolio" className="hover:text-amber-400 transition-colors">Work Gallery</a>
            <a href="#calculator" className="hover:text-amber-400 transition-colors">Cost Estimator</a>
            <a href="#certifications" className="hover:text-amber-400 transition-colors">Certifications</a>
            <a href="#coverage" className="hover:text-amber-400 transition-colors">Coverage Area</a>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={openQuoteModal}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold rounded-lg shadow-md hover:shadow-orange-500/25 transition-all text-sm flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              <span>Get Free Quote</span>
            </button>
          </div>
        </div>
      </nav>

      {}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-slate-950">
        {/* Background Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>AWS D1.1 Certified • Licensed & Fully Insured</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.1]">
                24/7 On-Site <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500">
                  Mobile Welding
                </span> & Metal Fabrication
              </h1>

              <p className="text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Heavy equipment repair, structural steel installation, high-pressure pipe welding, and custom architectural metalwork brought directly to your location. Fully equipped self-powered mobile rigs ready to deploy.
              </p>

              {/* Value Props Bullet Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 max-w-xl mx-auto lg:mx-0 text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Self-Powered Rigs</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Sub-60 Min Response</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>SMAW/GMAW/GTAW</span>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                <button 
                  onClick={openQuoteModal}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-base rounded-xl shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <FileText className="w-5 h-5" />
                  <span>Request Instant On-Site Quote</span>
                </button>
                <a 
href="tel:18092563749"
                  className="flex items-center justify-center gap-2 py-4 px-6 bg-transparent border border-slate-800 text-slate-200 text-sm lg:text-base font-bold whitespace-nowrap"
                >
                  <PhoneCall className="w-5 h-5 text-amber-400" />
                  <span>Call Dispatch (809) 256-3749</span>
                </a>
              </div>
            </div>

            {/* Hero Right Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl shadow-orange-950/30">
                <img 
                  src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1000&q=80" 
                  alt="Professional Welder at Work with Sparks"
                  className="w-full h-[440px] object-cover filter brightness-90 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                
                {/* Floating Metric Badge */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">Average On-Site Turnaround</p>
                    <p className="text-xl font-extrabold text-white">Under 2.5 Hours</p>
                  </div>
                  <div className="text-right">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-slate-300 font-medium">4.9/5 (180+ Field Reviews)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {}
      <section id="certifications" className="border-y border-slate-800/80 bg-slate-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
            Certified to Meet Stringent Industry & Structural Safety Codes
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-3 text-slate-300 font-black tracking-tight text-lg">
              <Award className="w-8 h-8 text-amber-500" />
              <span>AWS D1.1 STEEL</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 font-black tracking-tight text-lg">
              <ShieldCheck className="w-8 h-8 text-amber-500" />
              <span>OSHA 30 COMPLIANT</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 font-black tracking-tight text-lg">
              <Hammer className="w-8 h-8 text-amber-500" />
              <span>ASME SEC IX</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 font-black tracking-tight text-lg">
              <Layers className="w-8 h-8 text-amber-500" />
              <span>$2M COMMERCIAL INSURED</span>
            </div>
          </div>
        </div>
      </section>

      {}
      <section id="services" className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-amber-500 text-xs font-black uppercase tracking-widest block mb-2">Our Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Full-Spectrum Mobile Metalworking Solutions
            </h2>
            <p className="text-slate-400 mt-4 text-base">
              From heavy machinery steel reinforcement to delicate high-purity sanitary TIG welds, our mobile unit arrives fully geared for any job site challenge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Service Card 1 */}
            <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-8 transition-all hover:-translate-y-1 group">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl w-fit mb-6 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">24/7 Mobile Emergency Repair</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Rapid response roadside and jobsite repair for broken trailer hitches, chassis fractures, structural failures, and gate breakdowns.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" /> Self-Powered Rig Dispatch
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" /> All-Weather Field Capable
                </li>
              </ul>
            </div>

            {/* Service Card 2 */}
            <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-8 transition-all hover:-translate-y-1 group">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl w-fit mb-6 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Structural Steel Welding</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                AWS certified structural column modifications, floor joist reinforcements, roof truss framing, and moment connection welding.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" /> Full Penetration Grooves
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" /> Ultrasonic/Magnetic Test Ready
                </li>
              </ul>
            </div>

            {/* Service Card 3 */}
            <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-8 transition-all hover:-translate-y-1 group">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl w-fit mb-6 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <Wrench className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Heavy Equipment & Hardfacing</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Cracked boom repairs, excavator bucket hardfacing, bulldozer blade modifications, and heavy machinery structural plate replacements.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" /> High-Impact Wear Plates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" /> Pre/Post Weld Heat Controls
                </li>
              </ul>
            </div>

            {/* Service Card 4 */}
            <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-8 transition-all hover:-translate-y-1 group">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl w-fit mb-6 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Architectural Metal & Gates</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Custom metal railings, security window grilles, wrought iron driveway gates, floating staircases, and aesthetic metal features.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" /> Seamless Grind & Clean Finish
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" /> Ornamental Alloy Design
                </li>
              </ul>
            </div>

            {/* Service Card 5 */}
            <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-8 transition-all hover:-translate-y-1 group">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl w-fit mb-6 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <Flame className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Pipe & Pressure Vessel TIG</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Precision GTAW (TIG) welding on stainless steel, aluminum, and carbon steel process piping, pressure vessels, and tanks.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" /> Argon Back-Purging
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" /> ASME Code Quality
                </li>
              </ul>
            </div>

            {/* Service Card 6 */}
            <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-8 transition-all hover:-translate-y-1 group">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl w-fit mb-6 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <Hammer className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">On-Site Custom Fabrication</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Tailored metal cutting, gouging, fit-up, and field assembly for custom brackets, platforms, catwalks, and machinery guards.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" /> Plasma & Oxy-Fuel Cutting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" /> Precision Measurement
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {}
      <section id="calculator" className="py-20 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="text-amber-500 text-xs font-black uppercase tracking-widest block">Instant Budget Estimator</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                Calculate On-Site Project Cost
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Use our interactive dynamic estimator tool to get an instant ballpark idea of material, labor, and dispatch rates for your specific project requirements.
              </p>

              <div className="p-6 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Transparent Rate Structure</h4>
                    <p className="text-xs text-slate-400 mt-1">No hidden mileage surge fees within 40 miles of central hub. Clear hourly or fixed quote breakdowns before work commences.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Calculator Form Widget */}
            <div className="lg:col-span-7 bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-500" />
                <span>Interactive Cost Estimator</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Service Category</label>
                  <select 
                    value={estimatorData.serviceType}
                    onChange={(e) => setEstimatorData({...estimatorData, serviceType: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="repair">Mobile Repair / Patch Work</option>
                    <option value="structural">Structural Steel Beam Welding</option>
                    <option value="heavy_eq">Heavy Machinery Hardfacing</option>
                    <option value="tig_pipe">Sanitary TIG / Pipe Purging</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Base Metal Type</label>
                  <select 
                    value={estimatorData.metalType}
                    onChange={(e) => setEstimatorData({...estimatorData, metalType: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="carbon_steel">Carbon Steel</option>
                    <option value="stainless">Stainless Steel (+25%)</option>
                    <option value="aluminum">Structural Aluminum (+35%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Required On-Site Hours: <span className="text-amber-400 font-bold">{estimatorData.estimatedHours} hrs</span></label>
                  <input 
                    type="range" 
                    min="1" 
                    max="12" 
                    value={estimatorData.estimatedHours}
                    onChange={(e) => setEstimatorData({...estimatorData, estimatedHours: parseInt(e.target.value)})}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>1 Hour (Min)</span>
                    <span>6 Hours</span>
                    <span>12 Hours</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Urgency Level</label>
                  <select 
                    value={estimatorData.urgency}
                    onChange={(e) => setEstimatorData({...estimatorData, urgency: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="standard">Standard Schedule (1-3 Days)</option>
                    <option value="same_day">Same-Day Priority (+$150)</option>
                    <option value="emergency">24/7 Immediate Emergency (+$300)</option>
                  </select>
                </div>
              </div>

              {/* Generator Checkbox */}
              <div className="mb-6 flex items-center gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
                <input 
                  type="checkbox" 
                  id="powerCheck"
                  checked={estimatorData.requiresGenPower}
                  onChange={(e) => setEstimatorData({...estimatorData, requiresGenPower: e.target.checked})}
                  className="w-4 h-4 rounded accent-amber-500"
                />
                <label htmlFor="powerCheck" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Requires mobile rig 12kW generator power supply (+$75 flat)
                </label>
              </div>

              {/* Calculated Result Box */}
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Estimated Investment</span>
                  <span className="text-3xl font-black text-amber-400">${calculatedCost} <span className="text-xs font-normal text-slate-400">USD (Approx.)</span></span>
                </div>
                <button 
                  onClick={handleBookEstimate}
                  className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-sm transition-colors"
                >
                  Book This Estimate
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {}
      <section id="portfolio" className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-amber-500 text-xs font-black uppercase tracking-widest block mb-2">Proven Track Record</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                Recent On-Site Metalwork
              </h2>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Projects' },
                { id: 'repair', label: 'Repairs' },
                { id: 'structural', label: 'Structural' },
                { id: 'architectural', label: 'Architectural' },
                { id: 'heavy_equipment', label: 'Heavy Equipment' }
              ].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => setSelectedServiceFilter(btn.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    selectedServiceFilter === btn.id
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div 
                key={project.id} 
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col group"
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-slate-800">
                    {project.category.replace('_', ' ')}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" /> {project.location}
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-1.5">
                    {project.specs.map((spec, i) => (
                      <span key={i} className="text-[10px] bg-slate-950 px-2 py-1 rounded text-slate-300 font-mono border border-slate-800">
                        ✓ {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {}
      <section id="coverage" className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-amber-500 text-xs font-black uppercase tracking-widest block">Deployment Fleet</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                Mobile Welding Unit Capabilities
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our custom Ford F-550 heavy service truck is outfitted with industrial Miller welding generators, plasma cutters, torch setups, and structural fit-up tooling to tackle any remote job site.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-amber-400 font-bold text-sm mb-1">12kW Onboard Diesel Power</h4>
                  <p className="text-xs text-slate-400">Independent power for heavy dual-shield flux-core arc welding.</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-amber-400 font-bold text-sm mb-1">CNC Plasma Cutting</h4>
                  <p className="text-xs text-slate-400">On-site precision steel plate cutting up to 1-inch thickness.</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-amber-400 font-bold text-sm mb-1">50 Mile Radius Coverage</h4>
                  <p className="text-xs text-slate-400">Rapid emergency dispatch across Metro and surrounding counties.</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-amber-400 font-bold text-sm mb-1">Compressed Air Setup</h4>
                  <p className="text-xs text-slate-400">Air carbon arc gouging for fast weld joint preparation.</p>
                </div>
              </div>
            </div>

            {/* Interactive Service Area Map Graphic Placeholder */}
            <div className="lg:col-span-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
              <div className="h-80 w-full rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-6 relative">
                <MapPin className="w-12 h-12 text-amber-500 animate-bounce mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">Central Metro Service Area Radius</h3>
                <p className="text-xs text-slate-400 max-w-md">
                  Dispatched from Central Hub • Serving Industrial Parks, Construction Sites, Quarries, and Commercial Properties.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {["North County", "South Industrial Zone", "Downtown Metro", "East Logistics Park", "West Valley"].map((region, idx) => (
                    <span key={idx} className="text-xs bg-slate-950 px-3 py-1 rounded-full text-slate-300 border border-slate-800">
                      📍 {region}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {}
      <section className="py-24 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-amber-500 text-xs font-black uppercase tracking-widest block mb-2">Got Questions?</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-white hover:text-amber-400 transition-colors"
                >
                  <span className="text-base">{faq.q}</span>
                  {activeFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-amber-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>

                {activeFaq === index && (
                  <div className="px-6 pb-6 text-sm text-slate-400 leading-relaxed border-t border-slate-800/50 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="py-20 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
            Need On-Site Welding Done Right Today?
          </h2>
          <p className="text-slate-950 font-bold max-w-2xl mx-auto text-base sm:text-lg">
            Our certified mobile fabrication truck is fueled and ready to dispatch to your location now.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={openQuoteModal}
              className="w-full sm:w-auto px-8 py-4 bg-slate-950 text-white hover:bg-slate-900 font-black rounded-xl shadow-2xl transition-all flex items-center justify-center gap-3 text-base"
            >
              <Calculator className="w-5 h-5 text-amber-400" />
              <span>Get Instant Free Quote</span>
            </button>
            <a 
href="tel:18092563749"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-sm font-black uppercase tracking-wider rounded-xl shadow-lg transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Emergency Dispatch: (809) 256-3749</span>
            </a>
          </div>
        </div>
      </section>

      {}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg text-slate-950">
              <Flame className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <span className="text-base font-black text-white uppercase tracking-wider block">
                SEMPER<span className="text-amber-500">IRON</span> DESIGN
              </span>
              <span>© {new Date().getFullYear()} Semper Iron Design. AWS Certified.</span>
            </div>
          </div>

          <div className="flex gap-6 text-slate-400 font-medium">
            <a href="#services" className="hover:text-amber-400">Services</a>
            <a href="#portfolio" className="hover:text-amber-400">Portfolio</a>
            <a href="#calculator" className="hover:text-amber-400">Estimator</a>
            <a href="#certifications" className="hover:text-amber-400">Safety & Codes</a>
          </div>
        </div>
      </footer>

      {}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl">
            
            <button 
              onClick={() => setIsQuoteModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/50"
            >
              <X className="w-5 h-5" />
            </button>

            {docResult ? (
              <div className="space-y-5">
                <div className="mb-2">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block mb-1"><Receipt className="w-3.5 h-3.5 inline mr-1" />Document Generated</span>
                  <h3 className="text-2xl font-black text-white uppercase">{DOC_TYPES[docResult.type].title}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    #{docResult.number} • {docResult.date}
                    {docResult.dueDate ? ` • Due: ${docResult.dueDate}` : ''} — prepared for {docResult.customer.fullName}
                  </p>
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="divide-y divide-slate-800 text-sm">
                    {docResult.items.map((it, i) => (
                      <div key={i} className="flex justify-between px-5 py-3 gap-4">
                        <span className="text-slate-400 pr-4">
                          {it.description}
                          <span className="text-slate-500"> — {it.qty} {it.unit} × {money(it.price)}</span>
                        </span>
                        <span className="text-white font-semibold shrink-0">{money(it.qty * it.price)}</span>
                      </div>
                    ))}
                    {docResult.type === 'invoice' && (
                      <>
                        <div className="flex justify-between px-5 py-3">
                          <span className="text-slate-400 pr-4">Subtotal</span>
                          <span className="text-white font-semibold shrink-0">{money(docResult.subtotal)}</span>
                        </div>
                        <div className="flex justify-between px-5 py-3">
                          <span className="text-slate-400 pr-4">Tax ({docResult.taxRate}%)</span>
                          <span className="text-white font-semibold shrink-0">{money(docResult.tax)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between px-5 py-4 bg-amber-500/10 items-center">
                      <span className="text-white font-black uppercase tracking-wide">{docResult.type === 'invoice' ? 'Amount Due' : 'Document Total'}</span>
                      <span className="text-amber-400 text-xl font-black">{money(docResult.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Datos de pago visibles en pantalla: banco, cuenta y cédula */}
                <div className="bg-slate-950 rounded-xl border border-amber-500/30 overflow-hidden">
                  <div className="px-5 py-3 border-b border-amber-500/20 bg-amber-500/5">
                    <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest">Payment — Bank Transfer / Deposit</span>
                  </div>
                  <div className="px-5 py-3 text-sm space-y-1">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">Bank</span>
                      <span className="text-white font-semibold">{BANK.bank}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">Account #</span>
                      <span className="text-white font-semibold">{BANK.accountNumber}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">Name</span>
                      <span className="text-white font-semibold">{BANK.accountName}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">ID (Cédula)</span>
                      <span className="text-white font-semibold">{BANK.identification}</span>
                    </div>
                    <div className="pt-2 mt-1 border-t border-slate-800 text-xs text-amber-300/90 leading-relaxed">
                      {DOC_TYPES[docResult.type].payTerms} Include the {DOC_TYPES[docResult.type].numberPrefix} number as payment reference.
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Send this {DOC_TYPES[docResult.type].label.toLowerCase()} to your client as a PDF or via WhatsApp.
                  The PDF opens the browser print dialog — choose "Save as PDF" as destination.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button
                    onClick={sendViaWhatsApp}
                    className="flex-1 py-3.5 bg-green-600 hover:bg-green-500 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Send via WhatsApp
                  </button>
                </div>

                <button
                  onClick={() => setDocResult(null)}
                  className="w-full py-2 text-xs text-slate-400 hover:text-white font-bold transition-colors"
                >
                  ← Back to {DOC_TYPES[docType].label} form
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block mb-1">Business Document Generator</span>
                  <h3 className="text-2xl font-black text-white uppercase">Estimate • Quote • Invoice</h3>
                  <p className="text-xs text-slate-400 mt-1">Create a professional, print-ready document for your client.</p>
                </div>

                <form onSubmit={handleDocSubmit} className="space-y-4">

                  {/* Tipo de documento */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Document Type</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {Object.keys(DOC_TYPES).map((key) => (
                        <button
                          type="button"
                          key={key}
                          onClick={() => setDocType(key)}
                          className={`px-3 py-3 rounded-xl border text-[11px] font-bold uppercase tracking-wide transition-all ${
                            docType === key
                              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          {DOC_TYPES[key].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Full Name *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Phone Number *</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="(555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email (for delivery)</label>
                    <input 
                      type="email"
                      placeholder="john.doe@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Site Location / Address *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="123 Industrial Pkwy, City, State"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Líneas de ítems */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Line Items</label>
                    <div className="space-y-2">
                      {docItems.map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <input
                            value={item.description}
                            onChange={(e) => updateDocItem(item.id, 'description', e.target.value)}
                            placeholder={`Item ${idx + 1} description (e.g. Structural beam weld)`}
                            className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                          />
                          <input
                            type="number" min="0" step="1"
                            value={item.qty}
                            onChange={(e) => updateDocItem(item.id, 'qty', e.target.value)}
                            className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-2.5 text-sm text-white text-center focus:outline-none focus:border-amber-500"
                          />
                          <select
                            value={item.unit}
                            onChange={(e) => updateDocItem(item.id, 'unit', e.target.value)}
                            className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                          >
                            <option value="hr">hr</option>
                            <option value="job">job</option>
                            <option value="ft">ft</option>
                            <option value="lb">lb</option>
                            <option value="unit">unit</option>
                            <option value="flat">flat</option>
                          </select>
                          <input
                            type="number" min="0" step="0.01"
                            value={item.price}
                            onChange={(e) => updateDocItem(item.id, 'price', e.target.value)}
                            placeholder="Price"
                            className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2 py-2.5 text-sm text-white text-right focus:outline-none focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeDocItem(item.id)}
                            disabled={docItems.length === 1}
                            className="p-2.5 text-slate-500 hover:text-red-400 disabled:opacity-30 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Remove line"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addDocItem}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add line item
                    </button>
                  </div>

                  {/* Impuestos (solo factura) */}
                  {docType === 'invoice' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Tax Rate (%)</label>
                      <input 
                        type="number" min="0" max="30" step="0.1"
                        value={taxRate}
                        onChange={(e) => setTaxRate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}

                  {/* Total en vivo */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 text-sm">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal</span>
                      <span className="text-white font-semibold">{money(itemsTotal)}</span>
                    </div>
                    {docType === 'invoice' && (
                      <div className="flex justify-between text-slate-400">
                        <span>Tax ({taxRate}%)</span>
                        <span className="text-white font-semibold">{money(itemsTax)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-300 font-bold border-t border-slate-800 pt-2 mt-1">
                      <span className="uppercase tracking-wide">{docType === 'invoice' ? 'Amount Due' : 'Document Total'}</span>
                      <span className="text-amber-400">{money(grandTotal)}</span>
                    </div>
                  </div>

                  {/* Datos de pago visibles en pantalla: banco, cuenta y cédula */}
                  <div className="bg-slate-950 rounded-xl border border-amber-500/30 p-4 text-xs space-y-1">
                    <div className="font-black text-amber-400 uppercase tracking-widest text-[11px] mb-1">Payment — Bank Transfer / Deposit</div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">{BANK.bank} · Account</span>
                      <span className="text-white font-bold">{BANK.accountNumber}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">Name</span>
                      <span className="text-white font-semibold">{BANK.accountName}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">ID (Cédula)</span>
                      <span className="text-white font-semibold">{BANK.identification}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Job Description / Notes (Optional)</label>
                    <textarea 
                      rows={2}
                      placeholder="Scope, metal specs, access conditions, payment notes..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black uppercase tracking-wider text-sm rounded-xl shadow-xl transition-all"
                  >
                    Generate {DOC_TYPES[docType].label}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

    </div>

      {/* Documento imprimible: presupuesto, cotización o factura (solo visible al imprimir/guardar PDF) */}
      {docResult && (
        <div
          id="doc-print-doc"
          className="hidden print:block"
          style={{ background: '#ffffff', color: '#0f172a', fontFamily: 'Arial, Helvetica, sans-serif', padding: '36px 42px' }}
        >
          {/* Cabecera de la empresa */}
          <div style={{ borderBottom: '3px solid #f59e0b', paddingBottom: '16px', marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#f59e0b', color: '#0f172a', fontWeight: '900', borderRadius: '8px', padding: '8px', display: 'flex' }}>
                  <Flame style={{ width: 22, height: 22 }} />
                </div>
                <span style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.5px' }}>
                  SEMPER<span style={{ color: '#f59e0b' }}>IRON</span> DESIGN
                </span>
              </div>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#64748b', marginTop: '4px' }}>
                Mobile Welding & Fabrication
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#334155', lineHeight: '1.7' }}>
              <div style={{ fontWeight: '700' }}>Mobile Dispatch {COMPANY.phone}</div>
              <div>{COMPANY.email}</div>
              <div>{COMPANY.address} — 50 mi radius</div>
              <div>{COMPANY.tagline}</div>
            </div>
          </div>

          {/* Título del documento (adaptado: presupuesto / cotización / factura) y datos */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '18px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {DOC_TYPES[docResult.type].title}
              </h1>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
                {DOC_TYPES[docResult.type].label} — On-Site Welding & Metal Fabrication
              </div>
            </div>
            <div style={{ fontSize: '12px', textAlign: 'right', lineHeight: '1.7' }}>
              <div><strong>{DOC_TYPES[docResult.type].numberPrefix}:</strong> {docResult.number}</div>
              <div><strong>Date:</strong> {docResult.date}</div>
              {docResult.dueDate && <div><strong>Due:</strong> {docResult.dueDate}</div>}
            </div>
          </div>

          {/* Datos del cliente */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', marginBottom: '20px', fontSize: '13px', lineHeight: '1.7' }}>
            <div style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', color: '#64748b', marginBottom: '6px' }}>Prepared For</div>
            <div><strong>{docResult.customer.fullName}</strong>{docResult.customer.email ? ` — ${docResult.customer.email}` : ''}</div>
            <div>Phone: {docResult.customer.phone}</div>
            <div>Job Site: {docResult.customer.address}</div>
          </div>

          {/* Tabla de líneas de ítems */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '18px' }}>
            <thead>
              <tr>
                <th style={printTh}>Description</th>
                <th style={{ ...printTh, textAlign: 'right' }}>Qty × Rate</th>
                <th style={{ ...printTh, textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {docResult.items.map((it, i) => (
                <tr key={i}>
                  <td style={printTd}>
                    <div style={{ fontWeight: '700' }}>{it.description}</div>
                  </td>
                  <td style={{ ...printTd, textAlign: 'right' }}>{it.qty} × {money(it.price)} / {it.unit}</td>
                  <td style={{ ...printTd, textAlign: 'right', fontWeight: '700' }}>{money(it.qty * it.price)}</td>
                </tr>
              ))}
              {docResult.type === 'invoice' && (
                <>
                  <tr>
                    <td style={{ ...printTd, textAlign: 'right', fontWeight: '600', borderTop: '1px solid #e2e8f0' }} colSpan={2}>Subtotal</td>
                    <td style={{ ...printTd, textAlign: 'right', fontWeight: '700', borderTop: '1px solid #e2e8f0' }}>{money(docResult.subtotal)}</td>
                  </tr>
                  <tr>
                    <td style={{ ...printTd, textAlign: 'right', fontWeight: '600' }} colSpan={2}>Tax ({docResult.taxRate}%)</td>
                    <td style={{ ...printTd, textAlign: 'right', fontWeight: '700' }}>{money(docResult.tax)}</td>
                  </tr>
                </>
              )}
              <tr>
                <td style={{ ...printTd, borderTop: '2px solid #f59e0b', fontWeight: '900', fontSize: '14px' }} colSpan={2}>
                  {docResult.type === 'invoice' ? 'Amount Due' : 'Document Total'}
                </td>
                <td style={{ ...printTd, borderTop: '2px solid #f59e0b', textAlign: 'right', fontSize: '18px', fontWeight: '900' }}>{money(docResult.total)}</td>
              </tr>
            </tbody>
          </table>

          {/* Notas del trabajo */}
          {docResult.description && (
            <div style={{ fontSize: '12px', color: '#334155', marginBottom: '16px', lineHeight: '1.6' }}>
              <div style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', marginBottom: '4px' }}>Job Notes</div>
              <div>{docResult.description}</div>
            </div>
          )}

          {/* Datos de pago: cuenta bancaria y condiciones de adelanto/entrega */}
          <div style={{ border: '1px solid #f59e0b', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', background: '#fffbeb' }}>
            <div style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', color: '#92400e', marginBottom: '8px' }}>Payment — Bank Transfer / Deposit</div>
            <div style={{ fontSize: '13px', lineHeight: '1.8', color: '#0f172a' }}>
              <div><strong>Bank:</strong> {BANK.bank} &nbsp;·&nbsp; <strong>Account #:</strong> {BANK.accountNumber}</div>
              <div><strong>Name:</strong> {BANK.accountName}</div>
              <div><strong>ID (Cédula):</strong> {BANK.identification}</div>
              <div style={{ color: '#92400e', fontWeight: '600', fontSize: '12px', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #f59e0b' }}>
                {DOC_TYPES[docResult.type].payTerms} Please include the {DOC_TYPES[docResult.type].numberPrefix} number as payment reference.
              </div>
            </div>
          </div>

          {/* Términos y condiciones adaptados por tipo de documento */}
          <div style={{ borderTop: '2px solid #f59e0b', paddingTop: '12px', fontSize: '11px', color: '#64748b', lineHeight: '1.7' }}>
            <strong style={{ color: '#334155' }}>Terms:</strong> {DOC_TYPES[docResult.type].validity}
            <div style={{ marginTop: '30px', textAlign: 'center', fontWeight: '700', color: '#0f172a', letterSpacing: '2px' }}>
              — {COMPANY.name} —
            </div>
            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              {DOC_TYPES[docResult.type].footer}
            </div>
          </div>
        </div>
      )}
    {/* Widget flotante de captura de leads: botón fijo con formulario de visita/cotización */}
    <LeadWidget />
    </>
  );
}