import "./App.css";
import PublicationListing from "./components/PublicationListing";

function App() {
  return (
    <>
      <div className="pageTitle">
        <h2>Library Search</h2>
      </div>

      <div className="App">
        <PublicationListing />
      </div>
    </>
  );
}

export default App;
