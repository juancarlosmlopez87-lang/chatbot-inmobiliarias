import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

const SYSTEM_PROMPT = `Eres InmoBot, el asistente virtual inteligente de una inmobiliaria premium en la Costa Blanca, España.

REGLAS DE CONVERSACION:
- Responde de forma natural y conversacional, como un agente inmobiliario experto
- NUNCA pidas telefono ni datos personales a menos que el usuario QUIERA agendar una visita o pida que le llamen
- Responde a lo que te pregunten, no cambies de tema
- Si preguntan por precios, da precios concretos
- Si preguntan por zonas, explica las zonas con detalle real
- Si preguntan algo general, responde con conocimiento real de la Costa Blanca
- Maximo 4 frases por respuesta
- Idioma: español, pero si te hablan en ingles responde en ingles
- NO uses emojis. NO uses markdown ni asteriscos.

CATALOGO DE PROPIEDADES (demo):

1. APARTAMENTO COSTA - Orihuela Costa
   2 habitaciones, 1 bano, 65m2, piscina comunitaria, a 300m de la playa Flamenca
   Precio: 89.000 EUR | Comunidad: 60 EUR/mes | IBI: 350 EUR/ano
   Ideal para: parejas, inversion vacacional, jubilados

2. CHALET CAMPOAMOR - Dehesa de Campoamor
   3 habitaciones, 2 banos, 120m2 + 200m2 parcela, jardin privado, garage doble
   Precio: 195.000 EUR | Comunidad: 45 EUR/mes | IBI: 520 EUR/ano
   Ideal para: familias, residencia permanente

3. ESTUDIO TORREVIEJA - Centro Torrevieja
   Estudio, 1 bano, 35m2, totalmente reformado, vistas al mar, terraza 8m2
   Precio: 59.000 EUR | Comunidad: 35 EUR/mes | IBI: 180 EUR/ano
   Ideal para: inversion, alquiler vacacional, primera vivienda

4. ATICO PILAR - Pilar de la Horadada
   2 habitaciones, 2 banos, 80m2 + terraza solárium 30m2, piscina comunitaria
   Precio: 145.000 EUR | Comunidad: 55 EUR/mes | IBI: 420 EUR/ano
   Ideal para: parejas, vistas panoramicas, segunda residencia

5. BUNGALOW PLAYA - Mil Palmeras
   2 habitaciones, 1 bano, 75m2, planta baja, jardin 50m2, a 150m del mar
   Precio: 125.000 EUR | Comunidad: 40 EUR/mes | IBI: 380 EUR/ano
   Ideal para: familias, acceso directo playa

6. VILLA LUJO - La Zenia
   4 habitaciones, 3 banos, 220m2, parcela 500m2, piscina privada, vistas al golf
   Precio: 385.000 EUR | Comunidad: 0 EUR | IBI: 890 EUR/ano
   Ideal para: familias grandes, lujo, residencia permanente

CONOCIMIENTO DE LA ZONA:
- Orihuela Costa: playas Flamenca, La Zenia, Cabo Roig. Muchos bares, restaurantes, centro comercial La Zenia Boulevard
- Torrevieja: ciudad grande, hospital, todos los servicios, salinas rosas, paseo maritimo
- Campoamor: zona tranquila y exclusiva, campo de golf, cala natural
- Pilar de la Horadada: pueblo autentico espanol con playa, mercado los sabados
- Mil Palmeras: playa virgen, ambiente familiar, tranquilo
- La Zenia: zona premium, golf, centros comerciales, vida nocturna
- Clima: 320 dias de sol, inviernos suaves (12-18C), veranos calurosos (28-35C)
- Aeropuerto Alicante: 40-60 min, Murcia-Corvera: 20-40 min
- Sanidad: Hospital Torrevieja, centros de salud en cada pueblo
- Colegios internacionales: varios en la zona (ingles, noruego, sueco)

SOBRE COMPRAR EN ESPANA (extranjeros):
- NIE necesario (Numero Identidad Extranjero)
- Impuestos compra: ITP 10% (segunda mano) o IVA 10% (obra nueva)
- Gastos notaria/registro: ~1.5-2% del precio
- Hipotecas para extranjeros: hasta 60-70% del valor, interes ~3-4%
- Proceso: ~4-8 semanas desde reserva hasta escritura

Si alguien quiere mas info o visita, dile que puede llamar al +34 620 300 647 o dejar su contacto.`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: Request) {
  try {
    const { messages, config } = await request.json();

    if (!GROQ_API_KEY) {
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
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10),
        ],
        temperature: 0.6,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq error:', response.status, error);
      return NextResponse.json({
        message: getDemoResponse(messages),
        demo: true,
        groqError: `${response.status}: ${error.substring(0, 200)}`,
      });
    }

    const data = await response.json();
    return NextResponse.json({
      message: data.choices[0].message.content,
      demo: false,
      model: data.model,
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

  if (messages.length <= 1 || lastMsg.includes('hola') || lastMsg.includes('buenas') || lastMsg.includes('hello')) {
    return 'Bienvenido. Soy el asistente inmobiliario de la Costa Blanca. Tenemos apartamentos desde 59.000 EUR, chalets, aticos y villas. Preguntame lo que necesites: precios, zonas, propiedades concretas o informacion sobre la zona.';
  }
  if (lastMsg.includes('precio') || lastMsg.includes('cuanto') || lastMsg.includes('barato') || lastMsg.includes('caro')) {
    return 'Nuestro rango va de 59.000 EUR (estudio reformado en Torrevieja, 35m2) hasta 385.000 EUR (villa con piscina privada en La Zenia, 220m2). Lo mas vendido es el apartamento de 2 hab en Orihuela Costa por 89.000 EUR con piscina comunitaria a 300m de la playa. Que presupuesto manejas?';
  }
  if (lastMsg.includes('visita') || lastMsg.includes('cita') || lastMsg.includes('cuando')) {
    return 'Organizamos visitas cualquier dia de la semana. Puedes llamar directamente al +34 620 300 647 o dejarme tu nombre y te contactamos para cuadrar dia y hora.';
  }
  if (lastMsg.includes('playa') || lastMsg.includes('mar') || lastMsg.includes('costa')) {
    return 'Todas nuestras propiedades estan a menos de 500m de la playa. Las mejores playas de la zona: Playa Flamenca, Cabo Roig, La Zenia, Mil Palmeras y Campoamor. 320 dias de sol al ano, agua cristalina y chiringuitos por todas partes.';
  }
  if (lastMsg.includes('zona') || lastMsg.includes('donde') || lastMsg.includes('ubicacion') || lastMsg.includes('sitio')) {
    return 'Trabajamos en la Costa Blanca sur: Orihuela Costa (turistica, animada), Torrevieja (ciudad con todos los servicios), Campoamor (exclusiva, tranquila), Pilar de la Horadada (pueblo autentico) y La Zenia (premium, golf). Aeropuerto de Alicante a 40-60 min.';
  }
  if (lastMsg.includes('habitacion') || lastMsg.includes('grande') || lastMsg.includes('familia') || lastMsg.includes('nino')) {
    return 'Para familias recomiendo el chalet en Campoamor: 3 hab, 120m2, jardin privado y garage por 195.000 EUR. Zona tranquila, colegio internacional cerca. Tambien el bungalow en Mil Palmeras: 2 hab, jardin, a 150m de la playa por 125.000 EUR.';
  }
  if (lastMsg.includes('inversion') || lastMsg.includes('alquil') || lastMsg.includes('rentab') || lastMsg.includes('invertir')) {
    return 'La Costa Blanca es una de las mejores zonas de Espana para inversion inmobiliaria. Un estudio de 59.000 EUR en Torrevieja se alquila a 400-600 EUR/mes en temporada. Rentabilidad bruta del 8-12% anual. El apartamento de Orihuela Costa (89.000 EUR) genera 5.000-8.000 EUR/ano en alquiler vacacional.';
  }
  if (lastMsg.includes('hipoteca') || lastMsg.includes('financ') || lastMsg.includes('banco') || lastMsg.includes('pagar')) {
    return 'Los bancos financian hasta el 70% para residentes y 60% para no residentes. Interes actual: 3-4% fijo. Ejemplo: para el apartamento de 89.000 EUR, con 35.600 EUR de entrada, la cuota seria unos 300 EUR/mes a 25 anos. Gastos de compra adicionales: ~10.000 EUR (impuestos + notaria).';
  }
  if (lastMsg.includes('nie') || lastMsg.includes('extranjero') || lastMsg.includes('comprar') || lastMsg.includes('proceso')) {
    return 'Para comprar en Espana necesitas un NIE (Numero de Identidad Extranjero), que se tramita en 2-4 semanas. El proceso completo: reserva con senal, contrato de arras (10%), escritura ante notario. Total: 4-8 semanas. Te ayudamos con todo el papeleo.';
  }
  if (lastMsg.includes('lujo') || lastMsg.includes('villa') || lastMsg.includes('premium') || lastMsg.includes('piscina privada')) {
    return 'Nuestra joya es la villa en La Zenia: 4 hab, 3 banos, 220m2, parcela de 500m2, piscina privada y vistas al campo de golf. 385.000 EUR. Zona premium, cerca del centro comercial La Zenia Boulevard. Perfecta para familias que buscan exclusividad.';
  }
  return 'Tenemos 6 propiedades disponibles ahora mismo, desde estudios de 59.000 EUR hasta villas de 385.000 EUR, todas en la Costa Blanca. Puedes preguntarme por precios, zonas, tipos de propiedad, informacion sobre hipotecas, o lo que necesites.';
}
