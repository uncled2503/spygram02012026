import type { ProfileData, SuggestedProfile, FeedPost } from '../../types';
import { supabase } from '../integrations/supabase/client';

// ===================================
// UTILITY FUNCTIONS
// ===================================

const getProxyImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl || imageUrl.trim() === '') return '/perfil.jpg';
    if (imageUrl.startsWith('/') || imageUrl.startsWith('data:') || imageUrl.includes('weserv.nl')) {
        return imageUrl;
    }
    return `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&q=80`;
};

const getProxyImageUrlLight = (imageUrl: string | undefined): string => {
    if (!imageUrl || imageUrl.trim() === '') return '/perfil.jpg';
    if (imageUrl.startsWith('/') || imageUrl.startsWith('data:') || imageUrl.includes('weserv.nl')) {
        return imageUrl;
    }
    return `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&w=80&h=80&fit=cover&q=50`;
};

function shuffleArray(array: any[]): any[] {
    return [...array].sort(() => Math.random() - 0.5);
}

// Lista de nomes/usuários realistas em português para simulação com avatares de placeholder borrados
const MOCK_PEOPLE = [
    { username: 'biel_silva', fullName: 'Gabriel Silva', pic: '/perfil.jpg' },
    { username: 'amanda.mendes', fullName: 'Amanda Mendes', pic: '/perfil.jpg' },
    { username: 'lucas_lima', fullName: 'Lucas Lima', pic: '/perfil.jpg' },
    { username: 'carol_rezende', fullName: 'Carolina Rezende', pic: '/perfil.jpg' },
    { username: 'thiagosantos', fullName: 'Thiago Santos', pic: '/perfil.jpg' },
    { username: 'julia.moraes', fullName: 'Júlia Moraes', pic: '/perfil.jpg' },
    { username: 'felipe.castro', fullName: 'Felipe Castro', pic: '/perfil.jpg' },
    { username: 'leticia.s', fullName: 'Letícia Souza', pic: '/perfil.jpg' },
];

const LIFESTYLE_IMAGES = [
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=600&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80',
];

const MOCK_CAPTIONS = [
    "Sintonize na sua melhor versão ✨",
    "Vivendo momentos que não têm preço 📸",
    "Sabadou com estilo e boa companhia 🍷",
    "Focada nos novos projetos que estão vindo por aí 🤫",
    "Lembrança de um dia quente de verão 🏖️",
    "Aproveitando cada segundo, a vida passa rápido demais. 🍃",
];

// ===================================
// EXPORTED FUNCTIONS
// ===================================

export async function fetchProfileData(username: string): Promise<FetchResult> {
    try {
        const cleanUsername = username.replace(/^@+/, '').trim();
        if (!cleanUsername) throw new Error('Username inválido');

        const { data, error } = await supabase.functions.invoke('rapidapi-profile', {
            body: { username: cleanUsername },
        });

        if (error) throw new Error(`Erro na RapidAPI: ${error.message}`);

        const resultItem = data?.result?.[0];
        const user = resultItem?.user;

        if (user && user.username) {
            const profile: ProfileData = {
                username: user.username,
                fullName: user.full_name || '',
                profilePicUrl: getProxyImageUrl(user.hd_profile_pic_url_info?.url || user.profile_pic_url),
                biography: user.biography || '',
                followers: user.follower_count || 0,
                following: user.following_count || 0,
                postsCount: user.media_count || 0,
                isVerified: user.is_verified || false,
                isPrivate: user.is_private || false,
            };

            let suggestions: SuggestedProfile[] = [];
            
            const facepile = user.profile_context_facepile_users;
            const chaining = user.chaining_results || user.chaining_suggestions;

            const sourceArray = (Array.isArray(facepile) && facepile.length > 0) ? facepile : chaining;

            if (Array.isArray(sourceArray)) {
                suggestions = shuffleArray(sourceArray.map((p: any) => ({
                    username: p.username,
                    profile_pic_url: getProxyImageUrlLight(p.profile_pic_url),
                    fullName: p.full_name,
                    is_private: p.is_private === true
                })));
            }

            // Se a API não retornou sugestões, usamos nossa lista mockada de alta qualidade
            if (suggestions.length === 0) {
                suggestions = MOCK_PEOPLE.map(p => ({
                    username: p.username,
                    fullName: p.fullName,
                    profile_pic_url: p.pic,
                    is_private: false
                }));
            }

            return { profile, suggestions, posts: [] };
        }
        throw new Error('Perfil não encontrado.');
    } catch (error) {
        console.error('❌ Erro no fetchProfileData:', error);
        throw error;
    }
}

export async function fetchFullInvasionData(profileData: ProfileData): Promise<{ suggestions: SuggestedProfile[], posts: FeedPost[] }> {
    try {
        // Gera sugestões de amigos locais altamente realistas
        const suggestions: SuggestedProfile[] = MOCK_PEOPLE.map(p => ({
            username: p.username,
            fullName: p.fullName,
            profile_pic_url: p.pic,
            is_private: false
        }));

        // Cria posts simulados dinâmicos e atraentes baseados nas imagens lifestyle, pertencendo ao PRÓPRIO ALVO
        const posts: FeedPost[] = MOCK_CAPTIONS.slice(0, 5).map((caption, index) => {
            const imageUrl = LIFESTYLE_IMAGES[index % LIFESTYLE_IMAGES.length];
            
            return {
                de_usuario: {
                    username: profileData.username,
                    full_name: profileData.fullName,
                    profile_pic_url: profileData.profilePicUrl,
                },
                post: {
                    id: `post-simulated-${index}`,
                    image_url: imageUrl,
                    is_video: false,
                    caption: caption,
                    like_count: Math.floor(Math.random() * 1500) + 120,
                    comment_count: Math.floor(Math.random() * 45) + 8,
                }
            };
        });

        return { suggestions, posts };

    } catch (error) {
        console.error('❌ Erro no fetchFullInvasionData:', error);
        return { suggestions: [], posts: [] };
    }
}