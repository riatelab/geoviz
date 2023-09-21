/**
 * The `addont` function allows add font to the document from an url
 * It can be use ta add a shadow effect
 *
 * @param {string} url - font url. See https://fonts.google.com/
 * @example
 * viz.tool.addfont("https://fonts.googleapis.com/css2?family=Kenia")
 */
export function addfont(
  url = "https://fonts.googleapis.com/css2?family=Roboto"
) {
  let link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute("href", url);
  document.head.appendChild(link);
}
