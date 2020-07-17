(function getData() {
  const query = 
  `
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
      car {
        no
      }
    }
  `
  const mutation = `
  mutation a{
    setHero( id: "1", name: "2") {
      id
      name
    }
  }
  `
  fetch('/graphql', {
    method: 'POST',
    body: mutation
  })
  .then(resp => resp.json())
  .then(({data, errors}) => {
    document.querySelector('#data').textContent = JSON.stringify(data || errors, null, 2)
  })
})()