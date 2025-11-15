// postcss.config.js  (ESM because package.json has "type": "module")

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    // autoprefixer is optional, remove if you don't need it:
    autoprefixer: {},
  },
};

export default config;
