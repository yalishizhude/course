(function getData() {
  fetch('/graphql', {
    method: 'POST',
    body: `
      query guys($id: String = "1"){
        bad: hero(id: $id) {
          ...f
        }
        good: hero(id: $id, name: "a") {
          ...f
        }
      }
      fragment f on Hero {
        __typename
        id
        name
      }
    `
      // mutation a{
      //   setHero( id: "1", name: "2") {
      //     id
      //     name
      //   }
      // }
  })
  .then(resp => resp.json())
  .then(({data, errors}) => {
    document.querySelector('#data').textContent = JSON.stringify(data || errors, null, 2)
  })
})()