const express = require('express');

const app = express();
const staticDir = express.static(`${__dirname}/public`);
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const {
  allowInsecurePrototypeAccess,
} = require('@handlebars/allow-prototype-access');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes');
require('dotenv').config({ path: 'variables.env' });

mongoose.set('useCreateIndex', true);

app.use('/public', staticDir);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const LIMIT = parseInt(process.env.PAGE_SIZE, 10);

app.engine(
  'handlebars',
  exphbs({
    defaultLayout: 'main',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: {
      formatDate(date) {
        if (date) {
          const date1 = new Date(date);
          return date1 && date1.toDateString();
        }
        return 'N/A';
      },
      paginationLinks(count) {
        let linkNo;
        if (!Number.isNaN(count)) {
          const pagesCount = Math.ceil((count) / LIMIT);
          linkNo = [...Array(pagesCount + 1).keys()].slice(1);
        }
        return linkNo;
      },
      pages(count) {
        return Math.ceil((count) / LIMIT);
      },
      recordCountMessage(currentPage, count) {
        const totalPages = Math.ceil((count) / LIMIT);
        const from = ((currentPage - 1) * LIMIT) + 1;
        let to = currentPage * LIMIT;
        if (currentPage === totalPages) {
          to = count;
        }
        return `Showing (${from} - ${to}) of ${(count)}`;
      },
      isActive(currentPage, page) {
        return currentPage === page ? 'active' : '';
      },
      renderAuthors(authors) {
        return authors.join(', ');
      },
      suggestionLinks(suggestions) {
        const links = suggestions.map((suggestion) => `<a class="suggestion-link" href="javascript:void(0);">${suggestion}</a>`);

        return links.join(', ');
      },
    },
  }),
);

// Logging Middleware
app.use(async (req, res, next) => {
  console.log(
    `[${new Date().toUTCString()}]: ${req.method} ${
      req.originalUrl
    }`,
  );
  next();
});

app.use(cors(), async (req, res, next) => {
  next();
});

app.set('view engine', 'handlebars');

app.use('/', routes);

// done! we export it so we can start the site in start.js
module.exports = app;
