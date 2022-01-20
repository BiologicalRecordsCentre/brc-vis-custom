(function ($, fns) {

  fns.topN = function(id, config) {

    console.log('Garden Butterfly top n species')

    // Set up and empty donut chart
    var topN = Number(getConfigOpt(config, 'topN', 10))
    var radius = Number(getConfigOpt(config, 'radius', 200))
    var innerRadius = Number(getConfigOpt(config, 'innerRadius', 100))
    var legendWidth = Number(getConfigOpt(config, 'legendWidth', 150))
    var titleFontSize = Number(getConfigOpt(config, 'titleFontSize', '16'))

    var $div = $('<div style="margin: 0 10px 10px 10px"></div>').appendTo($('#' + id))
    $('<h2 style="margin-top: 0">Top ' + topN + ' butterflies recorded</h2>').appendTo($div)
    $('<div id="' + id + '-chart-div"></div>').appendTo($div)

    var pieConfig = {
      selector: '#' + id + '-chart-div',
      innerRadius: innerRadius,
      radius: radius,
      legendWidth: legendWidth,
      titleFontSize: titleFontSize,
      data: [], 
      label: 'value',
      expand: true
    }
    var chart = brccharts.pie(pieConfig)

    // Get the data from ES
    var $cs = $('<div id="' + id + '-cs-div"></div>').appendTo($('#' + id))
    $cs.addClass('idc-output')
    $cs.addClass('idc-output-customScript')

    if (!indiciaData.esSources) {
      indiciaData.esSources = []
    }
    indiciaData.esSources.push({
      size: 0,
      id: "source-" + id,
      mode: "compositeAggregation",
      uniqueField: "taxon.vernacular_name.keyword",
      fields: [
        "taxon.vernacular_name.keyword",
      ],
      filterBoolClauses: {
        "must":[
          {"query_type": "match_phrase","field": "metadata.survey.id","value": 431},
          {"query_type": "match_phrase","field": "taxon.group","value": "insect - butterfly"}
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

    // Callback functions for when data loaded
    indiciaFns[id] = function (el, sourceSettings, response) {
      console.log('ES callback ' + id + ' called')
      var data = response.aggregations._rows.buckets.map(function(r) {
        return {
          number: r.doc_count,
          name: r.key['taxon-vernacular_name-keyword']
        }
      })
      .sort(function(a, b) {return (b.number > a.number) ? 1 : -1})
      .filter(function(d,i) {return i < topN})
      chart.setChartOpts({data: data})
      console.log(data)
    }
  }

  function getConfigOpt(config, opt, defaultVal) {
    return config[opt] ? config[opt] : defaultVal
  }

})(jQuery, drupalSettings.brc_vis.fns)