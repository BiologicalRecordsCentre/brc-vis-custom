(function ($, fns, data) {

  var dataVer = [
    {
      set: 1,
      name: "Accepted",
      code: 'V',
      number: 0,
      colour: '#008000',
      image: 'libraries/brcvis/irecord/images/considered-correct.png',
    },
    {
      set: 1,
      name: "Not reviewed",
      code: 'C',
      number: 0,
      colour: '#FFA500',
    },
    {
      set: 1,
      name: "Not accepted",
      code: 'R',
      number: 0,
      colour: '#FF0000',
      image: 'libraries/brcvis/irecord/images/incorrect.png',
    },
    {
      set: 2,
      name: "Correct",
      code: 1,
      colour: '#008000',
      image: 'libraries/brcvis/irecord/images/accepted.png',
      number: 0
    },
    {
      set: 2,
      name: "Considered correct",
      code: 2,
      colour: '#00800088',
      image: 'libraries/brcvis/irecord/images/considered-correct.png',
      number: 0
    },
    {
      set: 2,
      name: "No sub-status",
      code: 0,
      colour: 'silver',
      number: 0
    },
    {
      set: 2,
      name: "Plausible",
      code: 3,
      colour: '#FFA500',
      image: 'libraries/brcvis/irecord/images/plausible.png',
      number: 0
    },
    {
      set: 2,
      name: "Unable to verify",
      code: 4,
      colour: '#FF000088',
      image: 'libraries/brcvis/irecord/images/unable-to-verify.png',
      number: 0
    },
    {
      set: 2,
      name: "Incorrect",
      code: 5,
      colour: '#FF0000',
      image: 'libraries/brcvis/irecord/images/incorrect.png',
      number: 0
    },
  ]

  fns.yearlyVerification = function(id, config) {

    var yearlyData = []

    var $div = fns.topDivConfig(config)
    $div.appendTo($('#' + id))

    // Busy indicator
    var $busy = fns.getBusy($div)

    $('<div id="' + id + '-yearly-ver-chart">').appendTo($div)

    // GUI Phenology
    var chartConfig = {
      selector: "#" + id + "-yearly-ver-chart",
      title: 'Yearly record totals',
      titleFontSize: 13,
      legendFontSize: 12,
      data: [],
      metrics: [],
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
        var filters = fns.getFiltersFromControls(config, tvk, taxon, group, true)

        indiciaData.esSources.push({
          size: 0,
          id: "source-" + id,
          mode: "compositeAggregation",
          uniqueField: "event.year",
          uniqueField: "identification.verification_status",
          uniqueField: "identification.verification_substatus",
          fields: [
            "event.year",
            "identification.verification_status",
            "identification.verification_substatus",
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

      var range = getYearRange()
      var startYear = range[0]
      var endYear = range[1]
    
      yearlyData = []
      for (i=startYear; i<=endYear; i++) {
        var y = {
          taxon: 'taxon',
          year: i,
          all: 0,
          acceptedOnly: 0,
          notAcceptedExcluded: 0
        }
        dataVer.forEach(function(dv){
          y[String(dv.code)] = 0
        })
        yearlyData.push (y)
      }

      //console.log(response.aggregations._rows.buckets)

      response.aggregations._rows.buckets.forEach(function(d) {
        var status = d.key['identification-verification_status'] 
        // Convert any deprecated statuses to C (not reviewed)
        if (status !== 'V' && status !== 'C' && status !== 'R') {
          status = 'C'
        }
        var substatus = d.key['identification-verification_substatus'] 
        var year = d.key['event-year'] 
        if (year >= startYear && year <= endYear) {
          if (status) {
            yearlyData[year-startYear][status] += d.doc_count
            if (status === 'V') {
              yearlyData[year-startYear].acceptedOnly += d.doc_count
            }
            //if (status === 'V' || status === 'C') {
            if (status !== 'R') {
              yearlyData[year-startYear].notAcceptedExcluded += d.doc_count
            }
          }
          if (substatus || substatus === 0) {
            yearlyData[year-startYear][String(substatus)] += d.doc_count
          }
          yearlyData[year-startYear]['all'] += d.doc_count
        }
      })

      //console.log(yearlyData)

      $busy.hide()
      plotData('')
    }

    fns.yearlyVerificationReplot = function(status) {
      plotData(status)
    }

    function getYearRange() {
      var range = fns.getYearRange(config)
      var startYear = range[0]
      var endYear = range[1]
      if (!startYear) startYear = 2000
      if (!endYear) endYear = new Date().getFullYear()

      return [Number(startYear), Number(endYear)]
    }
    function plotData(status) {

      // Metrics
      var metrics
      var statusCode
      var statOrSubstatus
      var colour
      if (status) {
        var dv = dataVer.find(function(d){return status === d.name})
        statusCode = dv.code
        statOrSubstatus = dv.set === 1 ? 'status' : 'substatus'
        colour = dv.colour
      } else {
        colour = 'blue'
      }
      if (status) {
        metrics = [{ prop: String(statusCode), label: 'Records per year for ' + statOrSubstatus + ' ' + status, colour: colour, opacity: 1}]
      } else {
        var prop
        if (fns.isAcceptedOnlyChecked(config)) {
          prop = 'acceptedOnly'
        } else if (fns.isExcludeNotAcceptedChecked(config)) {
          prop = 'notAcceptedExcluded'
        } else {
          prop = 'all'
        }
        metrics = [{ prop: prop, label: 'All filtered records per year', colour: colour, opacity: 1}]
      }

      var range = getYearRange()
      var startYear = range[0]
      var endYear = range[1]

      var opts = {data: yearlyData, metrics: metrics, minYear: startYear, maxYear: endYear}

      yearly.setChartOpts(opts)
    }
  }

})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)