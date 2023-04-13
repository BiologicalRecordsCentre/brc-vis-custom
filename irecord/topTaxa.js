(function ($, fns, data) {

  fns.topTaxa = function(id, config) {

    var selectedGroup

    var $div = fns.topDivConfig(config)
    $div.appendTo($('#' + id))
    
    var $cs1 = $('<div id="' + id + '-cs1-div"></div>').appendTo($('#' + id))
    var $chartDiv = $('<div id="' + id + '-chart-div" style="max-width: 500px"></div>').appendTo($('#' + id))

    // Busy indicator
    var $busy = fns.getBusy($chartDiv)

    var pieConfig = {
      selector: '#' + id + '-chart-div',
      label: 'pervalue',
      innerRadius: 70,
      radius: 170,
      legendWidth: 200,
      titleFontSize: 16,
      data: [], 
      expand: true,
      duration: 500
    }
    var donut = brccharts.pie(pieConfig)

    fns.addTaxonSelectedFn(function (usedTaxonSelId, tvk, taxon, group, groupid) {

      groupSelected(usedTaxonSelId, tvk, taxon, group, groupid)
    })

    function groupSelected(usedTaxonSelId, tvk, taxon, group, groupid) {

      if (usedTaxonSelId === config.taxonSelControlGroup) {
        
        $busy.show()

        selectedGroup = group

        // Set up filters in response to controls
        var filters = fns.getFiltersFromControls(config, tvk, taxon, group, {years: true})
        //console.log(filters)

        // Set N parameter from control
        var val = fns.getMonthAndN(config)
        var n = val[0]

        // Set month filter if required
        var month = val[1]
        if (month !== 'All') {
          var nMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month) + 1
          //console.log('nMonth', nMonth)
          filters[0].push({"query_type": "match_phrase", "field": "event.month", "value": nMonth})
        }
        
        indiciaData.esSources.push({
          id: "source-" + id + "-group",
          size: n,
          mode: "termAggregation",
          uniqueField: "taxon.accepted_name.keyword",
          fields: [
            "taxon.accepted_name.keyword",
          ],
          aggregation: {
            records: {
              cardinality: {
                field: id
              }
            }
          },
          filterBoolClauses: {
            "must": filters[0],
            "must_not": filters[1]
          },
          proxyCacheTimeout: drupalSettings.brc_vis.indiciaUserId ? 60 : 7200
        })

        //console.log('esSources', indiciaData.esSources)

        // The ES output classes must be added conditionally
        // because if they are added for a source that doesn't
        // get added to indiciaData.esSources, then hooking up
        // the data sources in the BRC vis module JS fails.
        $cs1.addClass('idc-control')
        $cs1.addClass('idc-customScript')
        var source1 = {}
        source1["source-" + id + "-group"] = ''
        $cs1.idcCustomScript({
          id: 'custom-script-' + id + "-group",
          source: source1,
          functionName: id + "-group",
        })
      }
    }

    // Add the Indicia ES custom callback function to
    // respond to taxon group selection.
    indiciaFns[id + "-group"]  = function (el, sourceSettings, response) {

      console.log('ES callback ' + id + '-group called')
      //console.log(response)

      // Generate array of total number of records per year
      var data = response.aggregations._idfield.buckets.map(function(d) {
        return {
          name: d.key,
          number: d.doc_count 
        }
      })

      // Default transition not working nicely because colours for each
      // species as introduced are kept, but top species change from year
      // to year and different species end up with same colour, so use
      // this hack to empty previous chart before building new one.
      donut.setChartOpts({data: []})
      setTimeout(function(){
        $busy.hide()
        donut.setChartOpts({data: data})
      }, 1000)

      // Remove any ES output classes otherwise when taxon
      // selector action buttons cause other JS code to execute
      // ES queries, but not this one, then these classes will
      // mess up the hooking up of those data sources.
      $cs1.removeClass('idc-control')
      $cs1.removeClass('idc-customScript')

    }

    function reRunEs() {
      if (indiciaData) {
        indiciaData.esSources = [] // eslint-disable-line no-undef
      }
      groupSelected(config.taxonSelControlGroup, null, null, selectedGroup, null)
      if (indiciaFns) {
        indiciaFns.initDataSources()
        indiciaFns.hookupDataSources()
        indiciaFns.populateDataSources()
      }
    }

    // React to interactive control actions
    fns.onGenButtonClick(function(marker){
      if (marker === 'update') {
        reRunEs()
      }
    })
    fns.onMonthAndNClick(function(){
      reRunEs()
    })
  }
})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)