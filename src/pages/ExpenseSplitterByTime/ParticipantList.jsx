/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable max-len */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import dayjs from 'dayjs';
import { Button, Grid } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import Paper from '@mui/material/Paper';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { v4 as uuidv4 } from 'uuid';
import Participant from './Participant';
import { getLocalItem, saveLocalItem, removeLocalItem } from '../../helpers/storage';

function calculatePayables(participants, pricePerMinute, startTime, endTime) {
  const payables = {};

  let start = startTime;
  while (start.isBefore(endTime)) {
    const activeParticipants = [];

    for (const participant of participants) {
      if (!start.isAfter(participant.endTime) && !start.isBefore(participant.startTime)) {
        activeParticipants.push(participant);
      }
    }

    const pricePerMinutePerParticipant = pricePerMinute / activeParticipants.length;

    for (let i = 0; i < activeParticipants.length; i += 1) {
      let toPay = pricePerMinutePerParticipant;
      if (i === activeParticipants.length - 1) {
        toPay = pricePerMinute - pricePerMinutePerParticipant * i;
      }

      const participant = activeParticipants[i];
      if (payables[participant.id]) {
        payables[participant.id] += toPay;
        continue;
      }

      payables[participant.id] = toPay;
    }

    start = start.add(1, 'minute');
  }

  return payables;
}

const localStorageKey = 'expenseSplitterByTime.participants';

function ParticipantList({
  onCompleteSession, totalPrice, startTime, endTime, isCrossingDay,
}) {
  let duration = endTime.diff(startTime, 'minute');
  duration = duration > 0 ? duration : 1440 + duration;

  const pricePerMinute = totalPrice / duration;

  const [participants, setParticipants] = React.useState([]);
  const [payables, setPayables] = React.useState({});

  React.useEffect(() => {
    const storedParticipants = getLocalItem(localStorageKey);
    if (storedParticipants) {
      setParticipants(storedParticipants.map((participant) => ({
        ...participant,
        startTime: dayjs(participant.startTime),
        endTime: dayjs(participant.endTime),
      })));
    }
  }, []);

  React.useEffect(() => {
    const newPayables = calculatePayables(participants, pricePerMinute, startTime, endTime);
    setPayables(newPayables);
  }, [participants]);

  const onAddParticipant = () => {
    const allParticipants = [
      ...participants,
      {
        id: uuidv4(),
        name: '',
        startTime,
        endTime,
      },
    ];

    saveLocalItem(localStorageKey, allParticipants);
    setParticipants(allParticipants);
  };

  const onDeleteParticipant = (participantID) => {
    const remainingParticipants = participants.filter((participant) => participant.id !== participantID);

    saveLocalItem(localStorageKey, remainingParticipants);
    setParticipants(remainingParticipants);
  };

  const onUpdateParticipantDetails = (updatedParticipant) => {
    const updatedParticipants = participants.map((participant) => {
      if (participant.id === updatedParticipant.id) {
        return updatedParticipant;
      }

      return participant;
    });

    saveLocalItem(localStorageKey, updatedParticipants);
    setParticipants(updatedParticipants);
  };

  const [isCompleteSessionDialogOpened, setIsCompleteSessionDialogOpened] = React.useState(false);

  const onConfirmCompleteSession = () => {
    setIsCompleteSessionDialogOpened(false);
    removeLocalItem(localStorageKey);
    onCompleteSession();
  };

  return (
    <Grid container spacing={3} style={{ marginTop: '10px', marginBottom: '20px' }}>
      <Grid item xs={12}>
        <Button
          variant="contained"
          onClick={() => setIsCompleteSessionDialogOpened(true)}
        >
          Complete session
        </Button>
        <Dialog
          open={isCompleteSessionDialogOpened}
          onClose={() => setIsCompleteSessionDialogOpened(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Done settle & ready to reset?
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              All participants will be removed if you click Yes.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onConfirmCompleteSession}>
              Yes
            </Button>
            <Button onClick={() => setIsCompleteSessionDialogOpened(false)}>
              No
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
      <Grid container spacing={1} item xs={12} style={{ fontSize: '20px' }}>
        <Grid item xs={4} md={1}>
          <u>Duration</u>
          :
        </Grid>
        <Grid item xs={8} md={11}>
          {`${startTime.format('HH:mm')} - ${endTime.format('HH:mm')}`}
        </Grid>
        <Grid item xs={4} md={1}>
          <u>Price</u>
          :
        </Grid>
        <Grid item xs={8} md={11}>
          {`$${totalPrice}`}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ overflowY: 'hidden' }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: '25px' }} />
                  <TableCell style={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }}>Start time</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }}>End time</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }}>Payable</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  {participants.map((participant) => (
                    <Participant
                      key={participant.id}
                      startTime={startTime}
                      endTime={endTime}
                      isCrossingDay={isCrossingDay}
                      participant={participant}
                      payable={payables[participant.id]}
                      onDeleteParticipant={onDeleteParticipant}
                      onUpdateParticipantDetails={onUpdateParticipantDetails}
                    />
                  ))}
                </LocalizationProvider>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" onClick={onAddParticipant} startIcon={<AddIcon />}>
          Add participant
        </Button>
      </Grid>
    </Grid>
  );
}

export default ParticipantList;
