import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

import InfoMobileComponent from './InfoMobileComponent';
import ReservationInfoComponent from './ReservationInfoComponent';
import GuestRegistrationComponent from './GuestRegistrationComponent';
// import UpsellRoomComponent from './UpsellRoomComponent';
// import AddOnCartComponent from './AddOnCartComponent';
import ReviewComponent from './ReviewComponent';

export default function MainPageComponent() {

    const [getSteps, setSteps] = useState([
        'Reservation Found',
        'Confimation/ Update Guest Info',
        'Upgrade Room Package',
        'Add On Services/ Items',
        'Review your order'
    ]);

    const [secondsLeft, setSecondsLeft] = useState(20);
    const [getActiveStep, setActiveStep] = useState(0);
    const [getHasPackages, setHasPackages] = useState(false);
    const [getHasAddOn, setHasAddOn] = useState(false);
    const [getResultMyKad, setResultMyKad] = useState({});
    const [getGuestAlreadyReg, setGuestAlreadyReg] = useState(false);
    const [getAllowCheckIn, setAllowCheckIn] = useState(false);
    const [getAddToCartItem, setAddToCartItem] = useState({});
    const [getRoomNumber, setRoomNumber] = useState({});

    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state;

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            navigate('/');
        };

        // Add event listener for beforeunload event
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup function to remove event listener when component unmounts
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [navigate]);

    useEffect(() => {
        if (state?.room?.packages && state.room.packages.length > 0) {
            setHasPackages(true)
        }
    }, [state?.room?.packages]);

    useEffect(() => {
        if (state?.addOnItems && state.addOnItems.length > 0) {
            setHasAddOn(true)
        }
    }, [state?.addOnItems]);

    const filteredSteps = getSteps.filter(step => {
        if (!getHasPackages && step === 'Upgrade Room Package') {
            return false;
        }

        if (!getHasAddOn && step === 'Add On Services/ Items') {
            return false;
        }
        return true;
    });

    useEffect(() => {
        if (getActiveStep === filteredSteps.length) {
            const countdownInterval = setInterval(() => {
                setSecondsLeft((prevSeconds) => {
                    if (prevSeconds === 0) {
                        clearInterval(countdownInterval);
                        navigate('/');
                        return 0;
                    }
                    return prevSeconds - 1;
                });
            }, 1000);

            return () => clearInterval(countdownInterval);
        }
    }, [navigate, getActiveStep, filteredSteps.length]);

    const handleNext = () => {
        setActiveStep(getActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep(getActiveStep - 1);
    };

    const handleCheckIn = async () => {

        if (getAllowCheckIn) {

            const u = new URL(state.a.u);
            const path = "api/room";

            u.pathname = u.pathname.endsWith('/')
                ? u.pathname + path
                : u.pathname + '/' + path;

            const api = u.toString();

            //POST
            const data = {
                // Compulsory
                ipAddr: state.a.ip,
                resv_id: location.state.reservation.resv_id,
            };

            try {
                const response = await fetch(api, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': state.a.k
                    },
                    body: JSON.stringify(data)
                });

                const responseData = await response.json();

                if (responseData.msg !== 'ok') {
                    return;
                }
                handleNext();
                setRoomNumber(responseData);

            } catch (error) {
                console.error('Error during saving:', error);
                // You can set a state variable here to handle errors if needed
            }
        }
    };

    const getStepContent = (currPage) => {

        switch (currPage) {
            case 0:
                return <ReservationInfoComponent result={setResultMyKad} />;
            case 1:
                return <GuestRegistrationComponent
                    guestInfo={getResultMyKad?.data?.newGuest}
                    next={setGuestAlreadyReg} />;
            // case 2:
            //     if (getHasPackages) {
            //         return <UpsellRoomComponent />
            //     } else {
            //         handleNext()
            //     }
            //     break
            // case 3:
            //     if (getHasAddOn) {
            //         return <AddOnCartComponent AddToCart={setAddToCartItem} />
            //     } else {
            //         handleNext()
            //     }
            //     break
            case 2:
                return <ReviewComponent
                    guestInfo={getResultMyKad?.data?.newGuest}
                    allowCheckIn={setAllowCheckIn} />
            default:
                return navigate('/')
        }
    }

    useEffect(() => {
        if (getResultMyKad.msg === 'ok') {
            handleNext()
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getResultMyKad]);

    return (
        <div>
            <CssBaseline />
            <Grid container sx={{ height: { xs: '100%', sm: '100dvh' } }}>
                <Grid
                    item
                    sm={12}
                    md={7}
                    lg={8}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        maxWidth: '100%',
                        width: '100%',
                        backgroundColor: { xs: 'transparent', sm: 'background.default' },
                        alignItems: 'start',
                        pt: { xs: 2, sm: 4 },
                        px: { xs: 2, sm: 10 },
                        gap: { xs: 4, md: 8 },
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: { sm: 'space-between', md: 'flex-end' },
                            alignItems: 'center',
                            width: '100%',
                            maxWidth: { sm: '100%', md: 600 },
                        }}
                    >
                        <Box
                            sx={{
                                display: { xs: 'flex', md: 'none' },
                                flexDirection: 'row',
                                width: '100%',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Button
                                startIcon={<ArrowBackRoundedIcon />}
                                onClick={() => { navigate('/') }}
                                sx={{ alignSelf: 'start' }}
                            >
                                Back to Main Page
                            </Button>
                        </Box>
                        <Box
                            sx={{
                                display: { xs: 'none', md: 'flex' },
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                alignItems: 'flex-end',
                                flexGrow: 1,
                                height: 150,
                            }}
                        >
                            <Stepper
                                id="desktop-stepper"
                                activeStep={getActiveStep}
                                sx={{
                                    width: '100%',
                                    height: 40,
                                }}
                            >
                                {filteredSteps.map((label) => (
                                    <Step
                                        sx={{
                                            ':first-of-child': { pl: 0 },
                                            ':last-of-child': { pr: 0 },
                                        }}
                                        key={label}
                                    >
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        </Box>
                    </Box>
                    <Card
                        sx={{
                            display: { xs: 'flex', md: 'flex' },
                            width: '100%',
                        }}
                    >
                        <CardContent
                            sx={{
                                display: 'flex',
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                ':last-of-child': { pb: 2 },
                            }}
                        >
                            <div>
                                <Typography variant="h5">
                                    Reservation Info
                                </Typography>
                            </div>
                            <InfoMobileComponent AddToCart={getAddToCartItem} />
                        </CardContent>
                    </Card>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            flexGrow: 1,
                            width: '100%',
                            maxWidth: { sm: '100%', md: 600 },
                            maxHeight: '720px',
                            gap: { xs: 5, md: 'none' },
                        }}
                    >
                        <Stepper
                            id="mobile-stepper"
                            activeStep={getActiveStep}
                            alternativeLabel
                            sx={{ display: { sm: 'flex', md: 'none' } }}
                        >
                            {filteredSteps.map((label) => (
                                <Step
                                    sx={{
                                        ':first-of-type': { pl: 0 },
                                        ':last-of-child': { pr: 0 },
                                        '& .MuiStepConnector-root': { top: { xs: 6, sm: 12 } },
                                    }}
                                    key={label}
                                >
                                    <StepLabel
                                        sx={{ '.MuiStepLabel-labelContainer': { maxWidth: '70px' } }}
                                    >
                                        {label}
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                        {getActiveStep === filteredSteps.length ? (
                            <Stack spacing={2} useFlexGap>
                                <Typography variant="h1">🛏</Typography>
                                <Typography variant="h5">"Welcome Message"</Typography>
                                <TableContainer component={Paper}>
                                    <Table aria-label="room table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Floor</TableCell>
                                                <TableCell align="right">Room Type</TableCell>
                                                <TableCell align="right">Room Number</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {getRoomNumber.room.map((room, index) => (
                                                <TableRow
                                                    key={index}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell component="th" scope="row">{room.floor_no}</TableCell>
                                                    <TableCell align="right">{room.room_type}</TableCell>
                                                    <TableCell align="right">{room.text}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Typography variant="body1" color="text.secondary">
                                    Redirecting in {secondsLeft} seconds...
                                </Typography>
                            </Stack>
                        ) : (
                            <React.Fragment>
                                {getStepContent(getActiveStep)}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column-reverse', sm: 'row' },
                                        justifyContent: getActiveStep !== 0 ? 'space-between' : 'flex-end',
                                        alignItems: 'end',
                                        flexGrow: 1,
                                        gap: 1,
                                        pb: { xs: 12, sm: 0 },
                                        mt: { xs: 2, sm: 0 },
                                        mb: '60px',
                                    }}
                                >
                                    {getActiveStep !== 0 && (
                                        <Button
                                            startIcon={<ChevronLeftRoundedIcon />}
                                            onClick={handleBack}
                                            variant="text"
                                            sx={{
                                                display: { xs: 'none', sm: 'flex' },
                                            }}
                                        >
                                            Previous
                                        </Button>
                                    )}

                                    {getActiveStep === filteredSteps.length - 1 ? (
                                        // Render Check In Now button only if getAllowCheckIn is true
                                        getAllowCheckIn && (
                                            <Button
                                                variant="contained"
                                                endIcon={<ChevronRightRoundedIcon />}
                                                onClick={handleCheckIn}
                                                sx={{
                                                    width: { xs: '100%', sm: 'fit-content' }
                                                }}
                                            >
                                                Check In Now
                                            </Button>
                                        )
                                    ) : (
                                        // Render Continue button if getActiveStep is not the last step
                                        getActiveStep !== 0 && getGuestAlreadyReg && (
                                            <Button
                                                variant="contained"
                                                endIcon={<ChevronRightRoundedIcon />}
                                                onClick={handleNext}
                                                sx={{
                                                    width: { xs: '100%', sm: 'fit-content' }
                                                }}
                                            >
                                                Continue
                                            </Button>
                                        )
                                    )}

                                </Box>
                            </React.Fragment>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </div>
    );
}