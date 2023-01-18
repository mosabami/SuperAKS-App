function fibcalculator(index) {
    if (index < 2) return 1;
    return fibcalculator(index - 1) + fibcalculator(index - 2) // + 100;
  }

  module.exports = {
    fib: fibcalculator,
  };