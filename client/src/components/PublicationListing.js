/* eslint-disable jsx-a11y/anchor-is-valid */
import axios from "axios";
import { useEffect, useState } from "react";
import PublicationCard from "./PublicationCard";
import { Pagination } from "@material-ui/lab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleUp } from "@fortawesome/free-solid-svg-icons";
// import {  } from "@fortawesome/fontawesome-svg-core";
import "../App.css";

import {
  Grid,
  makeStyles,
  TextField,
  InputLabel,
  Button,
  FormControl,
  Select,
  Chip,
  MenuItem,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: "0 5em",
  },
  formControl: {
    minWidth: 180,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  paper: {
    maxWidth: "100%",
    margin: `${theme.spacing(1)}px auto`,
    padding: theme.spacing(2),
  },
  clearLink: {
    marginLeft: "20px",
  },

  "@keyframes fadeIn": {
    "0%": {
      opacity: 0,
    },
    "100%": {
      opacity: 1,
    },
  },
  scrollTop: {
    position: "fixed",
    bottom: "20px",
    right: "30px",
    color: "#fff",
    height: "50",
    zIndex: "1000",
    cursor: "pointer",
    animation: "$fadeIn 0.6s",
    transition: "$opacity 0.4s",
  },
}));

const { perPage, apiURL } = require("../config");

const PublicationListing = (props) => {
  const classes = useStyles();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("desc");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [exact, setExact] = useState("");
  const [exactAttr, setExactAttr] = useState("");

  const [containing, setContaining] = useState("");
  const [containingAttr, setContainingAttr] = useState("");

  const [searchAttr, setSearchAttr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [publicationData, setPublicationData] = useState(undefined);

  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const url = `${apiURL}?category=${category}&searchTerm=${searchTerm}&exact=${exact}&containing=${containing}&sort=${sort}&page=${page}`;
        const { data } = await axios.get(url);
        if (data.count === 0) {
          setNotFound(true);
          setPublicationData(data);
        } else {
          setNotFound(false);
          setPublicationData(data);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [searchTerm, page, category, sort, exact, containing]);

  useEffect(() => {
    setTotalPages(
      Math.ceil(publicationData && publicationData.count / perPage)
    );
  }, [publicationData]);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const checkScrollTop = () => {
    if (!showScroll && window.pageYOffset > 400) {
      setShowScroll(true);
    } else if (showScroll && window.pageYOffset <= 400) {
      setShowScroll(false);
    }
  };

  window.addEventListener("scroll", checkScrollTop);

  const recordCountMessage = () => {
    let total = publicationData && publicationData.count;
    const from = (page - 1) * perPage + 1;
    let to = page * perPage;
    if (page === totalPages) {
      to = total;
    }
    return (
      <i>
        Showing ({from} - {to}) of {total} records!
      </i>
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setExact("");
    setContaining("");
    setSearchTerm(searchAttr);
    setSort("relevancy");
  };

  const handleAdvancedSubmit = (e) => {
    e.preventDefault();
    setSearchTerm("");
    setExact(exactAttr);
    setContaining(containingAttr);
    setSort("relevancy");
  };

  const clearAllFilters = (e) => {
    e.preventDefault();
    setSearchTerm("");
    setSearchAttr("");
    setExactAttr("");
    setContainingAttr("");
    setSort("desc");
    setExact("");
    setContaining("");
    setCategory("");
  };

  const showHideAdvancedForm = (e) => {
    setExactAttr("");
    setContainingAttr("");
    setSearchAttr("");
    setShowAdvanced(!showAdvanced);
  };

  const searchSuggestedKeyword = (e) => {
    e.preventDefault();
    const suggestedWord = e.target.innerHTML.trim();
    if (searchAttr.length) {
      setSearchAttr(suggestedWord);
      setSearchTerm(suggestedWord);
    } else if (exactAttr.length) {
      setExactAttr(suggestedWord);
      setExact(suggestedWord);
    } else if (containingAttr.length) {
      setContainingAttr(suggestedWord);
      setContaining(suggestedWord);
    }
  };

  const buildCard = (publication) => {
    return (
      <PublicationCard
        publication={publication}
        keyword={searchTerm || exact || containing}
        key={publication._id}
      />
    );
  };

  let currentPageText = recordCountMessage();

  const buildSuggestionLink = (s) => {
    return (
      <a href="" onClick={searchSuggestedKeyword}>
        {s}{" "}
      </a>
    );
  };

  let suggestions =
    publicationData &&
    publicationData.suggestions &&
    publicationData.suggestions.map((s) => buildSuggestionLink(s));

  const publicationCard =
    publicationData &&
    publicationData.results &&
    publicationData.results.map((publication) => buildCard(publication));

  const menuItem =
    publicationData &&
    publicationData.categories &&
    publicationData.categories.map((category) => (
      <MenuItem value={category} key={category}>
        {category}
      </MenuItem>
    ));

  return (
    <div className={classes.root}>
      <Chip
        className={classes.scrollTop}
        size="small"
        style={{
          height: 50,
          width: 50,
          backgroundColor: "#a00d29",
          display: showScroll ? "flex" : "none",
        }}
        label={<FontAwesomeIcon icon={faAngleDoubleUp} size="lg" />}
        onClick={scrollTop}
      />
      {/* search bar and filters */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          {showAdvanced ? (
            <>
              <form onSubmit={handleAdvancedSubmit}>
                <FormControl style={{ width: "70%" }}>
                  <TextField
                    id="outlined-basic"
                    autoComplete="off"
                    type="text"
                    size="small"
                    label="Containing"
                    value={containingAttr}
                    onChange={(e) => setContainingAttr(e.target.value)}
                  />
                  <TextField
                    id="outlined-basic"
                    autoComplete="off"
                    type="text"
                    size="small"
                    label="Exact"
                    value={exactAttr}
                    onChange={(e) => setExactAttr(e.target.value)}
                  />
                </FormControl>
                <Button
                  type="submit"
                  color="primary"
                  style={{ marginTop: "4em" }}
                  className={classes.searchButton}
                >
                  Advanced Search
                </Button>
              </form>
              <a href="#" onClick={showHideAdvancedForm}>
                Go Back
              </a>
            </>
          ) : (
            <>
              <form onSubmit={handleSearchSubmit}>
                <FormControl style={{ width: "85%" }}>
                  <TextField
                    id="outlined-basic"
                    autoComplete="off"
                    type="text"
                    size="small"
                    label="Search"
                    value={searchAttr}
                    onChange={(e) => setSearchAttr(e.target.value)}
                  />
                </FormControl>
                <Button
                  type="submit"
                  color="primary"
                  className={classes.searchButton}
                >
                  Search
                </Button>
              </form>
              <a href="#" onClick={showHideAdvancedForm}>
                Advanced
              </a>
            </>
          )}
          <a href="#" onClick={clearAllFilters} className={classes.clearLink}>
            Clear Search and Filters
          </a>
        </Grid>
        <Grid item xs={2}></Grid>
        <Grid item xs={4}>
          <Grid container>
            <Grid item xs={6}>
              <FormControl className={classes.formControl}>
                <InputLabel
                  id="demo-simple-select-label"
                  className={classes.formControl}
                  shrink
                >
                  Category
                </InputLabel>

                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={classes.selectEmpty}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  {menuItem}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl className={classes.formControl}>
                <InputLabel
                  id="demo-simple-select-label"
                  className={classes.formControl}
                >
                  Sort
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <MenuItem value="desc">Most Recent First</MenuItem>
                  <MenuItem value="relevancy">Most Relevant First</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <br />
      {/* pagination and text */}
      {notFound ? (
        ""
      ) : loading ? (
        ""
      ) : (
        <Grid container spacing={1}>
          <Grid item xs={5}>
            {searchTerm && (
              <>
                <h2>Results for "{searchTerm}"</h2>
              </>
            )}
            <span>{currentPageText}</span>
            <br />
            {publicationData &&
            publicationData.suggestions &&
            publicationData.suggestions.length ? (
              <span>Did you mean ( {suggestions} ) ?</span>
            ) : (
              ""
            )}
          </Grid>
          <Grid item xs={2}></Grid>
          <Grid item xs={5}>
            <Pagination
              count={totalPages}
              shape="rounded"
              defaultPage={1}
              page={page}
              showFirstButton
              showLastButton
              variant="text"
              color="primary"
              boundaryCount={2}
              onChange={(e, value) => setPage(value)}
            />
          </Grid>
        </Grid>
      )}
      {loading ? (
        "Loading ..."
      ) : notFound ? (
        <div style={{ textAlign: "center" }}>
          <h2>We're Sorry, but no results were found.</h2>
          <span> No results found for "{publicationData.searchTerm}". </span>
          {publicationData &&
            publicationData.suggestions &&
            publicationData.suggestions.length > 0 && (
              <span>Did you mean ( {suggestions} ) ?</span>
            )}
        </div>
      ) : (
        publicationCard
      )}
      <br />
      {loading ? (
        ""
      ) : (
        <Grid container spacing={1}>
          <Grid item xs={5}>
            <span>{currentPageText}</span>
          </Grid>
          <Grid item xs={2}></Grid>
          <Grid item xs={5}>
            <Pagination
              count={totalPages}
              shape="rounded"
              defaultPage={1}
              page={page}
              showFirstButton
              showLastButton
              variant="text"
              color="primary"
              boundaryCount={2}
              onChange={(e, v) => setPage(v)}
            />
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default PublicationListing;
