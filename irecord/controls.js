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
    //$('<p>The taxon selector and the controls below apply to all the visualisation on this page.</p>').appendTo($div)
    $('<div id="' + id + '-ctls">').appendTo($div)
    
    // Remove any top level style stuff because
    // it shouldn't need to be applied to all sub-blocks
    config['top-div-style'] = ''

    // Call all the required controls.
    fns.yearRangeControl(id + '-ctls', {...{minYearInit: 2000, maxYearInit: new Date().getFullYear()}, ...config})

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

    fns.acceptedOnlyControl(id + '-ctls', config)
    fns.excludeNotAcceptedControl(id + '-ctls', config)

    var $hr1 = $('<hr>').appendTo($('#' + id + '-ctls'))
    $hr1.css('margin', '5px 0')

    //$('<p>The controls below are applied to the loaded data and map.</p>').appendTo($('#' + id + '-ctls'))

    fns.coindicenceTaxaCheckboxControls(id + '-ctls', config) 
    fns.insetRadio(id + '-ctls', config) 
    fns.dotRadio(id + '-ctls', config) 
    fns.dotColours(id + '-ctls', config)
    $br = $('<br>').appendTo($('#' + id + '-ctls'))
    fns.downloadButtons(id + '-ctls', config)
  }

  fns.groupVisControls = function(id, config) {

    // This is a wrapper control which can be used
    // for pre-created collection of controls
    // (which themselves can be added individually
    // from blocks)
    var $div = fns.topDivConfig(config).appendTo($('#' + id))
    //$('<p>TODO The taxon selector and the controls below apply to all the visualisation on this page.</p>').appendTo($div)
    $('<div id="' + id + '-ctls">').appendTo($div)
    
    // Remove any top level style stuff because
    // it shouldn't need to be applied to all sub-blocks
    config['top-div-style'] = ''

    // Create the required controls.
    var $groupDisplay = $('<div>').appendTo($('#' + id + '-ctls'))
    $groupDisplay.attr('id', id + '-group-display') 
    $groupDisplay.text('No group selected')

    fns.acceptedOnlyControl(id + '-ctls', config)
    fns.excludeNotAcceptedControl(id + '-ctls', config)

    var $hr1 = $('<hr>').appendTo($('#' + id + '-ctls'))
    $hr1.css('margin', '5px 0')

    fns.yearRangeControl(id + '-ctls', {...{minYearInit: 2000, maxYearInit: new Date().getFullYear()}, ...config})
    fns.genButton(id + '-ctls', {...{buttonText: 'Update', buttonMarker: 'update'}, ...config}) 

    var $hr2 = $('<hr>').appendTo($('#' + id + '-ctls'))
    $hr2.css('margin', '5px 0')
  }

  fns.vcTetradControls = function(id, config) {

    // This is a wrapper control which can be used
    // for pre-created collection of controls
    // (which themselves can be added individually
    // from blocks)
    var $div = fns.topDivConfig(config).appendTo($('#' + id))
    $('<div id="' + id + '-ctls">').appendTo($div)

    // Remove any top level style stuff because
    // it shouldn't need to be applied to all sub-blocks
    config['top-div-style'] = ''

    // VC dropdown
    //fns.vcDropDownAndAction(id + '-ctls', config)

    // Accepted only and exclude not accepted checkboxes
    fns.acceptedOnlyControl(id + '-ctls', config)
    fns.excludeNotAcceptedControl(id + '-ctls', config)

    var $hr1 = $('<hr>').appendTo($('#' + id + '-ctls'))
    $hr1.css('margin', '5px 0')

    fns.mapClickOutput(id + '-ctls', config)

    var $hr1 = $('<hr>').appendTo($('#' + id + '-ctls'))
    $hr1.css('margin', '5px 0')

    fns.levelRadio(id + '-ctls', config)
    fns.showVcGrid(id + '-ctls', config) 
    fns.dotRadio(id + '-ctls', config) 
    fns.opacitySlider(id + '-ctls', config)
    fns.vcDotColourSelect(id + '-ctls', config) 
    fns.vcDotColourBreaksSelect(id + '-ctls', config) 
    fns.vcLegendPositionSelect(id + '-ctls', config) 

    var $hr2 = $('<hr>').appendTo($('#' + id + '-ctls'))
    $hr2.css('margin', '0 0 10px 0')

    fns.downloadButtons(id + '-ctls', config)
  }

  // Control - map click output
  fns.mapClickOutput = function(id, config) {
    var $div = fns.topDivConfig(config)
    var $ctlDiv = $div.appendTo($('#' + id))
    $ctlDiv.css('display', 'inline-block')
    
    var $div = $('<div>').appendTo($ctlDiv)
    $div.html('Info at clicked dot: <span class="dot-info"><span>')
  }
  fns.setMapClickOutput = function(config, html) {
    setHtml(config, 'dot-info', html)
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

  // Control - 10km grid toggle
  var onChangeShowVcGrid = []
  fns.showVcGrid = function(id, config) {
    makeCheckbox(config, id, 'show-vc-grid', 'Show 10 km grid', true, onChangeShowVcGrid)
  }
  fns.isShowVcGridChecked = function(config) {
    return isChecked(config, 'show-vc-grid')
  }
  fns.onShowVcGridChecked = function(fn) {
    onChangeShowVcGrid.push(fn)
  }

  // Control - opacity slider
  var onOpacitySliderFns = []
  fns.opacitySlider = function(id, config) {
    var $div = fns.topDivConfig(config)
    var $ctlDiv = $div.appendTo($('#' + id))
    $ctlDiv.css('display', 'inline-block')
    
    var $label = $('<label>').appendTo($ctlDiv)
    $label.attr('for', id + '-opacity')
    $label.text('Dot opacity:')
    $label.css('width', 'fit-content')
    $label.css('vertical-align', 'initial')
    $label.css('margin-right', '0.5em')
    $label.css('font-weight', 'normal')

    var $opacity = $('<input>').appendTo($ctlDiv)
    $opacity.attr('type', 'range')
    $opacity.attr('id', id + '-opacity')
    $opacity.attr('class', 'opacity')
    $opacity.attr('max', 1)
    $opacity.attr('min', 0)
    $opacity.attr('step', 0.1)
    $opacity.attr('value', 1)
    $opacity.css('width', '120px')
    $opacity.css('display', 'inline-block')
    $opacity.css('vertical-align', 'middle')

    $opacity.on('change', function() {
      onOpacitySliderFns.forEach(function(fn){
        fn(id)
      })
    })
  }
  fns.getOpacitySliderValue = function(config) {
    return getValue(config, 'opacity')
  }
  fns.onOpacitySliderChange = function(fn) {
    onOpacitySliderFns.push(fn)
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
    $ctlDiv.css('display', 'inline-block')
    
    var $label = $('<label>').appendTo($ctlDiv)
    $label.attr('for', id + '-year-start')
    $label.text('Year')
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
    $select.css('width', '4em')
    $select.val(config.minYearInit)

    $label = $('<label>').appendTo($ctlDiv)
    $label.attr('for', id + '-year-end')
    $label.text('to')
    $label.css('width', 'fit-content')
    $label.css('vertical-align', 'initial')
    $label.css('margin-right', '0.5em')
    $label.css('margin-left', '0.5em')
    $label.css('font-weight', 'normal')
  
    var $select = $('<input>').appendTo($ctlDiv)
    $select.attr('type', 'number')
    $select.attr('id', id + '-year-end')
    $select.attr('name', id + '-year-end')
    $select.attr('class', 'year-end')
    $select.attr('max', new Date().getFullYear())
    $select.attr('min', 1900)
    $select.css('width', '4em')
    $select.css('margin-right', '0.5em')
    $select.val(config.maxYearInit)
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

  // Control - monad/tetrad radio buttons
  var onChangeLevelRadio = []
  fns.levelRadio = function(id, config) {
    var $div = fns.topDivConfig(config)
    var $ctlDiv = $div.appendTo($('#' + id))

    $('<span>Level:</span>').appendTo($ctlDiv)
    var $radOptTetrad = $('<input type="radio">').appendTo($ctlDiv)
    $radOptTetrad.attr('id', id + '-level-tetrad')
    $radOptTetrad.attr('name', id + '-level')
    $radOptTetrad.css('margin', '0 0.3em 0 0.5em')
    $radOptTetrad.css('vertical-align', 'middle')
    $radOptTetrad.attr('value', 'tetrad')
    $radOptTetrad.attr('class', 'level-rad')
    $radOptTetrad.attr('checked', true)
    
    var $labelTetrad = $('<label>').appendTo($ctlDiv)
    $labelTetrad.attr('for', id + '-level-tetrad')
    $labelTetrad.text('Tetrads')
    $labelTetrad.css('width', 'fit-content')
    $labelTetrad.css('vertical-align', 'baseline')
    $labelTetrad.css('font-weight', 'normal')

    var $radOptMonad = $('<input type="radio">').appendTo($ctlDiv)
    $radOptMonad.attr('id', id + '-level-monad')
    $radOptMonad.attr('name', id + '-level')
    $radOptMonad.css('margin', '0 0.3em 0 0.5em')
    $radOptMonad.css('vertical-align', 'middle')
    $radOptMonad.attr('value', 'monad')
    $radOptMonad.attr('class', 'level-rad')

    var $labelMonad = $('<label>').appendTo($ctlDiv)
    $labelMonad.attr('for', id + '-level-monad')
    $labelMonad.text('Monads')
    $labelMonad.css('width', 'fit-content')
    $labelMonad.css('vertical-align', 'baseline')
    $labelMonad.css('font-weight', 'normal')

    $('input[name="' + id + '-level"]').change(function() {
      onChangeLevelRadio.forEach(function(fn){
        var level = fns.getLevelRadioSelection(config)
        fn(level)
      })
    })
  }
  fns.getLevelRadioSelection = function(config) {
    return getRadioValue(config, 'level-rad')
  }
  fns.onLevelRadioSelection = function(fn) {
    onChangeLevelRadio.push(fn)
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

  // Control - general button
  var genButtonFns = []
  fns.genButton = function(id, config) {
    var $div = fns.topDivConfig(config)
    var $ctlDiv = $div.appendTo($('#' + id))
    $ctlDiv.css('display', 'inline-block')

    var $but = $('<button>').appendTo($ctlDiv)
    $but.attr('id', id + '-but-' + config.buttonMarker)
    $but.text(config.buttonText)
    $but.click(function() {
      genButtonFns.forEach(function(fn){
        fn(config.buttonMarker)
      })
    })
  }
  fns.onGenButtonClick = function(fn) {
    genButtonFns.push(fn)
  }

  // Control - dropdown and action button
  var dropDownAndActionFns = []
  fns.dropDownAndAction = function(id, config) {
    var $div = fns.topDivConfig(config)
    //console.log(config)
    var $ctlDiv = $div.appendTo($('#' + id))
    $ctlDiv.css('display', 'flex')

    var $sel = $('<select>').appendTo($ctlDiv)
    $sel.attr('id', id + '-sel')
    $sel.css('flex', '20')
    $sel.css('margin-right', '0.5em')

    var $but = $('<button>').appendTo($ctlDiv)
    $but.css('flex', '1')
    $but.attr('id', id + '-but')
    $but.text(config.actionText)

    $but.click(function() {
      dropDownAndActionFns.forEach(function(fn){
        fn(id)
      })
    })
  }
  fns.onDropDownAndActionClick = function(fn) {
    dropDownAndActionFns.push(fn)
  }

  // Control - VC colour scheme
  var vcDotColourSelectFns = []
  fns.vcDotColourSelect = function(id, config) {
    var colours = [
      {
        label: 'None',
        colours: []
      },
      {
        label: 'YlOrRd',
        colours: ['#fed976','#feb24c','#fd8d3c','#f03b20','#bd0026'],
        reverse: false
      },
      {
        label: 'Reds',
        colours: ['#fcbba1','#fc9272','#fb6a4a','#de2d26','#a50f15'],
        reverse: false
      },
      {
        label: 'YlGnBu',
        colours: ['#c7e9b4','#7fcdbb','#41b6c4','#2c7fb8','#253494'],
        reverse: false
      },
      {
        label: 'RdPu',
        colours: ['#fcc5c0','#fa9fb5','#f768a1','#c51b8a','#7a0177'],
        reverse: false
      }
    ]
    var $div = fns.topDivConfig(config)
    var $ctlDiv = $div.appendTo($('#' + id))

    var $label = $('<label>').appendTo($ctlDiv)
    $label.attr('for', id + '-vc-colours')
    $label.text('Colours:')
    $label.css('width', 'fit-content')
    $label.css('vertical-align', 'initial')
    $label.css('margin-right', '0.5em')
    $label.css('font-weight', 'normal')

    var $sel = $('<select>').appendTo($ctlDiv)
    $sel.attr('id', id + '-vc-colours')
    $sel.attr('class', 'vc-colours')
  
    colours.forEach(function(c){
      if (c.reverse) c.colours.reverse()
      var $opt = $('<option>').appendTo($sel)
      $opt.attr('value', c.colours.join(','))
      $opt.text(c.label)
    })

    $sel.on('change', function() {
      vcDotColourSelectFns.forEach(function(fn){
        fn(id)
      })
    })
  }
  fns.onVcDotColourSelect = function(fn) {
    vcDotColourSelectFns.push(fn)
  }
  fns.getVcDotColourSelect = function(config) {
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
    var ret = null
    ctls.forEach(function(ctl) {
      if (!ret) {
        var strColours = $('#' + ctl).find('.vc-colours').first().val()
        if (strColours) {
          ret = strColours.split(',')
        } else {
          ret = []
        }
      }
    })
    return ret
  }

  // Control - VC colour breaks
  var vcDotColourBreaksSelectFns = []
  fns.vcDotColourBreaksSelect = function(id, config) {
    var breaks = [
      {
        label: '1, 2 , 3, 4, >4',
        breaks: [1, 2, 3, 4]
      },
      {
        label: '1, 2-5, 6-10, 11-15, >15',
        breaks: [1, 5, 10, 15],
      },
      {
        label: '1-5, 6-10, 11-15, 15-20, >20',
        breaks: [5, 10, 15, 20],
      },
      {
        label: '1-10, 11-50, 51-100, 100-200, >200',
        breaks: [10, 50, 100, 200],
      },
      {
        label: '1-10, 11-50, 51-200, 201-500, >500',
        breaks: [10, 50, 200, 500],
      }
    ]
    var $div = fns.topDivConfig(config)
    var $ctlDiv = $div.appendTo($('#' + id))

    var $label = $('<label>').appendTo($ctlDiv)
    $label.attr('for', id + '-vc-colour-breaks')
    $label.text('Classes:')
    $label.css('width', 'fit-content')
    $label.css('vertical-align', 'initial')
    $label.css('margin-right', '0.5em')
    $label.css('font-weight', 'normal')

    var $sel = $('<select>').appendTo($ctlDiv)
    $sel.attr('id', id + '-vc-colour-breaks')
    $sel.attr('class', 'vc-colour-breaks')
  
    breaks.forEach(function(b){
      var $opt = $('<option>').appendTo($sel)
      $opt.attr('value', b.breaks.join(','))
      $opt.text(b.label)
    })

    $sel.on('change', function() {
      vcDotColourBreaksSelectFns.forEach(function(fn){
        fn(id)
      })
    })
  }
  fns.onVcDotColourBreaksSelect = function(fn) {
    vcDotColourBreaksSelectFns.push(fn)
  }
  fns.getVcDotColourBreaksSelect = function(config) {
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
    var ret = null
    ctls.forEach(function(ctl) {
      if (!ret) {
        var strBreaks = $('#' + ctl).find('.vc-colour-breaks').first().val()
        ret = strBreaks.split(',').map(function(b){return Number(b)})
      }
    })
    return ret
  }

  // Control - Legend position
  var vcLegendPositionFns = []
  fns.vcLegendPositionSelect = function(id, config) {
  
    var $div = fns.topDivConfig(config)
    var $ctlDiv = $div.appendTo($('#' + id))

    var $label = $('<label>').appendTo($ctlDiv)
    $label.attr('for', id + '-vc-legend-pos')
    $label.text('Legend:')
    $label.css('width', 'fit-content')
    $label.css('vertical-align', 'initial')
    $label.css('margin-right', '0.5em')
    $label.css('font-weight', 'normal')

    var $sel = $('<select>').appendTo($ctlDiv)
    $sel.attr('id', id + '-vc-legend-pos')
    $sel.attr('class', 'vc-legend-pos')
  
    var positions = ['top left', 'top right', 'bottom left', 'bottom right']
    positions.forEach(function(p){
      var $opt = $('<option>').appendTo($sel)
      $opt.attr('value', p)
      $opt.text(p)
    })

    $sel.on('change', function() {
      vcLegendPositionFns.forEach(function(fn){
        fn(id)
      })
    })
  }
  fns.onLegendPositionSelect = function(fn) {
    vcLegendPositionFns.push(fn)
  }
  fns.getLegendPosition = function(config) {
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
    var ret = null
    ctls.forEach(function(ctl) {
      if (!ret) {
        ret = $('#' + ctl).find('.vc-legend-pos').first().val()
      }
    })
    return ret
  }

  // Control - VC dropdown and action button
  var vcDropDownAndActionFns = []
  fns.vcDropDownAndAction = function(id, config) {
    var $div = fns.topDivConfig(config)
    var $ctlDiv = $div.appendTo($('#' + id))
    //$ctlDiv.css('display', 'flex')

    var $sel = $('<select>').appendTo($ctlDiv)
    $sel.attr('id', id + '-vc-sel')
    $sel.attr('class', 'vc-sel')
    //$sel.css('flex', '20')
    $sel.css('width', '100%')
    $sel.css('padding', '0.2em 0')
    
    // var $but = $('<button>').appendTo($ctlDiv)
    // $but.css('flex', '1')
    // $but.css('margin-left', '0.5em')
    // $but.attr('id', id + '-vc-but')
    // $but.text(config.actionText)
    // $but.attr('disabled', true)
    // $but.css('color', 'silver')
    // $but.css('display', 'none')

    // Populate the select
    d3.csv('libraries/brcvis/irecord/vc/vcs.csv').then(function(data){
      // Sort the VCs and remove any undesired (e.g. Yorkshire)
      var vcs = data.filter(function(d){return d.name !== 'Yorkshire' && d.name !== 'Channel Isles'}).sort(function(a,b) {
        
        if (a.code.substr(0,1) === 'H' && b.code.substr(0,1) === 'H') {
          return order(Number(a.code.substr(1)), Number(b.code.substr(1)))
        } else if (a.code.substr(0,1) !== 'H' && b.code.substr(0,1) !== 'H') {
          return order(Number(a.code), Number(b.code))
        } else if (a.code.substr(0,1) === 'H') {
          return 1
        } else {
          return -1
        }

        function order(an, bn) {
          if (an > bn) {
            return 1
          }
          if (bn > an) {
            return -1
          }
          return 0
        }
      })
      var $opt = $('<option selected hidden>').appendTo($sel)
      $opt.text('Select a Vice County')
      $opt.attr('value', 0)
      $sel.css('color', 'silver')
      vcs.forEach(function(vc){
        var $opt = $('<option>').appendTo($sel)
        $opt.text(vc.name + ' (' + vc.code + ')')
        $opt.attr('value', vc.id)
        $opt.attr('data-vc-code', vc.code)
        $opt.css('color', 'black')
      })
    })
    $sel.on('change', function() {
      if ($sel.val()) {
        $sel.css('color', 'black')
        // $but.css('color', 'black')
        // $but.attr('disabled', false)
      }
      vcDropDownAndActionFns.forEach(function(fn){
        fn(id)
      })
    })
    
    // // Add action button
    // $but.click(function() {
    //   vcDropDownAndActionFns.forEach(function(fn){
    //     fn(id)
    //   })
    // })
  }
  fns.onVcDropDownAndActionClick = function(fn) {
    vcDropDownAndActionFns.push(fn)
  }
  fns.getVcDropDownAndAction = function(config) {
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
    var vcSelected = {vcId: '', vcName: '', vcCode: ''}
    ctls.forEach(function(ctl) {
      if (!vcSelected.vcId) {
        vcSelected.vcId = $('#' + ctl).find('.vc-sel').first().val()
        vcSelected.vcName = $('#' + ctl).find('.vc-sel option:selected').first().text()
        vcSelected.vcCode = $('#' + ctl).find('.vc-sel option:selected').first().attr('data-vc-code')
      }
    })
    return vcSelected
  }

  // Control - header and text
  fns.headerAndText = function(id, config) {
    var $div = fns.topDivConfig(config)
    var $ctlDiv = $div.appendTo($('#' + id))

    if (config.header) {
      $header = $('<div>').appendTo($ctlDiv)
      $header.css('font-size', fns.getConfigOpt(config, 'headerFontSize', 16))
      $header.css('margin', '0.3em 0')
      $header.css('font-weight', 'bold')
      $header.html(config.header)
    }
    if (config.text) {
      $text = $('<div>').appendTo($ctlDiv)
      $text.html(config.text)
    }
  }

  var monthAndNFns = []
  fns.monthAndN = function(id, config) {
    var $div = fns.topDivConfig(config)
    var $ctlDiv = $div.appendTo($('#' + id))
    $ctlDiv.css('display', 'inline-block')
    $ctlDiv.css('margin-bottom', '0.3em')
    
    var $label = $('<label>').appendTo($ctlDiv)
    $label.attr('for', id + '-top-n')
    $label.text('N')
    $label.css('width', 'fit-content')
    $label.css('vertical-align', 'initial')
    $label.css('margin-right', '0.5em')
    $label.css('font-weight', 'normal')

    var $select = $('<input>').appendTo($ctlDiv)
    $select.attr('type', 'number')
    $select.attr('id', id + '-top-n')
    $select.attr('name', id + '-top-n')
    $select.attr('class', 'top-n')
    $select.attr('max', 20)
    $select.attr('min', 2)
    $select.css('width', '3em')
    $select.val(10)

    $label = $('<label>').appendTo($ctlDiv)
    $label.attr('for', id + '-top-n-month')
    $label.text('Month')
    $label.css('width', 'fit-content')
    $label.css('vertical-align', 'initial')
    $label.css('margin-right', '0.5em')
    $label.css('margin-left', '0.5em')
    $label.css('font-weight', 'normal')
  
    var $select2 = $('<select>').appendTo($ctlDiv)
    $select2.attr('id', id + '-top-n-month')
    $select2.attr('name', id + '-top-n-month')
    $select2.attr('class', 'top-n-month')
    $select2.css('width', '4em')
    $select2.css('margin-right', '0.5em')

    var months = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    months.forEach(function(m) {
      var $opt = $('<option>').appendTo($select2)
      $opt.attr('value', m)
      $opt.text(m)
    })
    $select2.val('All')

    var $but = $('<button>').appendTo($ctlDiv)
    $but.attr('id', id + '-top-n-but')
    $but.text('Update')
    $but.click(function() {
      monthAndNFns.forEach(function(fn){
        fn()
      })
    })
  }
  fns.getMonthAndN = function(config) {
    return [getValue(config, 'top-n'), getValue(config, 'top-n-month')]
  }
  fns.onMonthAndNClick = function(fn) {
    monthAndNFns.push(fn)
  }
  
  // Generate ES filters from control values
  fns.getFiltersFromControls = function(config, tvk, taxon, group, els) {
    // This function can be called from functions implementing ES queries.
    // Creates ES filters from the control values.

    // The interactive elements argument is an object which specifies which
    // elements of the controls to include. Below we set the defaults of all
    // elements to true, so they have to be explicitly excluded if not wanted.
    var elsDefaults = {
      status: true,
      years: true
    }
    var elements = {...elsDefaults, ...els}

    // Init filters
    if (tvk) {
      var filtersMust = [
        {"query_type": "match_phrase", "field": "taxon.accepted_taxon_id", "value": tvk},
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
    // Records with no status are always excluded (at request of Martin Harvey)
    filtersMustNot.push({"query_type": "match_phrase","field": "identification.verification_status","value": ""})
    if (elements.status) {
      if (fns.isAcceptedOnlyChecked(config)) {
        filtersMust.push({"query_type": "match_phrase", "field": "identification.verification_status", "value": "V"})
      } else if (fns.isExcludeNotAcceptedChecked(config)) {
        filtersMustNot.push({"query_type": "match_phrase", "field": "identification.verification_status", "value": "R"})
      }
    }

    // Year filters
    if (elements.years) {
      var range = fns.getYearRange(config)
      var startYear = range[0]
      var endYear = range[1]
      if (startYear || endYear) {
        if (!startYear) startYear = 0
        if (!endYear) endYear = new Date().getFullYear()
        //console.log("event.year:[" + startYear + " TO " + endYear + "]")
        filtersMust.push({"query_type": "query_string","field": "event.year","value": "event.year:[" + startYear + " TO " + endYear + "]"})
      }
    }

    return [filtersMust, filtersMustNot]
  }

  // Get busy control
  fns.getBusy = function($el) {
    // Busy indicator
    return $('<div class="lds-ellipsis" style="display: none;"><div></div><div></div><div></div><div></div></div>').appendTo($el)
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

  function setHtml(config, className, html) {
    // Get any controls associated with the block that
    // owns this config.
    var ctls = fns.getConfigOpt(config, 'ctls', '')
    if (ctls) {
      ctls = ctls.split(' ')
    } else {
      ctls = []
    }
    // Set html of 
    // checked. There could be more than one relevant control,
    // though it wouldn't makes sense, and we account for that.
    var set = false
    ctls.forEach(function(ctl) {
      if (!set) {
        var $ctl = $('#' + ctl).find('.' + className).first()
        if ($ctl.length) {
          $ctl.html(html)
        }
        
      }
    })
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