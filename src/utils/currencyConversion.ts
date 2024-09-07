// src/utils/currencyConversion.ts
import axios from 'axios';

const API_KEY = process.env.CURRENCY_API_KEY || 'your-api-key';

export const convertCurrency = async (amount: number, fromCurrency: string, toCurrency: string): Promise<number> => {
  try {
    const response = await axios.get(`https://data.fixer.io/api/convert`, {
      params: {
        access_key: API_KEY,
        from: fromCurrency,
        to: toCurrency,
        amount: amount,
      },
    });

    return response.data.result;
  } catch (error) {
    console.error('Currency conversion failed:', error);
    throw new Error('Failed to convert currency');
  }
};
