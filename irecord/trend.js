(function ($, fns, data) {

  var responseData, phen1
  
  fns.trend = function(id, config) {
    
    var $div = fns.topDivConfig(config)
    $div.appendTo($('#' + id))

    var taxaFromGroup = []

    // Busy indicator
    var $busy = fns.getBusy($div)

    // Species selection
    $('<div id="' + id + '-trend-chart-sp-select">').appendTo($div)
    speciesSelect(id + '-trend-chart-sp-select')

    $('<div id="' + id + '-trend-chart">').appendTo($div)

    // GUI Phenology
    var chartConfig = {
      selector: "#" + id + "-trend-chart",
      title: 'Trend chart 1',
      titleFontSize: 13,
      legendFontSize: 12,
      axisLeftLabel: 'Number of records (bars)',
      axisRightLabel: 'Percentage of group records (line)',
      data: [],
      taxa: ['taxon'],
      width: 300,
      height: 200,
      perRow: 1,
      expand: true,
      showLegend: true,
    }
    chartConfig = {...chartConfig, ...fns.parseChartConfig(config)}
    trend = brccharts.trend(chartConfig)

    // Get the data from ES
    var $cs = $('<div id="' + id + '-cs-div"></div>').appendTo($('#' + id))

    fns.addTaxonSelectedFn(function (usedTaxonSelId, tvk, taxon, group) {

      console.log('taxon selected', usedTaxonSelId, config.taxonSelControl)

      if (usedTaxonSelId === config.taxonSelControl) {

        $busy.show()

        // Set up filters in response to controls
        var filters = fns.getFiltersFromControls(config, tvk, taxon, group, false)

        //console.log('filters', filters)

        indiciaData.esSources.push({
          size: 0,
          id: "source-" + id,
          mode: "compositeAggregation",
          uniqueField: "event.year",
          uniqueField: "taxon.accepted_name",
          fields: [
            "event.year",
            "taxon.accepted_name"
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

      console.log(response)

      taxaFromGroup = []
      response.aggregations._rows.buckets.forEach(function(taxonYear){
        if (taxaFromGroup.indexOf(taxonYear.key['taxon-accepted_name']) === -1){
          taxaFromGroup.push(taxonYear.key['taxon-accepted_name'])
        }
      })

      console.log('taxaFromGroup', taxaFromGroup)

      // Remove any ES output classes otherwise when taxon
      // selector action buttons cause other JS code to execute
      // ES queries, but not this one, then these classes will
      // mess up the hooking up of those data sources.
      $cs.removeClass('idc-output')
      $cs.removeClass('idc-output-customScript')

      //console.log('ES callback ' + id + ' called')
        
      // // Filter out data that has no week data
      // responseData = response.aggregations._rows.buckets.filter(function(w) {return w.key['event-week']})

      // // Convert any deprecated statuses to C (not reviewed)
      // responseData.forEach(function(w){
      //   var status = w.key['identification-verification_status']
      //   if (status !== 'V' && status !== 'C' && status !== 'R') {
      //     w.key['identification-verification_status'] = 'C'
      //   }
      // })

      $busy.hide()
      //plotData()
    }

    function plotData(status) {
  
      // Sometimes can get here when responseData is undefined
      if (!responseData) return

      //console.log('responseData', responseData)

      var dataFilter = [...responseData]
      var statusCode
      if (status) {
        statusCode = dataVer.find(function(d){return status === d.name}).code
      }

      // Filter based on inclusion/exclusion checkboxes
      if (fns.isAcceptedOnlyChecked(config)) {
        dataFilter = dataFilter.filter(function(h){
          return h.key['identification-verification_status'] === 'V'
        })
      }
      if (fns.isExcludeNotAcceptedChecked(config)) {
        dataFilter = dataFilter.filter(function(h){
          //return h.key['identification-verification_status'] === 'V' || h.key['identification-verification_status'] === 'C'
          return h.key['identification-verification_status'] !== 'R'
        })
      }
      
      // Filter based on status/substatus
      if (statusCode || statusCode === 0) {
        dataFilter = dataFilter.filter(function(h){
          return h.key['identification-verification_status'] === statusCode || h.key['identification-verification_substatus'] === statusCode
        })
      }

      // Prepare the metrics
      var metrics
      if (statusCode || statusCode === 0) {
        var statusVer = dataVer.find(function(d){return statusCode === d.code})
        metrics = [{
          prop: String(statusCode), 
          label: status, 
          colour: statusVer.colour
        }]
      } else {
        var statusType = fns.getStatusSubstatusRadioSelection(config)
        var set = statusType === 'status' ? 1 : 2
        metrics = dataVer.filter(function(dv) {return dv.set === set}).map(function(dv) {
          return {
            prop: String(dv.code), 
            label: dv.name, 
            colour: dv.colour
          }
        })
        var all = {
          prop: 'all', 
          label: 'All', 
          colour: 'blue'
        }
        metrics = [all, ...metrics]
      }

      // Generate the phenology data
      var phen1Data = []
      for (i=1; i<=53; i++) {
        var w = {
          taxon: 'taxon',
          week: i,
          all: 0,
        }
        dataVer.forEach(function(dv){
          w[String(dv.code)] = 0
        })
        phen1Data.push (w)
      }

      dataFilter.forEach(function(d) {
        var status = d.key['identification-verification_status'] 
        var substatus = d.key['identification-verification_substatus'] 
        var week = d.key['event-week'] 
        if (status) {
          phen1Data[week-1][status] += d.doc_count
        }
        if (substatus || substatus === 0) {
          phen1Data[week-1][String(substatus)] += d.doc_count
        }
        phen1Data[week-1]['all'] += d.doc_count
      })

      // Go through the metrics and remove any that do not have any data
      metrics = metrics.filter(function(m){
        var count = phen1Data.reduce(function(a, d) { 
          return a += d[m.prop]
        }, 0)
        return count > 0
      })

      // Remove 'all' from metrics if there are only two items
      if (metrics.length === 2) {
        metrics = metrics.filter(function(m){
          return m.prop !== 'all'
        })
      }
      
      // Update the phenology chart
      phen1.setChartOpts({
        data: phen1Data,
        metrics: metrics,
      })
    }


    function speciesSelect(id) {

      // Autocomplete species select (from group taxa)
      const $wrapper = $('<div>').appendTo($('#' + id))
      $wrapper.css('margin', '0.3em 0')
      $wrapper.attr('class', 'autoComplete_wrapper')
      const $input = $('<input>').appendTo($wrapper)
      $input.attr('id', id + '-input')
      $input.attr('type', 'text')
      $input.attr('tabindex', '1')

      const autoCompleteGroup = new autoComplete({
        selector: '#' + id + '-input',
        placeHolder: 'Type taxon from group',
        submit: true,
        data: {src: async function() {return taxaFromGroup}},  
        // resultsList: {
        //   maxResults: 50,
        // },
        // events: {
        //   input: {
        //     focus: () => {
        //       if (autoCompleteGroup.input.value.length) autoCompleteGroup.start()
        //     },
        //     selection: (event) => {
        //       console.log('selected', event.detail.selection.value.title)
        //     }
        //   }
        // }
      })
    }
  }
})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)