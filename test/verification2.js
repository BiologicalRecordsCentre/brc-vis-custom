(function ($, fns, data) {

  fns.verification2 = function(id, config) {

    //console.log("Verification sub-status chart")

    var $div = $('<div></div>').appendTo($('#' + id))

    // Verification sub-status
    $('<div id="' + id + '-chart">').appendTo($div)
    var verification2 = brccharts.pie({
      selector: "#" + id + "-chart",
      innerRadius: 35,
      radius: 70,
      title: 'Verification sub-status',
      titleFontSize: 14,
      data: [
        {
          name: "No substatus",
          number: 0,
          colour: '#00000055',
        },
        {
          name: "Accepted",
          number: 0,
          colour: '#008000',
        },
        {
          name: "Considered correct",
          number: 0,
          colour: '#00800088',
        },
        {
          name: "Plausible",
          number: 0,
          colour: '#FFA500',
        },
        {
          name: "Unable to verify",
          number: 0,
          colour: '#FF000088',
        },
        {
          name: "Incorrect",
          number: 0,
          colour: '#FF0000',
        },
      ],
      expand: true,
      legendSwatchSize: 15,
      legendWidth: 125,
      legendSwatchGap: 5,
      labelFontSize: 12,
      imageWidth: 40
    })

    // Get the data from ES
    var $cs = $('<div id="' + id + '-cs-div"></div>').appendTo($('#' + id))

    const linkedTaxonSelId = config.taxonSelControl
    fns.addTaxonSelectedFn(function (usedTaxonSelId, taxon) {

      if (usedTaxonSelId === linkedTaxonSelId) {
    
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
            "must":[
              {"query_type": "match_phrase","field": "taxon.taxa_taxon_list_id","value": taxon}
            ],
            "must_not":[
              {"query_type": "match_phrase","field": "identification-verification_status","value": ""}
            ]         
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

      // Remove any ES output classes otherwise when taxon
      // selector action buttons cause other JS code to execute
      // ES queries, but not this one, then these classes will
      // mess up the hooking up of those data sources.
      $cs.removeClass('idc-output')
      $cs.removeClass('idc-output-customScript')

      //console.log('ES callback ' + id + ' called')
        
      var data2 = [
        {
          name: "No substatus",
          colour: '#00000055',
          number: 0
        },
        {
          name: "Accepted",
          colour: '#008000',
          image: 'libraries/brcvis/test/images/accepted.png',
          number: 0
        },
        {
          name: "Considered correct",
          colour: '#00800088',
          image: 'libraries/brcvis/test/images/considered-correct.png',
          number: 0
        },
        {
          name: "Plausible",
          colour: '#FFA500',
          image: 'libraries/brcvis/test/images/plausible.png',
          number: 0
        },
        {
          name: "Unable to verify",
          colour: '#FF000088',
          image: 'libraries/brcvis/test/images/unable-to-verify.png',
          number: 0
        },
        {
          name: "Incorrect",
          colour: '#FF0000',
          image: 'libraries/brcvis/test/images/incorrect.png',
          number: 0
        },
      ]
      response.aggregations._rows.buckets.forEach(function(v) {
        data2[v.key['identification-verification_substatus']].number += v.doc_count
      })
      verification2.setChartOpts({data: data2.filter(function(v){return v.number})})
    }
  }

})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)