// Need localforage
// https://cdnjs.cloudflare.com/ajax/libs/localforage/1.4.0/localforage.min.js
function cachedFetch(url, expireTime) {
  //
  console.log("Fetching " + url)
  return localforage.getItem(url).then(function(value){
    if (value == null || Date.now() - value.updated > expireTime){
      console.log("We need a re-fetch")
      return fetch(url)
        .then(function(result){
          return result.json();
        })
        .then(function(value){
          return localforage.setItem(url, {'updated': Date.now(), 'data': value})
            .then(function(entry){
              return entry['data']
            })
        })

    }
    else {
      console.log("Getting it directly from the cache")
      return localforage.getItem(url)
        .then(function(entry){
          return entry['data']
        })
    }
  })
  //Init the indexeddb
}

