var isValid = function(s) {
  let arr = []
  s.split('').forEach(p => {
    if(['(', '[', '{'].indexOf(p) > -1 || arr.length ===0) {
      arr.push(p)
    } else {
      let end = arr[arr.length - 1]
      if(p===']' && end==='[') arr.pop()
      else if(p==='}' && end==='{') arr.pop()
      else if(p===')' && end==='(') arr.pop()
      else arr.push(p)
    }
  })
  return arr.length === 0
};