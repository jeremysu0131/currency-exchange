const express = require("express");
const app = express();

const currencies = {
  TWD: { TWD: 1, JPY: 3.669, USD: 0.03281 },
  JPY: { TWD: 0.26956, JPY: 1, USD: 0.00885 },
  USD: { TWD: 30.444, JPY: 111.801, USD: 1 },
};

app.get("/exchange", (req, res) => {
  const resData = { msg: "", amount: "" };
  const { source, target, amount } = req.query;
  const supportCurrencies = Object.keys(currencies).join(",");

  if (!source || !currencies[source]) {
    resData.msg = `The field 'source' should not be empty and only support ${supportCurrencies}`;
    return res.send(resData);
  }
  if (!target) {
    resData.msg = `The field 'target' should not be empty and only support ${supportCurrencies}`;
    return res.send(resData);
  }

  const sourceAmount = convertStringAmountToNumber(amount);
  if (sourceAmount < 1) {
    resData.msg =
      "The field 'amount' should be greater than 0 and the format should be $1,234.56";
    return res.send(resData);
  }

  const targetAmount = (sourceAmount * currencies[source][target]).toFixed(2);
  resData.amount = "$" + numberWithCommas(targetAmount);
  resData.msg = "success";
  return res.send(resData);
});

app.get("/", (req, res) => {
  res.status(200).send("I'm alive!");
});

function convertStringAmountToNumber(stringAmount) {
  const cleanedAmount = stringAmount.replace("$", "").replace(",", "");
  return isNaN(cleanedAmount) ? -1 : parseFloat(cleanedAmount);
}

function numberWithCommas(number) {
  const numArr = number.split(".");
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

  return result + decimalPart;
}

module.exports = app;