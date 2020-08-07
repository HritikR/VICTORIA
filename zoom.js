var zoomTransform;

// TODO: Update rest of zoom functions to use these
// TODO: Disable zoom before upload
// Generic disable zoom function
var disableZoom = (obj) => {
  obj.on(".zoom", null);
};

// Generic get zoom function
var getZoom = (width, height, zoomCallback, args) =>
  d3
    .zoom()
    .extent([
      [0, 0],
      [width, height],
    ])
    .scaleExtent([1, 8])
    .on("zoom", () => zoomCallback(d3.event.transform, ...args));

// Generic reset zoom function
var resetZoom = (obj, zoom) => {
  obj.call(zoom.transform, d3.zoomIdentity.scale(1));
};

function zoomedDoseProfile(transform, doseProfile) {
  doseProfile.zoomTransform = transform;
  if (
    !doseVol.isEmpty() &&
    d3.select("svg#plot-marker").select(".crosshair").node()
  ) {
    doseProfile.svg
      .selectAll("path.lines")
      .attr("transform", transform.toString());

    // Create new scale ojects based on event
    var new_xScale = transform.rescaleX(doseProfile.xScale);
    var new_yDoseScale = transform.rescaleY(doseProfile.yDoseScale);

    // Update axes
    doseProfile.svg
      .select(".profile-x-axis")
      .call(
        d3
          .axisBottom()
          .scale(new_xScale)
          .tickSize(-doseProfile.dimensions.height)
      );

    doseProfile.svg
      .select(".profile-y-dose-axis")
      .call(
        d3
          .axisLeft()
          .scale(new_yDoseScale)
          .tickFormat(d3.format(".0%"))
          .tickSize(-doseProfile.dimensions.width)
      );

    if (doseProfile.plotDensity) {
      var new_yDensityScale = transform.rescaleY(doseProfile.yDensityScale);
      doseProfile.svg
        .select(".profile-y-density-axis")
        .call(
          d3
            .axisLeft()
            .scale(new_yDensityScale)
            .tickSize(-doseProfile.dimensions.width)
        );
    }
  }
}

function zoomedCanvas(transform, canvas, axis) {
  // Get the image to draw
  let image = densityVol.prevSliceImg[axis];
  let context = canvas.node().getContext("2d");

  // Clear the canvas, apply transformations, and redraw
  context.clearRect(0, 0, canvas.node().width, canvas.node().height);
  context.save();
  context.translate(transform.x, transform.y);
  context.scale(transform.k, transform.k);
  context.drawImage(image, 0, 0);
  context.restore();
}

function zoomedAll(transform, panel) {
  zoomTransform = transform;

  panel.zoomTransform = transform;
  let axisElements = panel.axisElements;
  let volume = panel.volume;
  let axis = panel.axis;

  // Zoom on canvas
  zoomedCanvas(transform, axisElements["plot-density"], axis);

  // Zoom dose plot
  axisElements["plot-dose"]
    .select("g.dose-contour")
    .attr("transform", transform.toString());

  // Zoom marker
  axisElements["plot-marker"]
    .select("g.marker")
    .attr("transform", transform.toString());

  // Create new scale ojects based on event
  var new_xScale = transform.rescaleX(volume.prevSlice[panel.axis].xScale);
  var new_yScale = transform.rescaleY(volume.prevSlice[panel.axis].yScale);

  // Update axes
  axisElements["axis-svg"]
    .select(".x-axis")
    .call(d3.axisBottom().scale(new_xScale).ticks(6));
  axisElements["axis-svg"]
    .select(".y-axis")
    .call(d3.axisLeft().scale(new_yScale).ticks(6));

  // Update grid
  axisElements["axis-svg"]
    .select(".x-axis-grid")
    .call(
      d3
        .axisBottom()
        .scale(new_xScale)
        .tickSize(-mainViewerDimensions.height)
        .tickFormat("")
        .ticks(6)
    );
  axisElements["axis-svg"]
    .select(".y-axis-grid")
    .call(
      d3
        .axisLeft()
        .scale(new_yScale)
        .tickSize(-mainViewerDimensions.width)
        .tickFormat("")
        .ticks(6)
    );
}
