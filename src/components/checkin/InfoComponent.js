import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import BedIcon from '@mui/icons-material/Hotel';
import CardGiftIcon from '@mui/icons-material/CardGiftcard';

export default function InfoComponent({ RoomUpgrade, AddToCart }) {

  const location = useLocation();
  const state = location.state;

  let totalCharge = 0;
  state.room.forEach((room) => {
    room.charges.forEach((amt) => {
      totalCharge += amt.charge_amt;
    })
  })

  if (AddToCart && AddToCart.length > 0) {
    AddToCart.forEach((item) => {
      totalCharge += item.total_price;
    })
  }

  return (
    <React.Fragment>
      <Typography variant="subtitle2" color="text.secondary">
        Total
      </Typography>
      <Typography variant="h5" gutterBottom>
        $ {totalCharge}
      </Typography>
      <List disablePadding>
        {state.room.map((rate, index) => (
          <div key={index}>
            <ListSubheader
              color="primary"
              sx={{ color: 'text.primary', fontSize: 24, fontWeight: 'bold' }}>
              <ListItemIcon>
                <Typography variant="h6">
                  {index + 1}
                </Typography>
              </ListItemIcon>
              {rate.room_description}
            </ListSubheader>
            {rate.charges.map((charge, chargeIndex) => (
              <ListItem
                key={chargeIndex}
                sx={{ py: 1, px: 1 }}>
                <ListItemText
                  inset
                  sx={{ mr: 2 }}
                  secondary={charge.charge_desc} />
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  sx={{ fontSize: 24 }}>
                  ${charge.charge_amt}
                </Typography>
              </ListItem>
            ))}

            <Divider />
          </div>
        ))}

        {AddToCart && AddToCart.length > 0 && (
          <div>
            <ListSubheader
              color="primary"
              sx={{ color: 'text.primary', fontSize: 24, fontWeight: 'bold' }}>
              <ListItemIcon>
                <CardGiftIcon
                  style={{ marginLeft: "1px" }} />
              </ListItemIcon>
              Add on item
            </ListSubheader>

            {AddToCart.map((item, itemIndex) => (
              <ListItem key={itemIndex} sx={{ py: 1, px: 1 }}>
                <ListItemText
                  inset
                  sx={{ mr: 2 }}
                  secondary={`${item.charge_desc} ($${item.unit_price} * ${item.qty})`}
                />
                <Typography variant="body1" fontWeight="bold" sx={{ fontSize: 24 }}>
                  ${item.total_price}
                </Typography>
              </ListItem>
            ))}
          </div>
        )}
      </List>
    </React.Fragment>
  );
};