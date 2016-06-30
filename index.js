$(document).ready(function () {


});

var postToWebhook = function () {
   $.ajax({
      url: '/webhook',
      type: 'post',
      //data: formData,
      cache: false,
      contentType: false,
      processData: false,
      data: { "name": "value" },
      success: function (returndata) {
        
      },
      error: function (error) {
        console.error(error);
      }
    });
}

var getRepositories = function () {
  console.log("making repositories request");
    $.ajax({
      url: '/repositories',
      type: 'get',
      //data: formData,
      cache: false,
      contentType: false,
      processData: false,
      success: function (returndata) {
        var repositories = JSON.parse(returndata);
        var list = $('<ul class="repo-list list-group"></ul>');
        for (var i = 0; i < repositories.length; i++) {
          $('<li class="repoitem list-group-item" onclick="listItemClick(' + i + ')">'+repositories[i].name +'</li>').appendTo(list);
        } 
        list.appendTo(".repo-data");
        postToWebhook();
      },
      error: function (error) {
        console.error(error);
      }
    });
};

var listItemClick = function (idx) {
  console.log($(".repo-list")[0].children[idx].innerText);
}