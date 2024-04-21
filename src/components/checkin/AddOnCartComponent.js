import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { Unstable_NumberInput as BaseNumberInput } from '@mui/base/Unstable_NumberInput';
import { styled } from '@mui/system';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

const cardStyle = {
    width: '11rem',
    height: '20rem'
}

export default function AddOnCartComponent({ AddToCart }) {

    const location = useLocation();
    const state = location.state;
    const addOnItems = state.addOnItems;

    const [getAddToCart, setAddToCart] = useState([]);
    const [getQuantities, setQuantities] = useState(Array(addOnItems.length).fill(0));

    const NumberInput = React.forwardRef(function CustomNumberInput(props, ref) {
        return (
            <BaseNumberInput
                slots={{
                    root: StyledInputRoot,
                    input: StyledInput,
                    incrementButton: StyledButton,
                    decrementButton: StyledButton,
                }}
                slotProps={{
                    incrementButton: {
                        children: <AddIcon fontSize="small" />,
                        className: 'increment',
                    },
                    decrementButton: {
                        children: <RemoveIcon fontSize="small" />,
                    },
                }}
                {...props}
                ref={ref}
            />
        );
    });

    const handleQuantityChange = (val, itemIndex, item) => {
        const newQuantities = [...getQuantities];
        newQuantities[itemIndex] = val;
        setQuantities(newQuantities);

        const newItemData = [...getAddToCart]; // Copy the current item data
        if (val > 0) {
            newItemData[itemIndex] = {
                charge_id: item.charge_id,
                charge_desc: item.add_on_desc,
                qty: val,
                unit_price: item.charge_amt,
                total_price: item.charge_amt * val,
            };
        } else {
            newItemData.splice(itemIndex, 1); // Remove the item data if quantity is 0
        }

        setAddToCart(newItemData);
    };

    useEffect(() => {
        AddToCart(getAddToCart);
    }, [getAddToCart, AddToCart]);

    return (
        <Container
            id="type"
            sx={{
                pt: { xs: 2, sm: 6 },
                pb: { xs: 4, sm: 8 },
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: { xs: 6, sm: 12 },
            }}
        >
            <h2>At You Service.</h2>
            <Grid item sx={{ flexGrow: 1 }} container spacing={5}>
                <Grid item xs={12}>
                    <Grid container justifyContent="center" spacing={2}>
                        {addOnItems.map((item, index) => (
                            <Grid key={index} item>
                                <Card
                                    style={cardStyle}
                                    sx={{
                                        p: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        border: '1px solid',
                                        borderColor: 'primary.main',
                                    }}
                                >
                                    <CardContent>
                                        <Box
                                            sx={{
                                                mb: 1,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                color: 'primary.main',
                                            }}
                                        >
                                            <Typography component="h3" variant="h6">
                                                {item.add_on_desc}
                                            </Typography>
                                        </Box>
                                        <Divider
                                            sx={{
                                                my: 2,
                                                opacity: 0.2,
                                                borderColor: 'primary.main',
                                            }}
                                        />
                                        <Grid item
                                            container
                                            xs={12}
                                            justifyContent="space-between">
                                            <Typography
                                                variant="caption"
                                                align="left"
                                                gutterBottom
                                            >
                                                Price:
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                align="right"
                                                gutterBottom
                                            >
                                                Total price:
                                            </Typography>
                                        </Grid>
                                        <Grid item
                                            container
                                            xs={12}
                                            justifyContent="space-between">
                                            <Typography
                                                variant="caption"
                                                align="left"
                                                gutterBottom
                                            >
                                                ${item.charge_amt}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                align="right"
                                                gutterBottom
                                            >
                                                ${item.charge_amt * getQuantities[index]}
                                            </Typography>
                                        </Grid>
                                    </CardContent>
                                    <CardActions>
                                        <NumberInput
                                            defaultValue={0}
                                            min={0}
                                            max={10}
                                            value={getQuantities[index]}
                                            // onChange={(event, val) => {
                                            //     const newQuantities = [...getQuantities];
                                            //     newQuantities[index] = val;
                                            //     setQuantities(newQuantities);
                                            // }}
                                            onChange={(event, val) => handleQuantityChange(val, index, item)}
                                        />
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </Container >
    );
};

const blue = {
    100: '#daecff',
    200: '#b6daff',
    300: '#66b2ff',
    400: '#3399ff',
    500: '#007fff',
    600: '#0072e5',
    700: '#0059B2',
    800: '#004c99',
};

const grey = {
    50: '#F3F6F9',
    100: '#E5EAF2',
    200: '#DAE2ED',
    300: '#C7D0DD',
    400: '#B0B8C4',
    500: '#9DA8B7',
    600: '#6B7A90',
    700: '#434D5B',
    800: '#303740',
    900: '#1C2025',
};

const StyledInputRoot = styled('div')(
    ({ theme }) => `
    font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 400;
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[500]};
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
  `,
);

const StyledInput = styled('input')(
    ({ theme }) => `
    font-size: 0.875rem;
    font-family: inherit;
    font-weight: 400;
    line-height: 1.375;
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    box-shadow: 0px 2px 4px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.5)' : 'rgba(0,0,0, 0.05)'
        };
    border-radius: 8px;
    margin: 0 8px;
    padding: 10px 12px;
    outline: 0;
    min-width: 0;
    width: 4rem;
    text-align: center;
  
    &:hover {
      border-color: ${blue[400]};
    }
  
    &:focus {
      border-color: ${blue[400]};
      box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[700] : blue[200]};
    }
  
    &:focus-visible {
      outline: 0;
    }

    &:disabled
  `,
);

const StyledButton = styled('button')(
    ({ theme }) => `
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.875rem;
    box-sizing: border-box;
    line-height: 1.5;
    border: 1px solid;
    border-radius: 999px;
    border-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
    background: ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
    color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
    width: 32px;
    height: 32px;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 120ms;
  
    &:hover {
      cursor: pointer;
      background: ${theme.palette.mode === 'dark' ? blue[700] : blue[500]};
      border-color: ${theme.palette.mode === 'dark' ? blue[500] : blue[400]};
      color: ${grey[50]};
    }
  
    &:focus-visible {
      outline: 0;
    }
  
    &.increment {
      order: 1;
    }
  `,
);