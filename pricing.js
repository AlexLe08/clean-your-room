function medicalCostCalculations(product, fmtc, price) {
  // go through array with function to find who is getting included in coverage
    fmtc.forEach(function (whoToCover){
      if (fmtc.includes(whoToCover)) {
        var medicalCost = product.costs.find(function (cost){
        return cost.role === whoToCover
        })
        price += medicalCost.price
      } 
    });

    price = employerContributionDiscount(product, price)

  return price

}

//// Checking if employerContribution != 'dollar' to determine if dollarsOff's value needs to change
// checks if the product is medical and gives 0 for no discount
function employerContributionDiscount(product, price) {
  var dollarsOff;
  if (product.type === "medical") {
    dollarsOff = 0
  }

  else if (product.employerContribution.mode != 'dollar'){
    dollarsOff = price * ( product.employerContribution.contribution / 100)
  }


  price = price - dollarsOff
  return parseInt(price * 100) / 100
}

function volLifeCostCalculations(product, fmtc, price, selectedOptions) {
  // Go through array to find who gets coverage
  fmtc.forEach(function (whoToCover){
    if (fmtc.includes('ee') || fmtc.includes('sp')) {
      var coverage =  selectedOptions.coverageLevel.find(function (coverage) {
        return coverage.role === whoToCover
      })
      var cost = product.costs.find(function (cost) {
        return cost.role === whoToCover
      })
      price += (coverage.coverage / cost.costDivisor) * cost.price
    }
  })

  price = employerContributionDiscount(product, price)
  
  return price
}

function ltdCostCalculations(product, fmtc, price, employee) {

if (fmtc.includes('ee')) {
        var eeCoverage = product.coverage.find(function (coverage) {
          return coverage.role === 'ee'
        })

        var eeCost = product.costs.find(function (cost) {
          return cost.role === 'ee'
        })

        var salaryPercentage = eeCoverage.percentage / 100

        price += ((employee.salary * salaryPercentage) / eeCost.costDivisor) * eeCost.price
      }

      price = employerContributionDiscount(product, price)

      return price
}

module.exports.calculateProductPrice = function (product, employee, selectedOptions) {
  var price = 0
  var fmtc = selectedOptions.familyMembersToCover

  switch (product.type) {
    case 'medical':

      return medicalCostCalculations(product, fmtc, price)

    case 'volLife':

      return volLifeCostCalculations(product, fmtc, price, selectedOptions)
      
    case 'ltd':
      return ltdCostCalculations(product, fmtc, price, employee)
      
    default:
      return 0
  }
}
