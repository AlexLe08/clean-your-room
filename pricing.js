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

//Function returns a cost or coverage value depending on inputs
function getC(product, whoToCover) {
  var priceTag = product.find(function (cost) {
    return cost.role === whoToCover
  })
  return priceTag
}

// Some calculation shared by 2 product types
function mathStuff (factors, costDivisor, costPrice) {
  return (factors / costDivisor) * costPrice
}

function medicalCostCalculations(product, fmtc, price) {
  // go through array with function to find who is getting included in coverage to add the right cost
    fmtc.forEach(function (whoToCover){
      if (fmtc.includes(whoToCover)) {
        price += getC(product.costs, whoToCover).price
      } 
    });

    price = employerContributionDiscount(product, price)

  return price

}

function volLifeCostCalculations(product, fmtc, price, selectedOptions) {
  // Go through array to find who gets coverage, making sure they are employees or spouses
  fmtc.forEach(function (whoToCover){
    if (fmtc.includes('ee') || fmtc.includes('sp')) {
      var coverage = getC(selectedOptions.coverageLevel, whoToCover)
      var cost = getC(product.costs, whoToCover)

      price += mathStuff(coverage.coverage, cost.costDivisor, cost.price)
    }
  })

  price = employerContributionDiscount(product, price)
  
  return price
}

function ltdCostCalculations(product, fmtc, price, employee) {
if (fmtc.includes('ee')) {
        var eeCoverage = getC(product.coverage,'ee')
        var eeCost = getC(product.costs,'ee')

        // what used to be: var salaryPercentage = eeCoverage.percentage / 100
        var someFactors = employee.salary * (eeCoverage.percentage / 100)
        price += mathStuff(someFactors, eeCost.costDivisor, eeCost.price)
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
