// @flow

import got from 'got';

type Payload = {
  [currency: string]: number,
};

/**
  WARNING:
  Just a super fast way to get the zcl price
*/
// eslint-disable-next-line
export default (currencies: string[] = ['USD']): Promise<Payload> => new Promise((resolve, reject) => {
  const ENDPOINT = `https://min-api.cryptocompare.com/data/price?fsym=ZCL&tsyms=${currencies.join(
    ',',
  )}&api_key=${String(process.env.ZCL_PRICE_API_KEY)}`;

  got(ENDPOINT)
    .then(response => resolve(JSON.parse(response.body)))
    .catch(reject);
});
