import React, { useState, useEffect } from 'react';

import { Container, Typography } from '@material-ui/core';
import { NextPage, NextPageContext } from 'next';
import NavBar from '../components/NavBar'
import RenderChart from '../components/RenderChart';
import { formatDate, parseDate } from '../util/date';
import subDays from 'date-fns/subDays';
import { DateRangePicker } from 'react-nice-dates'
import 'react-nice-dates/build/style.css'
import { enGB } from 'date-fns/locale'
import { useRouter } from 'next/router'
import fromUnixTime from 'date-fns/fromUnixTime'
import { getSession } from 'next-auth/client';
import { findDashboardById, getDashboardLinks, DashboardLink, TableData } from '../config/dashboards';
import chartjs from 'chart.js'
import { ChartType } from '../enum/ChartType';
import { ChartData } from 'react-chartjs-2';

export interface ProsessedChart {
    id: string;
    type: ChartType;
    name: string;
    data: ChartData<chartjs.ChartData> | TableData;
}

interface IndexProps {
    id: string;
    name: string;
    links: DashboardLink[];
    startDateString: string;
    endDateString: string;
    chartsProsesed: ProsessedChart[]
}
const Index: NextPage<IndexProps> = ({ name, id, links, chartsProsesed, startDateString, endDateString }) => {
    const startDate = new Date(startDateString)
    const endDate = new Date(endDateString)

    const [calendarStartDate, setCalendarStartDate] = useState<Date>(startDate);
    const [calendarEndDate, setCalendarEndDate] = useState<Date>(endDate);
    const router = useRouter();

    useEffect(() => {
        if (calendarStartDate?.valueOf() < calendarEndDate?.valueOf()) {
            router.push({
                href: '/dashboard',
                query: {
                    id,
                    start_date: formatDate(calendarStartDate),
                    end_date: formatDate(calendarEndDate)
                }
            })    
        }
    }, [calendarStartDate, calendarEndDate])
    
    return (
        <>
            <NavBar links={links} />
            <Container>
                <Typography variant='h1'>{name}</Typography>
                <DateRangePicker
                    startDate={calendarStartDate}
                    endDate={calendarEndDate}
                    onStartDateChange={setCalendarStartDate}
                    onEndDateChange={setCalendarEndDate}
                    minimumDate={fromUnixTime(0)}
                    minimumLength={1}
                    format='dd MMM yyyy'
                    locale={enGB}
                >
                {({ startDateInputProps, endDateInputProps, focus }) => (
                    <div className='date-range'>
                    <input
                        className={'input' + (focus === 'startDate' ? ' -focused' : '')}
                        {...startDateInputProps}
                        placeholder='Start date'
                    />
                    <span className='date-range_arrow' />
                    <input
                        className={'input' + (focus === 'endDate' ? ' -focused' : '')}
                        {...endDateInputProps}
                        placeholder='End date'
                    />
                    </div>
                )}
                </DateRangePicker>

                {chartsProsesed.map((chart) => (
                    <div id={chart.id}>
                        <Typography variant='h4'>{chart.name}</Typography>
                        <RenderChart chart={chart} />
                    </div>
                ))}
            </Container>
        </>
    )
}

export async function getServerSideProps({ res, req, query }: NextPageContext) {
    const session = await getSession({ req })
    if (!session) {
        res.setHeader("Location", "/api/auth/signin/github");
        res.statusCode = 302;
        res.end();
        return { props: {} };
    }

    const { start_date, end_date, id } = query;

    const startDate = start_date ? parseDate(start_date as string) : subDays(new Date(), 30);
    const endDate = end_date ? parseDate(end_date as string) : new Date();
    
    const {name, charts} = findDashboardById(id as string);
    const links = getDashboardLinks();

    const chartsProsesed: ProsessedChart[] = [];
    for (const { name, getData, id, type } of charts) {
        const data = await getData({ startDate, endDate });
        const chart: ProsessedChart = {
            id,
            name,
            data,
            type
        }
        chartsProsesed.push(chart)
    }

    return {
        props: {
            id,
            name,
            links,
            startDateString: startDate.toString(),
            endDateString: endDate.toString(),
            chartsProsesed
        },
    }
}
  
export default Index;