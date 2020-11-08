import React, { FC } from 'react';
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'

import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Link from 'next/link'
import { DashboardLink } from '../config/dashboards';

interface NavBarProps {
    links: DashboardLink[];
}
const NavBar: FC<NavBarProps> = ({ links }) => {
    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu">

                </IconButton>
                <Typography variant="h6">RektDash</Typography>
                {links.map(({ id, name }) => (
                    <Link key={id} href={{ pathname: `dashboard`, query: { id } }}><Button color="inherit">{name}</Button></Link>
                ))}
                <Link href='/api/auth/signout'><Button color="inherit">Logout</Button></Link>
            </Toolbar>
        </AppBar>
    )
}

export default NavBar;