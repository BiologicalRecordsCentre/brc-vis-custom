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
  
  fns.hectadVerification = function(id, config) {

    var $div = fns.topDivConfig(config)
    $div.appendTo($('#' + id))

    // Busy indicator
    var $busy = fns.getBusy($div)

    // Respond to changes in associated control block
    fns.onAcceptedOnlyChecked(function(){
      brcmap.redrawMap()
    })
    fns.onExcludeNotAcceptedChecked(function(){
      brcmap.redrawMap()
    })

    // Add event handler for status/substatus radio button
    fns.onStatusSubstatusRadioSelection(function(status){
      console.log('selected status:', status)
      //hectadData = filterData(dataRaw)
      //brcmap.setIdentfier('')
      brcmap.redrawMap()
    })
      
    // Map
    $('<div id="' + id + '-hectad-map">').appendTo($div)

    // Create hectad map from brcatlas library
    var chartConfig = {
      selector: "#" + id + "-hectad-map",
      mapTypesKey: 'hectad-status',
      transOptsControl: false,
      legendOpts: {display: true,
        scale: 0.8,
        x: 10,
        y: 10
      },
      mapTypesSel: {
        'hectad-status': getHectadsStatus,
      },
      transOptsKey: 'BI4',
      expand: true
    }
    chartConfig = {...chartConfig, ...fns.parseChartConfig(config)}
    var brcmap = brcatlas.svgMap(chartConfig)

    // Array for unprocessed data from response of ES query
    var dataRaw = []
    // Array for data that will be created from response of ES query
    // and reformatted by the getHectads data access function.
    var hectadData=[]

    // Define the data access function
    function getHectadsStatus(identifier) {

      var statusVer = dataVer.find(function(d){return identifier === d.name})
      
      var types
      var statusType = fns.getStatusSubstatusRadioSelection(config)
      if (statusType === 'status') {
        types = dataVer.filter(function(dv){return dv.set === 1})
      } else {
        types = dataVer.filter(function(dv){return dv.set === 2})
      }

      // if (fns.isAcceptedOnlyChecked(config)) {
      //   dataFiltered = dataFiltered.filter(function(v){
      //     return v.key['identification-verification_status'] === 'V'
      //   })
      // }
      // if (fns.isExcludeNotAcceptedChecked(config)) {
      //   dataFiltered = dataFiltered.filter(function(v){
      //     return v.key['identification-verification_status'] !== 'R'
      //   })
      // }

      var recs = [...hectadData]
      if (fns.isAcceptedOnlyChecked(config)) {
        recs = recs.filter(function(h){
          return h.a_status.indexOf('V') > -1
        })
      }
      if (fns.isExcludeNotAcceptedChecked(config)) {
        recs = recs.filter(function(h){
          return !(h.a_status.indexOf('V') === -1 && h.a_status.indexOf('C') === -1)
        })
      }


      return new Promise(function (resolve, reject) {
        // At this stage, there might be some records without a 
        // resolved hectad (possibly outside UK?) so filter these out.
        recs = recs.filter(function(h){return h.gr}).map(function(h) {
          var colour = 'black'
          if (!statusVer) {
            for (var i=0; i<types.length; i++) {
              var code = String(types[i].code)
              if ((h.a_status).indexOf(code) > -1) {
                colour = types[i].colour
                break
              }
            }
          }
          return {
            gr: h.gr,
            id: h.gr,
            colour: statusVer ? statusVer.colour : colour,
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

    // Set up div for ES idc-output and idc-output-customScript
    var $cs = $('<div id="' + id + '-cs-div"></div>').appendTo($('#' + id))
    var $cs2 = $('<div id="' + id + '-cs-div-2"></div>').appendTo($('#' + id))

    fns.addTaxonSelectedFn(function (usedTaxonSelId, tvk, taxon, group) {
      dataRaw = []
      $busy.show()
      // Initially the data was retrieved from ES with a single aggregate
      // query using hectad, status and substatus. However with large
      // queries, e.g. all butterflies, the retrieved data appeared to be
      // truncated. An aggregate query of that kind will generate a huge
      // number of buckets and maybe this is causing the query to come up
      // against some sort of limit somehwere. So instead, we're using two
      // ES queries - one for hectad and status and one for hectad and substatus.
      // Then the results are combined in the Indicia custom function 
      // callback.
      esStatus(usedTaxonSelId, tvk, taxon, group)
      esSubstatus(usedTaxonSelId, tvk, taxon, group)
    })

    function esStatus(usedTaxonSelId, tvk, taxon, group) {

      if (usedTaxonSelId === config.taxonSelControl) {

        // Set up filters in response to controls
        var filters = fns.getFiltersFromControls(config, tvk, group)

        indiciaData.esSources.push({
          size: 0,
          id: "source-" + id,
          mode: "compositeAggregation",
          uniqueField: "location.grid_square.10km.centre",
          uniqueField: "identification.verification_status",
          fields: [
            "location.grid_square.10km.centre",
            "identification.verification_status",
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
    }

    function esSubstatus (usedTaxonSelId, tvk, taxon, group) {

      if (usedTaxonSelId === config.taxonSelControl) {

        // Set up filters in response to controls
        var filters = fns.getFiltersFromControls(config, tvk, group)

        indiciaData.esSources.push({
          size: 0,
          id: "source-2-" + id,
          mode: "compositeAggregation",
          uniqueField: "location.grid_square.10km.centre",
          uniqueField: "identification.verification_substatus",
          fields: [
            "location.grid_square.10km.centre",
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
        $cs2.addClass('idc-output')
        $cs2.addClass('idc-output-customScript')
        var source = {}
        source["source-2-" + id] = ''
        $cs2.idcCustomScript({
          id: 'custom-script-2-' + id,
          source: source,
          functionName: id,
        })
      }
    }

    indiciaFns[id]  = function (el, sourceSettings, response) {
      // Indicia ES custom callback function to create
      // the distrubution map when the query response is returned.

      // Remove any ES output classes otherwise when taxon
      // selector action buttons cause other JS code to execute
      // ES queries, but not this one, then these classes will
      // mess up the hooking up of those data sources.
      if (sourceSettings.id === 'source-brc-hectad') {
        $cs.removeClass('idc-output')
        $cs.removeClass('idc-output-customScript')
      } else {
        $cs2.removeClass('idc-output')
        $cs2.removeClass('idc-output-customScript')
      }
    
      // We'll process info from 
      var dataRawPart = response.aggregations._rows.buckets.filter(function(h){return h.key['location-grid_square-10km-centre']}).map(function(h) {
        var latlon = h.key['location-grid_square-10km-centre'].split(' ')
        var hectad = bigr.getGrFromCoords(Number(latlon[0]), Number(latlon[1]), 'wg', '', [10000])
        return {
          gr: hectad.p10000,
          type: sourceSettings.id === 'source-brc-hectad' ? 'status' : 'substatus',
          status: h.key['identification-verification_status'],
          substatus: h.key['identification-verification_substatus'],
          recs: h.doc_count
        }
      })

      if (dataRaw.length === 0) {
        dataRaw = [...dataRawPart]
      } else {
        dataRaw = [...dataRaw, ...dataRawPart]

        hectadData = filterData(dataRaw)
        $busy.hide()
        brcmap.setIdentfier('')
        brcmap.redrawMap()
      }
    }

    fns.hectadVerificationRemap = function(status) {

      if (status) {
        var statusVer = dataVer.find(function(d){return status === d.name})
        hectadData = filterData(dataRaw, statusVer.code)
      } else {
        hectadData = filterData(dataRaw)
      }
      brcmap.setIdentfier(status)
      brcmap.redrawMap()
    }
  }

  function filterData(data, statusCode) {

    // First of all filter based on status/substatus
    var iCode = dataVer.findIndex(function(d){return statusCode === d.code})
    var dataStatus
    if (statusCode || statusCode === 0 ) {
      dataStatus = data.filter(function(h){
        if (iCode < 3) {
          return h.status === statusCode
        } else {
          return h.substatus === statusCode
        }
      })
    } else {
      dataStatus = data
    }

    // Turns out that sometimes more than one lat/lon combo is returned for a single hectad.
    // Create a single record for each hectad, summing the number of records and
    // collecting status codes in an array.
    var dataReturn = dataStatus.filter(function(h){return h.gr}).reduce(function(a,h) {
      var existing = a.find(function(ah){return ah.gr === h.gr})
      if (existing) {
        existing.recs += h.recs
        var status = h.type === 'status' ? h.status : String(h.substatus)
        existing.a_status = [...existing.a_status, status]
      } else {
        a.push({
          gr: h.gr, 
          recs: h.recs, 
          //type: h.type,
          //status: h.status, 
          //substatus: h.substatus, 
          a_status: h.type === 'status' ? [h.status] : [String(h.substatus)] 
        })
      }
      return a
    }, [])

    return dataReturn
  }
})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)