/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'example.com',
      'pawline-products.s3.amazonaws.com',
      'res.cloudinary.com'
    ],
  },
};

module.exports = nextConfig; 