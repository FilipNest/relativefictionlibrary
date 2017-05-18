var config = {
  port: 7788,
  foursquareKey: "GLVSRGETGQAOFL01NNFNPPIG3RUFRIBCKWPXJSMSYUVD15V2",
  foursquareSecret: "LXUN1X2B4DRF2EKMURYEZRPYBLML2MND5ZKOKWILD5KSZ2EE",
  openWeatherKey: "4e36efb3cd43a9037a66de5e5d054493",
  static: __dirname + "/home",
};

var rf = require("relativefiction")(config);
