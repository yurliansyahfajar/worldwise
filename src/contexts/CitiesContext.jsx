import { createContext, useState, useEffect, useContext } from "react";
const BASE_URL = "http://localhost:8000/cities";

const CitiesContext = createContext();

function CitiesProvider({ children }) {
  const [cities, setCities] = useState([]);
  const [currentCity, setCurrentCity] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(function () {
    const fetchCities = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(BASE_URL);
        const data = await res.json();
        setCities(data);
      } catch (error) {
        throw new Error("Something went wrong with server");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCities();
  }, []);

  const fetchCityById = async (id) => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:8000/cities/${id}`);
      const data = await res.json();
      setCurrentCity(data);
    } catch (error) {
      throw new Error("Something went wrong with server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        onSetCities: setCities,
        onSetLoading: setIsLoading,
        getCityById: fetchCityById,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);

  if (context === undefined)
    throw new Error("CitiesContext was used outside the CitiesProvider");
  return context;
}

export { CitiesProvider, useCities };
