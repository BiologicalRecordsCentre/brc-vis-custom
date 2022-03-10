(function ($, fns, data) {

  //console.log(drupalSettings.brc_vis.config)

  // This file creates controls, rather than visualisations. However,
  // the controls can be implemented in blocks, just as visualisations
  // can by setting the custom JS configuration option 'fn' to the
  // name of the control creation function (generally the first) in
  // each pair below, e.g: fn acceptedOnlyControl
  // But rather than have a separate block for each control - which
  // would be quite spaced out, we can also implement collections here
  // and reference that from the block, e.g. fn overviewControls.

  // Collected controls
  fns.overviewControls = function(id, config) {

    // This is a wrapper control which can be used
    // for pre-created collection of controls
    // (which themselves can be added individually
    // from blocks)
    var $div = fns.topDivConfig(config).appendTo($('#' + id))
    $('<p>The taxon selector and the controls below apply to all the visualisation on this page.</p>').appendTo($div)
    $('<div id="' + id + '-ctls">').appendTo($div)
    
    //$('<legend>Apply to all page visualisations</legend>').appendTo($fldset)
    
    // Remove any top level style stuff because
    // it shouldn't need to be applied to all sub-blocks
    config['top-div-style'] = ''

    // Call all the required controls
    fns.yearRangeControl(id + '-ctls', config)
    var $hr = $('<hr>').appendTo($('#' + id + '-ctls'))
    $hr.css('margin', '5px 0')
    fns.acceptedOnlyControl(id + '-ctls', config)
    fns.excludeNotAcceptedControl(id + '-ctls', config)
    fns.statusSubstatusRadio(id + '-ctls', config)
  }

  // Control - use only Accepted records
  var onChangeAcceptedOnly = []
  fns.acceptedOnlyControl = function(id, config) {
    makeCheckbox(config, id, 'accepted-only', 'Use only Accepted records', false, onChangeAcceptedOnly)
  }
  fns.isAcceptedOnlyChecked = function(config) {
    return isChecked(config, 'accepted-only')
  }
  fns.onAcceptedOnlyChecked = function(fn) {
    onChangeAcceptedOnly.push(fn)
  }

  // Control - exclude Not accepted records
  var onChangeExcludeNotAccepted = []
  fns.excludeNotAcceptedControl = function(id, config) {
    makeCheckbox(config, id, 'exclude-not-accepted', 'Exclude Not Accepted records', true, onChangeExcludeNotAccepted)
  }
  fns.isExcludeNotAcceptedChecked = function(config) {
    return isChecked(config, 'exclude-not-accepted')
  }
  fns.onExcludeNotAcceptedChecked = function(fn) {
    onChangeExcludeNotAccepted.push(fn)
  }

  // Control - min/max year
  fns.yearRangeControl = function(id, config) {

    var $div = fns.topDivConfig(config)
    var $ctlDiv = $div.appendTo($('#' + id))
    
    var $label = $('<label>').appendTo($ctlDiv)
    $label.attr('for', id + '-year-start')
    $label.text('Min year')
    $label.css('width', 'fit-content')
    $label.css('vertical-align', 'initial')
    $label.css('margin-right', '0.5em')
    $label.css('font-weight', 'normal')

    var $select = $('<input>').appendTo($ctlDiv)
    $select.attr('type', 'number')
    $select.attr('id', id + '-year-start')
    $select.attr('name', id + '-year-start')
    $select.attr('class', 'year-start')
    $select.attr('max', new Date().getFullYear())
    $select.attr('min', 1900)

    $label = $('<label>').appendTo($ctlDiv)
    $label.attr('for', id + '-year-end')
    $label.text('Max year')
    $label.css('width', 'fit-content')
    $label.css('vertical-align', 'initial')
    $label.css('margin-right', '0.5em')
    $label.css('margin-left', '1em')
    $label.css('font-weight', 'normal')
  
    var $select = $('<input>').appendTo($ctlDiv)
    $select.attr('type', 'number')
    $select.attr('id', id + '-year-end')
    $select.attr('name', id + '-year-end')
    $select.attr('class', 'year-end')
    $select.attr('max', new Date().getFullYear())
    $select.attr('min', 1900)
  }
  fns.getYearRange = function(config) {

    return [getValue(config, 'year-start'), getValue(config, 'year-end')]
  }

  // Control - verification: status or substatus
  var onChangeStatusSubstatusRadio = []
  fns.statusSubstatusRadio = function(id, config) {
    var $div = fns.topDivConfig(config)
    var $ctlDiv = $div.appendTo($('#' + id))

    $('<span>Default display level:</span>').appendTo($ctlDiv)
    var $radOptStatus = $('<input type="radio">').appendTo($ctlDiv)
    $radOptStatus.attr('id', id + '-def-display-status')
    $radOptStatus.attr('name', id + '-def-display')
    $radOptStatus.css('margin', '0 0.3em 0 0.5em')
    $radOptStatus.css('vertical-align', 'middle')
    $radOptStatus.attr('value', 'status')
    $radOptStatus.attr('checked', true)
    $radOptStatus.attr('class', 'status-substatus-rad')
    
    var $labelStatus = $('<label>').appendTo($ctlDiv)
    $labelStatus.attr('for', id + '-def-display-status')
    $labelStatus.text('Status')
    $labelStatus.css('width', 'fit-content')
    $labelStatus.css('vertical-align', 'baseline')
    $labelStatus.css('font-weight', 'normal')

    var $radOptSubstatus = $('<input type="radio">').appendTo($ctlDiv)
    $radOptSubstatus.attr('id', id + '-def-display-substatus')
    $radOptSubstatus.attr('name', id + '-def-display')
    $radOptSubstatus.css('margin', '0 0.3em 0 0.5em')
    $radOptSubstatus.css('vertical-align', 'middle')
    $radOptSubstatus.attr('value', 'substatus')
    $radOptSubstatus.attr('class', 'status-substatus-rad')

    var $labelSubstatus = $('<label>').appendTo($ctlDiv)
    $labelSubstatus.attr('for', id + '-def-display-substatus')
    $labelSubstatus.text('Substatus')
    $labelSubstatus.css('width', 'fit-content')
    $labelSubstatus.css('vertical-align', 'baseline')
    $labelSubstatus.css('font-weight', 'normal')

    $('input[name="' + id + '-def-display"]').change(function() {
      onChangeStatusSubstatusRadio.forEach(function(fn){
        var status = fns.getStatusSubstatusRadioSelection(config)
        fn(status)
      })
    })
  }
  fns.getStatusSubstatusRadioSelection = function(config) {
    return getRadioValue(config, 'status-substatus-rad')
  }
  fns.onStatusSubstatusRadioSelection = function(fn) {
    onChangeStatusSubstatusRadio.push(fn)
  }

  // Generate ES filters from control values
  fns.getFiltersFromControls = function(config, tvk, group) {
    // This functioncan be called from functions implementing ES queries.
    // Creates ES filters from the control values.

    // Init filters
    if (tvk) {
      var filtersMust = [
        {"query_type": "match_phrase", "field": "taxon.taxa_taxon_list_id", "value": tvk},
      ]
    } else {
      var filtersMust = [
        {"query_type": "match_phrase", "field": "taxon.group", "value": group}
      ]
    }
    var filtersMustNot = []

    // // Status filters
    // if (fns.isAcceptedOnlyChecked(config)) {
    //   filtersMust.push({"query_type": "match_phrase", "field": "identification.verification_status", "value": "V"})
    // } else {
    //   // Records with no status are always excluded (at request of Martin Harvey)
    //   filtersMustNot.push({"query_type": "match_phrase","field": "identification.verification_status","value": ""})
    //   if (fns.isExcludeNotAcceptedChecked(config)) {
    //     filtersMustNot.push({"query_type": "match_phrase", "field": "identification.verification_status", "value": "R"})
    //   }
    // }

    // Year filters
    var range = fns.getYearRange(config)
    var startYear = range[0]
    var endYear = range[1]
    if (startYear || endYear) {
      if (!startYear) startYear = 0
      if (!endYear) endYear = new Date().getFullYear()
      //console.log("event.year:[" + startYear + " TO " + endYear + "]")
      filtersMust.push({"query_type": "query_string","field": "event.year","value": "event.year:[" + startYear + " TO " + endYear + "]"})
    }

    return [filtersMust, filtersMustNot]
  }

  // Get busy control
  fns.getBusy = function($el) {
    // Busy indicator
    return $('<div class="lds-ellipsis" style="display: none"><div></div><div></div><div></div><div></div></div>').appendTo($el)
  }

  // Helper functions
  function makeCheckbox(config, id, className, label, checked, fnsCallback) {
    var $div = fns.topDivConfig(config)
    var $ctlDiv = $div.appendTo($('#' + id))

    var $check = $('<input>').appendTo($ctlDiv)
    $check.attr('type', 'checkbox')
    $check.attr('id', id + '-' + className)
    $check.attr('name', id + '-' + className)
    $check.attr('class', className)
    $check.prop('checked', checked)

    var $label = $('<label>').appendTo($ctlDiv)
    $label.attr('for', id + '-' + className)
    $label.css('font-weight', 'normal')
    $label.css('width', 'auto')
    $label.css('margin', '0 0 0 0.5em')
    $label.css('vertical-align', 'initial')
    $label.text(label)

    $check.change(function() {
      fnsCallback.forEach(function(fn){
        fn()
      })
    })
  }

  function isChecked(config, className) {
    // Get any controls associated with the block that
    // owns this config.
    var ctls = fns.getConfigOpt(config, 'ctls', '')
    if (ctls) {
      ctls = ctls.split(' ')
    } else {
      ctls = []
    }

    // Set variable if a control of passed in class is
    // checked. There could be more than one relevant control,
    // though it wouldn't makes sense, and we account for that.
    var checked = false
    ctls.forEach(function(ctl) {
      if (!checked) {
        checked = $('#' + ctl).find('.' + className + ':checked').length > 0
      }
    })
    return checked
  }

  function getValue(config, className) {
    // Get any controls associated with the block that
    // owns this config.
    var ctls = fns.getConfigOpt(config, 'ctls', '')
    if (ctls) {
      ctls = ctls.split(' ')
    } else {
      ctls = []
    }

    // Set variable if a control of passed in class is
    // checked. There could be more than one relevant control,
    // though it wouldn't makes sense, and we account for that.
    var val = null
    ctls.forEach(function(ctl) {
      if (!val) {
        var ctlval = $('#' + ctl).find('.' + className).first().val()
        if (ctlval) val=ctlval
      }
    })
    return val
  }

  function getRadioValue(config, className) {
    // Get any controls associated with the block that
    // owns this config.
    var ctls = fns.getConfigOpt(config, 'ctls', '')
    if (ctls) {
      ctls = ctls.split(' ')
    } else {
      ctls = []
    }

    // Set variable if a control of passed in class is
    // checked. There could be more than one relevant control,
    // though it wouldn't makes sense, and we account for that.
    var val = null
    ctls.forEach(function(ctl) {
      if (!val) {
        var ctlval = $('#' + ctl).find('.' + className + ':checked').first().val()
        if (ctlval) val=ctlval
      }
    })
    return val
  }

})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)