(function ($, fns, data) {

  var data = [
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

  var dataResponse

  fns.verificationCombine = function(id, config) {

    var $div = fns.topDivConfig(config)
    $div.appendTo($('#' + id))

    // Busy indicator
    var $busy = fns.getBusy($div)

    // Respond to changes in associated control block if the interactive
    // config option is set to true
    if (fns.getConfigOpt(config, 'interactive', 'false') === 'true') {
      fns.onAcceptedOnlyChecked(function(){
        plotChart()
      })
      fns.onExcludeNotAcceptedChecked(function(){
        plotChart()
      })
    }

    $('<div id="' + id + '-chart">').appendTo($div)

    // Highlight callback specified?
    var callbackName = fns.getConfigOpt(config, 'callback', '')
    var callbackFn = null
    if (callbackName) {
      if (callbacks.hasOwnProperty(callbackName)) {
        var callbackFn = callbacks[callbackName]
      }
    }

    // Verification status chart
    var chartConfig = {
      selector: "#" + id + "-chart",
      label: 'pervalue',
      strokeWidth: 0.5,
      radius: 120,
      innerRadius: 80,
      innerRadius2: 40,
      legendTitle: 'Status',
      legendTitle2: 'Sub-status',
      legendTitleFontSize: 13,
      data: data,
      expand: true,
      legendSwatchSize: 15,
      legendWidth: 125,
      legendSwatchGap: 5,
      labelFontSize: 12,
      imageWidth: 40,
      callback: callbackFn ? callbackFn : function(){return}
    }
    chartConfig = {...chartConfig, ...fns.parseChartConfig(config)}
    var verification = brccharts.pie(chartConfig)

    // Get the data from ES
    var $cs = $('<div id="' + id + '-cs-div"></div>').appendTo($('#' + id))

    fns.addTaxonSelectedFn(function (usedTaxonSelId, tvk, taxon, group) {

      if (usedTaxonSelId === config.taxonSelControl) {

        $busy.show()

        // Set up filters in response to controls
        var filters = fns.getFiltersFromControls(config, tvk, group, true)

        indiciaData.esSources.push({
          size: 0,
          id: "source-" + id,
          mode: "compositeAggregation",
          uniqueField: "identification.verification_status",
          uniqueField: "identification.verification_substatus",
          fields: [
            "identification.verification_status",
            "identification.verification_substatus"
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

    // Indicia callback
    indiciaFns[id]  = function (el, sourceSettings, response) {

      //console.log(response)

      // Remove any ES output classes otherwise when taxon
      // selector action buttons cause other JS code to execute
      // ES queries, but not this one, then these classes will
      // mess up the hooking up of those data sources.

      $cs.removeClass('idc-output')
      $cs.removeClass('idc-output-customScript')

      dataResponse = response.aggregations._rows.buckets

      // Convert any deprecated statuses to C (not reviewed)
      dataResponse.forEach(function(d){
        var status = d.key['identification-verification_status']
        if (status !== 'V' && status !== 'C' && status !== 'R') {
          d.key['identification-verification_status'] = 'C'
        }
      })
      
      $busy.hide()
      plotChart()
    }

    function plotChart() {

      // Mappings from client_helpers/VerificationHelper.php
      // Status
      // 'V' => 'Accepted',
      // 'R' => 'Not accepted',
      // 'C' => 'Not reviewed',
      // // Deprecated.
      // 'D' => 'Query',
      // 'I' => 'In progress',
      // 'T' => 'Test record',
      
      // Sub-status
      // ('0' - no substatus)
      // '1' => 'correct',
      // '2' => 'considered correct',
      // '3' => 'plausible',
      // '4' => 'unable to verify',
      // '5' => 'incorrect'
      
      // Zero the counts
      data.forEach(function(d) {
        d.number = 0
      })

      var dataFiltered = [...dataResponse]

      if (fns.isAcceptedOnlyChecked(config)) {
        dataFiltered = dataFiltered.filter(function(v){
          return v.key['identification-verification_status'] === 'V'
        })
      }
      if (fns.isExcludeNotAcceptedChecked(config)) {
        dataFiltered = dataFiltered.filter(function(v){
          return v.key['identification-verification_status'] !== 'R'
        })
      }

      dataFiltered.forEach(function(v) {

        // Status
        var datum = data.find(function(d){return v.key['identification-verification_status'] === d.code})
        if (!datum) datum = data[1] // If status not found, treat as if C (Not reviewed)
        datum.number += v.doc_count

        // Sub-status
        var datum = data.find(function(d){return v.key['identification-verification_substatus'] === d.code})
        datum.number += v.doc_count
      })

      verification.setChartOpts({data: data.filter(function(v){return v.number})})
    }
  }
  // Callbacks
  var callbacks = {
    verification1: function(name){
      fns.hectadVerificationRemap(name)
      fns.phenologyVerificationReplot(name)
      fns.yearlyVerificationReplot(name)
    }
  }

})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)