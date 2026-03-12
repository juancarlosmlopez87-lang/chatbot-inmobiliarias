import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

const SYSTEM_PROMPT = `Eres el asistente virtual de una inmobiliaria en la Costa Blanca, España.
Tu trabajo es:
1. Responder preguntas sobre propiedades disponibles
2. Agendar visitas (pide nombre, telefono, fecha preferida)
3. Dar informacion sobre la zona (playas, servicios, colegios, transporte)
4. Capturar leads (siempre intenta conseguir nombre y telefono)
5. Ser amable, profesional y eficiente

PROPIEDADES DE EJEMPLO (demo):
- Apartamento 2 hab en Orihuela Costa, 89.000 EUR, 65m2, piscina comunitaria, 300m playa
- Chalet 3 hab en Campoamor, 195.000 EUR, 120m2, jardin privado, garage
- Estudio en Torrevieja, 59.000 EUR, 35m2, reformado, vistas al mar
- Atico 2 hab en Pilar de la Horadada, 145.000 EUR, 80m2, terraza 30m2, piscina

Si el usuario pregunta algo que no sabes, di que un agente se pondra en contacto.
Responde SIEMPRE en español. Respuestas cortas y directas (max 3 frases).
NO uses emojis. NO uses markdown.`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: Request) {
  try {
    const { messages, config } = await request.json();

    if (!GROQ_API_KEY) {
      // Demo mode without API key - return scripted responses
      return NextResponse.json({
        message: getDemoResponse(messages),
        demo: true,
      });
    }

    const systemPrompt = config?.systemPrompt || SYSTEM_PROMPT;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10), // Last 10 messages for context
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq error:', error);
      return NextResponse.json({
        message: getDemoResponse(messages),
        demo: true,
      });
    }

    const data = await response.json();
    return NextResponse.json({
      message: data.choices[0].message.content,
      demo: false,
    });
  } catch {
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}

function getDemoResponse(messages: Message[]): string {
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';

  if (lastMsg.includes('hola') || lastMsg.includes('buenas') || messages.length <= 1) {
    return 'Bienvenido a nuestra inmobiliaria. Tenemos apartamentos, chalets y estudios en la Costa Blanca desde 59.000 EUR. Que tipo de propiedad busca?';
  }
  if (lastMsg.includes('precio') || lastMsg.includes('cuanto') || lastMsg.includes('barato')) {
    return 'Tenemos propiedades desde 59.000 EUR (estudios) hasta 195.000 EUR (chalets). El mas popular es el apartamento de 2 habitaciones en Orihuela Costa por 89.000 EUR con piscina y a 300m de la playa. Le interesa?';
  }
  if (lastMsg.includes('visita') || lastMsg.includes('ver') || lastMsg.includes('cuando')) {
    return 'Perfecto, puedo agendarle una visita. Necesito su nombre y telefono para confirmar la cita. Que dia le vendria bien?';
  }
  if (lastMsg.includes('playa') || lastMsg.includes('zona') || lastMsg.includes('donde')) {
    return 'Nuestras propiedades estan en la Costa Blanca sur: Orihuela Costa, Campoamor, Torrevieja y Pilar de la Horadada. Todas a menos de 500m de la playa, con supermercados, restaurantes y transporte cerca.';
  }
  if (lastMsg.includes('habitacion') || lastMsg.includes('grande') || lastMsg.includes('familia')) {
    return 'Para familias le recomiendo el chalet en Campoamor: 3 habitaciones, 120m2, jardin privado y garage por 195.000 EUR. Tambien tenemos el atico en Pilar con 2 hab y terraza de 30m2 por 145.000 EUR.';
  }
  return 'Entendido. Le puedo dar mas informacion sobre cualquier propiedad o agendarle una visita. Si me deja su telefono, un agente le llamara para atenderle personalmente.';
}
