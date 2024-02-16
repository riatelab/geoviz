export function zoompanel(svg) {
  const size = [25, 70];
  const step = size[1] / 3;

  let pos = `translate(${svg.width - 30},5)`;
  if (Array.isArray(svg.control)) {
    pos = `translate(${svg.control[0]},${svg.control[1]})`;
  }

  const control = svg
    .append("g")
    .attr("transform", pos)
    .attr("id", svg.controlid);

  control
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("ry", 4)
    .attr("height", size[1])
    .attr("width", size[0])
    .attr("fill", "white")
    .attr("stroke", "#6a6a6a")
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 0.3)
    .attr("fill-opacity", 0.8);

  control
    .append("line")
    .attr("x1", 5)
    .attr("y1", step)
    .attr("x2", size[0] - 5)
    .attr("y2", step)
    .attr("stroke", "#6a6a6a")
    .attr("stroke-opacity", 0.3)
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", 2);

  control
    .append("line")
    .attr("x1", 5)
    .attr("y1", step * 2)
    .attr("x2", size[0] - 5)
    .attr("y2", step * 2)
    .attr("stroke", "#6a6a6a")
    .attr("stroke-opacity", 0.3)
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", 2);

  const plus = control
    .append("g")
    .attr("id", "plus")
    .attr("fill-opacity", 0.3)
    .attr("transform", `translate(${size[0] / 2},${step / 2})`)
    .append("path")
    .attr(
      "d",
      "m 5.3946396,1.8575e-4 c 0,-0.5977207 -0.6415104,-1.07903965 -1.4384715,-1.07903965 H 1.078854 v -2.876943 c 0,-0.7969611 -0.4813189,-1.4388425 -1.0790396,-1.4388425 -0.5977206,0 -1.078668,0.6418815 -1.078668,1.4388425 v 2.876943 h -2.8773145 c -0.7969611,0 -1.4384715,0.48131895 -1.4384715,1.07903965 0,0.5977206 0.6415104,1.07866755 1.4384715,1.07866755 h 2.8773145 v 2.8773148 c 0,0.7969609 0.4809474,1.4384713 1.078668,1.4384713 0.5977207,0 1.0790396,-0.6415104 1.0790396,-1.4384713 V 1.0788533 h 2.8773141 c 0.7969611,0 1.4384715,-0.48094695 1.4384715,-1.07866755 z"
    );

  const minus = control
    .append("g")
    .attr("id", "minus")
    .attr("fill-opacity", 0.3)
    .attr("transform", `translate(${size[0] / 2},${step * 1.5})`)
    .append("path")
    .attr(
      "d",
      "m -3.9574147,-1.0788543 h 7.9148294 c 0.767531,0 1.385435,0.48116901 1.385435,1.0788543 0,0.59768529 -0.617904,1.0788543 -1.385435,1.0788543 h -7.9148294 c -0.767531,0 -1.385435,-0.48116901 -1.385435,-1.0788543 0,-0.59768529 0.617904,-1.0788543 1.385435,-1.0788543 z"
    );

  const reset = control
    .append("g")
    .attr("id", "reset")
    .attr("fill-opacity", 0.3)
    .attr("transform", `translate(${size[0] / 2},${step * 2.5})`)
    .append("path")
    .attr(
      "d",
      "M -1.2940927,5.0777775 C -2.1684164,4.8314706 -3.2986963,4.0441048 -3.8430923,3.3020874 -4.6193793,2.2440057 -5.0578621,0.46159635 -4.6437431,0.04747726 c 0.4578187,-0.45781851 1.1277698,-0.19372689 1.1277698,0.44454944 0,0.8074783 0.4120423,1.7461873 1.0437767,2.3779217 C -0.24540433,5.0967408 3.4868355,3.5629027 3.4982525,0.41627457 3.5037957,-1.1038637 2.4692459,-2.4802179 1.0001263,-2.9073051 0.19813045,-3.1404538 -0.76260136,-3.0858393 -1.3593238,-2.7731864 l -0.3688394,0.1932514 0.5293829,0.085502 c 0.2911585,0.047005 0.61875041,0.1329827 0.72797943,0.191032 0.29382183,0.1561282 0.3156994,0.71991 0.0377042,0.9714962 -0.21116559,0.1911111 -0.41243343,0.201125 -1.69434973,0.084313 -1.962603,-0.1788514 -1.9446809,-0.1582157 -1.7693199,-2.0361648 0.1718494,-1.8401839 0.5119549,-2.3182208 1.1765397,-1.6536359 0.2143098,0.2143099 0.249689,0.3691038 0.1815992,0.7948485 l -0.084551,0.5287012 0.7756978,-0.3551263 c 1.47661618,-0.6760186 3.3900398,-0.4384785 4.7528368,0.590034 2.9090907,2.1955084 2.3838296,6.6728784 -0.9625575,8.204904 -0.890169,0.4075321 -2.29594186,0.5169037 -3.2368994,0.2518292 z"
    );

  control
    .append("g")
    .attr("id", "buttonplus")
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", size[1] / 3)
    .attr("width", size[0])
    .attr("opacity", 0)
    .style("cursor", "pointer")
    .on("mouseover", (e) => {
      plus.attr("fill-opacity", 0.8);
    })
    .on("mouseout", (e) => {
      plus.attr("fill-opacity", 0.3);
    });

  control
    .append("g")
    .attr("id", "buttonminus")
    .append("rect")
    .attr("x", 0)
    .attr("y", step)
    .attr("height", size[1] / 3)
    .attr("width", size[0])
    .attr("opacity", 0)
    .style("cursor", "pointer")
    .on("mouseover", (e) => {
      minus.attr("fill-opacity", 0.8);
    })
    .on("mouseout", (e) => {
      minus.attr("fill-opacity", 0.3);
    });

  control
    .append("g")
    .attr("id", "buttonreset")
    .append("rect")
    .attr("x", 0)
    .attr("y", step * 2)
    .attr("height", size[1] / 3)
    .attr("width", size[0])
    .attr("opacity", 0)
    .style("cursor", "pointer")
    .on("mouseover", (e) => {
      reset.attr("fill-opacity", 0.8);
    })
    .on("mouseout", (e) => {
      reset.attr("fill-opacity", 0.3);
    });
}
