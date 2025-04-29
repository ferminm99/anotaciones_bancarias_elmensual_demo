// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: false,
//   webpack: (config, { dev }) => {
//     if (dev) {
//       config.cache = false; // Deshabilitar caché en modo desarrollo
//     }
//     return config;
//   },
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Mantén estrict-mode activado en producción
};

export default nextConfig;
