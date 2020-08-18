console.clear()

const regexp = pathToRegexp("/user/:id");

const fn = compile("/user/:name/:id*")

console.log(fn({id: ['lagou', 'yalishizhude']}))
