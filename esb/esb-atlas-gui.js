
var esbGlobals = {
  dataRoot: null,
  dotShape: 'circle',
  vcRef: null,
  vcOutside: false,
  displayedMapTech: 'static'
};

(function ($) {

  esbGlobals.dataRoot = getConfigOpt('datapath')

  console.log(esbGlobals)

  var slippyMap, staticMap, currentTaxon, previousVc
  var vcs = {}
  var displayedStaticMap = 'hectad'
  var displayedSlippyMap = 'hectad'
  var slippyLegendOpts = {
    display: true,
    scale: 1,
    x: 10,
    y: 0,
    data: null
  }

  $(document).ready(function () {

    // Initialise main content
    var $content = $('#brc-vis-content').append('<div id="main-atlas-content"></div>')

    var $d = $('<div>').appendTo($content)
    var $r = $('<div class="w3-row-padding">').appendTo($d)
    var $left = $('<div class="w3-col m7">').appendTo($r)
    var $right = $('<div class="w3-col m5">').appendTo($r)
    $left.append('<div id="esbMapDiv" width="100%"></div>')
    $right.append('<div id="esbMapControls"></div>')

    createMaps("#esbMapDiv")
    createMapControls("#esbMapControls")
  })

  function getConfigOpt(opt, defaultVal) {
    return drupalSettings.brc_vis.config[opt] ? drupalSettings.brc_vis.config[opt] : defaultVal
  }

  function createMaps(selector) {

    // Modify standard UK opts to remove any without CI
    var transOptsSel =  JSON.parse(JSON.stringify(brcatlas.namedTransOpts))
    delete transOptsSel.BI3 // Remove the options without CI

    // Data access 
    var mapTypesSel = {
      'hectad': esbDataAccess.hectad,
      'quadrant': esbDataAccess.quadrant,
      'tetrad': esbDataAccess.tetrad,
      'monad': esbDataAccess.monad,
    }

    // Basemaps
    var basemapConfigs = [
      {
        name: 'Open Street Map',
        type: 'tileLayer',
        selected: true,
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        opts: {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      },
      {
        name: 'Stamen Black & White',
        type: 'tileLayer',
        selected: false,
        url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}',
        opts: {
          attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          subdomains: 'abcd',
          minZoom: 0,
          maxZoom: 20,
          ext: 'png'
        }
      },
      {
        name: 'Open Topo Map',
        type: 'tileLayer',
        selected: false,
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        opts: {
          maxZoom: 17,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        }
      },
      {
        name: 'NLS Historic',
        type: 'wms',
        selected: false,
        url: 'https://nls-{s}.tileserver.com/nls/{z}/{x}/{y}.jpg', 
        opts: {
          attribution: '<a href="https://maps.nls.uk/projects/api//">National Library of Scotland Historic Maps</a>',
          bounds: [[49.6, -12], [61.7, 3]],
          minZoom: 1,
          maxZoom: 18,
          subdomains: '0123'
        }
      },
    ]

    // Map height
    const height = 650
    // Create the static map
    staticMap = brcatlas.svgMap({
      selector: selector,
      mapid: "staticAtlasMain",
      captionId: "dotCaption",
      height: height,
      expand: true,
      legend: true,
      legendScale: 1,
      legendOpts: {
        display: true,
        scale: 1,
        x: 10,
        y: 5,
        data: null
      },
      transOptsKey: 'BI2',
      transOptsSel: transOptsSel,
      mapTypesKey: 'hectad',
      mapTypesSel: mapTypesSel,
      mapTypesControl: false,
      transOptsControl: false,
      gridLineColour: 'grey',
      boundaryColour: 'black',
      boundaryFill: '#EAEBE0',
      seaFill: '#AAD3DF',
      insetColour: 'grey'
    })

    // Create the slippy map
    slippyMap = brcatlas.leafletMap({
      selector: selector,
      mapid: 'slippyAtlasMain',
      height: height,
      width: staticMap.getMapWidth(),
      captionId: "dotCaption",
      mapTypesKey: 'hectad',
      mapTypesSel: mapTypesSel,
      legend: true,
      legendScale: 1,
      legendOpts: slippyLegendOpts,
      basemapConfigs: basemapConfigs,
    })
    $('#slippyAtlasMain').hide()
  }

  function createMapControls(selector) {
    mapInterfaceToggle(selector)
    taxonDropdown(selector)
    dotShapeControl(selector)
    staticControls(selector)
    slippyControls(selector)
    atlasInfo(selector)
  }

  function atlasInfo (selector) {
    var $div = $('<div id="esb-atlas-info" class="esb-control">').appendTo(selector)
    $div.html(`
      <br/>
      <hr/>
      <p>The Earthworm Atlas uses the following open source libraries from
      the Biological Recorders Centre to implement the mapping:</p>
      <ul>
        <li><a href="https://github.com/BiologicalRecordsCentre/brc-atlas">The BRC Atlas libray</a></li>
        <li><a href="https://github.com/BiologicalRecordsCentre/brc-atlas-bigr">The BRC British Isles Grid Reference libray</a></li>
      </ul>
      <p>Some features of the atlas, e.g. image download, are browser sensitive. If you are
      having trouble, try with Google Chrome - all features have been tested on Chrome.</p>
    `)
  }

  function staticControls(selector) {
    var $div = $('<div id="esb-atlas-static-controls">').appendTo(selector)
    insetControl($div)
    downloadControl($div)
  }

  function slippyControls(selector) {
    var $div = $('<div id="esb-atlas-slippy-controls" style="display: none">').appendTo(selector)
    dotSize($div)
    vcDropdown($div)
    vcOutsideCheckbox($div)
  }

  function dotSize($parent) {
    var $div = $('<div id="esb-atlas-dot-size" class="esb-control">').appendTo($parent)
    
    var $bgrp = $('<div class="btn-group" data-toggle="buttons">').appendTo($div)

    var $hectadLabel = $('<label class="btn btn-primary active">').appendTo($bgrp)
    var $hectadButton = $('<input type="radio" name="mapType" value="hectad" checked>').appendTo($hectadLabel)
    $hectadLabel.append("10 km")

    var $quadrantLabel = $('<label class="btn btn-primary">').appendTo($bgrp)
    var $quadrantButton = $('<input type="radio" name="mapType" value="quadrant">').appendTo($quadrantLabel)
    $quadrantLabel.append("5 km")

    var $tetradLabel = $('<label class="btn btn-primary">').appendTo($bgrp)
    var $tetradButton = $('<input type="radio" name="mapType" value="tetrad">').appendTo($tetradLabel)
    $tetradLabel.append("2 km")

    var $monadLabel = $('<label class="btn btn-primary">').appendTo($bgrp)
    var $monadButton = $('<input type="radio" name="mapType" value="monad">').appendTo($monadLabel)
    $monadLabel.append("1 km")

    $('input[type=radio][name="mapType"]').change(function() {
      displayedSlippyMap = $(this).val()
      changeMap()

      // Bootstrap should take care of below, but doesn't on ESB live site so we do it
      $('input[type=radio][name="mapType"]').parent().removeClass("active")
      $(this).parent().addClass("active")
    })
  }

  function vcDropdown($parent) {
    var $div = $('<div id="esb-atlas-vc-dropdown" class="esb-control">').appendTo($parent)
    var $sel = $('<select>').appendTo($div)

    var $opt = $('<option>')
    $opt.attr('value', '')
    $opt.html(`No Vice County`).appendTo($sel)

    d3.csv(`${esbGlobals.dataRoot}/vcs.csv`).then(function(data) {

      data.forEach(function(d) {
        vcs[d.ref] = {
          name: d.name,
          lat: d.lat,
          lon: d.lon
        }
        var $opt = $('<option>')
        $opt.attr('value', d.ref)
        $opt.html(`${d.ref} ${d.name}`).appendTo($sel)
      })

      $sel.attr('data-size', '10')
      $sel.attr('data-live-search', 'true')
      $sel.attr('data-header', 'Filter VCs by name/number')
      $sel.attr('title', 'Select a vice country')
      $sel.attr('data-width', '100%')
      $sel.selectpicker()
      $sel.on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
        if (esbGlobals.vcRef) {
          previousVc = esbGlobals.vcRef
        }
        esbGlobals.vcRef = $(this).val()
        if (esbGlobals.vcRef){
          slippyMap.lmap.setView(new L.LatLng(vcs[esbGlobals.vcRef].lat, vcs[esbGlobals.vcRef].lon))
        }
        changeMap()
      })
    }).catch(function(e){
      console.log('Error reading VC CSV')
    })
  }

  function vcOutsideCheckbox($parent) {
    var $div = $('<div id="esb-atlas-vc-outside" class="esb-control">').appendTo($parent)
    var $label = $('<label class="btn btn-primary">').appendTo($div)
    var $cb = $('<input type="checkbox" style="margin-right:0.5em">').appendTo($label)
    $label.append("Show records outside of VC")

    $cb.change(function() {
      esbGlobals.vcOutside = $cb.prop("checked")
      changeMap()
    })
  }

  function downloadControl(selector) {

    var downloadType = 'png'

    var $ctrlgrp = $('<div>').appendTo(selector)

    var $downloadButton = $('<button type="button" class="btn btn-primary esb-control" >').appendTo($ctrlgrp)
    $downloadButton.html('Download image')
    $downloadButton.css('margin-right', '0.5em')

    var $bgrp = $('<div id="esb-atlas-download-type" class="btn-group esb-control" data-toggle="buttons">').appendTo($ctrlgrp)

    var $pngLabel = $('<label class="btn btn-primary active">').appendTo($bgrp)
    var $pngButton = $('<input type="radio" name="downloadType" value="png" checked>').appendTo($pngLabel)
    $pngLabel.append("PNG")

    var $svgLabel = $('<label class="btn btn-primary">').appendTo($bgrp)
    var $svgButton = $('<input type="radio" name="downloadType" value="svg">').appendTo($svgLabel)
    $svgLabel.append("SVG")


    $('input[type=radio][name="downloadType"]').change(function() {
      downloadType = $(this).val()
      // Bootstrap should take care of below, but doesn't on ESB live site so we do it
      $('input[type=radio][name="downloadType"]').parent().removeClass("active")
      $(this).parent().addClass("active")
    })

    $downloadButton.click(function() {
      console.log('download', downloadType)
      staticMap.saveMap(downloadType === 'svg')
    })
  }

  function insetControl(selector) {
    var $bgrp = $('<div id="esb-atlas-insets" class="btn-group esb-control" data-toggle="buttons">').appendTo(selector)

    var $noneLabel = $('<label class="btn btn-primary">').appendTo($bgrp)
    var $noneButton = $('<input type="radio" name="insetType" value="BI1">').appendTo($noneLabel)
    $noneLabel.append("No insets")

    var $ciLabel = $('<label class="btn btn-primary active">').appendTo($bgrp)
    var $ciButton = $('<input type="radio" name="insetType" value="BI2" checked>').appendTo($ciLabel)
    $ciLabel.append("Inset CI")

    var $ciniLabel = $('<label class="btn btn-primary">').appendTo($bgrp)
    var $ciniButton = $('<input type="radio" name="insetType" value="BI4">').appendTo($ciniLabel)
    $ciniLabel.append("Inset CI & NI")

    $('input[type=radio][name="insetType"]').change(function() {
      staticMap.setTransform($(this).val())
      changeMap()

      // Bootstrap should take care of below, but doesn't on ESB live site so we do it
      $('input[type=radio][name="insetType"]').parent().removeClass("active")
      $(this).parent().addClass("active")
    })
  }

  function dotShapeControl(selector) {
    var $bgrp = $('<div id="esb-atlas-dot-shape" class="btn-group esb-control" data-toggle="buttons">').appendTo(selector)

    var $circleLabel = $('<label class="btn btn-primary active">').appendTo($bgrp)
    var $circleButton = $('<input type="radio" name="dotShape" value="circle" checked>').appendTo($circleLabel)
    $circleLabel.append("Circles")

    var $squareLabel = $('<label class="btn btn-primary">').appendTo($bgrp)
    var $squareButton = $('<input type="radio" name="dotShape" value="square">').appendTo($squareLabel)
    $squareLabel.append("Squares")

    $('input[type=radio][name="dotShape"]').change(function() {
      esbGlobals.dotShape = $(this).val()
      changeMap()
      // Bootstrap should take care of below, but doesn't on ESB live site so we do it
      $('input[type=radio][name="dotShape"]').parent().removeClass("active")
      $(this).parent().addClass("active")
    })
  }

  function mapInterfaceToggle(selector) {
    var $bgrp = $('<div class="btn-group" data-toggle="buttons">').appendTo(selector)

    var $staticLabel = $('<label class="btn btn-primary active">').appendTo($bgrp)
    var $staticButton = $('<input type="radio" name="mapTech" value="static" checked>').appendTo($staticLabel)
    $staticLabel.append("Overview")

    var $slippyLabel = $('<label class="btn btn-primary">').appendTo($bgrp)
    var $slippyButton = $('<input type="radio" name="mapTech" value="slippy">').appendTo($slippyLabel)
    $slippyLabel.append("Explore")

    $('input[type=radio][name="mapTech"]').change(function() {
      esbGlobals.displayedMapTech = $(this).val()

      if (esbGlobals.displayedMapTech === "static") {
        $('#slippyAtlasMain').hide()
        $('#staticAtlasMain').show()
        $('#esb-atlas-slippy-controls').hide()
        $('#esb-atlas-static-controls').show()
        
      } else {
        var $svg = $('#staticAtlasMain svg')
        var w = $svg.width()
        var h = $svg.height()
        $('#staticAtlasMain').hide()
        $('#slippyAtlasMain').show()
        slippyMap.setSize(w, h)
        $('#esb-atlas-static-controls').hide()
        $('#esb-atlas-slippy-controls').show()
      }
      changeMap()

      // Bootstrap should take care of below, but doesn't on ESB live site so we do it
      $('input[type=radio][name="mapTech"]').parent().removeClass("active")
      $(this).parent().addClass("active")
    })
  }

  function taxonDropdown(selector) {

    var $div = $('<div id="taxon-selector-div" class="esb-control">').appendTo($(selector))
    var $sel = $('<select>').appendTo($div)
    d3.csv(`${esbGlobals.dataRoot}/taxa.csv`).then(function(data) {
      data.forEach(function(d) {
        var name = d.taxon
        var $opt = $('<option>')
        $opt.attr('value', name)
        $opt.html(name).appendTo($sel)
      })

      $sel.attr('data-size', '10')
      $sel.attr('data-live-search', 'true')
      $sel.attr('data-header', 'Filter by typing a name')
      $sel.attr('title', 'Select an earthworm species')
      $sel.attr('data-width', '100%')
      $sel.selectpicker()
      $sel.on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
        currentTaxon = $(this).val()
        changeMap()
      })
    }).catch(function(e){
      console.log('Error reading taxon CSV')
    })
  }

  function changeMap() {

    var displayedMap, displayedMapType
    if (esbGlobals.displayedMapTech === 'static') {
      displayedMap = staticMap
      displayedMapType = displayedStaticMap
    } else {
      displayedMap = slippyMap
      displayedMapType = displayedSlippyMap 
      if (esbGlobals.vcRef) {
        slippyMap.addGeojsonLayer({
          name: vcs[esbGlobals.vcRef].name,
          url: `${esbGlobals.dataRoot}/vcs/vc${esbGlobals.vcRef}.geojson`,
          style: {
            "color": "blue",
            "weight": 3,
            "opacity": 0.65,
            "fill": false
          }
        })
      }
      if (previousVc) {
        slippyMap.removeGeojsonLayer(vcs[previousVc].name)
        previousVc = ""
      }
    }
    displayedMap.setMapType(displayedMapType)
    if (currentTaxon) {
      displayedMap.setIdentfier(currentTaxon) 
      displayedMap.redrawMap()
    }
  }
})(jQuery)