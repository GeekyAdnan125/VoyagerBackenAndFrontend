import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [createCom, setCreateCom] = useState(false);
  const [location, setLocation] = useState({});
  const [address, setAddress] = useState("");
  const [currentcity, setCurrentcity] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [souvenirLocation, setSouvenirLocation] = useState("");
  const [HotelLocation, setHotelLocation] = useState("");



  // Selected hotel for global access
  const [selectedHotel, setSelectedHotel] = useState(null);
  
  // Log whenever selectedHotel changes
  useEffect(() => {
    console.log("[AppContext] selectedHotel changed:", selectedHotel);
  }, [selectedHotel]);

  // emergency contacts
  const [emergencyContacts, setEmergencyContacts] = useState(() => {
    const saved = localStorage.getItem("emergencyContacts");
    return saved
      ? JSON.parse(saved)
      : {
          mom: "",
          dad: "",
          friend: "",
        };
  });

  useEffect(() => {
    localStorage.setItem("emergencyContacts", JSON.stringify(emergencyContacts));
  }, [emergencyContacts]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");
    const name = localStorage.getItem("userName");
    if (token && role && email) { 
      setUser({ token, role, email, name });
    }
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        logout,
        sidebarOpen,
        setSidebarOpen,
        profileOpen,
        setProfileOpen,
        createCom,
        setCreateCom,
        location,
        setLocation,
        address,
        setAddress,
        currentcity,
        setCurrentcity,
        userDetails,
        setUserDetails,
        isLoading,
        setIsLoading,
        souvenirLocation,
        setSouvenirLocation,
        HotelLocation,
        setHotelLocation,
        emergencyContacts,  
        setEmergencyContacts,  
        selectedHotel,
        setSelectedHotel,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
