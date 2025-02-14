import React, { useState, useEffect } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { DatePicker } from '@progress/kendo-react-dateinputs';
import { process } from '@progress/kendo-data-query';
import Papa from 'papaparse';
import '@progress/kendo-theme-default/dist/all.css';

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    building: 'all',
    dateRange: {
      start: null,
      end: null
    }
  });

useEffect(() => {
    const loadData = async () => {
      console.log('Starting to load data...');
      try {
        console.log('Attempting to fetch CSV file...');
        const response = await fetch('/data/customs_electricity_data.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        console.log('CSV file fetched successfully. First 100 characters:', csvText.substring(0, 100));

        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log('CSV parsing complete. First row:', results.data[0]);
            console.log('Column headers:', results.meta.fields);

            // Transform the data
            const transformedData = results.data.map(row => ({
              ...row,
              timestamp: new Date(row.timestamp),
              consumption_kwh: Number(row.consumption_kwh),
              cost_usd: Number(row.cost_usd),
              efficiency_score: Number(row.efficiency_score),
              peak_load: Boolean(row.peak_load)
            }));

            console.log('Data transformed. First row:', transformedData[0]);
            setData(transformedData);
            setLoading(false);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error loading CSV:', error.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const buildingTypes = ['all', ...new Set(data.map(item => item.building_type))];

  const [gridDataState, setGridDataState] = useState({
    sort: [],
    skip: 0,
    take: 10
  });

  const handleGridDataStateChange = (e) => {
    setGridDataState(e.dataState);
  };

  // Filter data based on selected filters
  const filteredData = React.useMemo(() => {
    let result = [...data];

    if (filter.building !== 'all') {
      result = result.filter(item => item.building_type === filter.building);
    }

    if (filter.dateRange.start) {
      result = result.filter(item => item.timestamp >= filter.dateRange.start);
    }

    if (filter.dateRange.end) {
      result = result.filter(item => item.timestamp <= filter.dateRange.end);
    }

    return result;
  }, [data, filter]);

  // Process the data with Kendo UI Data Query
  const processedData = process(filteredData, gridDataState);

  if (loading) {
    return <div>Loading data...</div>;
  }

  return (
    <div className="container mx-4 my-8">
      <h1 className="text-2xl font-bold mb-6">Electricity Consumption Dashboard</h1>

      <div className="flex gap-4 mb-6">
        <div>
          <label className="block mb-2">Building Type</label>
          <DropDownList
            data={buildingTypes}
            value={filter.building}
            onChange={(e) => setFilter({...filter, building: e.value})}
          />
        </div>
        <div>
          <label className="block mb-2">Date Range</label>
          <div className="flex gap-2">
            <DatePicker
              value={filter.dateRange.start}
              onChange={(e) => setFilter({
                ...filter,
                dateRange: {...filter.dateRange, start: e.value}
              })}
            />
            <DatePicker
              value={filter.dateRange.end}
              onChange={(e) => setFilter({
                ...filter,
                dateRange: {...filter.dateRange, end: e.value}
              })}
            />
          </div>
        </div>
      </div>

      <Grid
        data={processedData}
        {...gridDataState}
        onDataStateChange={handleGridDataStateChange}
        sortable={true}
        filterable={true}
        pageable={{
          buttonCount: 5,
          pageSizes: [10, 20, 50],
          pageSize: 10
        }}
      >
        <GridColumn field="timestamp" title="Timestamp" format="{0:dd/MM/yyyy HH:mm}" />
        <GridColumn field="customs_office" title="Customs Office" />
        <GridColumn field="building_type" title="Building Type" />
        <GridColumn field="equipment_type" title="Equipment Type" />
        <GridColumn field="department" title="Department" />
        <GridColumn field="consumption_kwh" title="Consumption (kWh)" format="{0:n2}" />
        <GridColumn field="cost_usd" title="Cost (USD)" format="{0:c2}" />
        <GridColumn field="peak_load" title="Peak Load" cell={(props) => (
          <td>{props.dataItem[props.field] ? '✓' : '✗'}</td>
        )} />
        <GridColumn field="efficiency_score" title="Efficiency Score" format="{0:p2}" />
      </Grid>
    </div>
  );
};

export default App;