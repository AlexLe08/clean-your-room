// Determines discounts if applicable
function employerContributionDiscount(product, price) {
  var dollarsOff = 0
  var divideOrNot = 1
  // If the product is medical then 0 dollars off
  if (product.type === "medical") {

  }

// Checking if employerContribution != 'dollar' to determine if dollarsOff's value needs to change
  else if (product.employerContribution.mode === 'dollar') {
    price = price - product.employerContribution.contribution
  }

// If its not dollar mode, its probably percentage until proven otherwise
  else {
    // If the product is volLife, divide contribution by 100 before multiplying price, otherwise divide by 1 for no effect
    if (product.type === "volLife") {
      divideOrNot = 100
    }
    dollarsOff = price * ( product.employerContribution.contribution/ divideOrNot)
  }
  
  price = price - dollarsOff
  return parseInt(price * 100) / 100
}

//Function returns price depending on whos getting covered
function getCost(product, whoToCover) {
  var priceTag = product.costs.find(function (cost) {
    return cost.role === whoToCover
  })
  return priceTag
}

function medicalCostCalculations(product, fmtc, price) {
  // go through array with function to find who is getting included in coverage to add the right cost
    fmtc.forEach(function (whoToCover){
      if (fmtc.includes(whoToCover)) {
        /*var medicalCost = product.costs.find(function (cost){
        return cost.role === whoToCover
        })*/
        price += getCost(product, whoToCover).price
      } 
    });

    price = employerContributionDiscount(product, price)

  return price

}

function volLifeCostCalculations(product, fmtc, price, selectedOptions) {
  // Go through array to find who gets coverage, making sure they are employees or spouses
  fmtc.forEach(function (whoToCover){
    if (fmtc.includes('ee') || fmtc.includes('sp')) {
      var coverage =  selectedOptions.coverageLevel.find(function (coverage) {
        return coverage.role === whoToCover
      })
      /*var cost = product.costs.find(function (cost) {
        return cost.role === whoToCover
      })
      */
     var cost = getCost(product, whoToCover)
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

        var eeCost = getCost(product,'ee')

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
