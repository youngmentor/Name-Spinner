import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import CreateMeeting from './pages/createMeeting';
// import MeetingsList from './pages/meetingList';
import AddParticipants from './pages/addParticipants';
import MeetingDetails from './pages/meetingDetails';
import ParticipantsList from './pages/spinParticipants';
<<<<<<< HEAD
import { Toaster } from 'react-hot-toast';
=======
import FileUploadSpinner from './NameSpinner';
>>>>>>> dc41dfdb68a5608b9d8a20d2d410be6e54108987
// import FileUploadSpinner from './NameSpinner';


const App: React.FC = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/create-meeting' element={<CreateMeeting />} />
          <Route path='/' element={<FileUploadSpinner />} />
          <Route path='/meetings/:meetingId' element={<MeetingDetails />} />
          <Route path='/meetings/:id/add-participants' element={<AddParticipants />} />
          <Route path='/meetings/:meetingId/spin-participants' element={<ParticipantsList />} />
        </Routes>
<<<<<<< HEAD
      </HashRouter>
      <Toaster/>
=======
      </BrowserRouter>
>>>>>>> dc41dfdb68a5608b9d8a20d2d410be6e54108987
    </div>
  );
};

export default App;
