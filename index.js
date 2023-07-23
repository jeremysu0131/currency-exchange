const express = require("express");
const app = express();
const port = 3000;

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
    resData.msg = `The field 'source' not null and only support ${supportCurrencies}`;
    return res.send(resData);
  }
  if (!target) {
    resData.msg = `The field 'target' not null and only support ${supportCurrencies}`;
    return res.send(resData);
  }
  if (!amount) {
    resData.msg =
      "The field 'amount' not null and the format should be $1,234.56";
    return res.send(resData);
  }

  const sourceAmount = convertStringAmountToNumber(amount);
  if (sourceAmount < 1) {
    resData.msg =
      "The field 'amount' not less or equal 0 and the format should be $1,234.56";
    return res.send(resData);
  }

  let targetAmount = sourceAmount * currencies[source][target];
  targetAmount = Math.round(targetAmount * 100) / 100;
  resData.amount = "$" + numberWithCommas(targetAmount);
  resData.msg = "success";
  return res.send(resData);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

function convertStringAmountToNumber(stringAmount) {
  const amount = stringAmount.replace("$", "").replace(",", "");
  return !isNaN(amount) ? parseFloat(amount) : -1;
}

function numberWithCommas(x) {
  const numStr = x.toString();
  const numArr = numStr.split(".");
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
