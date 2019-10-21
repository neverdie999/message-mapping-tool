const express = require('express');
const router = express.Router();
const path = require('path');

router.route('/message-spec-editor').get((req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'client/src/modules/graph-library/index.html'));
});

module.exports = router;
