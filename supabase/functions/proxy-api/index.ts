import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- DADOS DE EXEMPLO (MOCK) ---
// Esta função gera dados falsos para manter o app funcionando sem a API externa.
const getMockData = (campo: string, username: string) => {
  const MOCK_PROFILE = {
    username: username,
    full_name: 'Neymar Jr (Exemplo)',
    profile_pic_url: '/perfil.jpg',
    biography: 'Este é um perfil de exemplo. A API original foi desativada e aguarda substituição.',
    follower_count: 222000000,
    following_count: 1750,
    media_count: 5432,
    is_verified: true,
    is_private: false,
  };

  const MOCK_SUGGESTIONS = [
    { username: 'leomessi', full_name: 'Lionel Messi', profile_pic_url: '/perfil.jpg', is_private: false },
    { username: 'cristiano', full_name: 'Cristiano Ronaldo', profile_pic_url: '/perfil.jpg', is_private: false },
    { username: 'gabigol', full_name: 'Gabi Gol', profile_pic_url: '/perfil.jpg', is_private: true },
    { username: 'anitta', full_name: 'Anitta', profile_pic_url: '/perfil.jpg', is_private: false },
  ];

  const MOCK_POSTS = [
      { 
        id: '321', 
        image_url: '/passo1.png',
        video_url: null, 
        is_video: false,
        caption: 'Post de exemplo 1! #mock', 
        like_count: 1500000, 
        comment_count: 60000 
    },
    { 
        id: '654', 
        image_url: '/passo2.png',
        video_url: null, 
        is_video: false,
        caption: 'Outro post de exemplo. #dadosfalsos', 
        like_count: 2300000, 
        comment_count: 85000 
    }
  ];

  switch (campo) {
    case 'perfil_completo':
      return MOCK_PROFILE;
    case 'perfis_sugeridos':
      return MOCK_SUGGESTIONS;
    case 'lista_posts':
      return MOCK_POSTS;
    default:
      return { error: 'Campo inválido' };
  }
};


serve(async (req) => {
  // Lida com a requisição pre-flight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { campo, username } = await req.json()
    if (!campo || !username) {
      return new Response(
        JSON.stringify({ error: 'Faltando "campo" ou "username" no corpo da requisição.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`[proxy-api] Recebida requisição MOCK para campo: ${campo}, username: ${username}`);

    // Gera dados de exemplo
    const mockData = getMockData(campo, username);

    // Encapsula os dados na estrutura que o frontend espera
    const responsePayload = {
      results: [{
        data: mockData
      }]
    };

    // Retorna os dados de exemplo
    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('[proxy-api] Erro na função de proxy MOCK:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})