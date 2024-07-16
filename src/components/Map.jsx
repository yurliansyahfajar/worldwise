import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./Map.module.css";

function Map() {
  const [searchParams, setSearchParams] = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  const navigate = useNavigate();

  return (
    <div className={styles.mapContainer} onClick={() => navigate("form")}>
      <h1>Position</h1>
      {lat} <br /> {lng}
      <button onClick={() => setSearchParams({ lat: 23, lng: 25 })}>
        {" "}
        Change Position
      </button>
    </div>
  );
}

export default Map;
