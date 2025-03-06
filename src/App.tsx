import React from 'react';
import { Routes, Route, HashRouter } from 'react-router-dom';
import CreateMeeting from './pages/createMeeting';
import MeetingsList from './pages/meetingList';
import AddParticipants from './pages/addParticipants';
import MeetingDetails from './pages/meetingDetails';
import ParticipantsList from './pages/spinParticipants';
// import FileUploadSpinner from './NameSpinner';


const App: React.FC = () => {
  return (
    <div>
      <HashRouter>
        <Routes>
          <Route path='/create-meeting' element={<CreateMeeting />} />
          <Route path='/' element={<MeetingsList />} />
          <Route path='/meetings/:meetingId' element={<MeetingDetails />} />
          <Route path='/meetings/:id/add-participants' element={<AddParticipants />} />
          <Route path='/meetings/:meetingId/spin-participants' element={<ParticipantsList />} />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;
