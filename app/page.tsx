'use client';
import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Hola, bienvenido a nuestra inmobiliaria. Tenemos apartamentos, chalets y estudios en la Costa Blanca desde 59.000 EUR. En que puedo ayudarle?'
      }]);
    }
  }, [isOpen, messages.length]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Disculpe, ha habido un error. Intentelo de nuevo.' }]);
    }
    setLoading(false);
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-xl hover:bg-indigo-700 transition-all hover:scale-110 z-50"
        aria-label="Abrir chat"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 animate-fade-in" style={{ height: '500px' }}>
      <div className="bg-indigo-600 text-white px-4 py-3 rounded-t-2xl flex justify-between items-center">
        <div>
          <div className="font-bold text-sm">Asistente Inmobiliario</div>
          <div className="text-xs text-indigo-200">En linea - Respuesta inmediata</div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white text-xl leading-none">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-800 rounded-bl-md'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Escriba su mensaje..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-indigo-500 text-gray-800"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}

function PricingCard({ name, price, features, popular }: { name: string; price: number; features: string[]; popular?: boolean }) {
  return (
    <div className={`rounded-2xl p-8 ${popular ? 'bg-indigo-600 text-white ring-4 ring-indigo-300 scale-105' : 'bg-white text-gray-800 border border-gray-200'} shadow-lg`}>
      {popular && <div className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2">Mas popular</div>}
      <h3 className="text-xl font-bold mb-2">{name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-extrabold">{price}</span>
        <span className={`text-sm ${popular ? 'text-indigo-200' : 'text-gray-500'}`}> EUR/mes</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${popular ? 'text-indigo-200' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <a
        href={`https://wa.me/34620300647?text=Hola%2C%20quiero%20info%20sobre%20InmoBot%20AI%20plan%20${name}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-colors ${
          popular
            ? 'bg-white text-indigo-600 hover:bg-indigo-50'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        Solicitar demo
      </a>
    </div>
  );
}

export default function Home() {
  const [showContact, setShowContact] = useState(false);
  const [contactForm, setContactForm] = useState({ nombre: '', email: '', telefono: '', inmobiliaria: '' });
  const [sent, setSent] = useState(false);

  async function handleContact(e: React.FormEvent) {
    e.preventDefault();
    try {
      const text = `LEAD INMOBOT AI\nNombre: ${contactForm.nombre}\nEmail: ${contactForm.email}\nTel: ${contactForm.telefono}\nInmobiliaria: ${contactForm.inmobiliaria}`;
      await fetch(`https://api.telegram.org/bot8451701836:AAHnoYbzI14jnyCVtfx05iuA_CfkYKwPtX8/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: '1802913178', text }),
      });
    } catch { /* silent */ }
    setSent(true);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
        <nav className="relative max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-extrabold text-xl tracking-tight">InmoBot<span className="text-indigo-300">.AI</span></div>
          <div className="flex gap-4 items-center">
            <a href="#precios" className="text-sm text-indigo-200 hover:text-white transition-colors">Precios</a>
            <a href="#demo" className="text-sm text-indigo-200 hover:text-white transition-colors">Demo</a>
            <button
              onClick={() => setShowContact(true)}
              className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors"
            >
              Contactar
            </button>
          </div>
        </nav>

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-block bg-indigo-500/30 text-indigo-200 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-6">
              Inteligencia Artificial para Inmobiliarias
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Tu agente virtual que atiende clientes <span className="text-indigo-300">24/7</span>
            </h1>
            <p className="text-lg text-indigo-200 mb-8 leading-relaxed">
              InmoBot AI responde consultas, agenda visitas y captura leads mientras tu equipo descansa.
              Instalacion en 24 horas. Sin contratos de permanencia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#demo" className="bg-white text-indigo-700 px-8 py-4 rounded-xl font-bold text-center hover:bg-indigo-50 transition-colors shadow-lg">
                Ver demo en vivo
              </a>
              <a href="#precios" className="border-2 border-indigo-400 text-white px-8 py-4 rounded-xl font-bold text-center hover:bg-indigo-800 transition-colors">
                Ver precios
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { n: '24/7', l: 'Disponibilidad' },
            { n: '<3s', l: 'Tiempo respuesta' },
            { n: '95%', l: 'Consultas resueltas' },
            { n: '+40%', l: 'Mas leads capturados' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-extrabold text-indigo-600">{s.n}</div>
              <div className="text-sm text-gray-500 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-extrabold text-center mb-4">Como funciona</h2>
        <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">Configuramos tu chatbot con tus propiedades reales, tus datos de contacto y tu estilo de atencion</p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Atencion automatica',
              desc: 'Responde preguntas sobre propiedades, precios, zonas y disponibilidad. Aprende de tu catalogo real.',
              icon: '1'
            },
            {
              title: 'Captura de leads',
              desc: 'Obtiene nombre, telefono y email de cada visitante interesado. Te llega al instante por Telegram o email.',
              icon: '2'
            },
            {
              title: 'Agenda visitas',
              desc: 'Programa citas con clientes directamente. Sincroniza con tu calendario. Sin llamadas perdidas.',
              icon: '3'
            },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-extrabold text-xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo section */}
      <section id="demo" className="bg-indigo-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-center mb-4">Pruebalo ahora</h2>
          <p className="text-gray-500 text-center mb-8 max-w-xl mx-auto">
            Haz clic en el boton de chat en la esquina inferior derecha para probar una demo real del chatbot inmobiliario
          </p>
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-6xl mb-4">&#x1f4ac;</div>
              <h3 className="font-bold text-xl mb-2">Demo interactiva</h3>
              <p className="text-gray-500 text-sm mb-6">Pregunta por propiedades, precios, zonas o agenda una visita</p>
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                {['Que pisos teneis?', 'Quiero ver un chalet', 'Precios en Orihuela', 'Agendar visita'].map((q, i) => (
                  <div key={i} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium border border-indigo-200">
                    &quot;{q}&quot;
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-extrabold text-center mb-12">Para que tipo de inmobiliaria</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { title: 'Agencias de venta', desc: 'Muestra tu catalogo de propiedades, filtra por precio/zona/tipo y captura leads cualificados automaticamente.' },
            { title: 'Alquiler vacacional', desc: 'Responde sobre disponibilidad, precios por temporada, check-in/out y normas de la casa. Reservas directas.' },
            { title: 'Promotoras', desc: 'Presenta tu obra nueva, planos, materiales y plazos de entrega. Agenda visitas al piso piloto.' },
            { title: 'Administracion de fincas', desc: 'Atiende consultas de propietarios sobre cuotas, actas, incidencias y mantenimiento 24/7.' },
          ].map((uc, i) => (
            <div key={i} className="flex gap-4 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                {String.fromCharCode(65 + i)}
              </div>
              <div>
                <h3 className="font-bold mb-1">{uc.title}</h3>
                <p className="text-gray-500 text-sm">{uc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="bg-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-center mb-4">Precios simples, sin letra pequena</h2>
          <p className="text-gray-500 text-center mb-12">Sin permanencia. Setup en 24h. Cancela cuando quieras.</p>
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <PricingCard
              name="Starter"
              price={79}
              features={[
                'Chatbot en tu web',
                'Hasta 50 propiedades',
                '500 conversaciones/mes',
                'Notificaciones por email',
                'Soporte por email',
                'Setup: 149 EUR (unico pago)',
              ]}
            />
            <PricingCard
              name="Pro"
              price={149}
              popular
              features={[
                'Todo de Starter +',
                'Propiedades ilimitadas',
                'Conversaciones ilimitadas',
                'Telegram + WhatsApp',
                'Agenda de visitas',
                'Dashboard de analytics',
                'Setup: 299 EUR (unico pago)',
              ]}
            />
            <PricingCard
              name="Agencia"
              price={249}
              features={[
                'Todo de Pro +',
                'Multi-idioma (ES/EN/FR/DE)',
                'CRM integrado',
                'API personalizada',
                'Widget personalizable',
                'Soporte prioritario',
                'Setup: 499 EUR (unico pago)',
              ]}
            />
          </div>
        </div>
      </section>

      {/* ROI calculator */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 md:p-12 text-white">
          <h2 className="text-3xl font-extrabold mb-6 text-center">Calcula tu retorno</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-extrabold">3</div>
              <div className="text-indigo-200 mt-2">leads extra al mes con chatbot</div>
              <div className="text-sm text-indigo-300 mt-1">(estimacion conservadora)</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold">1</div>
              <div className="text-indigo-200 mt-2">venta extra cada 4 meses</div>
              <div className="text-sm text-indigo-300 mt-1">(con 3 leads/mes, 8% conversion)</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold">3.000+</div>
              <div className="text-indigo-200 mt-2">EUR de comision por venta</div>
              <div className="text-sm text-indigo-300 mt-1">(3% sobre 100K EUR)</div>
            </div>
          </div>
          <p className="text-center text-indigo-200 mt-8 text-sm">
            Coste del chatbot: 149 EUR/mes = 596 EUR en 4 meses. Retorno: 3.000+ EUR = <span className="text-white font-bold">ROI de 400%</span>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-extrabold text-center mb-12">Preguntas frecuentes</h2>
        {[
          { q: 'Cuanto tarda la instalacion?', a: '24 horas. Te damos un codigo que pegas en tu web y listo. Nosotros configuramos todo con tus propiedades reales.' },
          { q: 'Necesito conocimientos tecnicos?', a: 'No. Solo necesitas copiar y pegar una linea de codigo en tu web. Si usas WordPress, Wix o similar, te lo instalamos nosotros.' },
          { q: 'Puedo personalizar las respuestas?', a: 'Si. Configuramos el chatbot con tu catalogo, tus precios, tus zonas y tu estilo de comunicacion. Cada chatbot es unico.' },
          { q: 'Que pasa si un cliente hace una pregunta compleja?', a: 'El chatbot deriva la consulta a tu equipo via Telegram o email con todos los datos del cliente. Nunca pierde un lead.' },
          { q: 'Hay permanencia?', a: 'No. Mes a mes. Si no te convence, cancelas y ya esta. Sin penalizaciones.' },
        ].map((faq, i) => (
          <details key={i} className="group mb-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <summary className="px-6 py-4 cursor-pointer font-bold text-gray-800 flex justify-between items-center">
              {faq.q}
              <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-6 pb-4 text-gray-500 text-sm">{faq.a}</div>
          </details>
        ))}
      </section>

      {/* CTA */}
      <section className="bg-indigo-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Empieza a capturar leads hoy</h2>
          <p className="text-indigo-300 mb-8">Prueba gratis durante 7 dias. Sin tarjeta de credito.</p>
          <button
            onClick={() => setShowContact(true)}
            className="bg-white text-indigo-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Solicitar demo gratuita
          </button>
          <p className="text-indigo-400 text-sm mt-4">O llama al +34 620 300 647</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-bold text-white">InmoBot<span className="text-indigo-400">.AI</span> by Secretium</div>
          <div className="text-sm">Molina de Segura, Murcia | +34 620 300 647 | inmobancamurcia@gmail.com</div>
        </div>
      </footer>

      {/* Contact modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowContact(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-8" onClick={e => e.stopPropagation()}>
            {sent ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">&#x2705;</div>
                <h3 className="text-xl font-bold mb-2">Solicitud enviada</h3>
                <p className="text-gray-500">Te contactaremos en menos de 24 horas</p>
                <button onClick={() => { setShowContact(false); setSent(false); }} className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">Cerrar</button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-6">Solicitar demo gratuita</h3>
                <form onSubmit={handleContact} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    required
                    value={contactForm.nombre}
                    onChange={e => setContactForm(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-gray-800"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={contactForm.email}
                    onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-gray-800"
                  />
                  <input
                    type="tel"
                    placeholder="Telefono"
                    required
                    value={contactForm.telefono}
                    onChange={e => setContactForm(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-gray-800"
                  />
                  <input
                    type="text"
                    placeholder="Nombre de tu inmobiliaria"
                    value={contactForm.inmobiliaria}
                    onChange={e => setContactForm(prev => ({ ...prev, inmobiliaria: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-gray-800"
                  />
                  <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                    Solicitar demo gratis
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Chat widget */}
      <ChatDemo />
    </main>
  );
}
