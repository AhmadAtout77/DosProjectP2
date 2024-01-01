let currentTargetIndex = 0;

const roundRobin = (targets) => {
  const totalTargets = targets.length;

  return (req, res, next) => {
    req.target = targets[currentTargetIndex];
    currentTargetIndex = (currentTargetIndex + 1) % totalTargets;
    next();
  };
};

module.exports = roundRobin;
