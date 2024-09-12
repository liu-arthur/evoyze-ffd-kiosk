import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Select, MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function MyAccordion() {
    const [selectedOption, setSelectedOption] = useState('');

    const handleChange = (event) => {
        setSelectedOption(event.target.value);
    };

    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel-content"
                id="panel-header"
            >
                <Typography>Accordion Title</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Select
                    value={selectedOption}
                    onChange={handleChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Without label' }}
                    fullWidth
                >
                    <MenuItem value="No Thanks.."><em>No Thanks..</em></MenuItem>
                    <MenuItem value={'option1'}>Option 1</MenuItem>
                    <MenuItem value={'option2'}>Option 2</MenuItem>
                    <MenuItem value={'option3'}>Option 3</MenuItem>
                </Select>
            </AccordionDetails>
        </Accordion>
    );
}