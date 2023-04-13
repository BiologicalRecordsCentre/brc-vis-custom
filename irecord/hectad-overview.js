(function ($, fns, data) {

  fns.hectadOverview = function(id, config) {

    var $div = fns.topDivConfig(config)
    $div.appendTo($('#' + id))

    // Busy indicator
    var $busy = fns.getBusy($div)
    
    $('<div id="' + id + '-hectad-map">').appendTo($div)

    // Create hectad map from brcatlas library
    var chartConfig = {
      selector: "#" + id + "-hectad-map",
      mapTypesKey: 'hectad-colour',
      transOptsControl: false,
      legendOpts: {display: true,
        scale: 0.8,
        x: 10,
        y: 10
      },
      //onclick: mapClick,
      mapTypesSel: {
        'hectad': getHectads,
        'hectad-colour': getHectadsColour
      },
      transOptsKey: 'BI4',
      expand: true
    }
    chartConfig = {...chartConfig, ...fns.parseChartConfig(config)}
    var brcmap = brcatlas.svgMap(chartConfig)

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

    function getHectadsColour() {

      return new Promise(function (resolve, reject) {
      
        var viridis = ["#440154","#440256","#450457","#450559","#46075a","#46085c","#460a5d","#460b5e","#470d60","#470e61","#471063","#471164","#471365","#481467","#481668","#481769","#48186a","#481a6c","#481b6d","#481c6e","#481d6f","#481f70","#482071","#482173","#482374","#482475","#482576","#482677","#482878","#482979","#472a7a","#472c7a","#472d7b","#472e7c","#472f7d","#46307e","#46327e","#46337f","#463480","#453581","#453781","#453882","#443983","#443a83","#443b84","#433d84","#433e85","#423f85","#424086","#424186","#414287","#414487","#404588","#404688","#3f4788","#3f4889","#3e4989","#3e4a89","#3e4c8a","#3d4d8a","#3d4e8a","#3c4f8a","#3c508b","#3b518b","#3b528b","#3a538b","#3a548c","#39558c","#39568c","#38588c","#38598c","#375a8c","#375b8d","#365c8d","#365d8d","#355e8d","#355f8d","#34608d","#34618d","#33628d","#33638d","#32648e","#32658e","#31668e","#31678e","#31688e","#30698e","#306a8e","#2f6b8e","#2f6c8e","#2e6d8e","#2e6e8e","#2e6f8e","#2d708e","#2d718e","#2c718e","#2c728e","#2c738e","#2b748e","#2b758e","#2a768e","#2a778e","#2a788e","#29798e","#297a8e","#297b8e","#287c8e","#287d8e","#277e8e","#277f8e","#27808e","#26818e","#26828e","#26828e","#25838e","#25848e","#25858e","#24868e","#24878e","#23888e","#23898e","#238a8d","#228b8d","#228c8d","#228d8d","#218e8d","#218f8d","#21908d","#21918c","#20928c","#20928c","#20938c","#1f948c","#1f958b","#1f968b","#1f978b","#1f988b","#1f998a","#1f9a8a","#1e9b8a","#1e9c89","#1e9d89","#1f9e89","#1f9f88","#1fa088","#1fa188","#1fa187","#1fa287","#20a386","#20a486","#21a585","#21a685","#22a785","#22a884","#23a983","#24aa83","#25ab82","#25ac82","#26ad81","#27ad81","#28ae80","#29af7f","#2ab07f","#2cb17e","#2db27d","#2eb37c","#2fb47c","#31b57b","#32b67a","#34b679","#35b779","#37b878","#38b977","#3aba76","#3bbb75","#3dbc74","#3fbc73","#40bd72","#42be71","#44bf70","#46c06f","#48c16e","#4ac16d","#4cc26c","#4ec36b","#50c46a","#52c569","#54c568","#56c667","#58c765","#5ac864","#5cc863","#5ec962","#60ca60","#63cb5f","#65cb5e","#67cc5c","#69cd5b","#6ccd5a","#6ece58","#70cf57","#73d056","#75d054","#77d153","#7ad151","#7cd250","#7fd34e","#81d34d","#84d44b","#86d549","#89d548","#8bd646","#8ed645","#90d743","#93d741","#95d840","#98d83e","#9bd93c","#9dd93b","#a0da39","#a2da37","#a5db36","#a8db34","#aadc32","#addc30","#b0dd2f","#b2dd2d","#b5de2b","#b8de29","#bade28","#bddf26","#c0df25","#c2df23","#c5e021","#c8e020","#cae11f","#cde11d","#d0e11c","#d2e21b","#d5e21a","#d8e219","#dae319","#dde318","#dfe318","#e2e418","#e5e419","#e7e419","#eae51a","#ece51b","#efe51c","#f1e51d","#f4e61e","#f6e620","#f8e621","#fbe723","#fde725"]
    
        var colour = d3.scaleQuantize()
          .domain(d3.extent(hectadData, function(h) {return Math.log(h.recs)}))
          .range(viridis)

        // At this stage, there might be some records without a 
        // resolved hectad (possibly outside UK?) so filter these out.
        var recs = hectadData.filter(function(h){return h.gr}).map(function(h) {
          return {
            gr: h.gr,
            id: h.gr,
            colour: colour(Math.log(h.recs)),
            caption: h.recs
          }
        })

        resolve({
          records: recs,
          size: 1,
          precision: 10000,
          shape: 'circle',
          opacity: 1,
        })
      })
    }

    // Set up div for ES idc-control and idc-customScript
    var $cs = $('<div id="' + id + '-cs-div"></div>').appendTo($('#' + id))

    fns.addTaxonSelectedFn(function (usedTaxonSelId, tvk, taxon, group) {

      if (usedTaxonSelId === config.taxonSelControl) {

        $busy.show()

        // Set up filters in response to controls
        var filters = fns.getFiltersFromControls(config, tvk, taxon, group, false)

        indiciaData.esSources.push({
          size: 0,
          id: "source-" + id,
          mode: "compositeAggregation",
          uniqueField: "location.grid_square.10km.centre",
          // uniqueField: "identification.verification_status",
          fields: [
            "location.grid_square.10km.centre",
            // "identification.verification_status"
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
        $cs.addClass('idc-control')
        $cs.addClass('idc-customScript')
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
    // the distrubution map when the query response is returned.
    indiciaFns[id]  = function (el, sourceSettings, response) {

      //console.log(response)

      // Remove any ES output classes otherwise when taxon
      // selector action buttons cause other JS code to execute
      // ES queries, but not this one, then these classes will
      // mess up the hooking up of those data sources.
      $cs.removeClass('idc-control')
      $cs.removeClass('idc-customScript')

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

        $busy.hide()
        brcmap.redrawMap()
      }
  }
})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)