import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FB_PIXEL_ID = "1960837841237992";
const FB_ACCESS_TOKEN = "EAAfZBE4xTtzoBRlHEaUPZBwwrqDNOzCOthex2CEpzu7xlnYU3mJEG1MplZCZBZAKc363NZBy7SMNl1LWAtlLltitkL97ty0vCA8FX3EiIqP1OpaZAwGZCZCrGR6QJRMjnDqvZCkewODaBRnZBbZAU6zt2yGLB37qgTPbFszmXYrxG37lWhU9z1LKZAQRkUG8cKAVAsmrq4gZDZD";

async function sha256(text: string): Promise<string> {
  const formatted = text.trim().toLowerCase();
  const msgBuffer = new TextEncoder().encode(formatted);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { eventName, userData, customData } = await req.json()

    const hashedEmail = userData?.email ? await sha256(userData.email) : null;
    const hashedPhone = userData?.phone ? await sha256(userData.phone) : null;

    const payload = {
      data: [
        {
          event_name: eventName || "Lead",
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          user_data: {
            em: hashedEmail ? [hashedEmail] : [],
            ph: hashedPhone ? [hashedPhone] : []
          },
          custom_data: {
            currency: customData?.currency || "BRL",
            value: String(customData?.value || "37.90")
          }
        }
      ]
    }

    console.log(`[facebook-capi] Enviando evento ${eventName} para Pixel ${FB_PIXEL_ID}...`);

    const fbResponse = await fetch(`https://graph.facebook.com/v17.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const fbResult = await fbResponse.json();
    console.log(`[facebook-capi] Resposta do Meta:`, JSON.stringify(fbResult));

    return new Response(JSON.stringify(fbResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("[facebook-capi] Erro fatal:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})