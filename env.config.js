const mode = process.env.NODE_ENV || "development";

let config = {
  "development": {
    port: 8888,
    baseUrlImg: 'http://localhost:8888/images',
    baseUrl: 'http://localhost:8888/',
    secret: "dafafqek54mk45k45kl"
  },
  "production": {
    port: 80,
    baseUrlImg: '/images',
    baseUrl: '/',
    secret: "dafafqek54mk45k45kl"
  }
}

module.exports = config[mode];