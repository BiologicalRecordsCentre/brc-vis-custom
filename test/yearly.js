(function ($, fns, data) {

  fns.yearly = function(id, config) {

    //console.log("Yearly (trend) chart")

    var $div = $('<div></div>').appendTo($('#' + id))

    // GUI Phenology
    $('<div id="' + id + '-yearly-chart">').appendTo($div)
    var yearly = brccharts.yearly({
      selector: "#" + id + "-yearly-chart",
      legendFontSize: 14,
      data: [],
      metrics: [{ prop: 'n', label: 'Records per year', opacity: 1}],
      taxa: ['taxon'],
      minYear: 1990,
      maxYear: 2021,
      width: 290,
      height: 200,
      headPad: 35,
      margin: {left: 35, bottom: 10, top: 6},
      perRow: 1,
      expand: true,
      showTaxonLabel: false,
      showLegend: true
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
          uniqueField: "event.year",
          fields: [
            "event.year"
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
      yearly.setChartOpts({
        data: yearlyData,
      })
    }
  }

})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)