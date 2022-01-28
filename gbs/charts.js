(function ($, fns) {

  fns.topN = function(id, config) {

    // Set up and empty donut chart
    var loggedInUser = getConfigOpt(config, 'loggedInUser', false)

    var $div = $('<div style="margin: 0 10px 10px 10px"></div>').appendTo($('#' + id))
    //$('<h3 style="margin-top: 0">Top ' + topN + ' butterflies recorded</h3>').appendTo($div)
    $('<div id="' + id + '-chart-div" style="max-width: 500px"></div>').appendTo($div)

    // Get the data from ES
    var $cs = $('<div id="' + id + '-cs-div"></div>').appendTo($('#' + id))
    $cs.addClass('idc-output')
    $cs.addClass('idc-output-customScript')

    var filters = [
      {"query_type": "match_phrase","field": "metadata.survey.id","value": 431},
      {"query_type": "match_phrase","field": "taxon.group","value": "insect - butterfly"}
    ]
    if (loggedInUser && drupalSettings.brc_vis.indiciaUserId) {
      filters.push({"query_type": "match_phrase","field": "metadata.created_by_id","value": drupalSettings.brc_vis.indiciaUserId})
    }

    if (!indiciaData.esSources) {
      indiciaData.esSources = []
    }
    indiciaData.esSources.push({
      size: 0,
      id: "source-" + id,
      mode: "compositeAggregation",
      uniqueField: "taxon.accepted_name.keyword",
      fields: [
        //"taxon.vernacular_name.keyword",
        "taxon.accepted_name.keyword"
      ],
      filterBoolClauses: {
        "must": filters
      },
      proxyCacheTimeout: drupalSettings.brc_vis.indiciaUserId ? 60 : 7200
    })

    var source = {}
    source["source-" + id] = ''
    $('#' + id + '-cs-div').idcCustomScript({
      id: 'custom-script-' + id,
      source: source,
      functionName: id,
    })

    // Callback functions for when data loaded
    var topN = Number(getConfigOpt(config, 'topN', 10))

    indiciaFns[id] = function (el, sourceSettings, response) {
      console.log('ES callback ' + id + ' called')

      var data = response.aggregations._rows.buckets.map(function(r) {
        return {
          number: r.doc_count,
          //name: r.key['taxon-vernacular_name-keyword'] ? r.key['taxon-vernacular_name-keyword'] : 'White, unknown'
          name: getVernacular(r.key['taxon-accepted_name-keyword']) 
        }
      })
      .sort(function(a, b) {return (b.number > a.number) ? 1 : -1})
      .filter(function(d,i) {return i < topN})
      
      var radius = Number(getConfigOpt(config, 'radius', 200))
      var innerRadius = Number(getConfigOpt(config, 'innerRadius', 100))
      var legendWidth = Number(getConfigOpt(config, 'legendWidth', 150))
      var titleFontSize = Number(getConfigOpt(config, 'titleFontSize', '16'))
   
      var pieConfig = {
        selector: '#' + id + '-chart-div',
        innerRadius: innerRadius,
        radius: radius,
        legendWidth: legendWidth,
        titleFontSize: titleFontSize,
        data: data, 
        label: 'value',
        expand: true
      }
      brccharts.pie(pieConfig)
    }
  }

  fns.countsPerMonth = function(id, config) {

    var loggedInUser = getConfigOpt(config, 'loggedInUser', false)

    var $div = $('<div style="margin: 0 10px 10px 10px"></div>').appendTo($('#' + id))
    //$('<h3 style="margin-top: 0">Counts per month</h3>').appendTo($div)
    $('<div id="' + id + '-chart-div" style="max-width: 500px"></div>').appendTo($div)

    // Get the data from ES
    var $cs = $('<div id="' + id + '-cs-div"></div>').appendTo($('#' + id))
    $cs.addClass('idc-output')
    $cs.addClass('idc-output-customScript')


    var filters = [
      {"query_type": "match_phrase","field": "metadata.survey.id","value": 431},
      {"query_type": "match_phrase","field": "taxon.group","value": "insect - butterfly"}
    ]
    if (loggedInUser && drupalSettings.brc_vis.indiciaUserId) {
      filters.push({"query_type": "match_phrase","field": "metadata.created_by_id","value": drupalSettings.brc_vis.indiciaUserId})
    }

    if (!indiciaData.esSources) {
      indiciaData.esSources = []
    }
    indiciaData.esSources.push({
      size: 0,
      id: "source-" + id,
      mode: "compositeAggregation",
      uniqueField: "event.month",
      fields: [
        "event.month",
      ],
      filterBoolClauses: {
        "must": filters
      },
      proxyCacheTimeout: drupalSettings.brc_vis.indiciaUserId ? 60 : 7200
    })

    var source = {}
    source["source-" + id] = ''
    $('#' + id + '-cs-div').idcCustomScript({
      id: 'custom-script-' + id,
      source: source,
      functionName: id,
    })

    // Callback functions for when data loaded
    indiciaFns[id] = function (el, sourceSettings, response) {
      console.log('ES callback ' + id + ' called')
      var data = response.aggregations._rows.buckets.map(function(r) {
        return {
          number: r.doc_count,
          month: Number(r.key['event-month']),
          taxon: 'alltaxa'
        }
      })

      var phenConfig = {
        selector: '#' + id + '-chart-div',
        data: data, 
        perRow: 1,
        expand: true,
        taxa: ['alltaxa'],
        metrics:  [{ prop: 'number', label: 'total', colour: 'green' }],
        width: 500,
        height: 250,
        axisLeftLabel: 'Counts per month',
        axisLabelFontSize: 12,
        margin: {left: 50, bottom: 15, top: 10},
        showLegend: false,
        showTaxonLabel: false,
        axisLeft: 'tick',
        axisBottom: 'tick',
        style: 'bars'
      }
      brccharts.phen1(phenConfig)
    }
  }

  fns.topTenArea = function(id, config) {

    var loggedInUser = getConfigOpt(config, 'loggedInUser', false)

    var $div = $('<div style="margin: 0 10px 10px 10px"></div>').appendTo($('#' + id))
    //$('<h3 style="margin-top: 0">Top 10 species through the year</h3>').appendTo($div)
    $('<div id="' + id + '-chart-div" style="max-width: 500px"></div>').appendTo($div)

    // Get the data from ES
    var $cs = $('<div id="' + id + '-cs-div"></div>').appendTo($('#' + id))
    $cs.addClass('idc-output')
    $cs.addClass('idc-output-customScript')

    var filters = [
      {"query_type": "match_phrase","field": "metadata.survey.id","value": 431},
      {"query_type": "match_phrase","field": "taxon.group","value": "insect - butterfly"}
    ]
    if (loggedInUser && drupalSettings.brc_vis.indiciaUserId) {
      filters.push({"query_type": "match_phrase","field": "metadata.created_by_id","value": drupalSettings.brc_vis.indiciaUserId})
    }

    if (!indiciaData.esSources) {
      indiciaData.esSources = []
    }
    indiciaData.esSources.push({
      size: 0,
      id: "source-" + id,
      mode: "compositeAggregation",
      uniqueField: "taxon.accepted_name.keyword",
      fields: [
        "event.month",
        //"taxon.vernacular_name.keyword",
        "taxon.accepted_name.keyword"
      ],
      filterBoolClauses: {
        "must": filters
      },
      proxyCacheTimeout: drupalSettings.brc_vis.indiciaUserId ? 60 : 7200
    })

    var source = {}
    source["source-" + id] = ''
    $('#' + id + '-cs-div').idcCustomScript({
      id: 'custom-script-' + id,
      source: source,
      functionName: id,
    })

    // Callback functions for when data loaded
    indiciaFns[id] = function (el, sourceSettings, response) {

      console.log('ES callback ' + id + ' called')

      var data = response.aggregations._rows.buckets.map(function(r) {
        return {
          number: r.doc_count,
          month: Number(r.key['event-month']),
          //taxon: r.key['taxon-vernacular_name-keyword'] ? r.key['taxon-vernacular_name-keyword'] : 'White, unknown'
          taxon: getVernacular(r.key['taxon-accepted_name-keyword'])
        }
      })
      // Get totals for each taxon
      var taxaTotals = {}
      data.forEach(function(d) {
        if (taxaTotals.hasOwnProperty(d.taxon)) {
          taxaTotals[d.taxon] += d.number
        } else {
          taxaTotals[d.taxon] = d.number
        }
      })
      // Create an array of objects representing each taxon
      var taxaArray = Object.keys(taxaTotals).map(function(t){
        return {
          taxon: t,
          total: taxaTotals[t]
        }
      })
      // Sort the array and get the top ten
      var topTenTaxa = taxaArray.sort(function(a,b){
        return a.total > b.total ? -1 : 1
      }).filter(function(t,i){ return i < 10 }).map(function(t){return t.taxon})

      // Set up data array required by the chart- item for each month and
      // a property for each top-ten taxon.
      var chartData = []
      for (var i=1; i<=12; i++) {
        var d = {taxon: 'dummy', month: i}
        topTenTaxa.forEach(function(t){
          d[t] = 0
        })
        chartData.push(d)
      }

      // Go through the data returned from the ES query, remove any for taxa not in
      // top ten and then update the chartData array.
      data.filter(function(d){return topTenTaxa.indexOf(d.taxon) > -1}).forEach(function(d) {
        chartData[d.month-1][d.taxon]+=d.number
      })
     
      // Define the metrics. The data structures for the phenology charts were designed on the principle
      // that separate taxa would each be displayed on a different chart, but more than one metric can be
      // displayed on a single chart for a taxon. Here we are displaying several taxa on a single chart. We 
      // Can do that by specifying a 'dummy' taxon and using the taxa to create separate metrics.
      var colours = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']
      var metrics = topTenTaxa.map(function(t,i){
        return {
          prop: t,
          label: t,
          colour: colours[i]
        }
      })
 
      var phenConfig = {
        selector: '#' + id + '-chart-div',
        data: chartData, 
        perRow: 1,
        expand: true,
        taxa: ['dummy'],
        metrics: metrics,
        width: 500,
        height: 250,
        axisLeftLabel: 'Counts per month',
        axisLabelFontSize: 12,
        legendFontSize: 12,
        margin: {left: 50, bottom: 15, top: 10},
        showTaxonLabel: false,
        axisLeft: 'tick',
        axisBottom: 'tick',
        style: 'areas',
        stacked: true
      }
      brccharts.phen1(phenConfig)
    }
  }

  fns.hectadOverview = function(id, config) {

    var $div = $('<div></div>').appendTo($('#' + id))

    // Controls
    var $controls = $('<div class="col-md-4"></div>').appendTo($div)
    $('<h4>Filters</h4>').appendTo($controls)

    // Taxon select control
    var $row1 = $('<div class="form-group input-group"></div>').appendTo($controls)
    $('<span class="input-group-addon">Species</span>').appendTo($row1)
    var $selTaxon = $('<select class="form-control"></select>').appendTo($row1)
    $('<option value="">All</option>').appendTo($selTaxon)
    taxa.forEach(function(t){
      $('<option value="' + t.preferred_taxon + '">' + t.default_common_name + '</option>').appendTo($selTaxon)
    })
    $selTaxon.attr('title', 'Filter by species')
    $selTaxon.click(selectionChanged)

    // Year select control
    var $row2 = $('<div class="row"></div>').appendTo($controls)
    var $row2col1 = $('<div class="col-md-6"></div>').appendTo($row2)
    var $row2col2 = $('<div class="col-md-6"></div>').appendTo($row2)

    var $row2col1Grp = $('<div class="input-group"></div>').appendTo($row2col1)
    var $row2col2Grp = $('<div class="input-group"></div>').appendTo($row2col2)

    $('<span class="input-group-addon">From</span>').appendTo($row2col1Grp)
    var $selStartYear = $('<select class="form-group form-control"></select>').appendTo($row2col1Grp)
    for (var y = Number(new Date().getFullYear()); y >= 1970; y--) {
      var selected = y === 1970 ? 'selected' : ''
      $('<option value="' + y + '" ' + selected + ' >' + y + '</option>').appendTo($selStartYear)
    }
    $selStartYear.click(selectionChanged)

    $('<span class="input-group-addon">To</span>').appendTo($row2col2Grp)
    var $selEndYear = $('<select class="form-group form-control"></select>').appendTo($row2col2Grp)
    for (var y = Number(new Date().getFullYear()); y >= 1970; y--) {
      $('<option value="' + y + '">' + y + '</option>').appendTo($selEndYear)
    }
    $selEndYear.click(selectionChanged)

    //$selStartYear.prop('disabled', true)
    //$selEndYear.prop('disabled', true)
    
    // Clear filter button
    var $row3 = $('<div class="form-group" style="margin-top: 1em"></div>').appendTo($controls)
    var $clearFilters = $('<button class="form-control btn btn-default">Reset all filters</select>').appendTo($row3)
    $clearFilters.click(function(){
      $selTaxon.val('')
      $selStartYear.val(1970)
      $selEndYear.val(Number(new Date().getFullYear()))
      selectionChanged()
    })

    // Info
    $('<hr/>').appendTo($controls)
    $('<h4>Stats</h4>').appendTo($controls)
    $('<div>Number of butterflies: <b><span id="total_butterfly_count"></span></b></div>').appendTo($controls)
    
    $('<div>Number of 10 km squares: <b><span id="total_hectad_count"></span></b></div>').appendTo($controls)
   
    // Map
    $('<div id="' + id + '-chart-div" style="max-width: 500px" class="col-md-8"></div>').appendTo($div)
    var brcmap = brcatlas.svgMap({
      selector: '#' + id + '-chart-div',
      legendOpts: {display: true,
        scale: 0.8,
        x: 10,
        y: 10
      },
      //onclick: mapClick,
      transOptsControl: false,
      mapTypesKey: 'hectad',
      mapTypesSel: {
        'hectad': getHectads,
        //'hectad-colour': getHectadsColour
      },
      transOptsKey: 'BI4',
      expand: true
    })

    var hectadData=[]

    // Get the data from ES
    var $cs = $('<div id="' + id + '-cs-div"></div>').appendTo($('#' + id))
    $cs.addClass('idc-output')
    $cs.addClass('idc-output-customScript')

    if (!indiciaData.esSources) {
      indiciaData.esSources = []
    }

    esQuery()

    function esQuery() {

      var taxon = $selTaxon.val()
      var startYear = $selStartYear.val()
      var endYear = $selEndYear.val()

      console.log('start', startYear, 'end', endYear)

      var filters = [
        {"query_type": "match_phrase","field": "metadata.survey.id","value": 431},
        {"query_type": "match_phrase","field": "taxon.group","value": "insect - butterfly"},
        {"query_type": "query_string","field": "event.year","value": "[" + startYear + " TO " + endYear + "]"}
      ]
      if (taxon) {
        filters.push({"query_type": "match_phrase","field": "taxon.accepted_name","value": taxon})
      }

      indiciaData.esSources.push({
        id: "source-" + id,
        mode: "compositeAggregation",
        uniqueField: "location.grid_square.10km.centre",
        fields: [
          "location.grid_square.10km.centre"
        ],
        filterBoolClauses: {
          "must": filters
        },
        proxyCacheTimeout: drupalSettings.brc_vis.indiciaUserId ? 60 : 7200
      })

      var source = {}
      source["source-" + id] = ''
      $('#' + id + '-cs-div').idcCustomScript({
        id: 'custom-script-' + id,
        source: source,
        functionName: id,
      })
    }

    // Hectad distribution map
    indiciaFns[id]  = function (el, sourceSettings, response) {

      console.log('ES callback ' + id + ' called')
        
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

      $('#total_hectad_count').text(hectadData.length)
      $('#total_butterfly_count').text(hectadData.reduce(function(a,h){return a + h.recs}, 0))
      
      // busy.map = false
      // setBusy()
    }

    function selectionChanged() {
      indiciaData.esSources = []
      esQuery()
      indiciaFns.initDataSources()
      indiciaFns.hookupDataSources()
      indiciaFns.populateDataSources()
    }

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
  }

  function getConfigOpt(config, opt, defaultVal) {
    return config[opt] ? config[opt] : defaultVal
  }

  function getVernacular(scientific) {
    var match = taxa.find(function(t){return scientific === t.preferred_taxon})
    if (match) {
      return match.default_common_name
    } else {
      return 'unlisted'
    }
  }

  var taxa = [
    {"preferred_taxon":"Vanessa atalanta","default_common_name":"Red Admiral"},
    {"preferred_taxon":"Aglais io","default_common_name":"Peacock"},
    {"preferred_taxon":"Aglais urticae","default_common_name":"Small Tortoiseshell"},
    {"preferred_taxon":"Vanessa cardui","default_common_name":"Painted Lady"},
    {"preferred_taxon":"Polygonia c-album","default_common_name":"Comma"},
    {"preferred_taxon":"Pieris brassicae","default_common_name":"Large White"},
    {"preferred_taxon":"Pieris rapae","default_common_name":"Small White"},
    {"preferred_taxon":"Pieris napi","default_common_name":"Green-veined White"},
    {"preferred_taxon":"Anthocharis cardamines","default_common_name":"Orange-tip"},
    {"preferred_taxon":"Pieris","default_common_name":"White, unknown"},
    {"preferred_taxon":"Gonepteryx rhamni","default_common_name":"Brimstone"},
    {"preferred_taxon":"Melanargia galathea","default_common_name":"Marbled White"},
    {"preferred_taxon":"Pararge aegeria","default_common_name":"Speckled Wood"},
    {"preferred_taxon":"Maniola jurtina","default_common_name":"Meadow Brown"},
    {"preferred_taxon":"Pyronia tithonus","default_common_name":"Gatekeeper"},
    {"preferred_taxon":"Aphantopus hyperantus","default_common_name":"Ringlet"},
    {"preferred_taxon":"Lasiommata megera","default_common_name":"Wall"},
    {"preferred_taxon":"Polyommatus icarus","default_common_name":"Common Blue"},
    {"preferred_taxon":"Celastrina argiolus","default_common_name":"Holly Blue"},
    {"preferred_taxon":"Lycaena phlaeas","default_common_name":"Small Copper"},
    {"preferred_taxon":"Ochlodes sylvanus","default_common_name":"Large Skipper"},
    {"preferred_taxon":"Thymelicus sylvestris","default_common_name":"Small Skipper"},
    {"preferred_taxon":"Thymelicus lineola","default_common_name":"Essex Skipper"},
    {"preferred_taxon":"Polyommatus bellargus","default_common_name":"Adonis Blue"},
    {"preferred_taxon":"Satyrium pruni","default_common_name":"Black Hairstreak"},
    {"preferred_taxon":"Aricia agestis","default_common_name":"Brown Argus"},
    {"preferred_taxon":"Thecla betulae","default_common_name":"Brown Hairstreak"},
    {"preferred_taxon":"Polyommatus coridon","default_common_name":"Chalk Hill Blue"},
    {"preferred_taxon":"Carterocephalus palaemon","default_common_name":"Chequered Skipper"},
    {"preferred_taxon":"Colias croceus","default_common_name":"Clouded Yellow"},
    {"preferred_taxon":"Speyeria aglaja","default_common_name":"Dark Green Fritillary"},
    {"preferred_taxon":"Erynnis tages","default_common_name":"Dingy Skipper"},
    {"preferred_taxon":"Hamearis lucina","default_common_name":"Duke of Burgundy"},
    {"preferred_taxon":"Melitaea cinxia","default_common_name":"Glanville Fritillary"},
    {"preferred_taxon":"Hipparchia semele","default_common_name":"Grayling"},
    {"preferred_taxon":"Callophrys rubi","default_common_name":"Green Hairstreak"},
    {"preferred_taxon":"Pyrgus malvae","default_common_name":"Grizzled Skipper"},
    {"preferred_taxon":"Argynnis adippe","default_common_name":"High Brown Fritillary"},
    {"preferred_taxon":"Coenonympha tullia","default_common_name":"Large Heath"},
    {"preferred_taxon":"Melitaea athalia","default_common_name":"Heath Fritillary"},
    {"preferred_taxon":"Maculinea arion","default_common_name":"Large Blue"},
    {"preferred_taxon":"Thymelicus acteon","default_common_name":"Lulworth Skipper"},
    {"preferred_taxon":"Euphydryas aurinia","default_common_name":"Marsh Fritillary"},
    {"preferred_taxon":"Aricia artaxerxes","default_common_name":"Northern Brown Argus"},
    {"preferred_taxon":"Boloria euphrosyne","default_common_name":"Pearl-bordered Fritillary"},
    {"preferred_taxon":"Apatura iris","default_common_name":"Purple Emperor"},
    {"preferred_taxon":"Favonius quercus","default_common_name":"Purple Hairstreak"},
    {"preferred_taxon":"Erebia aethiops","default_common_name":"Scotch Argus"},
    {"preferred_taxon":"Hesperia comma","default_common_name":"Silver-spotted Skipper"},
    {"preferred_taxon":"Argynnis paphia","default_common_name":"Silver-washed Fritillary"},
    {"preferred_taxon":"Cupido minimus","default_common_name":"Small Blue"},
    {"preferred_taxon":"Coenonympha pamphilus","default_common_name":"Small Heath"},
    {"preferred_taxon":"Erebia epiphron","default_common_name":"Small Mountain Ringlet"},
    {"preferred_taxon":"Boloria selene","default_common_name":"Small Pearl-bordered Fritillary"},
    {"preferred_taxon":"Plebejus argus","default_common_name":"Silver-studded Blue"},
    {"preferred_taxon":"Satyrium w-album","default_common_name":"White-letter Hairstreak"},
    {"preferred_taxon":"Leptidea juvernica","default_common_name":"Cryptic Wood White"},
    {"preferred_taxon":"Limenitis camilla","default_common_name":"White Admiral"},
    {"preferred_taxon":"Leptidea sinapis","default_common_name":"Wood White"}]

})(jQuery, drupalSettings.brc_vis.fns)