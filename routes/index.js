const express = require('express');
const router = express.Router();
const path = require('path');

router.route('/').get((req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'client/src/modules/message-mapping-gui/index.html'));
});

router.route('/graph-library').get((req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'client/src/modules/graph-library/index.html'));
});

router.route('/message-mapping-gui').get((req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'client/src/modules/message-mapping-gui/index.html'));
});

router.route('/sample-message-viewer').get((req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'client/src/modules/sample-message-viewer/index.html'));
});

router.route('/segment-set-editor').get((req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'client/src/modules/segment-set-editor/index.html'));
});

module.exports = router;
