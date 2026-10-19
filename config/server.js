/**
 * Strapi server config for Railway.
 * Copy this file to your Strapi project: config/server.js
 * Railway provides a dynamic PORT; the server must listen on it for traffic to route correctly.
 */
module.exports = ({ env }) => ({
  host: "0.0.0.0",
  port: env.int("PORT", 1337),
  app: {
    keys: env.array("APP_KEYS"),
  },
});
