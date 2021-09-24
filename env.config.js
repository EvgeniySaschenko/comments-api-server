let config = {
  develop: {
    port: 8888,
    baseUrlImg: 'http://localhost:8888/images',
    baseUrl: 'http://localhost:8888/',
    secret: "dafafqek54mk45k45kl"
  },
  production: {
    port: process.env.PORT,
    baseUrlImg: 'https://vue-comments-server.herokuapp.com/images',
    baseUrl: 'https://vue-comments-server.herokuapp.com/',
    secret: "dafafqek54mk45k45kl"
  },
}

module.exports = config[process.env.NODE_ENV];