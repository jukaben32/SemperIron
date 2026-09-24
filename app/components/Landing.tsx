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
  Layers,
  FileText,
  DollarSign,
  Hammer
} from 'lucide-react';

// Iconos de marcas sociales (SVG inline porque lucide-react no incluye marcas)
const FbIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const IgIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TiktokIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

export default function App() {
  // Navigation & Modal states
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('all');
  const [activeFaq, setActiveFaq] = useState(null);

  // Controla el formulario de "Solicitar cotización" (widget de leads de la landing)
  const [quoteRequestOpen, setQuoteRequestOpen] = useState(false);
  const [leadPrefill, setLeadPrefill] = useState('');

  // Estimator Form state
  const [estimatorData, setEstimatorData] = useState({
    serviceType: 'repair',
    metalType: 'carbon_steel',
    urgency: 'standard',
    estimatedHours: 3,
    requiresGenPower: false
  });

  const [calculatedCost, setCalculatedCost] = useState(0);

  // Etiquetas y tarifas usadas por el estimador de costos
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

  // Abre el formulario de "Solicitar cotización" con el resumen del estimador prellenado,
  // para que el visitante envíe el lead (el generador de documentos vive en el panel /admin).
  const handleBookEstimateRequest = () => {
    const est = estimatorData;
    const serviceLabel = SERVICE_LABELS[est.serviceType] || 'Mobile Repair / Patch Work';
    const metal = METAL_LABELS[est.metalType] || METAL_LABELS.carbon_steel;
    const urgency = URGENCY_FEES[est.urgency] || URGENCY_FEES.standard;
    const quote = computeQuote(est, serviceLabel);

    const msg =
      `Solicito una cotización para: ${serviceLabel} en ${metal.label}.\n` +
      `Horas estimadas: ${est.estimatedHours} hrs.\n` +
      `Urgencia: ${urgency.label}.\n` +
      (est.requiresGenPower ? 'Incluye generador móvil de 12kW (+$75).\n' : '') +
      `Total estimado: $${Math.round(quote.total)} USD.`;
    setLeadPrefill(msg);
    setQuoteRequestOpen(true);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      
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
              onClick={() => setQuoteRequestOpen(true)}
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
              onClick={() => setQuoteRequestOpen(true)}
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
                  onClick={() => setQuoteRequestOpen(true)}
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
                  onClick={handleBookEstimateRequest}
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
              onClick={() => setQuoteRequestOpen(true)}
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

      {/* Redes sociales al final de la página */}
      <section className="bg-slate-900 border-t border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-black text-white uppercase tracking-wide">
            Síguenos en <span className="text-amber-500">nuestras redes sociales</span>
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a
              href="https://web.facebook.com/miltonrafael.semperortiz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-amber-500 hover:text-amber-400"
            >
              <FbIcon className="w-5 h-5" />
              Facebook
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-amber-500 hover:text-amber-400"
            >
              <IgIcon className="w-5 h-5" />
              Instagram
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-amber-500 hover:text-amber-400"
            >
              <TiktokIcon className="w-5 h-5" />
              TikTok
            </a>
          </div>
        </div>
      </section>

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

    </div>

    {/* Widget flotante de captura de leads: botón fijo con formulario de visita/cotización */}
    <LeadWidget open={quoteRequestOpen} setOpen={setQuoteRequestOpen} initialMessage={leadPrefill} />
    </>
  );
}