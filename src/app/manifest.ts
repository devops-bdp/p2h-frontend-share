import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'P2H MP - Batara Muara Pahu',
    short_name: 'P2H MP',
    description:
      'Aplikasi Pelaksanaan Pemeriksaan Harian (P2H) Armada & Alat Berat PT Batara Dharma Persada Site Muara Pahu',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#020617',
    theme_color: '#020617',
    icons: [
      {
        src: '/logo-navbar-transparant1.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo-navbar-transparant1.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo-navbar-transparant1.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
