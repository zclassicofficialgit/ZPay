// @flow

import getZCLPrice from '../../services/zec-price';

describe('ZCL PRICE Services', () => {
  test('should return the right value', async () => {
    const response = await getZCLPrice(['BRL', 'EUR', 'USD']);

    expect(response).toEqual({
      USD: expect.any(Number),
      BRL: expect.any(Number),
      EUR: expect.any(Number),
    });
  });
});
