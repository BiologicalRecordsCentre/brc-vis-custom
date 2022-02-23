(function ($, fns, data) {

  fns.hectadOverview = function(id, config) {

    //console.log('hectadOverview called with id', id)

    var $div = $('<div></div>').appendTo($('#' + id))

    // Create hectad map from brcatlas library
    $('<div id="' + id + '-hectad-map">').appendTo($div)
    var brcmap = brcatlas.svgMap({
      selector: "#" + id + "-hectad-map",
      mapTypesKey: 'hectad',
      transOptsControl: false,
      legendOpts: {display: true,
        scale: 0.8,
        x: 10,
        y: 10
      },
      //onclick: mapClick,
      mapTypesSel: {
        'hectad': getHectads
      },
      transOptsKey: 'BI4',
      expand: true
    })

    // Array for data that will be created from response of ES query
    // and reformatted by the getHectads data access function.
    var hectadData=[]

    // Define the data access function for brcmap
    function getHectads() {

      return new Promise(function (resolve, reject) {
        // At this stage, there might be some records without a 
        // resolved hectad (possibly outside UK?) so filter these out.
        var recs = hectadData.filter(function(h){return h.gr}).map(function(h) {
          return {
            gr: h.gr,
            id: h.gr,
            colour: 'black',
            opacity: 0.8,
            caption: h.recs
          }
        })
        resolve({
          records: recs,
          size: 1,
          precision: 10000,
          shape: 'circle',
        })
      })
    }

    // Set up div for ES idc-output and idc-output-customScript
    var $cs = $('<div id="' + id + '-cs-div"></div>').appendTo($('#' + id))

    const linkedTaxonSelId = config.taxonSelControl
    fns.addTaxonSelectedFn(function (usedTaxonSelId, taxon) {
      //console.log(usedTaxonSelId, linkedTaxonSelId)
      if (usedTaxonSelId === linkedTaxonSelId) {
        indiciaData.esSources.push({
          size: 0,
          id: "source-" + id,
          mode: "compositeAggregation",
          uniqueField: "location.grid_square.10km.centre",
          fields: [
            "location.grid_square.10km.centre"
          ],
          filterBoolClauses: {
            "must":[
              //{"query_type": "match_phrase","field": "taxon.accepted_name","value":taxon}
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
    // the distrubution map when the query response is returned.
    indiciaFns[id]  = function (el, sourceSettings, response) {

      hectadData = response.aggregations._rows.buckets.filter(function(h){return h.key['location-grid_square-10km-centre']}).map(function(h) {
        var latlon = h.key['location-grid_square-10km-centre'].split(' ')
        var hectad = bigr.getGrFromCoords(Number(latlon[0]), Number(latlon[1]), 'wg', '', [10000])
        return {
          gr: hectad.p10000,
          recs: h.doc_count
        }
      })
      // Turns out that sometimes more than one lat/lon combo is returned for a single hectad, so 
      // can't just do a simple map. Need to reduce to single values for each hectad.
      // Also filter out any values with null hectads
      hectadData = hectadData.filter(function(h){return h.gr}).reduce(function(a,h) {
        var existing = a.find(function(ah){return ah.gr === h.gr})
        if (existing) {
          existing.recs += h.recs
        } else {
          a.push({gr: h.gr, recs: h.recs})
        }
        return a
      }, [])

      brcmap.redrawMap()
    }
  }

  function getConfigOpt(config, opt, defaultVal) {
    return config[opt] ? config[opt] : defaultVal
  }
})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)