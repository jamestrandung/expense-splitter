/* eslint-disable max-len */
import React from 'react';
import { TextField } from '@mui/material';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDateTime } from '../../helpers/hooks';

function Participant({
  startTime, endTime, isCrossingDay, participant, payable, onDeleteParticipant, onUpdateParticipantDetails,
}) {
  const participantStart = useDateTime(participant.startTime);
  const participantEnd = useDateTime(participant.endTime);

  const onTimeUpdate = (component, newTime) => {
    if (newTime == null) {
      component.triggerError('Time must be within the start & end time of this session.');
      return null;
    }

    const cleanNewTime = newTime.millisecond(0);

    if (!cleanNewTime.isBefore(startTime) && !cleanNewTime.isAfter(endTime)) {
      component.clearError();
      return cleanNewTime;
    }

    if (isCrossingDay) {
      const newTimeNextDay = cleanNewTime.add(1, 'day');
      if (!newTimeNextDay.isBefore(startTime) && !newTimeNextDay.isAfter(endTime)) {
        component.clearError();
        return newTimeNextDay;
      }
    }

    component.triggerError('Time must be time within the start & end time of this session.');
    return null;
  };

  return (
    <TableRow
      key={participant.id}
      hover
    >
      <TableCell>
        <IconButton aria-label="delete" onClick={() => onDeleteParticipant(participant.id)}>
          <DeleteIcon />
        </IconButton>
      </TableCell>
      <TableCell>
        <TimePicker
          id={`startTime${participant.id}`}
          label="Start time"
          {...participantStart.props}
          onChange={(newTime) => {
            const validTime = onTimeUpdate(participantStart, newTime);
            if (validTime != null) {
              participantStart.props.onChange(validTime);
              onUpdateParticipantDetails({
                ...participant,
                startTime: validTime,
              });
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              {...participantStart.inputProps}
              fullWidth
            />
          )}
        />
      </TableCell>
      <TableCell>
        <TimePicker
          id={`endTime${participant.id}`}
          label="End time"
          {...participantEnd.props}
          onChange={(newTime) => {
            const validTime = onTimeUpdate(participantEnd, newTime);
            if (validTime != null) {
              participantEnd.props.onChange(validTime);
              onUpdateParticipantDetails({
                ...participant,
                endTime: validTime,
              });
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              {...participantEnd.inputProps}
              fullWidth
            />
          )}
        />
      </TableCell>
      <TableCell>
        <TextField
          id={`name${participant.id}`}
          label="Name"
          value={participant.name}
          onChange={(e) => {
            onUpdateParticipantDetails({
              ...participant,
              name: e.target.value,
            });
          }}
          fullWidth
        />
      </TableCell>
      <TableCell
        component="th"
        scope="row"
      >
        {`$${Math.round((payable + Number.EPSILON) * 100) / 100}`}
      </TableCell>
    </TableRow>
  );
}

export default Participant;
