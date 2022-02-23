(function ($, fns, data) {

  fns.verification3 = function(id, config) {

    var $div = $('<div></div>').appendTo($('#' + id))

    // Verification sub-status
    $('<div id="' + id + '-chart">').appendTo($div)
    var verification3 = brccharts.pie({
      selector: "#" + id + "-chart",
      innerRadius: 35,
      radius: 70,
      title: 'Sub-status - data from another block',
      titleFontSize: 14,
      data: [
        {
          name: "No substatus",
          number: 0,
          colour: '#00000055',
        },
        {
          name: "Accepted",
          number: 0,
          colour: '#008000',
        },
        {
          name: "Considered correct",
          number: 0,
          colour: '#00800088',
        },
        {
          name: "Plausible",
          number: 0,
          colour: '#FFA500',
        },
        {
          name: "Unable to verify",
          number: 0,
          colour: '#FF000088',
        },
        {
          name: "Incorrect",
          number: 0,
          colour: '#FF0000',
        },
      ],
      expand: true,
      legendSwatchSize: 15,
      legendWidth: 125,
      legendSwatchGap: 5,
      labelFontSize: 12,
      imageWidth: 40
    })

    // Indicia callback
    // An example of callback that is called from a function
    // initiated in another block. The other function is responsible
    // for retrieving the ES data and then calls this function if
    // it exists. Saves doubling up on ES calls.
    fns.verification3_callback = function (response) {
        
      var data2 = [
        {
          name: "No substatus",
          colour: '#00000055',
          number: 0
        },
        {
          name: "Accepted",
          colour: '#008000',
          image: 'libraries/brcvis/irecord/images/accepted.png',
          number: 0
        },
        {
          name: "Considered correct",
          colour: '#00800088',
          image: 'libraries/brcvis/irecord/images/considered-correct.png',
          number: 0
        },
        {
          name: "Plausible",
          colour: '#FFA500',
          image: 'libraries/brcvis/irecord/images/plausible.png',
          number: 0
        },
        {
          name: "Unable to verify",
          colour: '#FF000088',
          image: 'libraries/brcvis/irecord/images/unable-to-verify.png',
          number: 0
        },
        {
          name: "Incorrect",
          colour: '#FF0000',
          image: 'libraries/brcvis/irecord/images/incorrect.png',
          number: 0
        },
      ]
      response.aggregations._rows.buckets.forEach(function(v) {
        data2[v.key['identification-verification_substatus']].number += v.doc_count
      })
      verification3.setChartOpts({data: data2.filter(function(v){return v.number})})
    }
  }

})(jQuery, drupalSettings.brc_vis.fns, drupalSettings.brc_vis.data)