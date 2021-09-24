let config = {
  develop: {
    port: 4444,
    baseUrlImg: 'http://localhost:4444/images',
    baseUrl: 'http://localhost:4444/',
    secret: "dafafqek54mk45k45kl"
  },
  production: {
    port: 8888,
    baseUrlImg: 'https://vue-comments-server.herokuapp.com:8888/images',
    baseUrl: 'https://vue-comments-server.herokuapp.com:8888/',
    secret: "dafafqek54mk45k45kl"
  },
}

module.exports = config[process.env.NODE_ENV];