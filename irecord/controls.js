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
    
    // Remove any top level style stuff because
    // it shouldn't need to be applied to all sub-blocks
    config['top-div-style'] = ''

    // Call all the required controls.
    fns.yearRangeControl(id + '-ctls', config)

    var $hr1 = $('<hr>').appendTo($('#' + id + '-ctls'))
    $hr1.css('margin', '5px 0')
    $hr1.css('display', fns.getConfigOpt(config, 'hr1', 'true') === 'true' ? '' : 'none')

    fns.acceptedOnlyControl(id + '-ctls', config)
    fns.excludeNotAcceptedControl(id + '-ctls', config)

    if (fns.getConfigOpt(config, 'showStatusSubstatus', 'true') === 'true'){
      fns.statusSubstatusRadio(id + '-ctls', config)
    }

    var $hr2 = $('<hr>').appendTo($('#' + id + '-ctls'))
    $hr2.css('margin', '5px 0')
    $hr2.css('display', fns.getConfigOpt(config, 'hr2', 'true') === 'true' ? '' : 'none')
  }

  fns.coincidenceMapControls = function(id, config) {

    // This is a wrapper control which can be used
    // for pre-created collection of controls
    // (which themselves can be added individually
    // from blocks)
    var $div = fns.topDivConfig(config).appendTo($('#' + id))
    $('<div id="' + id + '-ctls">').appendTo($div)

    $('<p>The two filter cheboxes below are applied to the taxa data when loaded.</p>').appendTo($('#' + id + '-ctls'))

    fns.acceptedOnlyControl(id + '-ctls', config)
    fns.excludeNotAcceptedControl(id + '-ctls', config)

    var $hr1 = $('<hr>').appendTo($('#' + id + '-ctls'))
    $hr1.css('margin', '5px 0')

    $('<p>The controls below are applied to the loaded data and map.</p>').appendTo($('#' + id + '-ctls'))

    fns.coindicenceTaxaCheckboxControls(id + '-ctls', config) 
    fns.insetRadio(id + '-ctls', config) 
    fns.dotRadio(id + '-ctls', config) 
    fns.dotColours(id + '-ctls', config)
    $br = $('<br>').appendTo($('#' + id + '-ctls'))
    fns.downloadButtons(id + '-ctls', config)
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

  // Control - taxon 1 and taxon 2 checkboxes
  var onChangeCoincidenceTaxa = []
  fns.coindicenceTaxaCheckboxControls = function(id, config) {
    makeCheckbox(config, id, 'coincidence-taxa-1', 'Display taxon 1', true, onChangeCoincidenceTaxa)
    makeCheckbox(config, id, 'coincidence-taxa-2', 'Display taxon 2', true, onChangeCoincidenceTaxa)
  }
  fns.coindicenceTaxaCheckboxStates = function(config) {
    return [isChecked(config, 'coincidence-taxa-1'), isChecked(config, 'coincidence-taxa-2')]
  }
  fns.onCoincidenceTaxaChecked = function(fn) {
    onChangeCoincidenceTaxa.push(fn)
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

  // Control - map inset radio buttons
  var onChangeInsetRadio = []
  fns.insetRadio = function(id, config) {
    var $div = fns.topDivConfig(config)
    var $ctlDiv = $div.appendTo($('#' + id))

    $('<span>Map insets:</span>').appendTo($ctlDiv)
    var $radOptNone = $('<input type="radio">').appendTo($ctlDiv)
    $radOptNone.attr('id', id + '-inset-none')
    $radOptNone.attr('name', id + '-inset')
    $radOptNone.css('margin', '0 0.3em 0 0.5em')
    $radOptNone.css('vertical-align', 'middle')
    $radOptNone.attr('value', 'BI1')
    $radOptNone.attr('class', 'inset-rad')
    
    var $labelNone = $('<label>').appendTo($ctlDiv)
    $labelNone.attr('for', id + '-inset-none')
    $labelNone.text('None')
    $labelNone.css('width', 'fit-content')
    $labelNone.css('vertical-align', 'baseline')
    $labelNone.css('font-weight', 'normal')

    var $radOptCi = $('<input type="radio">').appendTo($ctlDiv)
    $radOptCi.attr('id', id + '-inset-ci')
    $radOptCi.attr('name', id + '-inset')
    $radOptCi.css('margin', '0 0.3em 0 0.5em')
    $radOptCi.css('vertical-align', 'middle')
    $radOptCi.attr('value', 'BI2')
    $radOptCi.attr('class', 'inset-rad')

    var $labelCi = $('<label>').appendTo($ctlDiv)
    $labelCi.attr('for', id + '-inset-ci')
    $labelCi.text('CI')
    $labelCi.css('width', 'fit-content')
    $labelCi.css('vertical-align', 'baseline')
    $labelCi.css('font-weight', 'normal')

    var $radOptCiNi = $('<input type="radio">').appendTo($ctlDiv)
    $radOptCiNi.attr('id', id + '-inset-ci-ni')
    $radOptCiNi.attr('name', id + '-inset')
    $radOptCiNi.css('margin', '0 0.3em 0 0.5em')
    $radOptCiNi.css('vertical-align', 'middle')
    $radOptCiNi.attr('value', 'BI4')
    $radOptCiNi.attr('class', 'inset-rad')
    $radOptCiNi.attr('checked', true)

    var $labelCiNi = $('<label>').appendTo($ctlDiv)
    $labelCiNi.attr('for', id + '-inset-ci-ni')
    $labelCiNi.text('CI & NI')
    $labelCiNi.css('width', 'fit-content')
    $labelCiNi.css('vertical-align', 'baseline')
    $labelCiNi.css('font-weight', 'normal')

    $('input[name="' + id + '-inset"]').change(function() {
      onChangeInsetRadio.forEach(function(fn){
        var status = fns.getInsetRadioSelection(config)
        fn(status)
      })
    })
  }
  fns.getInsetRadioSelection = function(config) {
    return getRadioValue(config, 'inset-rad')
  }
  fns.onInsetRadioSelection = function(fn) {
    onChangeInsetRadio.push(fn)
  }

  // Control - dot style radio buttons
  var onChangeDotRadio = []
  fns.dotRadio = function(id, config) {
    var $div = fns.topDivConfig(config)
    var $ctlDiv = $div.appendTo($('#' + id))

    $('<span>Dot style:</span>').appendTo($ctlDiv)
    var $radOptCircle = $('<input type="radio">').appendTo($ctlDiv)
    $radOptCircle.attr('id', id + '-dot-circle')
    $radOptCircle.attr('name', id + '-dot')
    $radOptCircle.css('margin', '0 0.3em 0 0.5em')
    $radOptCircle.css('vertical-align', 'middle')
    $radOptCircle.attr('value', 'circle')
    $radOptCircle.attr('class', 'dot-rad')
    $radOptCircle.attr('checked', true)
    
    var $labelCircle = $('<label>').appendTo($ctlDiv)
    $labelCircle.attr('for', id + '-dot-circle')
    $labelCircle.text('Circles')
    $labelCircle.css('width', 'fit-content')
    $labelCircle.css('vertical-align', 'baseline')
    $labelCircle.css('font-weight', 'normal')

    var $radOptSquare = $('<input type="radio">').appendTo($ctlDiv)
    $radOptSquare.attr('id', id + '-dot-square')
    $radOptSquare.attr('name', id + '-dot')
    $radOptSquare.css('margin', '0 0.3em 0 0.5em')
    $radOptSquare.css('vertical-align', 'middle')
    $radOptSquare.attr('value', 'square')
    $radOptSquare.attr('class', 'dot-rad')

    var $labelSquare = $('<label>').appendTo($ctlDiv)
    $labelSquare.attr('for', id + '-dot-square')
    $labelSquare.text('Squares')
    $labelSquare.css('width', 'fit-content')
    $labelSquare.css('vertical-align', 'baseline')
    $labelSquare.css('font-weight', 'normal')

    $('input[name="' + id + '-dot"]').change(function() {
      onChangeDotRadio.forEach(function(fn){
        var status = fns.getDotRadioSelection(config)
        fn(status)
      })
    })
  }
  fns.getDotRadioSelection = function(config) {
    return getRadioValue(config, 'dot-rad')
  }
  fns.onDotRadioSelection = function(fn) {
    onChangeDotRadio.push(fn)
  }

  // Control - dot colours
  var onChangeDotColours = []
  fns.dotColours = function(id, config) {

    var $div = fns.topDivConfig(config)
    var $ctlDiv = $div.appendTo($('#' + id))

    var $colourDiv1 = $('<div>').appendTo($ctlDiv)

    var $colour1 = $('<input type="text">').appendTo($colourDiv1)
    $colour1.attr('id', id + '-dot-colour-1')
    $colour1.css('width', '110px')

    var $labelColour1 = $('<label>').appendTo($colourDiv1)
    $labelColour1.attr('for', id + '-dot-colour-1')
    $labelColour1.text('Taxon 1 colour')
    $labelColour1.css('width', 'fit-content')
    $labelColour1.css('vertical-align', 'baseline')
    $labelColour1.css('font-weight', 'normal')
    $labelColour1.css('margin-left', '0.5em')

    var $colourDiv2 = $('<div>').appendTo($ctlDiv)

    var $colour2 = $('<input type="text">').appendTo($colourDiv2)
    $colour2.attr('id', id + '-dot-colour-2')
    $colour2.css('width', '110px')

    var $labelColour2 = $('<label>').appendTo($colourDiv2)
    $labelColour2.attr('for', id + '-dot-colour-2')
    $labelColour2.text('Taxon 2 colour')
    $labelColour2.css('width', 'fit-content')
    $labelColour2.css('vertical-align', 'baseline')
    $labelColour2.css('font-weight', 'normal')
    $labelColour2.css('margin-left', '0.5em')

    var $colourDiv3 = $('<div>').appendTo($ctlDiv)

    var $colour3 = $('<input type="text">').appendTo($colourDiv3)
    $colour3.attr('id', id + '-dot-colour-3')
    $colour3.css('width', '110px')

    var $labelColour3 = $('<label>').appendTo($colourDiv3)
    $labelColour3.attr('for', id + '-dot-colour-3')
    $labelColour3.text('Coincidence colour')
    $labelColour3.css('width', 'fit-content')
    $labelColour3.css('vertical-align', 'baseline')
    $labelColour3.css('font-weight', 'normal')
    $labelColour3.css('margin-left', '0.5em')

    var $hiddenColour1 = $('<input type="hidden">').appendTo($ctlDiv)
    $hiddenColour1.attr('class', 'dot-colour-hidden-1')
    $hiddenColour1.attr('id', id + '-dot-colour-hidden-1')
    var $hiddenColour2 = $('<input type="hidden">').appendTo($ctlDiv)
    $hiddenColour2.attr('class', 'dot-colour-hidden-2')
    $hiddenColour2.attr('id', id + '-dot-colour-hidden-2')
    var $hiddenColour3 = $('<input type="hidden">').appendTo($ctlDiv)
    $hiddenColour3.attr('class', 'dot-colour-hidden-3')
    $hiddenColour3.attr('id', id + '-dot-colour-hidden-3')

    const colour1 = new JSColor('#' + id + '-dot-colour-1', {onChange: colourChange})
    const colour2 = new JSColor('#' + id + '-dot-colour-2', {onChange: colourChange})
    const colour3 = new JSColor('#' + id + '-dot-colour-3', {onChange: colourChange})

    // Default colours 
    colour1.fromString('#1f77b4')
    colour2.fromString('#ff7f0e')
    colour3.fromString('#2ca02c')
    $hiddenColour1.val(colour1.toHEXString())
    $hiddenColour2.val(colour2.toHEXString())
    $hiddenColour3.val(colour3.toHEXString())

    function colourChange() {
      $hiddenColour1.val(colour1.toHEXString())
      $hiddenColour2.val(colour2.toHEXString())
      $hiddenColour3.val(colour3.toHEXString())
      onChangeDotColours.forEach(function(fn){
        fn()
      })
    }
  }
  fns.getDotColours = function(config) {

    // Get any controls associated with the block that
    // owns this config.
    var ctls = fns.getConfigOpt(config, 'ctls', '')
    if (ctls) {
      ctls = ctls.split(' ')
    } else {
      ctls = []
    }

    // Set variable if controls of passed in class are found.
    // There could be more than one relevant control,
    // though it wouldn't makes sense, and we account for that.
    var c1, c2, c3
    ctls.forEach(function(ctl) {
      if (!c1) {
        c1 = $('#' + ctl).find('.dot-colour-hidden-1').first().val()
        c2 = $('#' + ctl).find('.dot-colour-hidden-2').first().val()
        c3 = $('#' + ctl).find('.dot-colour-hidden-3').first().val()
      }
    })
    return [c1, c2, c3]
  }
  fns.onDotColourChange = function(fn) {
    onChangeDotColours.push(fn)
  }

  // Control - download buttons
  var onClickDownload = []
  fns.downloadButtons = function(id, config) {
    var $div = fns.topDivConfig(config)
    var $ctlDiv = $div.appendTo($('#' + id))

    var $svg = $('<button>').appendTo($ctlDiv)
    $svg.attr('id', id + '-download-svg')
    $svg.attr('class', 'download-svg')
    $svg.css('margin-right', '0.5em')
    $svg.text('Download SVG')
    $svg.click(function() {download('svg')})
    // Temporarily disabled
    $svg.css('display', 'none')

    var $png = $('<button>').appendTo($ctlDiv)
    $png.attr('id', id + '-download-svg')
    $png.attr('class', 'download-svg')
    $png.text('Download PNG')
    $png.click(function() {download('png')})

    function download(type) {
      onClickDownload.forEach(function(fn){
        fn(type)
      })
    }
  }
  fns.onDownloadClick = function(fn) {
    onClickDownload.push(fn)
  }

  // Generate ES filters from control values
  fns.getFiltersFromControls = function(config, tvk, taxon, group, interactive) {
    // This function can be called from functions implementing ES queries.
    // Creates ES filters from the control values.

    // The interactive flag is passed as an argument. If not set to true
    // then extra filters added to ES queries.

    // Init filters
    if (tvk) {
      var filtersMust = [
        {"query_type": "match_phrase", "field": "taxon.taxa_taxon_list_id", "value": tvk},
      ]
    } else if (group) {
      var filtersMust = [
        {"query_type": "match_phrase", "field": "taxon.group", "value": group}
      ]
    } else {
      var filtersMust = [
        {"query_type": "query_string", "field": "taxon.accepted_name","value": "taxon.accepted_name:\"" + taxon + "\""}
      ]
    }
    var filtersMustNot = []

    // Status filters
    if (fns.isAcceptedOnlyChecked(config)) {
      if (!interactive) {
        filtersMust.push({"query_type": "match_phrase", "field": "identification.verification_status", "value": "V"})
      }
    } else {
      // Records with no status are always excluded (at request of Martin Harvey)
      filtersMustNot.push({"query_type": "match_phrase","field": "identification.verification_status","value": ""})
      if (!interactive) {
        if (fns.isExcludeNotAcceptedChecked(config)) {
          filtersMustNot.push({"query_type": "match_phrase", "field": "identification.verification_status", "value": "R"})
        }
      }
    }

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