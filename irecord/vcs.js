(function ($, fns, data) {

  fns.vcTetrad = function(id, config) {

    var dataSquares = []
    var selectedTaxon
    var selectedTvk
    var selectedLevel='2km'
    var selectedVC
    var brcmap, grid
    var acceptedOnly, excludeNotAccepted
    var transOptsSel = {}
    var calcHeight

    var $div = fns.topDivConfig(config)
    $div.appendTo($('#' + id))

    // Busy indicator
    var $busy = fns.getBusy($div)

    // mapClick function
    function mapClick(gr, id, caption) {
      fns.setMapClickOutput(config, caption)
    }

    // Map
    $mapdiv = $('<div id="' + id + '-tetmon-map">').appendTo($div)
    //$mapdiv.css('border', '2px solid silver')

     // Create transOptsSel from file
    var transOptsGb = {}
    var pBoundsGb = d3.csv('libraries/brcvis/irecord/vc/bounds-gb.csv').then(function(data){
      data.forEach(function(d){
        transOptsGb['vc' + d.VCNUMBER] = {
          id: 'vc' + d.VCNUMBER,
          caption: d.VCNAME + ' (' + d.VCNUMBER + ')',
          bounds: {
            xmin: d.xmin,
            ymin: d.ymin,
            xmax: d.xmax,
            ymax: d.ymax
          }
        }
      })
    })
    var transOptsIr = {}
    var pBoundsIr = d3.csv('libraries/brcvis/irecord/vc/bounds-ir.csv').then(function(data){
      data.forEach(function(d){
        transOptsIr['vc' + d.ref] = {
          id: 'vc' + d.ref,
          caption: d.name + ' (' + d.ref + ')',
          bounds: {
            xmin: d.xmin,
            ymin: d.ymin,
            xmax: d.xmax,
            ymax: d.ymax
          }
        }
      })
    })
    Promise.all([pBoundsGb, pBoundsIr]).then(function(){

      transOptsSel = {...transOptsGb, ...transOptsIr}

      // Create tetmon map from brcatlas library
      var chartConfig = {
        selector: "#" + id + "-tetmon-map",
        legendOpts: {
          display: true,
          scale: 1,
          x: 25,
          y: 10
        },
        mapTypesSel: {
          'gen-map-data': getMapData,
        },
        mapTypesKey: 'gen-map-data',
        transOptsControl: false,
        // Need to set a boundary and grid geojson otherwise GB default is set
        // But set the transOptsKey to a different VC so that nothing is displayed.
        boundaryGjson: 'libraries/brcvis/irecord/vc/boundaries/vc1.geojson',
        gridGjson: 'libraries/brcvis/irecord/vc/grids/vc1.geojson',
        transOptsKey: 'vc100',
        transOptsSel: transOptsSel,
        expand: true,
        gridLineColour: 'grey',
        boundaryColour: 'black',
        seaFill: 'white',
        onclick: mapClick
      }
      chartConfig = {...chartConfig, ...fns.parseChartConfig(config)}
      brcmap = brcatlas.svgMap(chartConfig)
    })
    
    // Define the data access function
    function getMapData() {

      return new Promise(function (resolve, reject) {

        var colours = fns.getVcDotColourSelect(config)
        var breaks = fns.getVcDotColourBreaksSelect(config)

        dataMap = dataSquares.map(function(s) {
          var tetmon = selectedLevel === '2km' ? 'Tetrad - ' : 'Monad - '
          var ret = {
            gr: s.gr,
            id: s.gr,
            caption: tetmon + '<b>' + s.gr + '</b>  records - <b>' + s.recs + '</b>'
          }
          if (colours.length) {
            var colour
            for (var i=0; i<breaks.length; i++) {
              if (s.recs <= breaks[i]) {
                colour = colours[i]
                break
              }
            }
            if (!colour) {
              colour = colours[colours.length-1]
            }
            ret.colour = colour
          }
          return ret
        })
        resolve({
          records: dataMap,
          size: 1,
          precision: selectedLevel === '2km' ? 2000 : 1000,
          shape: fns.getDotRadioSelection(config),
          opacity: fns.getOpacitySliderValue(config)
        })
      })
    }

    // Set up div for ES idc-control and idc-customScript
    var $cs = $('<div id="' + id + '-cs-div"></div>').appendTo($('#' + id))
   
    fns.addTaxonSelectedFn(function (usedTaxonSelId, tvk, taxon, group) {
      
      if (usedTaxonSelId === config.taxonSelControl) {

        selectedTaxon = taxon
        selectedTvk = tvk

        getDataFromES (tvk, taxon)
      }
    })

    function getDataFromES (tvk, taxon) {
      
      dataSquares = []
      $busy.show()

      //selectedTaxon = taxon
      //selectedTvk = tvk

      // Update the legend straight away
      setLegendOpts()

      var vcId = Number(fns.getVcDropDownAndAction(config).vcId)

      // Set up filters in response to controls
      var filters = fns.getFiltersFromControls(config, tvk, taxon, null, {status: true})

      // Save for use elsewhere
      acceptedOnly = fns.isAcceptedOnlyChecked(config)
      excludeNotAccepted = fns.isExcludeNotAcceptedChecked(config)

      filters[0].push({
        "query_type":"term","nested":"location.higher_geography","field":"location.higher_geography.id","value": vcId
      })
      //console.log('filters', filters)

      indiciaData.esSources.push({
        size: 0,
        id: "source-" + id,
        mode: "compositeAggregation",
        uniqueField: "location.grid_square." + selectedLevel + ".centre",
        fields: [
          "location.grid_square." + selectedLevel + ".centre",
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

    indiciaFns[id]  = function (el, sourceSettings, response) {
      // Indicia ES custom callback function to create
      // the distrubution map when the query response is returned.

      // Remove any ES output classes otherwise when taxon
      // selector action buttons cause other JS code to execute
      // ES queries, but not this one, then these classes will
      // mess up the hooking up of those data sources.
      $cs.removeClass('idc-control')
      $cs.removeClass('idc-customScript')
 
      //console.log(response)
     
      // Reference system
      outRefSystem = selectedVC.vcCode.substr(0,1) === 'H' ? 'ir' : 'gb'

      // Create the tetrad/monad array 
      dataSquares = response.aggregations._rows.buckets.filter(function(s){return s.key['location-grid_square-' + selectedLevel + '-centre']}).map(function(s) {
        var precision = selectedLevel === '2km' ? 2000 : 1000
        var latlon = s.key['location-grid_square-' + selectedLevel + '-centre'].split(' ')
        
        var square = bigr.getGrFromCoords(Number(latlon[0]), Number(latlon[1]), 'wg', outRefSystem, [precision])

        return {
          gr: square['p' + precision],
          recs: s.doc_count
        }
      })

      // Could be that sometimes more than one lat/lon combo is returned for a single square from ES.
      // Create a single record for each square, summing the number of records.
      dataSquares = dataSquares.filter(function(s){return s.gr}).reduce(function(a,s) {
        var existing = a.find(function(as){return as.gr === s.gr})
        if (existing) {
          existing.recs += s.recs
        } else {
          a.push({
            gr: s.gr, 
            recs: s.recs, 
          })
        }
        return a
      }, [])

      //console.log('dataSquares', dataSquares)

      $busy.hide()

      brcmap.setProj(outRefSystem)
      brcmap.redrawMap()
    }

    // Helper functions

    // Generate download image information
    function getDownloadInfo() {
      var today = new Date()
      var dd = String(today.getDate()).padStart(2, '0')
      var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
      var yyyy = today.getFullYear()

      today = dd + '/' + mm + '/' + yyyy

      var text = 'Generated from iRecord on '
      text += today + ' (' + window.location + ').'

      acceptedOnly, excludeNotAccepted

      if (acceptedOnly) {
        text += ' Only records with verification status \'Accepted\' are included.'
      } else if (excludeNotAccepted) {
        text += ' Records with verification status \'Not Accepted\' are excluded.'
      } else {
        text += ' CAUTION - Records with verification status \'Not Accepted\' were NOT excluded from this map.'
        text += ' The map can be generated with these records excluded.'
      }

      const info = {
        text: text,
        margin: 10,
        fontSize: 10,
        img: 'libraries/brcvis/irecord/images/ceh-brc-logo.png'
      }

      return info
    } 

    // Set legend opts
    function setLegendOpts() {

      // Generate legend lines if appropriate
      var colours = fns.getVcDotColourSelect(config)
      var breaks = fns.getVcDotColourBreaksSelect(config)
      var lines = []
      if (colours.length) {
        lines = breaks.map(function(b,i){
          var text
          if (i === 0) {
            if (b === 1) {
              text = '1 rec'
            } else {
              text = '1-' + b + ' recs'
            }
          } else {
            if (b > breaks[i-1]+1) {
              text = breaks[i-1]+1 + '-' + b + ' recs'
            } else {
              text = b + ' recs'
            }
          }
          return {
            colour: colours[i],
            text: text
          }
        })
        lines.push({
          colour: colours[breaks.length],
          text: '>' + breaks[breaks.length-1] + ' recs'
        })
      }

      // Keeps the size of the text on the map the same
      // regardless of the size of the map
      var mapWidth = brcmap.getMapWidth()
      var scale = mapWidth/800

      // Calculate the position of the legend
      var position = fns.getLegendPosition(config)
      var legendX, legendY
      var breakTextLength = lines.reduce(function(a,l){return l.text.length > a ? l.text.length : a}, 0)
      if (position === 'top left' || position === 'bottom left') {
        legendX = 7
      } else {
        legendX = mapWidth - (breakTextLength * 7 + 25)
      }
      if (position === 'top left' || position === 'top right') {
        legendY = 10
      } else {
        legendY = calcHeight - 120
      }

      var title = '<b><i>' + selectedTaxon + '</i> in VC ' + selectedVC.vcName + ' (' + selectedLevel + ' atlas)</b>'
      brcmap.setMapTitle(title, 16, 7, 20)

      if (selectedTaxon) {
        var legendOpts = {
          display: true,
          scale: scale,
          x: legendX,
          y: legendY,
          data: {
            //title: selectedTaxon + ' in VC ' + selectedVC.vcName + ' (' + selectedLevel + ' atlas)',
            size: 1,
            shape: fns.getDotRadioSelection(config),
            precision: selectedLevel === '2km' ? 2000 : 1000,
            opacity: fns.getOpacitySliderValue(config),
            lines: lines
          }
        }
        brcmap.setLegendOpts(legendOpts)
      }
    }

    // React to interactive control actions
    fns.onVcDropDownAndActionClick(function() {
      // Enable taxon selector
      $('#' + config.taxonSelControl).prop('data-enabled-input-fn')(true)

      // Get selected VC
      var vc = fns.getVcDropDownAndAction(config)
      selectedVC = vc

      // Clear the map
      brcmap.clearMap()

      // Set the map transform, background, etc etc
      var fileRoot = 'libraries/brcvis/irecord/vc/'
      var vckey = 'vc' + vc.vcCode
      var backImg = fileRoot + 'backgrounds/' + vckey + '.png'
      var backWld = fileRoot + 'backgrounds/' + vckey + '.pgw'
      var boundary = fileRoot + 'boundaries/' + vckey + '.geojson'
      grid = fileRoot + 'grids/' + vckey + '.geojson'

      // Change the height of the map to keep the width constant. Even though the map is expanded
      // to fill the div, this is important to keep the thickness of boundary etc constant between
      // areas.
      var bWidth = Number(transOptsSel[vckey].bounds.xmax) - Number(transOptsSel[vckey].bounds.xmin)
      var bHeight = Number(transOptsSel[vckey].bounds.ymax) - Number(transOptsSel[vckey].bounds.ymin)
      calcHeight = 800 * bHeight / bWidth
      brcmap.setHeight(calcHeight)

      // Set transform
      brcmap.setTransform(vckey)

      // Add basemap
      brcmap.basemapImage(vckey, true, backImg, backWld)
      var display = fns.isShowVcGridChecked(config)
      if (display){
        brcmap.setGrid(grid)
      }
      brcmap.setBoundary(boundary)

      // Remap the current taxon
      if (selectedTvk) {
        if (indiciaData) {
          indiciaData.esSources = [] // eslint-disable-line no-undef
        }
        getDataFromES (selectedTvk, selectedTaxon)
        if (indiciaFns) {
          indiciaFns.initDataSources()
          indiciaFns.hookupDataSources()
          indiciaFns.populateDataSources()
        }
      }
    })
    
    fns.onDotRadioSelection(function(){
      setLegendOpts()
      brcmap.redrawMap()
    })

    fns.onLevelRadioSelection(function(){

      selectedLevel = fns.getLevelRadioSelection(config) === 'tetrad' ? '2km' : '1km'

      // Remap the current taxon
      if (selectedTvk) {
        if (indiciaData) {
          indiciaData.esSources = [] // eslint-disable-line no-undef
        }
        getDataFromES (selectedTvk, selectedTaxon)
        if (indiciaFns) {
          indiciaFns.initDataSources()
          indiciaFns.hookupDataSources()
          indiciaFns.populateDataSources()
        }
      }
    })

    fns.onDownloadClick(function(type){
      brcmap.saveMap(false, getDownloadInfo())
    })

    fns.onShowVcGridChecked(function(){
      var display = fns.isShowVcGridChecked(config)
      if (display){
        brcmap.setGrid(grid)
      } else {
        brcmap.setGrid('')
      }
    })

    fns.onOpacitySliderChange(function(){
      setLegendOpts()
      brcmap.redrawMap()
    })

    fns.onVcDotColourSelect(function(){
      setLegendOpts()
      brcmap.redrawMap()
    })

    fns.onVcDotColourBreaksSelect(function(){
      setLegendOpts()
      brcmap.redrawMap()
    })

    fns.onLegendPositionSelect(function(){
      setLegendOpts()
      brcmap.redrawMap()
    })

    // Inits
    $(document).ready(function () {
      // Disable taxon selection control until first VC is selected
      $('#' + config.taxonSelControl).prop('data-enabled-input-fn')(false)
    })
  }
})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)