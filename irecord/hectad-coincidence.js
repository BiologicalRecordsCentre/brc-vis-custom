(function ($, fns, data) {

  fns.hectadCoincidence = function(id, config) {

    var $div = fns.topDivConfig(config)
    $div.appendTo($('#' + id))

    var taxon1, taxon2
    var verificationFiltersTaxon1, verificationFiltersTaxon2

    // Busy indicator
    var $busy = fns.getBusy($div)

    $('<div id="' + id + '-hectad-coincidence">').appendTo($div)

    // Create hectad map from brcatlas library
    var chartConfig = {
      selector: "#" + id + "-hectad-coincidence",
      mapTypesKey: 'coincidence',
      transOptsControl: false,
      legendOpts: {display: true,
        scale: 0.8,
        x: 10,
        y: 10
      },
      //onclick: mapClick,
      mapTypesSel: {
        'coincidence': getHectads,
      },
      transOptsKey: 'BI4',
      expand: true
    }
    chartConfig = {...chartConfig, ...fns.parseChartConfig(config)}
    var brcmap = brcatlas.svgMap(chartConfig)

    // Array for data that will be created from response of ES query
    // and reformatted by the getHectads data access function.
    var hectadData=[[], []]

    // Define the data access function for brcmap
    function getHectads() {

      var taxaChecked = fns.coindicenceTaxaCheckboxStates(config)
      var useTaxon1 = taxaChecked[0] && hectadData[0].length
      var useTaxon2 = taxaChecked[1] && hectadData[1].length

      var colours = fns.getDotColours(config)
      var colour1 = colours[0]
      var colour2 = colours[1]
      var colour3 = colours[2]

      var mapTaxa, colour

      if (useTaxon1 && useTaxon2) {
        mapTaxa = 3
      } else if (useTaxon1) {
        mapTaxa = 1
        colour = colour1
      } else if (useTaxon2) {
        mapTaxa = 2
        colour = colour2
      } else {
        mapTaxa = 0
      }

      var mapData
      if (!mapTaxa) {
        mapData = []
      } else if (mapTaxa === 1 || mapTaxa == 2) {
        mapData = hectadData[mapTaxa-1]
      } else {
        mapData = hectadData[0].map(function(h){
          return {
            gr: h.gr,
            recs: h.recs,
            colour: colour1
          }
        })
        hectadData[1].forEach(function(h2) {
          var match = mapData.find(function(h1) {
            return h1.gr === h2.gr
          })
          if (match) {
            match.colour = colour3
            match.recs += h2.recs
          } else {
            mapData.push({
              gr: h2.gr,
              recs: h2.recs,
              colour: colour2
            })
          }
        })
      }

      return new Promise(function (resolve, reject) {
        // At this stage, there might be some records without a 
        // resolved hectad (possibly outside UK?) so filter these out.
        var recs = mapData.filter(function(h){return h.gr}).map(function(h) {
          return {
            gr: h.gr,
            id: h.gr,
            colour: colour ? colour : h.colour,
            opacity: 1,
            caption: h.recs
          }
        })
        resolve({
          records: recs,
          size: 1,
          precision: 10000,
          shape: fns.getDotRadioSelection(config),
        })
      })
    }

    // Generate legend options object
    function getLegendOpts() {

      var taxaChecked = fns.coindicenceTaxaCheckboxStates(config)
      var useTaxon1 = taxaChecked[0] && hectadData[0].length
      var useTaxon2 = taxaChecked[1] && hectadData[1].length

      var colours = fns.getDotColours(config)
      var colour1 = colours[0]
      var colour2 = colours[1]
      var colour3 = colours[2]

      var legendLines = []
      if (useTaxon1) {
        legendLines.push({
          colour: colour1,
          text: taxon1
        })
      }
      if (useTaxon2) {
        legendLines.push({
          colour: colour2,
          text: taxon2
        })
      }
      if (useTaxon1 && useTaxon2) {
        legendLines.push({
          colour: colour3,
          text: 'Both'
        })
      }

      // Scale adjustment depends on inset type
      var insetType = fns.getInsetRadioSelection(config)
      //console.log('insetType', insetType)
      var scale = 0.7
      var x = 10
      var y = -7
      if (insetType === 'BI1') {
        scale = scale * 0.8
        x = 7
        y = -5
      }
      if (insetType === 'BI2') {
        scale = scale * 0.86
        x = 7
        y = -5
      }

      var legendOpts = {
        display: true,
        scale: scale,
        x: x,
        y: y,
        data: {
          //title: 'Concidence of species',
          size: 1,
          precision: 10000,
          opacity: 1,
          shape: fns.getDotRadioSelection(config),
          lines: legendLines
        }
      }

      return legendOpts
    }

    // Generate download image information
    function getDownloadInfo() {
      var today = new Date()
      var dd = String(today.getDate()).padStart(2, '0')
      var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
      var yyyy = today.getFullYear()

      today = dd + '/' + mm + '/' + yyyy

      var text = 'Generated from iRecord on '
      text += today + ' (' + window.location + ').'

      var taxaChecked = fns.coindicenceTaxaCheckboxStates(config)
      var useTaxon1 = taxaChecked[0] && hectadData[0].length
      var useTaxon2 = taxaChecked[1] && hectadData[1].length

      if (useTaxon1) {
        if (verificationFiltersTaxon1[0]) {
          text += ' Only records with verification status \'Accepted\' are included for ' + taxon1 + '.'
        } else if (verificationFiltersTaxon1[1]) {
          text += ' Records with verification status \'Not Accepted\' are excluded for ' + taxon1 + '.'
        } else {
          text += ' CAUTION - Records with verification status \'Not Accepted\' were NOT excluded from this map'
          text += ' for ' + taxon1 + '. The map can be generated with these records excluded.'
        }
      }
      if (useTaxon2) {
        if (verificationFiltersTaxon2[0]) {
          text += ' Only records with verification status \'Accepted\' are included for ' + taxon2 + '.'
        } else if (verificationFiltersTaxon2[1]) {
          text += ' Records with verification status \'Not Accepted\' are excluded for ' + taxon2 + '.'
        } else {
          text += ' CAUTION - Records with verification status \'Not Accepted\' were NOT excluded from this map'
          text += ' for ' + taxon2 + '. The map can be generated with these records excluded.'
        }
      }

      const info = {
        text: text,
        margin: 10,
        fontSize: 10,
        img: 'libraries/brcvis/irecord/images/ceh-brc-logo.png'
      }

      return info
    } 

    // Set up div for ES idc-output and idc-output-customScript
    var cs = []
    cs[0] = $('<div id="' + id + '-cs1-div"></div>').appendTo($('#' + id))
    cs[1] = $('<div id="' + id + '-cs2-div"></div>').appendTo($('#' + id))

    fns.addTaxonSelectedFn(function (usedTaxonSelId, tvk, taxon, group) {

      //console.log(usedTaxonSelId, tvk, taxon, group)

      if (usedTaxonSelId === config.taxonSelControl1 || usedTaxonSelId === config.taxonSelControl2) {

        var iTaxon = usedTaxonSelId === config.taxonSelControl1 ? 1 : 2

        // Store the names of the selected taxa
        if (iTaxon === 1) {
          if (taxon) {
            taxon1 = taxon
          } else if (group) {
            taxon1 = group
          }
        } else {
          if (taxon) {
            taxon2 = taxon
          } else if (group) {
            taxon2 = group
          }
        }

        $busy.show()
        // Disable both taxon selection controls
        $('#' + config.taxonSelControl1).prop('data-enabled-fn')(false)
        $('#' + config.taxonSelControl2).prop('data-enabled-fn')(false)

        // Set up filters in response to controls
        var filters = fns.getFiltersFromControls(config, tvk, taxon, group, false)

        // Store verification status filters for use with image download text
        if (iTaxon === 1) {
          verificationFiltersTaxon1 = [fns.isAcceptedOnlyChecked(config), fns.isExcludeNotAcceptedChecked(config)]
        } else {
          verificationFiltersTaxon2 = [fns.isAcceptedOnlyChecked(config), fns.isExcludeNotAcceptedChecked(config)]
        }

        indiciaData.esSources.push({
          size: 0,
          id: "source-" + iTaxon + '-' + id,
          mode: "compositeAggregation",
          uniqueField: "location.grid_square.10km.centre",
          fields: [
            "location.grid_square.10km.centre",
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
        var $cs = cs[iTaxon-1]
        $cs.addClass('idc-output')
        $cs.addClass('idc-output-customScript')
        var source = {}
        source["source-" + iTaxon + '-' + id] = ''
        $cs.idcCustomScript({
          id: 'custom-script-' + iTaxon + '-' + id,
          source: source,
          functionName: id,
        })
      }
    })

    // Add the Indicia ES custom callback function to create
    // the distrubution map when the query response is returned.
    indiciaFns[id]  = function (el, sourceSettings, response) {

      var iTaxon = sourceSettings.id === 'source-1-brc-hectad-coincidence' ? 1 : 2
      
      //console.log(response)

      // Remove any ES output classes otherwise when taxon
      // selector action buttons cause other JS code to execute
      // ES queries, but not this one, then these classes will
      // mess up the hooking up of those data sources.
      var $cs = cs[iTaxon-1]
      $cs.removeClass('idc-output')
      $cs.removeClass('idc-output-customScript')

      hectadData[iTaxon-1] = response.aggregations._rows.buckets.filter(function(h){return h.key['location-grid_square-10km-centre']}).map(function(h) {
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
      hectadData[iTaxon-1] = hectadData[iTaxon-1].filter(function(h){return h.gr}).reduce(function(a,h) {
        var existing = a.find(function(ah){return ah.gr === h.gr})
          if (existing) {
            existing.recs += h.recs
          } else {
            a.push({gr: h.gr, recs: h.recs})
          }
          return a
        }, [])

      $busy.hide()
      // Enable both taxon selection controls
      $('#' + config.taxonSelControl1).prop('data-enabled-fn')(true)
      $('#' + config.taxonSelControl2).prop('data-enabled-fn')(true)

      //brcmap.setIdentfier(iTaxon)
      brcmap.setLegendOpts(getLegendOpts())
      brcmap.redrawMap()
    }

    // React to interactive control actions
    fns.onCoincidenceTaxaChecked(function() {
      brcmap.setLegendOpts(getLegendOpts())
      brcmap.redrawMap()
    })
    fns.onInsetRadioSelection(function(){
      brcmap.setTransform(fns.getInsetRadioSelection(config))
      brcmap.setLegendOpts(getLegendOpts())
      brcmap.redrawMap()
    })
    fns.onDotRadioSelection(function(){
      brcmap.setLegendOpts(getLegendOpts())
      brcmap.redrawMap()
    })
    fns.onDotColourChange(function(){
      brcmap.setLegendOpts(getLegendOpts())
      brcmap.redrawMap()
    })
    fns.onDownloadClick(function(type){
      brcmap.saveMap(type === 'svg', getDownloadInfo())
    })
  }
})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)