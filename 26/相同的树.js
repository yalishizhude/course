var isSameTree = function(p, q) {
  if(p===null && q===null) {
    return true
  } else if(p && q && p.val===q.val) {
    return isSameTree(p.left, q.left) && isSameTree(p.right, q.right)
  } else {
    return false
  }
};