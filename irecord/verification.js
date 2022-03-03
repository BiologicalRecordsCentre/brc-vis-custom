(function ($, fns, data) {

  fns.verificationCombine = function(id, config) {

    var $div = fns.topDivConfig(config)
    $div.appendTo($('#' + id))

    // Busy indicator
    var $busy = fns.getBusy($div)

    $('<div id="' + id + '-chart">').appendTo($div)

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
      data: [
        {
          set: 1,
          name: "Accepted",
          number: 0,
          colour: '#008000',
          image: 'libraries/brcvis/irecord/images/considered-correct.png',
        },
        {
          set: 1,
          name: "Not accepted",
          number: 0,
          colour: '#FF0000',
          image: 'libraries/brcvis/irecord/images/incorrect.png',
        },
        {
          set: 1,
          name: "Not reviewed",
          number: 0,
          colour: '#FFA500',
        },
        {
          set: 2,
          name: "Correct",
          colour: '#008000',
          image: 'libraries/brcvis/irecord/images/accepted.png',
          number: 0
        },
        {
          set: 2,
          name: "Considered correct",
          colour: '#00800088',
          image: 'libraries/brcvis/irecord/images/considered-correct.png',
          number: 0
        },
        {
          set: 2,
          name: "Plausible",
          colour: '#FFA500',
          image: 'libraries/brcvis/irecord/images/plausible.png',
          number: 0
        },
        {
          set: 2,
          name: "Unable to verify",
          colour: '#FF000088',
          image: 'libraries/brcvis/irecord/images/unable-to-verify.png',
          number: 0
        },
        {
          set: 2,
          name: "Incorrect",
          colour: '#FF0000',
          image: 'libraries/brcvis/irecord/images/incorrect.png',
          number: 0
        },
        {
          set: 2,
          name: "No sub-status",
          colour: 'silver',
          number: 0
        },
      ],
      expand: true,
      legendSwatchSize: 15,
      legendWidth: 125,
      legendSwatchGap: 5,
      labelFontSize: 12,
      imageWidth: 40,
      //label: 'value'
    }
    chartConfig = {...chartConfig, ...fns.parseChartConfig(config)}
    var verification = brccharts.pie(chartConfig)

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

      // Mappings from client_helpers/VerificationHelper.php
      // Status
      // 'V' => 'Accepted',
      // 'R' => 'Not accepted',
      // // Deprecated.
      // 'D' => 'Query',
      // 'I' => 'In progress',
      // 'T' => 'Test record',
      // 'C' => 'Not reviewed',

      // Sub-status
      // ('0' - no substatus)
      // '1' => 'correct',
      // '2' => 'considered correct',
      // '3' => 'plausible',
      // '4' => 'unable to verify',
      // '5' => 'incorrect'
      
      // Remove any ES output classes otherwise when taxon
      // selector action buttons cause other JS code to execute
      // ES queries, but not this one, then these classes will
      // mess up the hooking up of those data sources.

      $cs.removeClass('idc-output')
      $cs.removeClass('idc-output-customScript')

      var data1 = [
        {
          set: 1,
          name: "Accepted",
          number: 0,
          colour: '#008000',
          image: 'libraries/brcvis/irecord/images/considered-correct.png',
        },
        {
          set: 1,
          name: "Not accepted",
          number: 0,
          colour: '#FF0000',
          image: 'libraries/brcvis/irecord/images/incorrect.png',
        },
        {
          set: 1,
          name: "Not reviewed",
          number: 0,
          colour: '#FFA500',
        },
        {
          set: 2,
          name: "Correct",
          colour: '#008000',
          image: 'libraries/brcvis/irecord/images/accepted.png',
          number: 0
        },
        {
          set: 2,
          name: "Considered correct",
          colour: '#00800088',
          image: 'libraries/brcvis/irecord/images/considered-correct.png',
          number: 0
        },
        {
          set: 2,
          name: "Plausible",
          colour: '#FFA500',
          image: 'libraries/brcvis/irecord/images/plausible.png',
          number: 0
        },
        {
          set: 2,
          name: "Unable to verify",
          colour: '#FF000088',
          image: 'libraries/brcvis/irecord/images/unable-to-verify.png',
          number: 0
        },
        {
          set: 2,
          name: "Incorrect",
          colour: '#FF0000',
          image: 'libraries/brcvis/irecord/images/incorrect.png',
          number: 0
        },
        {
          set: 2,
          name: "No sub-status",
          colour: 'silver',
          number: 0
        },
      ]

      response.aggregations._rows.buckets.forEach(function(v) {
        //console.log('v', v)
        // Status
        var statuses = ['V', 'R']
        var workData1 = data1.filter(function(d,i){return i<3})
        var iStatus = statuses.indexOf(v.key['identification-verification_status'])
        if (iStatus === -1) iStatus = 2 // Not reviewed if not V or R
        workData1[iStatus].number += v.doc_count
        // Sub-status
        var workData2 = data1.filter(function(d,i){return i>=3})
        var iSubstatus = v.key['identification-verification_substatus'] ? v.key['identification-verification_substatus']-1 : 5
        workData2[iSubstatus].number += v.doc_count
      })

      $busy.hide()
      verification.setChartOpts({data: data1.filter(function(v){return v.number})})
    }
  }

})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)