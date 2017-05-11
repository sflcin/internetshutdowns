var updatesRactive = new Ractive({
  el: "#updates",
  template: "#updates-template",
  data: {
    posts: []
  }
});

$(document).ready(function(){
  fetch('https://ist-backend.herokuapp.com/updates').then(function (response) {
    return response.json();
  }).then (function (results) {
    console.log(results);
    updatesRactive.set({
      posts: results
    });
  });
});
