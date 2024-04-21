import * as React from 'react';
import { useNavigate, useLocation } from "react-router-dom";

import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function ReviewComponent({ guestInfo, allowCheckIn }) {

    const location = useLocation();
    const navigate = useNavigate();
    let resvInfo;

    if (location.state) {
        resvInfo = location.state;
    } else {
        navigate('/');
    }

    let totalCharge = 0;
    resvInfo.room.forEach((room) => {
        room.charges.forEach((amt) => {
            totalCharge += amt.charge_amt;
        })
    })

    const totalPymt = resvInfo.reservation.total_pymt;

    if (Math.abs(totalCharge + totalPymt) === 0) {
        allowCheckIn(true);
    };

    const addresses = [guestInfo.add1, guestInfo.add2, guestInfo.add3, guestInfo.postcode, guestInfo.state];

    return (
        <Stack spacing={2}>
            <List disablePadding>
                {resvInfo.room.map((room, index) => (
                    <ListItem key={index} sx={{ py: 1, px: 0 }}>
                        <ListItemText
                            primary={room.room_description}
                            secondary={
                                room.charges.map((charge, index) => (
                                    <React.Fragment key={index}>
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            color="textSecondary"
                                        >
                                            {charge.charge_desc}
                                        </Typography>
                                        <br />
                                    </React.Fragment>
                                ))
                            }
                        />
                        <Typography variant="body2">
                            {room.charges.map((amt, index) => (
                                <span key={index}>$ {amt.charge_amt}</span>
                            ))}
                        </Typography>
                    </ListItem>
                ))}

                <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Total" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        $ {totalCharge.toFixed(2)}
                    </Typography>
                </ListItem>
            </List>
            <Divider />
            <Stack
                direction="column"
                divider={<Divider flexItem />}
                spacing={2}
                sx={{ my: 2 }}
            >
                <div>
                    <Typography variant="subtitle2" gutterBottom>
                        Reservation details
                    </Typography>
                    <Typography gutterBottom sx={{ fontWeight: 700 }}>{guestInfo.name}</Typography>
                    <Typography color="text.secondary" gutterBottom>
                        {addresses.join(', ')}
                    </Typography>
                </div>
                <div>
                    <Typography variant="subtitle2" gutterBottom>
                        Payment details
                    </Typography>
                    <Grid container>
                        {Math.abs(totalCharge + totalPymt) === 0 ? (
                            <React.Fragment key={guestInfo.name}>
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    useFlexGap
                                    sx={{ width: '100%', mb: 1 }}
                                >
                                    <Typography variant="body1" color="text.secondary">

                                    </Typography>
                                    <Typography gutterBottom sx={{ fontWeight: 700 }}>
                                        Payment Complete
                                    </Typography>
                                </Stack>
                            </React.Fragment>
                        ) : (
                            <React.Fragment key={guestInfo.name}>
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    useFlexGap
                                    sx={{ width: '100%', mb: 1 }}
                                >
                                    <Typography variant="body1" color="text.secondary">

                                    </Typography>
                                    <Typography gutterBottom sx={{ fontWeight: 700 }}>
                                        Pending Payment
                                    </Typography>
                                </Stack>
                            </React.Fragment>
                        )}
                    </Grid>
                </div>
            </Stack>
        </Stack>
    );
}