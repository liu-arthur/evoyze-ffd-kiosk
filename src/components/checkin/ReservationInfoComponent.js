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
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import BuildIcon from '@mui/icons-material/Build';
import { styled } from '@mui/system';

import { SnackbarProvider, enqueueSnackbar } from 'notistack';

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
            '🌟 Step Using MyKad',
            '1. Get ready your MyKad.',
            '2. Insert your MyKad into the designated MyKad reader slot.',
            '3. Once your MyKad is inserted, proceed to press the button below.'
        ],
        buttonText: 'Register using Mykad',
        buttonVariant: 'outlined',
    },
    {
        id: 'pp',
        title: 'Passport',
        subheader: 'Coming soon...',
        description: [
            `Exciting news! We're working on introducing a passport scanning feature. `,
            'Stay tuned for updates!'
        ],
        buttonText: 'Register using passport',
        buttonVariant: 'outlined',
    },
];

export default function ReservationComponent({ result }) {

    const [getOpen, setOpen] = React.useState(false);
    const [resvInfo, setResvInfo] = React.useState(null);

    const location = useLocation();
    const navigate = useNavigate();    

    let timeoutId;
    let responseReceived = false;
    const timeoutDuration = 15000; // 15 seconds

    React.useEffect(() => {
        if (location.state) {
            setResvInfo(location.state);
        } else {
            navigate('/');
        }
    }, [location.state, navigate]);

    if (!resvInfo) {
        return <CircularProgress />;
    }

    const ci_dt = moment(resvInfo.reservation.check_in_dt).format('DD-MMM-YYYY');
    const co_dt = moment(resvInfo.reservation.check_out_dt).format('DD-MMM-YYYY');

    const calculateNumOfNights = (dt1, dt2) => {
        const format = 'DD-MMM-YYYY';

        const date1 = moment(dt1, format);
        const date2 = moment(dt2, format);
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
        try {
            timeoutId = setTimeout(() => {
                if (!responseReceived) {
                    disconnectFunction();
                }
            }, timeoutDuration);

            handleOpen();

            ipcRenderer.send('read-mykad');

            ipcRenderer.on('mykad-content', (event, data) => {
                responseReceived = true; // Set flag to true indicating response received
                clearTimeout(timeoutId); // Clear the timeout

                if (data.msg !== 'ok') {
                    handleClose();

                    enqueueSnackbar(data.msg, { variant: 'warning' });
                } else {
                    handleClose();

                    let newGuest = data.data;
                    newGuest["seq"] = 1;
                    result({ msg: 'ok', data: { newGuest } });
                }

            });
        } catch (error) {
            // Handle any unexpected errors
            console.error('An error occurred:', error);
            // Perform necessary error handling actions, such as showing an error message to the user
            enqueueSnackbar('An error occurred while processing your request', { variant: 'error' });
        }

    };

    // Function to handle disconnect
    const disconnectFunction = () => {
        handleClose();
        ipcRenderer.removeAllListeners('mykad-content');
        enqueueSnackbar('No response', { variant: 'info' });
    }

    return (
        <SnackbarProvider
            preventDuplicate
            autoHideDuration={3000}
            maxSnack={2}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}>
            <Container
                id="type"
                sx={{
                    pt: '1rem',
                    pb: '2rem',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2.5rem',
                }}
            >
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
                        width: '100%',
                        textAlign: 'center',
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
                            md={6}
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
                                            {tier.id === 'pp' && (
                                                <Chip
                                                    icon={<BuildIcon />}
                                                    label={tier.subheader}
                                                    size="small"
                                                    sx={{
                                                        background: (theme) =>
                                                            theme.palette.mode === 'light' ? '' : 'none',
                                                        backgroundColor: 'primary.contrastText',
                                                        '& .MuiChip-label': {
                                                            color: 'primary.dark',
                                                        },
                                                        '& .MuiChip-icon': {
                                                            color: 'primary.dark',
                                                        },
                                                    }}
                                                />
                                            )}
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
                                                        tier.id === 'my' ? 'grey.200' : undefined,
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
        </SnackbarProvider>
    );
}