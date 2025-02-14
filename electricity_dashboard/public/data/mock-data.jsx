import Papa from 'papaparse';

export const loadCustomsData = async () => {
  try {
    const response = await fetch('/src/data/customs_electricity_data.csv');
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const processedData = results.data.map(row => ({
            ...row,
            timestamp: new Date(row.timestamp),
            consumption_kwh: parseFloat(row.consumption_kwh),
            cost_usd: parseFloat(row.cost_usd),
            efficiency_score: parseFloat(row.efficiency_score)
          }));
          resolve(processedData);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading customs data:', error);
    throw error;
  }
};
