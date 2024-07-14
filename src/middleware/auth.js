const { error } = require("update/lib/utils");

//middeware to check if the api token is valid
const auth = async (req, res, next) => {
  try{
    const token = req.headers.authorization.split(' ')[1];

    if (!token || token !== process.env.API_TOKEN) {
      return res.status(401).json({ message: 'Access denied. Invalid API token.' });
    }

    next();
  }
  catch(err){
    return res.status(401).json({ message: 'Access denied.', error: err });
  }
}

module.exports = auth;