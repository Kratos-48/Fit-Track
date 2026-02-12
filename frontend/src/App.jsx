import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import CreateMemberPage from "./pages/CreateMemberPage";
import MemberDetailPage from "./pages/MemberDetailPage";
import PaymentsPage from "./pages/PaymentsPage";


const App = () => {
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/members/details" element={<MemberDetailPage />} />
        <Route path="/members/create" element={<CreateMemberPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
      </Routes>
    </div>
  );
};

export default App;
