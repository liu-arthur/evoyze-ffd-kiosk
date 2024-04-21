import React from 'react';
import moment from 'moment';
import { useNavigate, useLocation } from "react-router-dom";

// @mui/material
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/system';

const { ipcRenderer } = window.require('electron');

const FormGrid = styled(Grid)(() => ({
    display: 'flex',
    flexDirection: 'column',
}));

const tiers = [
    {
        id: 'my',
        title: 'MyKad',
        description: [
            'a description'
        ],
        buttonText: 'Register using Mykad',
        buttonVariant: 'outlined',
    },
    {
        id: 'pp',
        title: 'Passport',
        subheader: '',
        description: [
            'another description',
            'work in progress...',
            'Coming soon...'
        ],
        buttonText: 'Register using passport',
        buttonVariant: 'outlined',
    },
];

export default function ReservationComponent({ result }) {

    const [getOpen, setOpen] = React.useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    let resvInfo;

    let timeoutId;
    let responseReceived = false;
    const timeoutDuration = 15000; // 15 seconds

    if (location.state) {
        resvInfo = location.state;
    } else {
        navigate('/');
    }

    const ci_dt = moment(resvInfo.reservation.check_in_dt).format('DD-MMM-YYYY');
    const co_dt = moment(resvInfo.reservation.check_out_dt).format('DD-MMM-YYYY');

    const calculateNumOfNights = (dt1, dt2) => {
        const date1 = moment(dt1);
        const date2 = moment(dt2);
        const numOfNight = date2.diff(date1, 'days');

        return numOfNight;
    }
    const numOfNight = calculateNumOfNights(ci_dt, co_dt);

    const handleClose = () => {
        setOpen(false);
    };
    const handleOpen = () => {
        setOpen(true);
    };

    const handleRegisterMyKad = async () => {

        timeoutId = setTimeout(() => {
            if (!responseReceived) {
                disconnectFunction();
            }
        }, timeoutDuration);

        handleOpen()

        ipcRenderer.send('read-mykad');

        ipcRenderer.on('mykad-content', (event, data) => {
            responseReceived = true; // Set flag to true indicating response received
            clearTimeout(timeoutId); // Clear the timeout

            if (data.msg !== 'ok') {
                alert(data.msg);

                handleClose();
            } else {

                let newGuest = data.data;
                newGuest["seq"] = 1;
                result({ msg: 'ok', data: { newGuest } });

                handleClose();
            }

        });

    };

    // Function to handle disconnect
    const disconnectFunction = () => {
        ipcRenderer.removeAllListeners('mykad-content');
        // console.log("No response received within 10 seconds. Disconnecting...");

        handleClose();
    }

    return (
        <Container >
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={getOpen}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Grid container spacing={3}>
                <FormGrid item xs={12}>
                    <FormLabel>
                        Guest Name
                    </FormLabel>
                    <OutlinedInput
                        placeholder={resvInfo.reservation.cust_name.toUpperCase()}
                        readOnly
                    />
                </FormGrid>
                <FormGrid item xs={6}>
                    <FormLabel>
                        Booking Number
                    </FormLabel>
                    <OutlinedInput
                        placeholder={resvInfo.reservation.resv_no.toUpperCase()}
                        readOnly
                    />
                </FormGrid>
                <FormGrid item xs={3}>
                    <FormLabel>
                        Staying Period
                    </FormLabel>
                    <OutlinedInput
                        placeholder={numOfNight > 1 ? numOfNight + ' nights' : numOfNight + ' night'}
                        readOnly
                    />
                </FormGrid>
                <FormGrid item xs={3}>
                    <FormLabel>
                        # of Rooms
                    </FormLabel>
                    <OutlinedInput
                        placeholder={resvInfo.reservation.no_of_room > 1 ? resvInfo.reservation.no_of_room + ' rooms' : resvInfo.reservation.no_of_room + ' room'}
                        readOnly
                    />
                </FormGrid>
                <FormGrid item xs={6}>
                    <FormLabel>
                        Check In Date
                    </FormLabel>
                    <OutlinedInput
                        placeholder={ci_dt}
                        readOnly
                    />
                </FormGrid>
                <FormGrid item xs={6}>
                    <FormLabel>
                        Check Out Date
                    </FormLabel>
                    <OutlinedInput
                        placeholder={co_dt}
                        readOnly
                    />
                </FormGrid>
            </Grid>

            <Divider
                sx={{
                    my: 2,
                    opacity: 0.5,
                    borderColor: 'grey.900',
                }}
            />
            <Box
                sx={{
                    width: { sm: '100%', md: '60%' },
                    textAlign: { sm: 'left', md: 'center' },
                }}
            >
                <Typography component="h2" variant="h4" textAlign="center" color="text.primary">
                    Check-in Using Mykad/ Passport?
                </Typography>
            </Box>

            <Grid container spacing={4} alignItems="center" justifyContent="center">
                {tiers.map((tier) => (
                    <Grid
                        item
                        key={tier.title}
                        xs={12}
                        sm={6}
                        md={4}
                    >
                        <Card
                            sx={{
                                p: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4,
                                border:
                                    tier.id === 'my' ? '1px solid' : undefined,
                                borderColor:
                                    tier.id === 'my' ? 'primary.main' : undefined,
                                background:
                                    tier.id === 'my'
                                        ? 'linear-gradient(#033363, #021F3B)'
                                        : undefined,
                            }}
                        >
                            <CardContent>
                                <Box
                                    sx={{
                                        mb: 1,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        color: tier.id === 'my' ? 'grey.100' : '',
                                    }}
                                >
                                    <Typography component="h3" variant="h6">
                                        {tier.title}
                                    </Typography>
                                </Box>
                                <Divider
                                    sx={{
                                        my: 2,
                                        opacity: 0.2,
                                        borderColor: 'grey.500',
                                    }}
                                />
                                {tier.description.map((line) => (
                                    <Box
                                        key={line}
                                        sx={{
                                            py: 1,
                                            display: 'flex',
                                            gap: 1.5,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Typography
                                            component="span"
                                            variant="subtitle2"
                                            sx={{
                                                color:
                                                    tier.id === 'bk' ? 'grey.200' : undefined,
                                            }}
                                        >
                                            {line}
                                        </Typography>
                                    </Box>
                                ))}
                            </CardContent>
                            <CardActions>
                                <Button
                                    fullWidth
                                    variant={tier.buttonVariant}
                                    disabled={tier.id === 'pp'}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleRegisterMyKad()
                                    }}
                                >
                                    {tier.buttonText}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}