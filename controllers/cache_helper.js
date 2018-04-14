var axios = require('axios')

module.exports.set = async (req, res, url, data, value) => {
  axios.post(url, {params: { cacheKey: userCacheKey, cacheData: storeData}})
  // .then(function(postResponse){})
  .catch(function(err){
    console.log(err)
    res.send(err);
  });
}
module.exports.get =async (req, res, data) => {
}

module.exports.delete=async (req, res, data)=> {

}
