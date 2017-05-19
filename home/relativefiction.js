var user = {};
navigator.geolocation.getCurrentPosition(function (location) {
  user.latitude = location.coords.latitude;
  user.longitude = location.coords.longitude;
});

// Replace all words between curlies 

$.each($(".codeblock"), function (index, inside) {

  function getWordsBetweenCurlies(str) {
    var results = [],
      re = /{{([^}}]+)}}/g,
      text;

    while (text = re.exec(str)) {
      results.push(text[1]);
    }
    return results;
  }

  function ifOpen(str) {
    var results = [],
      re = /{{#([^}}]+)}}/g,
      text;

    while (text = re.exec(str)) {
      results.push(text[1]);
    }
    return results;
  }

  function ifClose(str) {
    var results = [],
      re = /{{\/([^}}]+)}}/g,
      text;

    while (text = re.exec(str)) {
      results.push(text[1]);
    }
    return results;
  }

  var content = $(inside).html();

  var tags = getWordsBetweenCurlies(content);

  $.each(tags, function (index, tagcontent) {

    var tag = "{{" + tagcontent + "}}";

    $(inside).html($(inside)
      .html()
      .split(tag)
      .join("<span class='tag'>" + tag + "</span>"))

  });

  var content = $(inside).html();

  var tags = ifOpen(content);

  $.each(tags, function (index, tagcontent) {

    var tag = "{{#" + tagcontent + "}}";

    $(inside).html($(inside)
      .html()
      .split(tag)
      .join("<span class='if'>" + tag + "</span>"))

  });

  var content = $(inside).html();

  var tags = ifClose(content);

  $.each(tags, function (index, tagcontent) {

    var tag = "{{/" + tagcontent + "}}";

    $(inside).html($(inside)
      .html()
      .split(tag)
      .join("<span class='if'>" + tag + "</span>"))

  });

  $(inside).html($(inside)
    .html()
    .split("{{else}}")
    .join("<span class='if'>{{else}}</span>"))

});

$("body").on("click", ".localise", function (e) {

  var button = event.target;

  var block = $(event.target).parent().find(".inner");

  var data = {};

  var rawtext = $.trim($(block).html());

  data.text = $.trim($(block).text());

  //Get location
  navigator.geolocation.getCurrentPosition(function (location) {

    data.latitude = user.latitude;
    data.longitude = user.longitude;

    $.blockUI({
      css: {
        border: 'none',
        padding: '15px',
        backgroundColor: '#000',
        'border-radius': '10px',
        opacity: .5,
        color: '#fff',
      },
      message: "Localising, please wait..."
    });

    $.ajax({
      type: "POST",
      url: "/",
      data: data,
      success: function (result) {

        console.log(result);

        $.unblockUI(500);

        // Put in result

        $(block).attr("data-raw", rawtext);
        $(block).html($.parseHTML(result.result));
        $(block).html($.trim($(block).html()))
        $(button).attr("class", "reset");
        $(button).html("Reset");

      },
    });

  })

});

$("body").on("click", ".reset", function (e) {

  var button = event.target;

  var block = $(event.target).parent().find(".inner");

  $(block).html($(block).attr("data-raw"));

  $(button).attr("class", "localise");
  $(button).html("Localise");

});
