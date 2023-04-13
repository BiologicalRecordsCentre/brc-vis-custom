(function ($, fns, data) {

  // Can't find a way to implement this with ES
  // Sacking for now.
  // This JS copied from trend and part edited.
  return

  fns.accum = function(id, config) {

    var $div = fns.topDivConfig(config)
    $div.appendTo($('#' + id))

    var accumChart

    // Busy indicator
    var $busy = fns.getBusy($div)

    $('<div id="' + id + '-accum-chart">').appendTo($div)

    // GUI Accumulation chart
    var chartConfig = {
      selector: "#" + id + "-accum-chart",
      titleFontSize: 13,
      legendFontSize: 12,
      taxonLabelFontSize: 13,
      data: [],
      metrics: [
        {
          prop: '2020', 
          labelTaxa: '2020 taxa', 
          labelCounts: '2020 records', 
          colourTaxa: 'red', 
          colourCounts: 'red', 
          styleTaxa: 'solid', 
          styleCounts: 'dashed'
        },
        {
          prop: '2019', 
          labelTaxa: '2019 taxa', 
          labelCounts: '2019 records', 
          colourTaxa: 'blue', 
          colourCounts: 'blue', 
          styleTaxa: 'solid', 
          styleCounts: 'dashed'
        },
      ],
      width: 300,
      height: 200,
      perRow: 1,
      expand: true,
      showLegend: true,
      interactivity: 'mousemove',
    }
    chartConfig = {...chartConfig, ...fns.parseChartConfig(config)}
    accumChart = brccharts.accum(chartConfig)

    // Get the data from ES
    var $cs1 = $('<div id="' + id + '-cs1-div"></div>').appendTo($('#' + id))
    
    fns.addTaxonSelectedFn(function (usedTaxonSelId, tvk, taxon, group, groupid) {
      
      console.log('accum taxon selected')
      
      if (usedTaxonSelId === config.taxonSelControlGroup) {

        $busy.show()

        // Set the taxon_group_id API taxon search param for the associated species selection
        // controls and store the group name for elsewhere.
        $('#' + config.taxonSelControlTaxon).prop('data-param-override-fn')({taxon_group_id: groupid})
        selectedGroup = group
        
        // Set up filters in response to controls
        var filters = fns.getFiltersFromControls(config, tvk, taxon, group, {years: true})

        indiciaData.esSources.push({
          size: 0,
          id: "source-" + id + "-group",
          mode: "compositeAggregation",
          uniqueField: "event.week",
          fields: [
            "event.week",
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
        $cs1.addClass('idc-control')
        $cs1.addClass('idc-customScript')
        var source1 = {}
        source1["source-" + id + "-group"] = ''
        $cs1.idcCustomScript({
          id: 'custom-script-' + id + "-group",
          source: source1,
          functionName: id + "-group",
        })
      }
    })

    // Add the Indicia ES custom callback function to
    // respond to taxon group selection.
    indiciaFns[id + "-group"]  = function (el, sourceSettings, response) {

      //console.log('ES callback ' + id + '-group called')

      // Generate array of total number of records per year
      dataAllTaxa = response.aggregations._rows.buckets.filter(function(y){return y.key['event-year']}).map(function(y) {
        return {
          taxon: 'other',
          year: y.key['event-year'],
          count: y.doc_count //Later, totals for specific taxon will be subtracted
        }
      })

      // Clear Trend charts and associated controls
      dataSelectedTaxa = []
      dataSelectedTaxaNames = []
      trendChart.setChartOpts({
        data: [],
        taxa: [''],
        group: [],
      })
      var $selCtl = $('#' + config.taxonRemoveCtlId + ' select')
      $selCtl.empty()
      var $taxSel = $('#' + config.taxonSelControlTaxon + '-input')
      $taxSel.val('')

      // Remove any ES output classes otherwise when taxon
      // selector action buttons cause other JS code to execute
      // ES queries, but not this one, then these classes will
      // mess up the hooking up of those data sources.
      $cs1.removeClass('idc-control')
      $cs1.removeClass('idc-customScript')

      // Update control text
      $('#' + config.ctls + '-group-display').html('<b>' + selectedGroup + '</b> selected')
      // Ensure that taxon control are enabled
      $('#' + config.taxonSelControlTaxon).prop('data-enabled-input-fn')(true)

      $busy.hide()
    }


    function getYearRange() {
      var range = fns.getYearRange(config)
      var startYear = range[0]
      var endYear = range[1]
      startYear = startYear ? Number(startYear) : 2000
      endYear = endYear ? Number(endYear) : new Date().getFullYear()

      return [startYear, endYear]
    }

    // React to interactive control actions
    fns.onGenButtonClick(function(marker){
      if (marker === 'update') {
        var years = getYearRange()
        trendChart.setChartOpts({
          minYear: years[0],
          maxYear: years[1]
        })
      }
    })

  }
})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)