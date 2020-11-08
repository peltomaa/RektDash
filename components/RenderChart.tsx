import { Typography } from '@material-ui/core';
import React, { FC } from 'react'
import { ChartType } from '../enum/ChartType';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { ProsessedChart } from '../pages/dashboard';
import { DataGrid } from '@material-ui/data-grid';
import { TableData, AllChartsData } from '../config/dashboards';

interface RenderChartProps {
    chart: ProsessedChart;
}
const RenderChart: FC<RenderChartProps> = ({ chart }) => {
    const { type, data } = chart;

    if (type === ChartType.LINE) {
        return (
            <Line data={data as AllChartsData} />
        )
    }

    if (type === ChartType.BAR) {
        return (
            <Bar data={data as AllChartsData} />
        )
    }

    if (type === ChartType.PIE) {
        return (
            <Pie data={data as AllChartsData} />
        )
    }

    if (type === ChartType.TABLE) {
        const { rows, columns } = data as TableData;
        return (
            <div style={{ height: 650, width: '100%' }}>
                <DataGrid rows={rows} columns={columns} pageSize={10} />
            </div>
        )
    }

    return <Typography>No data</Typography>
}

export default RenderChart
