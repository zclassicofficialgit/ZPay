// @flow

import got from 'got';

type Payload = {
  [currency: string]: number,
};

/**
  WARNING:
  Just a super fast way to get the zcl price
  Updated to use CoinGecko API for accurate ZCL pricing
*/
// eslint-disable-next-line
export default (currencies: string[] = ['USD']): Promise<Payload> => new Promise((resolve, reject) => {
  const currencyString = currencies.join(',').toLowerCase();
  const ENDPOINT = `https://api.coingecko.com/api/v3/simple/price?ids=zclassic&vs_currencies=${currencyString}`;

  got(ENDPOINT)
    .then(response => {
      const data = JSON.parse(response.body);
      // Transform CoinGecko format {zclassic: {usd: 0.7}} to {USD: 0.7}
      const result = {};
      currencies.forEach(currency => {
        const lowerCurrency = currency.toLowerCase();
        if (data.zclassic && data.zclassic[lowerCurrency]) {
          result[currency] = data.zclassic[lowerCurrency];
        }
      });
      resolve(result);
    })
    .catch(reject);
});
