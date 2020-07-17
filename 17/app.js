const Koa = require('koa');
const koaStatic = require('koa-static')
const router = require('koa-router')()
const koaBodyParser = require('koa-bodyparser')
const path = require('path')
const data = require('./data.json')
const { graphql, buildSchema } = require('graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { addMocksToSchema } = require('@graphql-tools/mock')

const query = `
type Car {
  no: Int,
  name: String
}
type Hero {
  id: String
  name: String,
  car: Car
}
type Query {
  hero(id: String, name: String): [Hero]
}
type Mutation {
  setHero(id: String, name: String): Hero
}
`
const eSchema = makeExecutableSchema({ typeDefs: query })
const mock = addMocksToSchema({schema: eSchema})
// const schema = buildSchema(query);
// const root = {
//   hero({id='hello', name='world'}) {
//     return data.hero
//   },
//   setHero(h) {
//     data.hero.push(h)
//     return h
//   }
// };
const staticPath = './'

const app = new Koa();

router.post('/graphql', async ctx => {
  graphql(mock, ctx.request.body, root).then((response) => {
    ctx.body = response;
  });
})

app.use(koaBodyParser({
  enableTypes: ['text', 'json', 'form']
}));
app.use(router.routes())
app.use(koaStatic(
  path.join(__dirname, staticPath)
))

app.listen(80);