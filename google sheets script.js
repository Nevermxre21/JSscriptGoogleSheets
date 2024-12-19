const ADDRESSES = [
  "TLZVTXpA9DdiVGQT1QfSwsLwLxTiGZR3Rg",
  "TQR35TqChh1jFK1qnkvzqRfGjjUdvh325F",
  "TFTaF7Bx6B881Cibr6s3KHxnc7N9JVzt1T",

];

const TEMPLATE_URL = "https://apilist.tronscan.org/api/account/tokens?address=";
const API_KEY = "240372b2-c7fb-4dba-ad66-16dbc4351adb";

function getWalletBalances() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.clear(); // Очищаем лист перед записью
  sheet.appendRow(["Кошелек", "Баланс USDT"]);

  ADDRESSES.forEach(address => {
    if (address[0] === "0") {
      sheet.appendRow([address, "0"]);
      return;
    }

    try {
      const response = UrlFetchApp.fetch(TEMPLATE_URL + address, {
        method: "get",
        headers: {
          "TRON-PRO-API-KEY": API_KEY
        },
        muteHttpExceptions: true
      });

      const data = JSON.parse(response.getContentText());

      let foundUSDT = false;

      if (data && data.data) {
        for (const token of data.data) {
          if (token.tokenName === "Tether USD") {
            sheet.appendRow([address, token.quantity]);
            foundUSDT = true;
            break;
          }
        }
      }

      if (!foundUSDT) {
        sheet.appendRow([address, "0"]);
      }
    } catch (e) {
      sheet.appendRow([address, `Ошибка: ${e.message}`]);
    }
  });
}

function createTimeDrivenTriggers() {
  // Создаем триггер, который будет запускать функцию getWalletBalances каждую минуту
  ScriptApp.newTrigger('getWalletBalances')
           .timeBased()
           .everyMinutes(5) // Каждые 5 минут
           .create();
}

function deleteTriggers() {
  // Удаляет все триггеры (если нужно очистить все триггеры)
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
}