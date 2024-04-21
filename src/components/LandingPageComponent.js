import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import BuildIcon from '@mui/icons-material/Build';
import CircularProgress from '@mui/material/CircularProgress';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import KioskBoard from 'kioskboard';

const { ipcRenderer } = window.require('electron');

const tiers = [
    {
        id: 'bk',
        title: 'Search by Booking Number',
        description: [
            'Information on how to get the booking number'
        ],
        buttonText: 'Search',
        buttonVariant: 'outlined',
    },
    {
        id: 'qr',
        title: 'Scan QR Code',
        subheader: 'Coming soon...',
        description: [
            'This is a description for QR Code.',
        ],
        buttonText: 'Scan',
        buttonVariant: 'outlined',
    },
];

export default function LandingPageComponent() {

    // Access getConfig via props
    // const getConfig = props;
    const [getConfig, setConfig] = useState({});
    let ipAddress;
    const [getOpen, setOpen] = useState(false);
    const navigate = useNavigate();

    // User input fields
    const bkNumRef = useRef(null);

    useEffect(() => {
        if (bkNumRef.current) {
            KioskBoard.run(bkNumRef.current, {
                cssAnimations: false,
                theme: "flat",
                keysEnterText: 'Return',
                keysAllowSpacebar: false,
                keysFontSize: '18px',
                keysIconSize: '18px',
                keysArrayOfObjects: [
                    {
                        "0": "Q",
                        "1": "W",
                        "2": "E",
                        "3": "R",
                        "4": "T",
                        "5": "Y",
                        "6": "U",
                        "7": "I",
                        "8": "O",
                        "9": "P",
                    }, {
                        "0": "A",
                        "1": "S",
                        "2": "D",
                        "3": "F",
                        "4": "G",
                        "5": "H",
                        "6": "J",
                        "7": "K",
                        "8": "L"
                    }, {
                        "1": "Z",
                        "2": "X",
                        "3": "C",
                        "4": "V",
                        "5": "B",
                        "6": "N",
                        "7": "M",
                    }
                ],
                keysSpecialCharsArrayOfStrings: [
                    '$', '!', '~', '&', '=', '#', "[", "]",
                    '.', '_', '-', '+', "@", ".com"
                ],
            });
        }
    }, []);

    useEffect(() => {
        ipcRenderer.send('find-config');
        ipcRenderer.once('result', (event, data) => {
            if (data.msg !== 'ok') {
                alert(`Error: ${data.msg}`);
                return;
            };
            // console.log(data.data)
            setConfig(data.data);
        });
        // Clean up the listener when the component unmounts
        return () => {
            ipcRenderer.removeAllListeners('result');
        };
    }, []);

    const searchBooking = async () => {

        const inputValue = bkNumRef.current.value;

        if (getConfig && getConfig.pms_url) {
            if (!getConfig.pms_url.endsWith("/") && !getConfig.link.startsWith("/")) {
                getConfig.pms_url += "/";
            } else if (getConfig.pms_url.endsWith("/") && getConfig.link.startsWith("/")) {
                getConfig.link = getConfig.link.slice(1);
            }
        }

        const u = new URL(getConfig.pms_url + getConfig.link);

        const k = getConfig.key;
        const ip = getConfig.ipAddress;
        const path = "api/booking";

        u.pathname = u.pathname.endsWith('/')
            ? u.pathname + path
            : u.pathname + '/' + path;

        const api = u.toString();

        if (!inputValue) {
            return;
        }

        const data = {
            dt: moment().format('YYYYMMDD'),
            resvNum: bkNumRef.current.value,
            ipAddr: ip
        };

        handleOpen();

        try {
            const response = await fetch(api, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': k
                },

                body: JSON.stringify(data)
            });

            const responseData = await response.json();
            responseData.a = {
                u: getConfig.pms_url,
                k: k,
                ip: ip,

            };

            if (responseData.msg !== 'ok') {
                handleClose();
                alert(responseData.msg);
                bkNumRef.current.value = '';
            } else {
                handleClose();
                navigate("/MainPageComponent", { state: responseData });
            }
        } catch (error) {
            alert(error.message)
            handleClose();
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    return (
        <Container
            id="type"
            sx={{
                pt: { xs: 4, sm: 12 },
                pb: { xs: 8, sm: 16 },
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: { xs: 3, sm: 6 },
            }}
        >
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={getOpen}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Box
                sx={{
                    width: { sm: '100%', md: '60%' },
                    textAlign: { sm: 'left', md: 'center' },
                }}
            >
                <Typography component="h2" variant="h4" textAlign="center" color="text.primary">
                    a title
                </Typography>
                <Typography variant="body1" textAlign="center" color="text.secondary">
                    a description. <br />
                    second paragraph description.
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
                                    tier.id === 'bk' ? '1px solid' : undefined,
                                borderColor:
                                    tier.id === 'bk' ? 'primary.main' : undefined,
                                background:
                                    tier.id === 'bk'
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
                                        color: tier.id === 'bk' ? 'grey.100' : '',
                                    }}
                                >
                                    <Typography component="h3" variant="h6">
                                        {tier.title}
                                    </Typography>
                                    {tier.id === 'qr' && (
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
                                </Box>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        color: tier.id === 'bk' ? 'grey.50' : undefined,
                                    }}
                                >
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
                                        <TipsAndUpdatesOutlinedIcon
                                            sx={{
                                                width: 20,
                                                color:
                                                    tier.id === 'bk'
                                                        ? 'primary.light'
                                                        : 'primary.main',
                                            }}
                                        />
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
                                <Divider
                                    sx={{
                                        my: 2,
                                        opacity: 0.2,
                                        borderColor: 'grey.500',
                                    }}
                                />
                                {tier.id === 'bk' && (
                                    <div className='Input-div'>
                                        <div className='OutlinedInput-root'>
                                            <input className='Input-bk'
                                                ref={bkNumRef}
                                                data-kioskboard-type="all"
                                                data-kioskboard-placement="bottom"
                                                data-kioskboard-specialcharacters="true"
                                            />
                                        </div>
                                    </div>
                                )}

                            </CardContent>
                            <CardActions>
                                <Button
                                    fullWidth
                                    variant={tier.buttonVariant}
                                    disabled={tier.id === 'qr'}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        searchBooking();
                                    }}
                                >
                                    {tier.buttonText}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container >
    );
}