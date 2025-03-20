import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import CreateMeeting from './pages/createMeeting';
import MeetingsList from './pages/meetingList';
import AddParticipants from './pages/addParticipants';
import MeetingDetails from './pages/meetingDetails';
import ParticipantsList from './pages/spinParticipants';


const App: React.FC = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<CreateMeeting />} />
          <Route path='/meetings' element={<MeetingsList />} />
          <Route path='/meetings/:meetingId' element={<MeetingDetails />} />
          <Route path='/meetings/:id/add-participants' element={<AddParticipants />} />
          <Route path='/meetings/:meetingId/spin-participants' element={<ParticipantsList />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
