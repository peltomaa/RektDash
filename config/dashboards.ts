import { ChartData } from "react-chartjs-2";
import { ChartType } from "../enum/ChartType";
import { formatDate } from "../util/date";
import { connection } from "../util/snowflake";
import chartjs from 'chart.js'
import { RowsProp, Columns } from '@material-ui/data-grid';

export interface GetDataParams {
    startDate: Date;
    endDate: Date;
}

export interface TableData {
    rows: RowsProp;
    columns: Columns;
}

export type AllChartsData = ChartData<chartjs.ChartData>;

export interface DashboardChartConfig {
    id: string;
    name: string;
    type: ChartType;
    getData: (params: GetDataParams) => Promise<AllChartsData | TableData>
}

export interface DashboardConfig {
    id: string;
    name: string;
    charts: DashboardChartConfig[]
}

export const dashboards: DashboardConfig[] = [
    {
        id: 'cafe',
        name: 'Cafe data',
        charts: [{
            id: 'cafeRevenue',
            name: 'Cafe revenue',
            type: ChartType.LINE,
            getData({ startDate, endDate }: GetDataParams) {
                return new Promise((resolve, reject) => {
                    connection.execute({
                        sqlText: `
                            SELECT HEADER_BOOKINGDATE, SUM(HEADER_CASHIER)
                            FROM DEV_EDW_JUNCTION.JUNCTION_2020.CAFE_POS_DATA
                            WHERE HEADER_BOOKINGDATE BETWEEN ? AND ?
                            GROUP BY HEADER_BOOKINGDATE
                            ORDER BY HEADER_BOOKINGDATE
                        `,
                        binds: [formatDate(startDate), formatDate(endDate)],
                        complete: function (err, stmt, rows) {
                            if (err) {
                                console.error('Error', err)
                                reject('Snoflake query failed')
                            } else {
                                resolve({
                                    labels: rows.map((item): any => formatDate(item['HEADER_BOOKINGDATE'])),
                                    datasets: [{
                                        label: 'Revenue',
                                        data: rows.map((item): any => item['SUM(HEADER_CASHIER)'])
                                    }]
                                });
                            }
                        }
                    });
                })
            }
        },
        {
            id: 'mostSoldProducts',
            name: 'Most sold products',
            type: ChartType.TABLE,
            getData({ startDate, endDate }: GetDataParams) {
                return new Promise((resolve, reject) => {
                    connection.execute({
                        sqlText: `
                            SELECT ITEM_CODE, SUM(HEADER_TOTAL), COUNT(ITEM_ID)
                            FROM DEV_EDW_JUNCTION.JUNCTION_2020.CAFE_POS_DATA
                            WHERE HEADER_BOOKINGDATE BETWEEN ? AND ?
                            GROUP BY ITEM_CODE
                        `,
                        binds: [formatDate(startDate), formatDate(endDate)],
                        complete: function (err, stmt, rows) {
                            if (err) {
                                console.error('Error', err)
                                reject('Snoflake query failed')
                            } else {
                                resolve({
                                    columns: [
                                        { field: 'id', headerName: 'ID', width: 200 },
                                        { field: 'revenue', headerName: 'Revenue', width: 100 }
                                    ],
                                    rows: rows.map((item): any => ({
                                        id: item['ITEM_CODE'],
                                        revenue: item['SUM(HEADER_TOTAL)']
                                    }))
                                });
                            }
                        }
                    });
                })
            }
        }]
    },
    {
        id: 'webstore',
        name: 'Webstore data',
        charts: [{
            id: 'wenbstoreRevenue',
            name: 'All-time webstore revenue',
            type: ChartType.LINE,
            getData({ startDate, endDate }: GetDataParams) {
                return new Promise((resolve, reject) => {
                    connection.execute({
                        sqlText: `
                            SELECT DATE(ORDER_TIME), SUM(REVENUE)
                            FROM "DEV_EDW_JUNCTION"."JUNCTION_2020"."WEBSHOP_DATA"
                            GROUP BY ORDER_TIME
                        `,
                        binds: [formatDate(startDate), formatDate(endDate)],
                        complete: function (err, stmt, rows) {
                            if (err) {
                                console.error('Error', err)
                                reject('Snoflake query failed')
                            } else {
                                resolve({
                                    labels: rows.map((item): any => formatDate(item['DATE(ORDER_TIME)'])),
                                    datasets: [{
                                        label: 'Revenue',
                                        data: rows.map((item): any => item['SUM(REVENUE)'])
                                    }]
                                });
                            }
                        }
                    });
                })
            }
        },
        {
            id: 'mostSoldProducts',
            name: 'All-time most sold products',
            type: ChartType.TABLE,
            getData({ startDate, endDate }: GetDataParams) {
                return new Promise((resolve, reject) => {
                    connection.execute({
                        sqlText: `
                            SELECT DISTINCT(PRODUCT_NAME), SUM(REVENUE), COUNT(PRODUCT_NAME)
                            FROM "DEV_EDW_JUNCTION"."JUNCTION_2020"."WEBSHOP_DATA"
                            GROUP BY PRODUCT_NAME
                        `,
                        binds: [formatDate(startDate), formatDate(endDate)],
                        complete: function (err, stmt, rows) {
                            if (err) {
                                console.error('Error', err)
                            } else {
                                resolve({
                                    columns: [
                                        { field: 'id', headerName: 'Index', width: 20 },
                                        { field: 'name', headerName: 'Product name', width: 300 },
                                        { field: 'revenue', headerName: 'Revenue', width: 100 },
                                        { field: 'quantity', headerName: 'Quantity', width: 100 }
                                    ],
                                    rows: rows.map((item, index): any => ({
                                        id: index,
                                        name: item['PRODUCT_NAME'],
                                        revenue: item['SUM(REVENUE)'],
                                        quantity: item['COUNT(PRODUCT_NAME)']
                                    }))
                                });
                            }
                        }
                    });
                })
            }
        }]
    },
    {
        id: 'weather',
        name: 'Weather data',
        charts: [{
            id: 'orderRevenueByWeather',
            name: 'All-time order revenue by weather',
            type: ChartType.PIE,
            getData() {
                return new Promise((resolve, reject) => {
                    connection.execute({
                        sqlText: `
                            SELECT W.V:data[0].weather[0].main as WEATHER, SUM(D.REVENUE) as REVENUE
                            FROM "DEV_EDW_JUNCTION"."JUNCTION_2020"."WEBSHOP_DATA" AS D
                            INNER JOIN (SELECT * FROM "SNOWFLAKE_SAMPLE_DATA"."WEATHER"."DAILY_14_TOTAL" LIMIT 100) AS W
                            ON DAY(W.T)=DAY(D.ORDER_TIME)
                            GROUP BY W.V:data[0].weather[0].main;
                        `,
                        complete: function (err, stmt, rows) {
                            if (err) {
                                console.error('Error', err)
                                reject('Snoflake query failed')
                            } else {
                                resolve({
                                    labels: rows.map((item): any => item['WEATHER']),
                                    datasets: [{
                                        label: 'Revenue',
                                        data: rows.map((item): any => item['REVENUE'])
                                    }]
                                });
                            }
                        }
                    });
                })
            }
        }, {
            id: 'purchaseRevenueByWeather',
            name: 'All-time purhace revenue by weather',
            type: ChartType.PIE,
            getData() {
                return new Promise((resolve, reject) => {
                    connection.execute({
                        sqlText: `
                            SELECT W.V:data[0].weather[0].main as WEATHER, SUM(D.HEADER_TOTAL) as REVENUE
                            FROM "DEV_EDW_JUNCTION"."JUNCTION_2020"."CAFE_POS_DATA" AS D
                            INNER JOIN (SELECT * FROM "SNOWFLAKE_SAMPLE_DATA"."WEATHER"."DAILY_14_TOTAL" LIMIT 100) AS W
                            ON DAY(W.T)=DAY(D.HEADER_BOOKINGDATE)
                            GROUP BY W.V:data[0].weather[0].main;
                        `,
                        complete: function (err, stmt, rows) {
                            if (err) {
                                console.error('Error', err)
                                reject('Snoflake query failed')
                            } else {
                                resolve({
                                    labels: rows.map((item): any => item['WEATHER']),
                                    datasets: [{
                                        label: 'Revenue',
                                        data: rows.map((item): any => item['REVENUE'])
                                    }]
                                });
                            }
                        }
                    });
                })
            }
        }]
    }
]

export function findDashboardById(id: string): DashboardConfig {
    return dashboards.find((dashboard) => dashboard.id === id);
}

export interface DashboardLink {
    name: string;
    id: string;
}
export function getDashboardLinks(): DashboardLink[] {
    return dashboards.map(({ name, id }) => ({
        name,
        id
    }));
}