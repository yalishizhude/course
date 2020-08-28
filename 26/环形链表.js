var hasCycle = function(head) {
  if(!head) return false
  let p1 = head
  let p2 = head
  let cycle = false
  while(p1 && p2) {
    p1 = p1.next
    if(p2.next) p2 = p2.next.next
    else p2 = null
    if(p1 && p2 && p1===p2) {
      console.log(p1.val, p2.val)
      cycle = true
      break
    }
  }
  return cycle
};