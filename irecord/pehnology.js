(function ($, fns, data) {

  fns.phenology = function(id, config) {

    var $div = fns.topDivConfig(config)
    $div.appendTo($('#' + id))

    // Busy indicator
    var $busy = fns.getBusy($div)

    $('<div id="' + id + '-phenology-chart">').appendTo($div)

    // GUI Phenology
    var chartConfig = {
      selector: "#" + id + "-phenology-chart",
      legendFontSize: 14,
      data: [],
      taxa: ['taxon'],
      metrics: [{ prop: 'n', label: 'Records per week', colour: 'blue' }],
      width: 300,
      height: 200,
      perRow: 1,
      expand: true,
      showTaxonLabel: false
    }
    chartConfig = {...chartConfig, ...fns.parseChartConfig(config)}
    var phen1 = brccharts.phen1(chartConfig)

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
          uniqueField: "event.week",
          fields: [
            "event.week"
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
        
      var phen1Data = []
      for (i=1; i<=53; i++) {
        phen1Data.push ({
          taxon: 'taxon',
          week: i,
          n: 0
        })
      }
      response.aggregations._rows.buckets.filter(function(w) {return w.key['event-week']}).forEach(function(w) {
        phen1Data[w.key['event-week']-1].n = w.doc_count
      })

      // Update the phenology chart
      $busy.hide()
      phen1.setChartOpts({
        data: phen1Data,
      })
    }
  }

})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)