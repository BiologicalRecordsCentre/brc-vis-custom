(function($) {

  console.log("PoMS library loaded")

  $(document).ready(function () {
    console.log("Generate PoMS chart")
    console.log("data", drupalSettings)
    var repdataAll = JSON.parse(drupalSettings.brc_vis.data)
    //pomsSelectFlower(repdataAll['poms-donuts-1'] ,'#brc-vis-content')
    // Call pomsSelectFlower using the first named report
    pomsSelectFlower(repdataAll[Object.keys(repdataAll)[0]] ,'#brc-vis-content')
  })
  
  // Declare stuff useful to more than one data formatting function
  var chartDataAll = [
    {
      name: "Bumblebees",
      colour: '#5A99D3',
      image: '/libraries/brcvis/poms/images/Bumblebees.png'
    },
    {
      name: "Honeybees",
      colour: '#EB7C30',
      image: '/libraries/brcvis/poms/images/Honeybees.png'
    },
    {
      name: "Solitary bees",
      colour: '#A3A3A3',
      image: '/libraries/brcvis/poms/images/Solitary bees.png'
    },
    {
      name: "Wasps",
      colour: '#FFBF00',
      image: '/libraries/brcvis/poms/images/Wasps.png'
    },
    {
      name: "Hoverflies",
      colour: '#4472C3',
      image: '/libraries/brcvis/poms/images/Hoverflies.png'
    },
    {
      name: "Other flies",
      colour: '#70AB46',
      image: '/libraries/brcvis/poms/images/Other flies.png'
    },
    {
      name: "Butterflies and moths",
      colour: '#1F5380',
      image: '/libraries/brcvis/poms/images/Butterflies and moths.png'
    },
    {
      name: "Beetles",
      colour: '#9D480E',
      image: '/libraries/brcvis/poms/images/Beetles.png'
    },
    {
      name: "Small insects (<3mm)",
      colour: '#626262',
      image: '/libraries/brcvis/poms/images/Aphid_BHL.png'
    },
    {
      name: "Other insects",
      colour: '#977200',
      image: '/libraries/brcvis/poms/images/Other insects.png'
    }
  ]

  var flowersAll = [
    {
      name: "Bramble (Blackberry) - Rubus fruticosus",
      short: "Bramble (Blackberry)",
      html: "Bramble (Blackberry) - <i>Rubus fruticosus</i>"
    },
    {
      name: "Buddleja",
      short: "Buddleja",
      html: "Buddleja",
    },
    {
      name: "Buttercup - Ranunculus species",
      short: "Buttercup",
      html: "Buttercup - <i>Ranunculus</i> species"
    },
    {
      name: "Dandelion - Taraxacum officinale",
      short: "Dandelion",
      html: "Dandelion - <i>Taraxacum officinale</i>"
    },
    {
      name: "Hawthorn - Crataegus",
      short: "Hawthorn",
      html: "Hawthorn - <i>Crataegus</i>"
    },
    {
      name: "Heathers - Calluna and Erica species",
      short: "Heathers",
      html: "Heathers - <i>Calluna</i> and <i>Erica</i> species"
    },
    {
      name: "Hogweed - Heracleum sphondylium",
      short: "Hogweed",
      html: "Hogweed - <i>Heracleum sphondylium</i>"
    },
    {
      name: "Ivy - Hedera",
      short: "Ivy",
      html: "Ivy - <i>Hedera</i>"
    },
    {
      name: "Knapweeds (Common or Greater) - Centaurea nigra or scabiosa",
      short: "Knapweeds (Common or Greater)",
      html: "Knapweeds (Common or Greater) - <i>Centaurea nigra</i> or <i>scabiosa</i>"
    },
    {
      name: "Lavender (English) - Lavandula angustifolia",
      short: "Lavender (English)",
      html: "Lavender (English) - <i>Lavandula angustifolia</i>"
    },
    // {
    //   name: "Other - please describe below",
    //   html: "Other flowering plant"
    // },
    {
      name: "Ragwort - Jacobaea/Senecio species",
      short: "Ragwort",
      html: "Ragwort - <i>Jacobaea/Senecio</i> species"
    },
    {
      name: "Thistle - Cirsium or Carduus",
      short: "Thistle",
      html: "Thistle - <i>Cirsium</i> or <i>Carduus</i>"
    },
    {
      name: "White Clover - Trifolium repens",
      short: "White Clover",
      html: "White Clover - <i>Trifolium repens</i>"
    },
    {
      name: "White Dead-nettle - Lamium album",
      short: "White Dead-nettle",
      html: "White Dead-nettle - <i>Lamium album</i>"
    },
  ]

  function getConfigOpt(opt, defaultVal) {
    return drupalSettings.brc_vis.config[opt] ? drupalSettings.brc_vis.config[opt] : defaultVal
  }

  function formatDataBySample(repdata) {
    var dataBySample={}
    repdata.forEach(function(d){
      var grp = d.taxon

      if (!dataBySample[d.sample]) {
        dataBySample[d.sample] = {
          flower: d.flower
        }
      } 
      
      if (dataBySample[d.sample][grp]) {
        dataBySample[d.sample][grp] = dataBySample[d.sample][grp] + Number(d.pomscount)
      } else {
        dataBySample[d.sample][grp] = Number(d.pomscount)
      }
    })
    // Convert from object to array
    return Object.keys(dataBySample).map(sample => dataBySample[sample])
  }

  function flowersFromData(data) {
    var flowers = []
    data.forEach(d => {
      // Flower
      if (flowers.indexOf(d.flower) === -1) {
        flowers.push(d.flower)
      } 
    })
    return flowers
  }

  function chartForFlower(data, f, titleDiv, chartDivId) {
    // Filter data to flower species
    var dataFiltered = data.filter(d => d.flower === f)

    // Get the insect groups recorded on this flower
    var groups = []
    dataFiltered.forEach(d => {
      var dGroups = Object.keys(d).filter(k => k !== 'flower')
      dGroups.forEach(g => {
        if (groups.indexOf(g) === -1) {
          groups.push(g)
        }
      })
    })
    
    // Create the chart data
    var chartData = chartDataAll.filter(cd => groups.indexOf(cd.name) !== -1)
    chartData.forEach(cd => {
      cd.number = dataFiltered.reduce((total,d) => {
        if(d[cd.name]) {
          return d[cd.name] + total
        } else {
          return total
        }
      }, 0) / dataFiltered.length
    })

    // Create html title caption for chart
    var iFlower = flowersAll.map(fl => fl.name).indexOf(f)
    var html = 'Percentage of all insects counted on <b>'
    if (iFlower > -1) {
      html = html + flowersAll[iFlower].html
    } else {
      html = html + f
    }
    html = html + '</b> belonging to each group. '
    html = html + 'A total of <b>' + chartData.reduce((total, cd) => total + cd.number * dataFiltered.length, 0)
    html = html + ' insects</b> were counted over '
    html = html + '<b>' + dataFiltered.length + ' samples</b>'
    html = html + ' - an average of <b>' + Math.round(chartData.reduce((total, cd) => total + cd.number, 0))
    html = html + ' insects per sample.'
    titleDiv.html(html)
    
    // Generate the chart
    brccharts.pie({
      selector: chartDivId,
      innerRadius: 100,
      radius: 200,
      data: chartData,
      expand: true
    })
  }

  function chartDataForFlower(data, f) {
    // Filter data to flower species
    var dataFiltered = data.filter(d => d.flower === f)

    // Get the insect groups recorded on this flower
    var groups = []
    dataFiltered.forEach(d => {
      var dGroups = Object.keys(d).filter(k => k !== 'flower')
      dGroups.forEach(g => {
        if (groups.indexOf(g) === -1) {
          groups.push(g)
        }
      })
    })
    
    // Create the chart data
    var chartData = chartDataAll.filter(cd => groups.indexOf(cd.name) !== -1)
    chartData.forEach(cd => {
      cd.number = dataFiltered.reduce((total,d) => {
        if(d[cd.name]) {
          return d[cd.name] + total
        } else {
          return total
        }
      }, 0) / dataFiltered.length
    })

    return {data: chartData, samples: dataFiltered.length}
  }

  function chartTitleForFlower(f, chartData){

    var iFlower = flowersAll.map(fl => fl.name).indexOf(f)
    var flower = iFlower > -1 ? flowersAll[iFlower].html : f
    var flowerShort = iFlower > -1 ? flowersAll[iFlower].short : f
    var insects = chartData.data.reduce((total, cd) => total + cd.number * chartData.samples, 0)
    var samples = chartData.samples
    var mean = Math.round(chartData.data.reduce((total, cd) => total + cd.number, 0))

    var html = drupalSettings.brc_vis.config.titleTemplate

    html = html ? html : 'No title specified with <b>titleTemplate</b> option.'
    html = html.replace('##plant##', flower)
    html = html.replace('##plant-short##', flowerShort)
    html = html.replace('##insects##', insects)
    html = html.replace('##samples##', samples)
    html = html.replace('##mean##', mean)

    return html
  }

  function pomsByFlower (repdata, selector){

    var data = formatDataBySample(repdata)
    var flowers = flowersFromData(data)
    
    flowers.forEach((f, i) => {
      // Create a new div for chart and title
      var parentDiv = d3.select(selector).append('div')
      var titleDiv = parentDiv.append('div')

      titleDiv.style('font-size', getConfigOpt('titleFontSize', '1.3em'))
      titleDiv.style('line-height', getConfigOpt('titleLineHeight', '1em'))
      titleDiv.style('margin-bottom', getConfigOpt('titleMarginBottom', '0.5em'))

      var div = parentDiv.append('div')
      div.attr('id', 'brcvis-flower-' + i)
      div.style('max-width', '600px')
      div.style('margin-bottom', '1em')

      //chartForFlower(data, f, titleDiv, '#brcvis-flower-' + i)

      // Get data formatted for chart (and sample number)
      var chartData = chartDataForFlower(data, f)

      // Set chart title
      titleDiv.html(chartTitleForFlower(f, chartData))

      // Generate the chart
      brccharts.pie({
        selector: '#brcvis-flower-' + i,
        innerRadius: 100,
        legendWidth: getConfigOpt('legendWidth', 200),
        labelFontSize: getConfigOpt('labelFontSize', 14),
        radius: 200,
        data: chartData.data,
        expand: true
      })
    })
  }

  function pomsSelectFlower(repdata, selector){

    var data = formatDataBySample(repdata)

    // Create select, chart and title html elements
    var parentDiv = d3.select(selector).append('div')

    var input = parentDiv.append('select')
    input.style('margin-bottom', '1em')
    input.attr('id', 'poms-flower-select')

    var titleDiv = parentDiv.append('div')
    titleDiv.style('font-size', getConfigOpt('titleFontSize', '1.3em'))
    titleDiv.style('line-height', getConfigOpt('titleLineHeight', '1em'))
    titleDiv.style('margin-bottom', getConfigOpt('titleMarginBottom', '0.5em'))

    var div = parentDiv.append('div')
    div.attr('id', 'brcvis-flower-interactive')
    div.style('max-width', '600px')
    div.style('margin-bottom', '1em')

    // Populate the dropdown list
    flowersAll.forEach((f,i) => {
      const opt = input.append('option')
      opt.attr('value', f.name).text(getConfigOpt('shortDropdownNames', '') === 'true' ? f.short : f.name)
      if (i === 0) {
        opt.property('selected', true)
      }
    })

    // Handle user action
    input.on('change', () => {
      var f = d3.select('#poms-flower-select').property('value')

      // Get data formatted for chart (and sample number)
      var chartData = chartDataForFlower(data, f)

      // Set chart title
      titleDiv.html(chartTitleForFlower(f, chartData))

      // Reset chart data
      chart.setChartOpts({data: chartData.data}) 
    })

    
    // Get initial data and set caption
    var f = d3.select('#poms-flower-select').property('value')
    var chartData = chartDataForFlower(data, f)
    titleDiv.html(chartTitleForFlower(f, chartData))

    // Generate the initial chart and get reference to chart for use
    // in select handler
    var chart = brccharts.pie({
      selector: '#brcvis-flower-interactive',
      innerRadius: 100,
      legendWidth: getConfigOpt('legendWidth', 200),
      labelFontSize: getConfigOpt('labelFontSize', 14),
      radius: 200,
      data: chartData.data,
      expand: true
    })
  }
})(jQuery)
