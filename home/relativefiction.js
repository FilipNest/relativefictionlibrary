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

var localise = function (text, callback) {

  //Get location
  navigator.geolocation.getCurrentPosition(function (location) {

    var data = {};

    data.text = $.trim(text);

    data.latitude = location.coords.latitude;
    data.longitude = location.coords.longitude;

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

        $("#errors").hide();

        if (result.errors.length) {

          $("#errors").html(result.errors.join("<br />"));

          $("#errors").show();

        }

        $.unblockUI(500);

        callback(result);

      }
    });

  }, function () {

    alert("Being location based, you currently need to give this page access to your location for this to work.")

  })
}

$("body").on("click", ".preview", function (e) {

  var value = myCodeMirror.getValue();

  localise(value, function (result) {

    // Put in result

    $(".story").html(result.result);

  })

})

$("body").on("click", ".localise", function (e) {

  var button = event.target;

  var block = $(event.target).parent().find(".inner");

  var data = {};

  var rawtext = $.trim($(block).text());

  localise(rawtext, function (result) {

    // Put in result

    $(block).attr("data-raw", rawtext);
    $(block).html($.parseHTML(result.result));
    $(block).html($.trim($(block).html()))
    $(button).attr("class", "reset");
    $(button).html("Reset");

  })

});

if ($("#story").length) {

  var text = $(".story").html();

  localise(text, function (output) {

    $(".story").html(output.result);

  })

}

$("body").on("click", ".reset", function (e) {

  var button = event.target;

  var block = $(event.target).parent().find(".inner");

  $(block).html($(block).attr("data-raw"));

  $(button).attr("class", "localise");
  $(button).html("Localise");

});
