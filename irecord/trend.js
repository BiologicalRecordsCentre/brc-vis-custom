(function ($, fns, data) {

  fns.trend = function(id, config) {

    var $div = fns.topDivConfig(config)
    $div.appendTo($('#' + id))

    var trendChart
    var dataAllTaxa = []
    var dataSelectedTaxa = []
    var dataSelectedTaxaNames = []
    var selectedTaxon, selectedGroup

    // Busy indicator
    var $busy = fns.getBusy($div)

    $('<div id="' + id + '-trend-chart">').appendTo($div)

    // GUI Phenology
    var chartConfig = {
      selector: "#" + id + "-trend-chart",
      //title: 'Trend chart 1',
      titleFontSize: 13,
      legendFontSize: 12,
      taxonLabelFontSize: 13,
      axisLeftLabel: 'Number of records (bars)',
      axisRightLabel: 'Percentage of group records (line)',
      styleCounts: {legend: 'Records for selected taxon'},
      styleProps: {legend: '% of all taxon group records'},
      //minYear: 1980,
      //maxYear: 2020,
      data: [],
      taxa: [''],
      width: 300,
      height: 200,
      perRow: 1,
      expand: true,
      showLegend: true,
      interactivity: 'mousemove',
    }
    chartConfig = {...chartConfig, ...fns.parseChartConfig(config)}
    trendChart = brccharts.trend(chartConfig)

    // Get the data from ES
    var $cs1 = $('<div id="' + id + '-cs1-div"></div>').appendTo($('#' + id))
    var $cs2 = $('<div id="' + id + '-cs2-div"></div>').appendTo($('#' + id))

    fns.addTaxonSelectedFn(function (usedTaxonSelId, tvk, taxon, group, groupid) {

      if (usedTaxonSelId === config.taxonSelControlGroup) {

        $busy.show()

        // Set the taxon_group_id API taxon search param for the associated species selection
        // controls and store the group name for elsewhere.
        $('#' + config.taxonSelControlTaxon).prop('data-param-override-fn')({taxon_group_id: groupid})
        selectedGroup = group
        
        // Set up filters in response to controls
        var filters = fns.getFiltersFromControls(config, tvk, taxon, group, {years: false})

        indiciaData.esSources.push({
          size: 0,
          id: "source-" + id + "-group",
          mode: "compositeAggregation",
          uniqueField: "event.year",
          fields: [
            "event.year",
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

      if (usedTaxonSelId === config.taxonSelControlTaxon && dataSelectedTaxaNames.indexOf(taxon) === -1) {

        $busy.show()

        selectedTaxon = taxon

        // Set up filters in response to controls
        var filters = fns.getFiltersFromControls(config, tvk, taxon, group, {years: false})

        indiciaData.esSources.push({
          size: 0,
          id: "source-" + id + "-taxon",
          mode: "compositeAggregation",
          uniqueField: "event.year",
          fields: [
            "event.year",
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
        $cs2.addClass('idc-control')
        $cs2.addClass('idc-customScript')
        var source2 = {}
        source2["source-" + id + "-taxon"] = ''
        $cs2.idcCustomScript({
          id: 'custom-script-' + id + "-taxon",
          source: source2,
          functionName: id + "-taxon",
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

    // Add the Indicia ES custom callback function to respond
    // to taxon selection.
    indiciaFns[id + "-taxon"]  = function (el, sourceSettings, response) {

      //console.log('ES callback ' + id + '-taxon called')

      // Create data of format required by trend chart (includes all taxa)
      // Includes a filter to remove null years
      var dataTaxon = response.aggregations._rows.buckets.filter(function(y){return y.key['event-year']}).map(function(y) {
        return {
          taxon: selectedTaxon,
          year: y.key['event-year'],
          count: y.doc_count
        }
      })
      dataSelectedTaxa = [...dataSelectedTaxa, ...dataTaxon]
      dataSelectedTaxaNames.push(selectedTaxon)
      var dataOtherTaxa = getOtherTaxa()

      // Get year range
      var range = fns.getYearRange(config)
      var startYear = range[0]
      var endYear = range[1]
      startYear = startYear ? Number(startYear) : 2000
      endYear = endYear ? Number(endYear) : new Date().getFullYear()

      // Update the trend chart
      trendChart.setChartOpts({
        data: [...dataOtherTaxa, ...dataSelectedTaxa],
        taxa: dataSelectedTaxaNames,
        group: [...dataSelectedTaxaNames, 'other'],
        minYear: startYear,
        maxYear: endYear
      })

      // Add the name of the selected taxon to the remove taxon control
      var $selCtl = $('#' + config.taxonRemoveCtlId + ' select')
      var $opt = $('<option>').appendTo($selCtl)
      $opt.text(selectedTaxon)
      $opt.attr("value", selectedTaxon)

      // Remove any ES output classes otherwise when taxon
      // selector action buttons cause other JS code to execute
      // ES queries, but not this one, then these classes will
      // mess up the hooking up of those data sources.
      $cs2.removeClass('idc-control')
      $cs2.removeClass('idc-customScript')

      $busy.hide()
    }

    function getOtherTaxa() {
      // For the trend chart to work, we need at least two 'taxa' because
      // the sum of records in each year for the taxa allow the trend (% of all records)
      // to be calculated. So we create a dummy taxon from the yearly totals, and subtract
      // the counts for selected taxa.
      var dataOtherTaxa = dataAllTaxa.map(function(o){
        const n = {...o}
        var matches = dataSelectedTaxa.filter(function(t) {return o.year === t.year})
        matches.forEach(function(t) {
          n.count = n.count - t.count
        })
        return n
      })
      return dataOtherTaxa
    }

    function getYearRange() {
      var range = fns.getYearRange(config)
      var startYear = range[0]
      var endYear = range[1]
      startYear = startYear ? Number(startYear) : 2000
      endYear = endYear ? Number(endYear) : new Date().getFullYear()

      return [startYear, endYear]
    }

    $(document).ready(function () {
      // Inits
      // Initially taxon selection controls are disabled before a 
      // group selected.
      var fn = $('#' + config.taxonSelControlTaxon).prop('data-enabled-input-fn')
      fn(false)
    })

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

    fns.onDropDownAndActionClick(function(id){
      if (id = config.taxonRemoveCtlId) {
        var removeTaxon = $('#' + config.taxonRemoveCtlId + ' select').find(":selected").text()
        $('#' + config.taxonRemoveCtlId + ' select').find(":selected").remove()

        dataSelectedTaxaNames = dataSelectedTaxaNames.filter(function(t){return t !== removeTaxon})
        dataSelectedTaxa = dataSelectedTaxa.filter(function(d){return d.taxon !== removeTaxon})
        var dataOtherTaxa = getOtherTaxa()

        trendChart.setChartOpts({
          data: [...dataOtherTaxa, ...dataSelectedTaxa],
          taxa: dataSelectedTaxaNames.length ? dataSelectedTaxaNames : [''],
          group: dataSelectedTaxaNames.length ? [...dataSelectedTaxaNames, 'other'] : [],
        })
      }
    })
  }
})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)