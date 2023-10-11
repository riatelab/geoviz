export async function render2(svg) {
  const png = SVGToImage({
    svg: getSVGString(svg.node()),
    mimetype: "image/png",
    width: svg.width,
    height: svg.henght,
    quality: 1,
    outputFormat: "base64",
  }).then(function (outputData) {
    return outputData;
  });

  return await png;

  //return html`<img src="${await png}" />`;
}

function getSVGString(svgNode) {
  svgNode.setAttribute("xlink", "http://www.w3.org/1999/xlink");
  var cssStyleText = getCSSStyles(svgNode);
  appendCSS(cssStyleText, svgNode);

  var serializer = new XMLSerializer();
  var svgString = serializer.serializeToString(svgNode);
  svgString = svgString.replace(/(\w+)?:?xlink=/g, "xmlns:xlink="); // Fix root xlink without namespace
  svgString = svgString.replace(/NS\d+:href/g, "xlink:href"); // Safari NS namespace fix

  return svgString;

  function getCSSStyles(parentElement) {
    var selectorTextArr = [];

    // Add Parent element Id and Classes to the list
    selectorTextArr.push("#" + parentElement.id);
    for (var c = 0; c < parentElement.classList.length; c++)
      if (!contains("." + parentElement.classList[c], selectorTextArr))
        selectorTextArr.push("." + parentElement.classList[c]);

    // Add Children element Ids and Classes to the list
    var nodes = parentElement.getElementsByTagName("*");
    for (var i = 0; i < nodes.length; i++) {
      var id = nodes[i].id;
      if (!contains("#" + id, selectorTextArr)) selectorTextArr.push("#" + id);

      var classes = nodes[i].classList;
      for (var c = 0; c < classes.length; c++)
        if (!contains("." + classes[c], selectorTextArr))
          selectorTextArr.push("." + classes[c]);
    }

    // Extract CSS Rules
    var extractedCSSText = "";
    for (var i = 0; i < document.styleSheets.length; i++) {
      var s = document.styleSheets[i];

      try {
        if (!s.cssRules) continue;
      } catch (e) {
        if (e.name !== "SecurityError") throw e; // for Firefox
        continue;
      }

      var cssRules = s.cssRules;
      for (var r = 0; r < cssRules.length; r++) {
        if (contains(cssRules[r].selectorText, selectorTextArr))
          extractedCSSText += cssRules[r].cssText;
      }
    }

    return extractedCSSText;

    function contains(str, arr) {
      return arr.indexOf(str) === -1 ? false : true;
    }
  }

  function appendCSS(cssText, element) {
    var styleElement = document.createElement("style");
    styleElement.setAttribute("type", "text/css");
    styleElement.innerHTML = cssText;
    var refNode = element.hasChildNodes() ? element.children[0] : null;
    element.insertBefore(styleElement, refNode);
  }
}

/**
 * Simple function that converts a plain SVG string or SVG DOM Node into an image with custom dimensions.
 *
 * @param {Object} settings The configuration object to override the default settings.
 * @see https://ourcodeworld.com/articles/read/1456/how-to-convert-a-plain-svg-string-or-svg-node-to-an-image-png-or-jpeg-in-the-browser-with-javascript
 * @returns {Promise}
 */
function SVGToImage(settings) {
  let _settings = {
    svg: null,
    // Usually all SVG have transparency, so PNG is the way to go by default
    mimetype: "image/png",
    quality: 0.92,
    width: "auto",
    height: "auto",
    outputFormat: "base64",
  };

  // Override default settings
  for (let key in settings) {
    _settings[key] = settings[key];
  }

  return new Promise(function (resolve, reject) {
    let svgNode;

    // Create SVG Node if a plain string has been provided
    if (typeof _settings.svg == "string") {
      // Create a non-visible node to render the SVG string
      let SVGContainer = document.createElement("div");
      SVGContainer.style.display = "none";
      SVGContainer.innerHTML = _settings.svg;
      svgNode = SVGContainer.firstElementChild;
    } else {
      svgNode = _settings.svg;
    }

    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");

    let svgXml = new XMLSerializer().serializeToString(svgNode);
    let svgBase64 = "data:image/svg+xml;base64," + btoa(svgXml);

    const image = new Image();

    image.onload = function () {
      let finalWidth, finalHeight;

      // Calculate width if set to auto and the height is specified (to preserve aspect ratio)
      if (_settings.width === "auto" && _settings.height !== "auto") {
        finalWidth = (this.width / this.height) * _settings.height;
        // Use image original width
      } else if (_settings.width === "auto") {
        finalWidth = this.naturalWidth;
        // Use custom width
      } else {
        finalWidth = _settings.width;
      }

      // Calculate height if set to auto and the width is specified (to preserve aspect ratio)
      if (_settings.height === "auto" && _settings.width !== "auto") {
        finalHeight = (this.height / this.width) * _settings.width;
        // Use image original height
      } else if (_settings.height === "auto") {
        finalHeight = this.naturalHeight;
        // Use custom height
      } else {
        finalHeight = _settings.height;
      }

      // Define the canvas intrinsic size
      canvas.width = finalWidth;
      canvas.height = finalHeight;

      // Render image in the canvas
      context.drawImage(this, 0, 0, finalWidth, finalHeight);

      if (_settings.outputFormat == "blob") {
        // Fullfil and Return the Blob image
        canvas.toBlob(
          function (blob) {
            resolve(blob);
          },
          _settings.mimetype,
          _settings.quality
        );
      } else {
        // Fullfil and Return the Base64 image
        resolve(canvas.toDataURL(_settings.mimetype, _settings.quality));
      }
    };

    // Load the SVG in Base64 to the image
    image.src = svgBase64;
  });
}
