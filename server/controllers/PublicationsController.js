const Typo = require('typo-js');
const Publication = require('../models/Publication');

const dictionary = new Typo('en_US');

const LIMIT = parseInt(process.env.PAGE_SIZE, 10);

async function filterAndSearch(req) {
  try {
    const { searchTerm, exact, containing, category, page, sort } = req.query;
    const pageNumber = Number.isNaN(parseInt(page, 10))
      ? 1
      : parseInt(page, 10);
    const skip = (pageNumber - 1) * LIMIT;
    let searchText;
    let suggestions;

    if (searchTerm && searchTerm.length) {
      const isSpelledCorrectly = dictionary.check(searchTerm);
      if (!isSpelledCorrectly) {
        suggestions = dictionary.suggest(searchTerm);
      }
      searchText = searchTerm;
    } else if ((exact && exact.length) || (containing && containing.length)) {
      const isSpelledCorrectly = dictionary.check(exact);
      if (!isSpelledCorrectly) {
        suggestions = dictionary.suggest(exact);
      }
      // eslint-disable-next-line no-useless-escape
      searchText = `\"${exact}\" ${containing}`;
    }

    const countQuery = [];
    let sortQuery;
    let aggregateQuery;

    if (searchText && sort === 'relevancy') {
      sortQuery = { score: { $meta: 'textScore' } };
    } else {
      sortQuery = { publication_date: -1 };
    }

    if (category && searchText) {
      aggregateQuery = [
        { $match: { $text: { $search: searchText }, category } },
        {
          $sort: sortQuery
        },
        { $skip: skip },
        { $limit: LIMIT }
      ];
      countQuery.push(
        { $text: { $search: searchText }, category },
        { $sort: sortQuery }
      );
    } else if (category && !searchText) {
      aggregateQuery = [
        { $match: { category } },
        { $sort: sortQuery },
        { $skip: skip },
        { $limit: LIMIT }
      ];
      countQuery.push({ category });
    } else if (searchText) {
      aggregateQuery = [
        { $match: { $text: { $search: searchText } } },
        { $sort: sortQuery },
        { $skip: skip },
        { $limit: LIMIT }
      ];
      countQuery.push(
        { $text: { $search: searchText } },
        { score: { $meta: 'textScore' } }
      );
    } else {
      aggregateQuery = [
        { $sort: sortQuery },
        { $skip: skip },
        { $limit: LIMIT }
      ];
      countQuery.push({});
    }

    const categories = await Publication.distinct('category').sort();
    const count = await Publication.find(...countQuery)
      .countDocuments()
      .exec();

    const results = await Publication.aggregate(aggregateQuery).allowDiskUse(
      true
    );

    return {
      results,
      count,
      currentPage: pageNumber,
      suggestions,
      categories,
      searchTerm: searchText && searchText.replace(/"/g, '')
    };
  } catch (e) {
    console.log(e);
    return { error: e };
  }
}

module.exports = {
  async index(req, res) {
    const {
      results,
      count,
      currentPage,
      suggestions,
      categories,
      searchTerm,
      error
    } = await filterAndSearch(req);

    if (error) {
      res.json({ error });
    } else {
      const fileName = req.xhr ? 'partials/publications' : 'files/index';
      res.render(fileName, {
        results,
        count,
        currentPage,
        suggestions,
        categories,
        searchTerm,
        layout: req.xhr ? false : 'main'
      });
    }
  },

  async indexApi(req, res) {
    const response = await filterAndSearch(req);
    if (response.error) {
      res.status(500).json({ message: response.error });
    } else {
      res.json(response);
    }
  }
};
