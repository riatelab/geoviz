import { circle } from "../mark/circle";
import { randompoints } from "../tool/randompoints";
import { text } from "../mark/text";
import { unique } from "../helpers/utils";

/**
 * @function plot_dotdensity
 * @description
 * The `plot_dotdensity` function generates a **dot density map** by creating points proportionally
 * to a numeric variable in your dataset. Each point represents a fixed quantity (`dotval`) from the data.
 *
 *
 * @param {Object|SVGElement} arg1 - Either the container SVG element to draw into, or the options object if creating a new container.
 * @param {Object} [arg2] - Options object (used when an existing container is provided as `arg1`).
 *
 * @property {string} [type="dotdensity"] - Type of plot.
 * @property {string} [stroke="none"] - Stroke color for dots.
 * @property {number} [r=1] - Radius of each dot.
 * @property {number} [dotval] - Value represented by one dot. If undefined, computed automatically.
 * @property {boolean} [legend=true] - Whether to add a legend.
 * @property {Array<number>} [leg_pos] - Position `[x, y]` of the legend. Defaults to `[10, svg.height - 10]`.
 * @property {string} [leg_text] - Text to display in the legend. Defaults to the dot value.
 * @property {string} [fill="black"] - Fill color of the dots.
 * @property {Array|Object} [data] - The dataset to visualize.
 * @property {string} [var] - The numeric variable in the dataset to map with dots.
 *
 * @returns {SVGElement} The SVG container with the dot density map rendered.
 *
 */

export function plot_dotdensity(arg1, arg2) {
  const newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups;

  const defaults = {
    type: "dotdensity",
    id: unique(),
    stroke: "none",
    dotval: undefined,
    r: 1,
    legend: true,
    leg_pos: undefined,
    leg_text: undefined,
    fill: "black",
  };

  const options = {
    ...defaults,
    ...(newcontainer ? arg1 : arg2),
  };

  // Generate the points
  options.data = randompoints({
    data: options.data,
    var: options.var,
    dotval: options.dotval,
  });

  // Get the actual SVG container
  let svg;
  if (newcontainer) {
    svg = circle(options); // new container + points
  } else {
    svg = arg1; // existing container
    circle(svg, options); // add the points
  }

  let ids = `#${options.id}`;

  // --------------------------
  // Separate handling of the legend
  // --------------------------
  // Add the legend if requested
  if (options.legend) {
    const legId = "leg_" + options.id;
    ids = [`#${options.id}`, `#${legId}`];
    const pos = options.leg_pos || [10, svg.height - 10];

    if (newcontainer) {
      text({
        ...options,
        id: legId,
        pos: [pos[0], pos[1]],
        text: options.leg_text || `One dot = ${options.data.dotvalue}`,
        fontSize: 10,
        textAnchor: "start",
        dominantBaseline: "middle",
      });
    } else {
      text(svg, {
        id: legId,
        pos: [pos[0], pos[1]],
        text: options.leg_text || `One dot = ${options.data.dotvalue}`,
        fontSize: 10,
        textAnchor: "start",
        dominantBaseline: "middle",
        fill: options.fill,
      });
    }
  }

  if (newcontainer) {
    return render(svg);
  } else {
    return ids;
  }
}
