import React from 'react';
import {
  Container,
} from '@mui/material';
import ExpenseSplitterByTime from './pages/ExpenseSplitterByTime/ExpenseSplitterByTime';

function App() {
  return (
    <Container maxWidth="xl">
      <ExpenseSplitterByTime />
    </Container>
  );
}

export default App;
