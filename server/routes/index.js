const express = require('express');

const router = express.Router();
const publicationsController = require('../controllers/PublicationsController');

router.get('/', publicationsController.index);
router.get('/files/filter', publicationsController.index);
router.get('/api/files/filter', publicationsController.indexApi);

router.get('*', async (req, res) => {
  res.status(404).json({ error: 'Page not found!' });
});

module.exports = router;
