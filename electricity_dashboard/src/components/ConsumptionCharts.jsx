import React from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';

const ConsumptionGrid = ({ data }) => {
  return (
    <Grid
      data={data}
      style={{ height: '400px' }}
      sortable={true}
      filterable={true}
      groupable={true}
      reorderable={true}
      pageable={{ buttonCount: 5, pageSizes: true }}
    >
      <GridColumn field="timestamp" title="Timestamp" />
      <GridColumn field="customs_office" title="Customs Office" />
      <GridColumn field="building_type" title="Building Type" />
      <GridColumn field="consumption_kwh" title="Consumption (kWh)" />
      <GridColumn field="cost_usd" title="Cost (USD)" format="{0:c2}" />
      <GridColumn field="efficiency_score" title="Efficiency Score" />
    </Grid>
  );
};

export default ConsumptionGrid;