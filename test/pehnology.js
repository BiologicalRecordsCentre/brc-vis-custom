(function ($, fns, data) {

  fns.phenology = function(id, config) {

    //console.log("Phenology chart")

    var $div = $('<div></div>').appendTo($('#' + id))

    // GUI Phenology
    $('<div id="' + id + '-phenology-chart">').appendTo($div)
    var phen1 = brccharts.phen1({
      selector: "#" + id + "-phenology-chart",
      legendFontSize: 14,
      data: [],
      taxa: ['taxon'],
      metrics: [{ prop: 'n', label: 'Records per week', colour: 'blue' }],
      width: 290,
      height: 200,
      headPad: 35,
      perRow: 1,
      expand: true,
      showTaxonLabel: false
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
          uniqueField: "event.week",
          fields: [
            "event.week"
          ],
          filterBoolClauses: {
            "must":[
              {"query_type": "match_phrase","field": "taxon.taxa_taxon_list_id","value":taxon}
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
      } else {
        // If not required, then remove any ES output classes
        // already added otherwise hooking up
        // the data sources in the BRC vis module JS fails.
        $cs.removeClass('idc-output')
        $cs.removeClass('idc-output-customScript')
      }  
    })

    // Add the Indicia ES custom callback function to create
    // the chart when the query response is returned.
    indiciaFns[id]  = function (el, sourceSettings, response) {

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
      phen1.setChartOpts({
        data: phen1Data,
      })
    }
  }

})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)