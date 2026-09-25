import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import PatientFlow from "./pages/PatientFlow";
import Interview from "./pages/Interview";
import MedicalDocumentUpload from "./pages/MedicalDocumentUpload";
import DoctorDashboard from "./pages/DoctorDashboard";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Default */}
                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/patient"
                            replace
                        />
                    }
                />

                {/* Patient Flow */}
                <Route
                    path="/patient"
                    element={<PatientFlow />}
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
                            to="/doctor/dashboard"
                            replace
                        />
                    }
                />

                {/* Unknown URL */}
                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/patient"
                            replace
                        />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;