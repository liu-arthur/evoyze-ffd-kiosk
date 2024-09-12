import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

const StyledDiv = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(2), // Adds margin below each paragraph
}));

const HighlightedText = styled('span')(() => ({
    fontWeight: 'bold',
}));

const TermsAndConditionsComponent = ({ open, onClose }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Terms and Conditions</DialogTitle>
            <DialogContent>
                <StyledDiv>
                    <Typography variant="body1">
                        <HighlightedText>1. Check-in after 2:00 PM; check-out before 12:00 PM.</HighlightedText>
                    </Typography>
                </StyledDiv>
                <StyledDiv>
                    <Typography variant="body1">
                        <HighlightedText>2. A Tourism Tax of RM 10.00 per room, per night, will be charged to foreign guests.</HighlightedText>
                    </Typography>
                </StyledDiv>
                <StyledDiv>
                    <Typography variant="body1">
                        <HighlightedText>3. Smoking and vaping are prohibited in all rooms. A penalty of RM 200.00 will be imposed for each violation.</HighlightedText> 
                    </Typography>
                </StyledDiv>
                <StyledDiv>
                    <Typography variant="body1">
                        <HighlightedText>4. Pets are not permitted within the hotel premises.</HighlightedText>
                    </Typography>
                </StyledDiv>
                <StyledDiv>
                    <Typography variant="body1">
                        <HighlightedText>5. Fruits such as durian, mangosteen, and dragon fruit are not permitted.</HighlightedText>
                    </Typography>
                </StyledDiv>

                <StyledDiv>
                    <Typography variant="body1">
                        The Hotel will provide individual safe deposit boxes in the room for the secure storage of money, jewelry, and other valuables. We will not be responsible or liable for any loss or injury to such items unless they are deposited with us for safekeeping. In any case, our liability is limited to RM500.00 for any or all such property for an individual guest. Our liabilities are governed by Section 4 of the Innkeepers Ordinance No. 16 of 1952.
                    </Typography>
                </StyledDiv>
                <StyledDiv>
                    <Typography variant="body1">
                        Please notify our front desk service representative if there are any errors in your registration record. We want to ensure that your name and room number are correct so that mail and messages can be delivered promptly. Keys/key cards will only be issued to the registered guest.
                    </Typography>
                </StyledDiv>
                <StyledDiv>
                    <Typography variant="body1">
                        Any credit balance remaining at check-out will be considered payment for any other unspecified services.
                    </Typography>
                </StyledDiv>
                <StyledDiv>
                    <Typography variant="body1">
                        By clicking the tick box, you agree to the collection, processing, usage, and disclosure of your personal data as described in The Everly Group Personal Data Protection Policy Notice, available at: https://theeverlygroup.com.
                    </Typography>
                </StyledDiv>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TermsAndConditionsComponent;
