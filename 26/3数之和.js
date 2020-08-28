/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function(nums) {
  let result = new Set()
  let neg = []
  let pos = []
  let z = []
  let znum = 0
  let map = {}
  nums.forEach(n => {
      if(n>0) {
        pos.push(n)
      } else if(n<0) {
        neg.push(n)
      } else if(znum<3){
        znum++;
        z.push(n)
      }
      map[n] = true
  })
  neg.sort()
  pos.sort()
  // 2pos + 1neg
  for(let i=0;i<pos.length-1;i++) {
    for(let j=i+1;j<pos.length;j++) {
      if(map[0 - pos[i] - pos[j]]) {
        result.add((0 - pos[i] - pos[j])+','+pos[i] + ',' + pos[j])
      }
    }
  }
  // 1pos + 2neg
  for(let i=0;i<neg.length-1;i++) {
    for(let j=i+1;j<neg.length;j++) {
      if(map[0 - neg[i] - neg[j]]) {
        result.add(neg[i] + ',' + neg[j] + ',' + (0 - neg[i] - neg[j]))
      }
    }
  }
  // 1pos + 1z + 1neg
  if(z.length > 0) {
    for(let i=0;i<pos.length;i++) {
      if(map[0-pos[i]]) {
        result.add((0 - pos[i])+',0,' + pos[i])
      }
    }
  }
  // 3z
  if(z.length>2) {
    result.add('0,0,0')
  }
  return Array.from(result).map(it => it.split(','))
};