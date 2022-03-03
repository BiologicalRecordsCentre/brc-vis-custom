(function ($, fns, data) {

  fns.yearly = function(id, config) {

    var $div = fns.topDivConfig(config)
    $div.appendTo($('#' + id))

    // Busy indicator
    var $busy = fns.getBusy($div)

    $('<div id="' + id + '-yearly-chart">').appendTo($div)

    // GUI Phenology
    var chartConfig = {
      selector: "#" + id + "-yearly-chart",
      legendFontSize: 14,
      data: [],
      metrics: [{ prop: 'n', label: 'Records per year', opacity: 1}],
      taxa: ['taxon'],
      minYear: 2000,
      maxYear: new Date().getFullYear(),
      width: 300,
      height: 200,
      perRow: 1,
      expand: true,
      showTaxonLabel: false,
      showLegend: true
    }
    chartConfig = {...chartConfig, ...fns.parseChartConfig(config)}
    var yearly = brccharts.yearly(chartConfig)


    // Get the data from ES
    var $cs = $('<div id="' + id + '-cs-div"></div>').appendTo($('#' + id))

    fns.addTaxonSelectedFn(function (usedTaxonSelId, tvk, taxon, group) {

      if (usedTaxonSelId === config.taxonSelControl) {

        $busy.show()

        // Set up filters in response to controls
        var filters = fns.getFiltersFromControls(config, tvk, group)

        indiciaData.esSources.push({
          size: 0,
          id: "source-" + id,
          mode: "compositeAggregation",
          uniqueField: "event.year",
          fields: [
            "event.year"
          ],
          filterBoolClauses: {
            "must": filters[0],
            "must_not": filters[1]
          },
          proxyCacheTimeout: drupalSettings.brc_vis.indiciaUserId ? 60 : 7200
        })

        // The ES output classes must be added conditionally
        // because if they are added for a source that doesn't
        // get added to indiciaData.esSources, then hooking up
        // the data sources in the BRC vis module JS fails.
        $cs.addClass('idc-output')
        $cs.addClass('idc-output-customScript')
        var source = {}
        source["source-" + id] = ''
        $cs.idcCustomScript({
          id: 'custom-script-' + id,
          source: source,
          functionName: id,
        })
      }
    })

    // Add the Indicia ES custom callback function to create
    // the chart when the query response is returned.
    indiciaFns[id]  = function (el, sourceSettings, response) {

      // Remove any ES output classes otherwise when taxon
      // selector action buttons cause other JS code to execute
      // ES queries, but not this one, then these classes will
      // mess up the hooking up of those data sources.
      $cs.removeClass('idc-output')
      $cs.removeClass('idc-output-customScript')

      //console.log('ES callback ' + id + ' called')
        
      var yearlyData = response.aggregations._rows.buckets.filter(function(w) {return w.key['event-year']}).map(function(y) {
        return {
          taxon: 'taxon',
          year: y.key['event-year'],
          n: y.doc_count
        }
      })

      var opts = {data: yearlyData}

      var range = fns.getYearRange(config)
      var startYear = range[0]
      var endYear = range[1]
      if (startYear || endYear) {
        if (!startYear) startYear = 2000
        if (!endYear) endYear = new Date().getFullYear()
        opts = {...opts, minYear: Number(startYear), maxYear: Number(endYear)}
      } 

      $busy.hide()
      yearly.setChartOpts(opts)
    }
  }

})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)