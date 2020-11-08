import { GetServerSidePropsContext } from 'next';
import { getSession } from 'next-auth/client';
import React from 'react';
import NavBar from '../components/NavBar'
import MainMisellaneous from '../components/MainMisellaneous'
import { getDashboardLinks } from '../config/dashboards';
import { Container } from '@material-ui/core';

const Index = ({ links }) => {
    return (
        <>
            <head>
                <title>RektDash</title>
            </head>
            <NavBar links={links} />
            <Container>
                <MainMisellaneous links={links}/>
            </Container>
        </>  
    )
}

export async function getServerSideProps({ res, req }: GetServerSidePropsContext) {
    const session = await getSession({ req })
    if (!session) {
        res.setHeader("Location", "/api/auth/signin/github");
        res.statusCode = 302;
        res.end();
        return { props: {} };
    }
    
    const links = getDashboardLinks();

    return {
        props: {
            links
        },
    }
}

export default Index;