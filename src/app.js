const express = require("express");
const app = express();

const currencies = {
  TWD: { TWD: 1, JPY: 3.669, USD: 0.03281 },
  JPY: { TWD: 0.26956, JPY: 1, USD: 0.00885 },
  USD: { TWD: 30.444, JPY: 111.801, USD: 1 },
};

app.get("/exchange", (req, res) => {
  const { source, target, amount } = req.query;
  const supportCurrencies = Object.keys(currencies).join(",");

  if (!source || !currencies[source]) {
    return sendErrorResponse(
      res,
      `The field 'source' should not be empty and only support ${supportCurrencies}`
    );
  }

  if (!target || !currencies[target]) {
    return sendErrorResponse(
      res,
      `The field 'target' should not be empty and only support ${supportCurrencies}`
    );
  }

  const sourceAmount = convertStringAmountToNumber(amount);
  if (sourceAmount <= 0) {
    return sendErrorResponse(
      res,
      "The field 'amount' should be greater than 0 and the format should be $1,234.56"
    );
  }

  const targetAmount =
    Math.round(sourceAmount * currencies[source][target] * 100) / 100;
  if (targetAmount >= 0.01) {
    return res.json({
      msg: "success",
      amount: formatTargetAmount(targetAmount),
    });
  } else {
    return sendErrorResponse(
      res,
      "The rate of the target amount is less than $0.01"
    );
  }
});

app.get("/", (req, res) => {
  res.status(200).send("I'm alive!");
});

function convertStringAmountToNumber(stringAmount) {
  const cleanedAmount = stringAmount.replace("$", "").replace(/,/g, "");
  return isNaN(cleanedAmount) ? -1 : parseFloat(cleanedAmount);
}

function formatTargetAmount(number) {
  const numArr = number.toFixed(2).split(".");
  const integerPart = numArr[0];
  const decimalPart = numArr[1] ? "." + numArr[1] : "";

  let result = "";
  let count = 0;

  for (let i = integerPart.length - 1; i >= 0; i--) {
    count++;
    result = integerPart[i] + result;
    if (count === 3 && i !== 0) {
      count = 0;
      result = "," + result;
    }
  }

  return "$" + result + decimalPart;
}

function sendErrorResponse(res, msg) {
  res.status(400).json({ msg });
}

module.exports = app;
