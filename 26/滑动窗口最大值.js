var maxSlidingWindow = function(nums, k) {
  const res = [], queue = [];
  for (let i = 0, K = k - 1; i < nums.length; i++){
      while (nums[i] > queue[queue.length - 1]) queue.pop();
      queue.push(nums[i]);
      if (queue[0] === nums[i - k]) queue.shift();
      if (i >= K) res.push(queue[0]);
  }
  return res;
}
