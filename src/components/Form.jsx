// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"
import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { useUrlPosition } from "../hooks/useUrlPositions";
import Button from "./Button";
import styles from "./Form.module.css";
import Message from "./Message";
import Spinner from "./Spinner";
import DatePicker from "react-datepicker";
import { useCities } from "../contexts/CitiesContext";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const initialState = {
  cityName: "",
  country: "",
  date: new Date(),
  notes: "",
  isLoadingGeocoding: false,
  geocodingError: "",
  emoji: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return {
        ...state,
        cityName: action.payload.city || action.payload.locality || "",
        country: action.payload.countryName,
        emoji: convertToEmoji(action.payload.countryCode),
      };
    case "setCity":
      return {
        ...state,
        cityName: action.payload,
      };
    case "setDate":
      return {
        ...state,
        date: action.payload,
      };
    case "setNotes":
      return {
        ...state,
        notes: action.payload,
      };
    case "geoLoading":
      return {
        ...state,
        isLoadingGeocoding: action.payload,
      };
    case "geoError":
      return {
        ...state,
        geocodingError: action.payload,
      };
    case "noteReceived":
      return {
        ...state,
        notes: action.payload,
      };
    default:
      throw new Error("Action not recognize");
  }
}

function Form() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    cityName,
    country,
    date,
    notes,
    isLoadingGeocoding,
    geocodingError,
    emoji,
  } = state;

  const navigate = useNavigate();
  const [lat, lng] = useUrlPosition();
  const { createCity, isLoading } = useCities();

  useEffect(
    function () {
      if (!lat && !lng) return;
      const fetchCityByCoor = async () => {
        try {
          dispatch({ type: "geoLoading", payload: true });
          dispatch({ type: "geoError", payload: "" });

          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}`
          );
          const data = await res.json();

          if (!data.countryCode) {
            throw new Error(
              "No city were selected, please click somewhere else."
            );
          }
          dispatch({ type: "dataReceived", payload: data });
        } catch (error) {
          dispatch({ type: "geoError", payload: error.message });
        } finally {
          dispatch({ type: "geoLoading", payload: false });
        }
      };
      fetchCityByCoor();
    },
    [lat, lng]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cityName || !date) return;
    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    };
    await createCity(newCity);
    navigate("/app/cities");
  }

  if (!lat && !lng)
    return <Message message={`Please click wherever on the map`} />;
  if (isLoadingGeocoding) return <Spinner />;
  if (geocodingError) return <Message message={geocodingError} />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) =>
            dispatch({ type: "setCity", payload: e.target.value })
          }
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>

        <DatePicker
          id="date"
          selected={date}
          onChange={(date) => dispatch({ type: "setDate", payload: date })}
          dateFormat="dd/MM/yyyy"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) =>
            dispatch({ type: "setNotes", payload: e.target.value })
          }
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <Button
          type="back"
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
        >
          &larr; Back
        </Button>
      </div>
    </form>
  );
}

export default Form;
