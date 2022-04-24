import React from 'react';
import dayjs from 'dayjs';
import { Button, TextField, Grid } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ParticipantList from './ParticipantList';
import { useDateTime, useInput } from '../../helpers/hooks';
import { getLocalItem, saveLocalItem, removeLocalItem } from '../../helpers/storage';

const localStorageKey = 'expenseSplitterByTime.session';

function ExpenseSplitterByTime() {
  const totalPrice = useInput('');
  const startTime = useDateTime(null);
  const endTime = useDateTime(null);
  const [isSessionStarted, setIsSessionStarted] = React.useState(false);

  React.useEffect(() => {
    const session = getLocalItem(localStorageKey);
    if (session) {
      totalPrice.set(session.totalPrice);
      startTime.set(dayjs(session.startTime));
      endTime.set(dayjs(session.endTime));
      setIsSessionStarted(true);
    }
  }, []);

  const validateTotalPrice = () => {
    if (!totalPrice.value || totalPrice.value <= 0) {
      totalPrice.triggerError('Please enter the total price for this session.');
      return false;
    }

    totalPrice.clearError();
    return true;
  };

  const validateStartTime = () => {
    if (startTime.value == null) {
      startTime.triggerError('Please enter the start time of this session.');
      return false;
    }

    startTime.clearError();
    return true;
  };

  const validateEndTime = () => {
    if (endTime.value == null) {
      endTime.triggerError('Please enter the end time of this session.');
      return false;
    }

    if (startTime.value != null && endTime.value != null && endTime.value.isSame(startTime.value, 'minute')) {
      endTime.triggerError('The end time of this session cannot be the same as the start time.');
      return false;
    }

    endTime.clearError();
    return true;
  };

  const onStartSession = () => {
    let valid = validateTotalPrice();
    valid = validateStartTime() && valid;
    valid = validateEndTime() && valid;

    if (valid) {
      setIsSessionStarted(true);

      saveLocalItem(localStorageKey, {
        totalPrice: totalPrice.value,
        startTime: startTime.value,
        endTime: endTime.value,
      });
    }
  };

  if (!isSessionStarted) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid container spacing={3} style={{ marginTop: '10px', marginBottom: '20px' }}>
          <Grid item xs={12}>
            <TextField
              id="totalPrice"
              label="Total price"
              type="number"
              {...totalPrice.props}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TimePicker
              id="startTime"
              label="Start time"
              {...startTime.props}
              renderInput={(params) => (
                <TextField
                  {...params}
                  {...startTime.inputProps}
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TimePicker
              id="endTime"
              label="End time"
              {...endTime.props}
              renderInput={(params) => (
                <TextField
                  {...params}
                  {...endTime.inputProps}
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={onStartSession}>
              Start session
            </Button>
          </Grid>
        </Grid>
      </LocalizationProvider>
    );
  }

  const onCompleteSession = () => {
    removeLocalItem(localStorageKey);
    totalPrice.reset();
    startTime.reset();
    endTime.reset();
    setIsSessionStarted(false);
  };

  return (
    <ParticipantList
      onCompleteSession={onCompleteSession}
      totalPrice={totalPrice.value}
      startTime={startTime.value}
      endTime={endTime.value.isBefore(startTime.value) ? endTime.value.add(1, 'day') : endTime.value}
      isCrossingDay={endTime.value.isBefore(startTime.value)}
    />
  );
}

export default ExpenseSplitterByTime;
