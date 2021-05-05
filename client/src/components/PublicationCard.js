/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-script-url */
import React, { useState } from "react";
import {
  Typography,
  Button,
  Grid,
  Divider,
  makeStyles,
  Modal,
  Backdrop,
  Fade,
  Chip,
} from "@material-ui/core";
import "../App.css";
import ReactHtmlParser from "react-html-parser";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  root: {
    flexGrow: 1,
    "text-align": "justify",
  },
  publicationCard: {
    padding: "2em 0",
  },
  abstract: {
    color: "#333",
    fontSize: "1em",
  },
  readMore: {
    fontSize: "0.86em",
    cursor: "pointer",
  },
  title: {
    fontWeight: "400",
  },
  iframe: {
    width: "100%",
    height: "80%",
  },
}));

const PublicationCard = ({ publication, keyword }) => {
  const classes = useStyles();
  const [showMore, setShowMore] = useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  let foundInFile = true;

  const showMoreText = (e) => {
    e.preventDefault();
    setShowMore(!showMore);
  };

  const formatDate = (date) => {
    if (date) {
      const date1 = new Date(date);
      return date1 && date1.toDateString();
    }
    return "N/A";
  };

  const highlightText = (text) => {
    if (keyword && text) {
      const regex = new RegExp(keyword, "gim");
      regex.test(text) && (foundInFile = false);
      let markedText = text.replace(regex, (e) => `<mark>${e}</mark>`);
      return markedText;
    } else {
      // foundInFile = false;
      return text;
    }
  };

  const title = highlightText(publication.title);
  const authors = highlightText(publication.authors.join(", "));

  const buildAbstract = () => {
    const maxLen = 400;
    let text = highlightText(
      publication.abstract && publication.abstract.trim()
    );
    if (text && text.length > maxLen) {
      if (showMore) {
        return text;
      } else {
        return text.substring(0, maxLen);
      }
    }
  };

  const showFileTag = keyword && publication.file_s3 && foundInFile;
  const abstract = buildAbstract();

  return (
    <div className={classes.root}>
      <Grid container wrap="nowrap" spacing={2}>
        <Grid item xs>
          <div className={classes.publicationCard}>
            <Typography variant="h6" className={classes.title}>
              {ReactHtmlParser(title)}
            </Typography>
            <Typography variant="subtitle1">{publication.category}</Typography>
            <br />
            {publication.authors && publication.authors.length ? (
              <Typography variant="subtitle2">
                by {ReactHtmlParser(authors)}
              </Typography>
            ) : (
              ""
            )}
            <Typography variant="subtitle2">
              Published on: <i>{formatDate(publication.publication_date)}</i>
            </Typography>
            {abstract && abstract.length > 0 && (
              <>
                <Typography className={classes.abstract}>
                  {ReactHtmlParser(abstract)}
                  {showMore ? (
                    <a
                      href="#"
                      className={classes.readMore}
                      onClick={showMoreText}
                    >
                      Collapse
                    </a>
                  ) : (
                    <a
                      href="#"
                      className={classes.readMore}
                      onClick={showMoreText}
                    >
                      ... Show More
                    </a>
                  )}
                </Typography>
              </>
            )}
          </div>
        </Grid>
      </Grid>
      <Button variant="outlined">
        <a
          href={`https://sercuarc.org/publication/?id=${publication.id}&pub-type=${publication.category}&publication=${publication.title}`}
          rel="noreferrer"
          target="_blank"
        >
          Learn More
        </a>
      </Button>
      &nbsp; &nbsp;
      <Button
        variant="outlined"
        onClick={() => setOpenModal(true)}
        color="primary"
      >
        {" "}
        Preview{" "}
      </Button>
      <br />
      {showFileTag ? (
        <>
          <br />
          <Chip
            size="small"
            style={{
              backgroundColor: "#a00d29",
              color: "#fff",
              fontWeight: "550",
            }}
            label="Found In file"
          />
          <br />
        </>
      ) : (
        ""
      )}
      <br />
      <Divider />
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-iframe"
        className={classes.modal}
        open={openModal}
        onClose={() => setOpenModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openModal}>
          <div className={classes.paper}>
            <h4 className={classes.modalHeader} id="transition-modal-title">
              {publication.title}
              <Button color="secondary" onClick={() => setOpenModal(false)}>
                <small>Close</small>
              </Button>
            </h4>
            {publication.file_s3 && publication.file_s3.length ? (
              <iframe
                id="transition-modal-iframe"
                className={classes.iframe}
                src={publication.file_s3}
                title={publication.title + publication.id}
              />
            ) : (
              <h6 style={{ textAlign: "center" }}>
                No File Available for this publication
              </h6>
            )}
          </div>
        </Fade>
      </Modal>
    </div>
  );
};

export default PublicationCard;
