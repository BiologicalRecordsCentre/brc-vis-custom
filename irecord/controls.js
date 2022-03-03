(function ($, fns, data) {

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
    fns.acceptedOnlyControl(id + '-ctls', config)
    fns.excludeNotAcceptedControl(id + '-ctls', config)
    fns.yearRangeControl(id + '-ctls', config)
  }

  // Control - use only Accepted records
  fns.acceptedOnlyControl = function(id, config) {

    makeCheckbox(config, id, 'accepted-only', 'Use only Accepted records')
  }
  fns.isAcceptedOnlyChecked = function(config) {

    return isChecked(config, 'accepted-only')
  }

  // Control - exclude Not accepted records
  fns.excludeNotAcceptedControl = function(id, config) {

    makeCheckbox(config, id, 'exclude-not-accepted', 'Exclude Not Accepted records', true)
  }
  fns.isExcludeNotAcceptedChecked = function(config) {

    return isChecked(config, 'exclude-not-accepted')
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

    // Status filters
    if (fns.isAcceptedOnlyChecked(config)) {
      filtersMust.push({"query_type": "match_phrase", "field": "identification.verification_status", "value": "V"})
    } else {
      // Records with no status are always excluded (at request of Martin Harvey)
      filtersMustNot.push({"query_type": "match_phrase","field": "identification.verification_status","value": ""})
      if (fns.isExcludeNotAcceptedChecked(config)) {
        filtersMustNot.push({"query_type": "match_phrase", "field": "identification.verification_status", "value": "R"})
      }
    }

    // Year filters
    var range = fns.getYearRange(config)
    var startYear = range[0]
    var endYear = range[1]
    if (startYear || endYear) {
      if (!startYear) startYear = 0
      if (!endYear) endYear = new Date().getFullYear()
      filtersMust.push({"query_type": "query_string","field": "event.year","value": "[" + startYear + " TO " + endYear + "]"})
    }

    return [filtersMust, filtersMustNot]
  }

  // Get busy control
  fns.getBusy = function($el) {
    // Busy indicator
    return $('<div class="lds-ellipsis" style="display: none"><div></div><div></div><div></div><div></div></div>').appendTo($el)
  }

  // Helper functions
  function makeCheckbox(config, id, className, label, checked) {
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

})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)