(function ($, fns, data) {

  fns.topFiveButterflies = function(id, config) {

    //console.log('topFiveButterflies called with id', id)

    var $div = $('<div></div>').appendTo($('#' + id))

    // Create hectad map from brcatlas library
    $('<div id="' + id + '-donut">').appendTo($div)

    var donut = brccharts.pie({
      selector: '#' + id + '-donut',
      innerRadius: 35,
      radius: 70,
      title: 'Butterfly numbers test',
      titleFontSize: 14,
      data: [],
      expand: true,
      legendSwatchSize: 15,
      legendWidth: 125,
      legendSwatchGap: 5,
      labelFontSize: 12,
      imageWidth: 40
    })

    // Get the data from ES
    var $cs = $('<div id="' + id + '-cs-div"></div>').appendTo($('#' + id))
    $cs.addClass('idc-output')
    $cs.addClass('idc-output-customScript')

    if (!indiciaData.esSources) {
      indiciaData.esSources = []
    }
    indiciaData.esSources.push({
      size: 5,
      //sort: {"_count": "desc"}, // Not working - neither is doc_count - ask Jvb
      id: "source-" + id,
      mode: "compositeAggregation",
      uniqueField: "taxon.vernacular_name.keyword",
      fields: [
        "taxon.vernacular_name.keyword"
      ],
      filterBoolClauses: {
        "must":[
          {"query_type": "match_phrase","field": "taxon.group","value": "Insect - butterfly"},
          {"query_type": "match_phrase","field": "metadata.survey.id","value": 431},
        ]
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
  

    // Indicia callback
    indiciaFns[id]  = function (el, sourceSettings, response) {
      //console.log('ES callback ' + id + ' called')
      const data = response.aggregations._rows.buckets.map(function(d) {
        return {
          name: d.key['taxon-vernacular_name-keyword'],
          number: d.doc_count,
        }
      })
      donut.setChartOpts({
        data: data,
      })

      // This is necessary to stop an ES error on any
      // subsequent ES calls on this page (e.g. in response
      // to taxon search). The error doesn't stop the page
      // working but pops up an ES error in an alert.
      $cs.removeClass('idc-output')
      $cs.removeClass('idc-output-customScript')
    }
  }

  function getConfigOpt(config, opt, defaultVal) {
    return config[opt] ? config[opt] : defaultVal
  }
})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)