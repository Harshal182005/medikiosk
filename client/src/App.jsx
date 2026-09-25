import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import RoleSelection from "./pages/RoleSelection";
import PatientFlow from "./pages/PatientFlow";
import Interview from "./pages/Interview";
import MedicalDocumentUpload from "./pages/MedicalDocumentUpload";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorLogin from "./pages/DoctorLogin";
import PatientReview from "./pages/PatientReview";


function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Main Landing Page */}
                <Route
                    path="/"
                    element={<RoleSelection />}
                />

                {/* Patient Flow */}
                <Route
                    path="/patient"
                    element={<PatientFlow />}
                />

                {/* Patient Review */}
                <Route
                    path="/patient/review"
                    element={<PatientReview />}
                />

                {/* AI Interview */}
                <Route
                    path="/patient/interview"
                    element={<Interview />}
                />

                {/* Medical Documents */}
                <Route
                    path="/patient/documents"
                    element={
                        <MedicalDocumentUpload />
                    }
                />

                {/* Doctor Login */}
                <Route
                    path="/doctor/login"
                    element={<DoctorLogin />}
                />

                {/* Doctor Dashboard */}
                <Route
                    path="/doctor/dashboard"
                    element={
                        <DoctorDashboard />
                    }
                />

                {/* Old doctor route */}
                <Route
                    path="/doctor"
                    element={
                        <Navigate
                            to="/doctor/login"
                            replace
                        />
                    }
                />

                {/* Unknown URL */}
                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;