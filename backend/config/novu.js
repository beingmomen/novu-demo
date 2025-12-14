const { Novu } = require("@novu/api");

const novu = new Novu({
  secretKey: process.env.NOVU_API_KEY,
});

module.exports = novu;
