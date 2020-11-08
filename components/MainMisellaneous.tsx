import React, { FC } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { DashboardLink } from '../config/dashboards';
import Typography from '@material-ui/core/Typography'
import Link from 'next/link'

interface NavBarProps {
    links: DashboardLink[];
}
const NavBar: FC<NavBarProps> = ({ links }) => {
    return (
        <>
            <Typography variant="h1">RektDash</Typography>
            <Typography gutterBottom>
                <hr/>
                Sovelluksessamme pystymme nyt katsomaan erilaisia tilastoja tietokannasta. 
                näemme xy-koordinaatistossa liikevaihdon päivämäärittäin ja pylväsdiagrammin josta näemme liikevaihdon tuotteittain.
            </Typography>
            <hr/>
            <Typography variant='h5'>Dashboards:</Typography>
            <List>
                {links.map(({ id, name }) => (
                    <Link key={id} href={{ pathname: `dashboard`, query: { id } }}>
                        <ListItem button>
                            <ListItemText primary={name} />
                        </ListItem>
                    </Link>
                ))}
            </List>
        </>
    )
}

export default NavBar;