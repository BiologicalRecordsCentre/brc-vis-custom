(function ($) {

  $(document).ready(function () {
    console.log('Custom iRecord atlas library loaded')

    var viridis = ["#440154","#440256","#450457","#450559","#46075a","#46085c","#460a5d","#460b5e","#470d60","#470e61","#471063","#471164","#471365","#481467","#481668","#481769","#48186a","#481a6c","#481b6d","#481c6e","#481d6f","#481f70","#482071","#482173","#482374","#482475","#482576","#482677","#482878","#482979","#472a7a","#472c7a","#472d7b","#472e7c","#472f7d","#46307e","#46327e","#46337f","#463480","#453581","#453781","#453882","#443983","#443a83","#443b84","#433d84","#433e85","#423f85","#424086","#424186","#414287","#414487","#404588","#404688","#3f4788","#3f4889","#3e4989","#3e4a89","#3e4c8a","#3d4d8a","#3d4e8a","#3c4f8a","#3c508b","#3b518b","#3b528b","#3a538b","#3a548c","#39558c","#39568c","#38588c","#38598c","#375a8c","#375b8d","#365c8d","#365d8d","#355e8d","#355f8d","#34608d","#34618d","#33628d","#33638d","#32648e","#32658e","#31668e","#31678e","#31688e","#30698e","#306a8e","#2f6b8e","#2f6c8e","#2e6d8e","#2e6e8e","#2e6f8e","#2d708e","#2d718e","#2c718e","#2c728e","#2c738e","#2b748e","#2b758e","#2a768e","#2a778e","#2a788e","#29798e","#297a8e","#297b8e","#287c8e","#287d8e","#277e8e","#277f8e","#27808e","#26818e","#26828e","#26828e","#25838e","#25848e","#25858e","#24868e","#24878e","#23888e","#23898e","#238a8d","#228b8d","#228c8d","#228d8d","#218e8d","#218f8d","#21908d","#21918c","#20928c","#20928c","#20938c","#1f948c","#1f958b","#1f968b","#1f978b","#1f988b","#1f998a","#1f9a8a","#1e9b8a","#1e9c89","#1e9d89","#1f9e89","#1f9f88","#1fa088","#1fa188","#1fa187","#1fa287","#20a386","#20a486","#21a585","#21a685","#22a785","#22a884","#23a983","#24aa83","#25ab82","#25ac82","#26ad81","#27ad81","#28ae80","#29af7f","#2ab07f","#2cb17e","#2db27d","#2eb37c","#2fb47c","#31b57b","#32b67a","#34b679","#35b779","#37b878","#38b977","#3aba76","#3bbb75","#3dbc74","#3fbc73","#40bd72","#42be71","#44bf70","#46c06f","#48c16e","#4ac16d","#4cc26c","#4ec36b","#50c46a","#52c569","#54c568","#56c667","#58c765","#5ac864","#5cc863","#5ec962","#60ca60","#63cb5f","#65cb5e","#67cc5c","#69cd5b","#6ccd5a","#6ece58","#70cf57","#73d056","#75d054","#77d153","#7ad151","#7cd250","#7fd34e","#81d34d","#84d44b","#86d549","#89d548","#8bd646","#8ed645","#90d743","#93d741","#95d840","#98d83e","#9bd93c","#9dd93b","#a0da39","#a2da37","#a5db36","#a8db34","#aadc32","#addc30","#b0dd2f","#b2dd2d","#b5de2b","#b8de29","#bade28","#bddf26","#c0df25","#c2df23","#c5e021","#c8e020","#cae11f","#cde11d","#d0e11c","#d2e21b","#d5e21a","#d8e219","#dae319","#dde318","#dfe318","#e2e418","#e5e419","#e7e419","#eae51a","#ece51b","#efe51c","#f1e51d","#f4e61e","#f6e620","#f8e621","#fbe723","#fde725"]
    var ylorred = ["#ffffcc","#fffecb","#fffec9","#fffdc8","#fffdc6","#fffcc5","#fffcc4","#fffbc2","#fffac1","#fffac0","#fff9be","#fff9bd","#fff8bb","#fff8ba","#fff7b9","#fff6b7","#fff6b6","#fff5b5","#fff5b3","#fff4b2","#fff4b0","#fff3af","#fff2ae","#fff2ac","#fff1ab","#fff1aa","#fff0a8","#fff0a7","#ffefa6","#ffeea4","#ffeea3","#ffeda2","#ffeda0","#ffec9f","#ffeb9d","#ffeb9c","#ffea9b","#ffea99","#ffe998","#ffe897","#ffe895","#ffe794","#ffe693","#ffe691","#ffe590","#ffe48f","#ffe48d","#ffe38c","#fee28b","#fee289","#fee188","#fee087","#fee085","#fedf84","#fede83","#fedd82","#fedc80","#fedc7f","#fedb7e","#feda7c","#fed97b","#fed87a","#fed778","#fed777","#fed676","#fed574","#fed473","#fed372","#fed270","#fed16f","#fed06e","#fecf6c","#fece6b","#fecd6a","#fecb69","#feca67","#fec966","#fec865","#fec764","#fec662","#fec561","#fec460","#fec25f","#fec15e","#fec05c","#febf5b","#febe5a","#febd59","#febb58","#feba57","#feb956","#feb855","#feb754","#feb553","#feb452","#feb351","#feb250","#feb14f","#feb04e","#feae4d","#fead4d","#feac4c","#feab4b","#feaa4a","#fea84a","#fea749","#fea648","#fea547","#fea347","#fea246","#fea145","#fda045","#fd9e44","#fd9d44","#fd9c43","#fd9b42","#fd9942","#fd9841","#fd9741","#fd9540","#fd9440","#fd923f","#fd913f","#fd8f3e","#fd8e3e","#fd8d3d","#fd8b3c","#fd893c","#fd883b","#fd863b","#fd853a","#fd833a","#fd8139","#fd8039","#fd7e38","#fd7c38","#fd7b37","#fd7937","#fd7736","#fc7535","#fc7335","#fc7234","#fc7034","#fc6e33","#fc6c33","#fc6a32","#fc6832","#fb6731","#fb6531","#fb6330","#fb6130","#fb5f2f","#fa5d2e","#fa5c2e","#fa5a2d","#fa582d","#f9562c","#f9542c","#f9522b","#f8512b","#f84f2a","#f74d2a","#f74b29","#f64929","#f64828","#f54628","#f54427","#f44227","#f44127","#f33f26","#f23d26","#f23c25","#f13a25","#f03824","#f03724","#ef3524","#ee3423","#ed3223","#ed3123","#ec2f22","#eb2e22","#ea2c22","#e92b22","#e92921","#e82821","#e72621","#e62521","#e52420","#e42220","#e32120","#e22020","#e11f20","#e01d20","#df1c20","#de1b20","#dd1a20","#dc1920","#db1820","#da1720","#d91620","#d81520","#d71420","#d51320","#d41221","#d31121","#d21021","#d10f21","#cf0e21","#ce0d21","#cd0d22","#cc0c22","#ca0b22","#c90a22","#c80a22","#c60923","#c50823","#c40823","#c20723","#c10723","#bf0624","#be0624","#bc0524","#bb0524","#b90424","#b80424","#b60425","#b50325","#b30325","#b10325","#b00225","#ae0225","#ac0225","#ab0225","#a90125","#a70126","#a50126","#a40126","#a20126","#a00126","#9e0126","#9c0026","#9a0026","#990026","#970026","#950026","#930026","#910026","#8f0026","#8d0026","#8b0026","#8a0026","#880026","#860026","#840026","#820026","#800026"]
    var ylorred2 = ["#fff4b0","#fff3af","#fff2ae","#fff2ac","#fff1ab","#fff1aa","#fff0a8","#fff0a7","#ffefa6","#ffeea4","#ffeea3","#ffeda2","#ffeda0","#ffec9f","#ffeb9d","#ffeb9c","#ffea9b","#ffea99","#ffe998","#ffe897","#ffe895","#ffe794","#ffe693","#ffe691","#ffe590","#ffe48f","#ffe48d","#ffe38c","#fee28b","#fee289","#fee188","#fee087","#fee085","#fedf84","#fede83","#fedd82","#fedc80","#fedc7f","#fedb7e","#feda7c","#fed97b","#fed87a","#fed778","#fed777","#fed676","#fed574","#fed473","#fed372","#fed270","#fed16f","#fed06e","#fecf6c","#fece6b","#fecd6a","#fecb69","#feca67","#fec966","#fec865","#fec764","#fec662","#fec561","#fec460","#fec25f","#fec15e","#fec05c","#febf5b","#febe5a","#febd59","#febb58","#feba57","#feb956","#feb855","#feb754","#feb553","#feb452","#feb351","#feb250","#feb14f","#feb04e","#feae4d","#fead4d","#feac4c","#feab4b","#feaa4a","#fea84a","#fea749","#fea648","#fea547","#fea347","#fea246","#fea145","#fda045","#fd9e44","#fd9d44","#fd9c43","#fd9b42","#fd9942","#fd9841","#fd9741","#fd9540","#fd9440","#fd923f","#fd913f","#fd8f3e","#fd8e3e","#fd8d3d","#fd8b3c","#fd893c","#fd883b","#fd863b","#fd853a","#fd833a","#fd8139","#fd8039","#fd7e38","#fd7c38","#fd7b37","#fd7937","#fd7736","#fc7535","#fc7335","#fc7234","#fc7034","#fc6e33","#fc6c33","#fc6a32","#fc6832","#fb6731","#fb6531","#fb6330","#fb6130","#fb5f2f","#fa5d2e","#fa5c2e","#fa5a2d","#fa582d","#f9562c","#f9542c","#f9522b","#f8512b","#f84f2a","#f74d2a","#f74b29","#f64929","#f64828","#f54628","#f54427","#f44227","#f44127","#f33f26","#f23d26","#f23c25","#f13a25","#f03824","#f03724","#ef3524","#ee3423","#ed3223","#ed3123","#ec2f22","#eb2e22","#ea2c22","#e92b22","#e92921","#e82821","#e72621","#e62521","#e52420","#e42220","#e32120","#e22020","#e11f20","#e01d20","#df1c20","#de1b20","#dd1a20","#dc1920","#db1820","#da1720","#d91620","#d81520","#d71420","#d51320","#d41221","#d31121","#d21021","#d10f21","#cf0e21","#ce0d21","#cd0d22","#cc0c22","#ca0b22","#c90a22","#c80a22","#c60923","#c50823","#c40823","#c20723","#c10723","#bf0624","#be0624","#bc0524","#bb0524","#b90424","#b80424","#b60425","#b50325","#b30325","#b10325","#b00225","#ae0225","#ac0225","#ab0225","#a90125","#a70126","#a50126","#a40126","#a20126","#a00126","#9e0126","#9c0026","#9a0026","#990026","#970026","#950026","#930026","#910026","#8f0026","#8d0026","#8b0026","#8a0026","#880026","#860026","#840026","#820026","#800026"]
    var turbo = ["#23171b","#271a28","#2b1c33","#2f1e3f","#32204a","#362354","#39255f","#3b2768","#3e2a72","#402c7b","#422f83","#44318b","#453493","#46369b","#4839a2","#493ca8","#493eaf","#4a41b5","#4a44bb","#4b46c0","#4b49c5","#4b4cca","#4b4ecf","#4b51d3","#4a54d7","#4a56db","#4959de","#495ce2","#485fe5","#4761e7","#4664ea","#4567ec","#446aee","#446df0","#426ff2","#4172f3","#4075f5","#3f78f6","#3e7af7","#3d7df7","#3c80f8","#3a83f9","#3985f9","#3888f9","#378bf9","#368df9","#3590f8","#3393f8","#3295f7","#3198f7","#309bf6","#2f9df5","#2ea0f4","#2da2f3","#2ca5f1","#2ba7f0","#2aaaef","#2aaced","#29afec","#28b1ea","#28b4e8","#27b6e6","#27b8e5","#26bbe3","#26bde1","#26bfdf","#25c1dc","#25c3da","#25c6d8","#25c8d6","#25cad3","#25ccd1","#25cecf","#26d0cc","#26d2ca","#26d4c8","#27d6c5","#27d8c3","#28d9c0","#29dbbe","#29ddbb","#2adfb8","#2be0b6","#2ce2b3","#2de3b1","#2ee5ae","#30e6ac","#31e8a9","#32e9a6","#34eba4","#35eca1","#37ed9f","#39ef9c","#3af09a","#3cf197","#3ef295","#40f392","#42f490","#44f58d","#46f68b","#48f788","#4af786","#4df884","#4ff981","#51fa7f","#54fa7d","#56fb7a","#59fb78","#5cfc76","#5efc74","#61fd71","#64fd6f","#66fd6d","#69fd6b","#6cfd69","#6ffe67","#72fe65","#75fe63","#78fe61","#7bfe5f","#7efd5d","#81fd5c","#84fd5a","#87fd58","#8afc56","#8dfc55","#90fb53","#93fb51","#96fa50","#99fa4e","#9cf94d","#9ff84b","#a2f84a","#a6f748","#a9f647","#acf546","#aff444","#b2f343","#b5f242","#b8f141","#bbf03f","#beef3e","#c1ed3d","#c3ec3c","#c6eb3b","#c9e93a","#cce839","#cfe738","#d1e537","#d4e336","#d7e235","#d9e034","#dcdf33","#dedd32","#e0db32","#e3d931","#e5d730","#e7d52f","#e9d42f","#ecd22e","#eed02d","#f0ce2c","#f1cb2c","#f3c92b","#f5c72b","#f7c52a","#f8c329","#fac029","#fbbe28","#fdbc28","#feb927","#ffb727","#ffb526","#ffb226","#ffb025","#ffad25","#ffab24","#ffa824","#ffa623","#ffa323","#ffa022","#ff9e22","#ff9b21","#ff9921","#ff9621","#ff9320","#ff9020","#ff8e1f","#ff8b1f","#ff881e","#ff851e","#ff831d","#ff801d","#ff7d1d","#ff7a1c","#ff781c","#ff751b","#ff721b","#ff6f1a","#fd6c1a","#fc6a19","#fa6719","#f96418","#f76118","#f65f18","#f45c17","#f25916","#f05716","#ee5415","#ec5115","#ea4f14","#e84c14","#e64913","#e44713","#e24412","#df4212","#dd3f11","#da3d10","#d83a10","#d5380f","#d3360f","#d0330e","#ce310d","#cb2f0d","#c92d0c","#c62a0b","#c3280b","#c1260a","#be2409","#bb2309","#b92108","#b61f07","#b41d07","#b11b06","#af1a05","#ac1805","#aa1704","#a81604","#a51403","#a31302","#a11202","#9f1101","#9d1000","#9b0f00","#9a0e00","#980e00","#960d00","#950c00","#940c00","#930c00","#920c00","#910b00","#910c00","#900c00","#900c00","#900c00"]
    var hectadData=[]
    var busy
    setBusy(false)
 
    // GUI
    var $main = $('#brc-vis-content')

    // GUI divs for custom scripts
    //var $csTaxa = $('<div id="taxa-cs-control"></div>').appendTo($main)
    var $csHectad = $('<div id="hectad-map-cs-control"></div>').appendTo($main)
    var $csPhenology = $('<div id="phenology-cs-control"></div>').appendTo($main)
    var $csYearly = $('<div id="yearly-cs-control"></div>').appendTo($main)
    var $csVerification = $('<div id="verification-cs-control"></div>').appendTo($main)

    //getTaxa()

    // GUI Left/Right panels
    var $panels = $('<div style="display: flex; flex-wrap: wrap">').appendTo($main)
    var $panelLeft = $('<div style="flex: 1;">').appendTo($panels)
    //var $panelMiddle = $('<div style="flex: 0.5; min-width: 300px; margin-left: 10px">').appendTo($panels)
    var $panelRight = $('<div style="flex: 2; margin-left: 10px">').appendTo($panels)

    var $panelRightTop = $('<div style="display: flex; flex-wrap: wrap">').appendTo($panelRight)
    var $panelRightBottom = $('<div style="display: flex; flex-wrap: wrap">').appendTo($panelRight)

    var $panelRightTop1 = $('<div style="flex: 1; min-width: 300px;">').appendTo($panelRightTop)
    var $panelRightTop2 = $('<div style="flex: 1; min-width: 300px;">').appendTo($panelRightTop)

    var $panelRightBottom1 = $('<div style="flex: 1; min-width: 300px;">').appendTo($panelRightBottom)
    var $panelRightBottom2 = $('<div style="flex: 1; min-width: 300px;">').appendTo($panelRightBottom)


    // GUI Taxon control
    var $control = $('<div>').appendTo($panelLeft)
    $control.css('margin', '0.5em 0')
    var $taxon = $('<input type="text" placeholder="Accepted taxon name" id="atlas-taxon"></input>').appendTo($control)
    var $button = $('<button id="atlas-button">Display</button>').appendTo($control)
    $button.click(taxonSelected)

    // Busy indicator
    var busy = $('<div class="lds-ellipsis" style="display: none"><div></div><div></div><div></div><div></div></div>').appendTo($control)

    // GUI Map
    var $map = $('<div id="atlas-map">').appendTo($panelLeft)
    var brcmap = brcatlas.svgMap({
      selector: "#atlas-map",
      mapTypesKey: 'hectad',
      legendOpts: {display: true,
        scale: 0.8,
        x: 10,
        y: 10
      },
      onclick: mapClick,
      mapTypesSel: {
        'hectad': getHectads,
        'hectad-colour': getHectadsColour
      },
      transOptsKey: 'BI4',
      expand: true
    })

    // GUI Map controls
    var $mapControls = $('<div id="atlas-map-controls">').appendTo($panelLeft)
    var $hc = $('<input type="checkbox" id="hectad-colour">').appendTo($mapControls)
    var $hl = $('<label for="hectad-colour">Colour record number</label>').appendTo($mapControls)
    var $ct = $('<span id="hectad-click-text">').appendTo($mapControls)
    $ct.html('<span style="color: silver">Click on a dot for info</span>')
    $hl.css('margin-top', '1px')
    $hl.css('margin-left', '0.5em')
    $hl.css('font-weight', 'normal')
    $hc.on('change', function(){
      if(this.checked) {
        brcmap.setMapType('hectad-colour')
      } else {
        brcmap.setMapType('hectad')
      }
      brcmap.redrawMap()
    })

    // GUI Phenology
    $('<div id="atlas-phenology">').appendTo($panelRightTop1)
    var phen1 = brccharts.phen1({
      selector: '#atlas-phenology',
      legendFontSize: 14,
      data: [],
      taxa: ['taxon'],
      metrics: [{ prop: 'n', label: 'Records per week', colour: 'blue' }],
      width: 290,
      height: 200,
      headPad: 35,
      perRow: 1,
      expand: true,
      showTaxonLabel: false
    })

    // GUI Records yearly
    $('<div id="atlas-yearly">').appendTo($panelRightTop2)

    var yearly = brccharts.yearly({
      selector: '#atlas-yearly',
      legendFontSize: 14,
      data: [],
      metrics: [{ prop: 'n', label: 'Records per year', opacity: 1}],
      taxa: ['taxon'],
      minYear: 1990,
      maxYear: 2021,
      width: 290,
      height: 200,
      headPad: 35,
      margin: {left: 35, bottom: 10, top: 6},
      perRow: 1,
      expand: true,
      showTaxonLabel: false,
      showLegend: true
    })

    // GUI pies chart for verification
    $('<div id="atlas-verification-1">').appendTo($panelRightBottom1)
    $('<div id="atlas-verification-2">').appendTo($panelRightBottom2)

    var verification1 = brccharts.pie({
      selector: '#atlas-verification-1',
      innerRadius: 35,
      radius: 70,
      title: 'Verification status',
      titleFontSize: 14,
      data: [
        {
          name: "No status",
          number: 0,
          colour: '#00000055',
        },
        {
          name: "Accepted",
          number: 0,
          colour: '#008000',
        },
        {
          name: "Not reviewed",
          number: 0,
          colour: '#FFA500',
        },
        {
          name: "Not accepted",
          number: 0,
          colour: '#FF0000',
        }
      ],
      expand: true,
      legendSwatchSize: 15,
      legendWidth: 125,
      legendSwatchGap: 5,
      labelFontSize: 12,
      imageWidth: 40
    })

    var verification2 = brccharts.pie({
      selector: '#atlas-verification-2',
      innerRadius: 35,
      radius: 70,
      title: 'Verification sub-status',
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

    // GUI General info
    var $info = $('<div id="atlas-info"></div>').appendTo($main)

    // Callback functions for when data loaded
    if (typeof(indiciaFns) !== "undefined") {
      // Taxa list
      // indiciaFns.taxaList = function (el, sourceSettings, response) {
      //   console.log(response)
      // }

      // Hectad distribution map
      indiciaFns.hectadMap = function (el, sourceSettings, response) {
        
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
            console.log(h.gr)
            existing.recs += h.recs
          } else {
            a.push({gr: h.gr, recs: h.recs})
          }
          return a
        }, [])
        brcmap.redrawMap()
        busy.map = false
        setBusy()
      }

      // Phenology chart
      indiciaFns.phenologyChart = function (el, sourceSettings, response) {
        var phen1Data = []
        for (i=1; i<=53; i++) {
          phen1Data.push ({
            taxon: 'taxon',
            week: i,
            n: 0
          })
        }
        response.aggregations._rows.buckets.filter(function(w) {return w.key['event-week']}).forEach(function(w) {
          phen1Data[w.key['event-week']-1].n = w.doc_count
        })
        // Update the phenology chart
        phen1.setChartOpts({
          data: phen1Data,
        })
        busy.phen = false
        setBusy()
      }

      // Yearly chart
      indiciaFns.yearlyChart = function (el, sourceSettings, response) {
        //console.log('yearly', response.aggregations._rows.buckets)
        var yearlyData = response.aggregations._rows.buckets.filter(function(w) {return w.key['event-year']}).map(function(y) {
          return {
            taxon: 'taxon',
            year: y.key['event-year'],
            n: y.doc_count
          }
        })
        yearly.setChartOpts({
          data: yearlyData,
        })
        busy.yearly = false
        setBusy()
      }

      // Verification status pie chart
      indiciaFns.verificationChart = function (el, sourceSettings, response) {

        var data1 = [
          {
            name: "No status",
            number: 0,
            colour: '#00000055',
          },
          {
            name: "Accepted",
            number: 0,
            colour: '#008000',
            image: 'libraries/brcvis/irecord/images/considered-correct.png',
          },
          {
            name: "Not reviewed",
            number: 0,
            colour: '#FFA500',
          },
          {
            name: "Not accepted",
            number: 0,
            colour: '#FF0000',
            image: 'libraries/brcvis/irecord/images/incorrect.png',
          }
        ]
        response.aggregations._rows.buckets.forEach(function(v) {
          var statuses = ['', 'V', 'C', 'R']
          var iStatus = statuses.indexOf(v.key['identification-verification_status'])
          if (iStatus === -1) iStatus = 0
          data1[iStatus].number += v.doc_count
        })
        verification1.setChartOpts({data: data1.filter(function(v){return v.number})})

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
        verification2.setChartOpts({data: data2.filter(function(v){return v.number})})

        busy.verification = false
        setBusy()
      } 
    }

    function getTaxa() {
      // $csTaxa.addClass('idc-output')
      // $csTaxa.addClass('idc-output-customScript')

      // // ES source and custom script control for taxa list
      // indiciaData.esSources=[{
      //   id: "taxa-source",
      //   mode: "termAggregation",
      //   uniqueField: "taxon.accepted_taxon_id",
      //   fields: [
      //     "taxon.accepted_name"
      //   ],
      //   aggregation: {
      //     records: {
      //       cardinality: {
      //         field: "id"
      //       }
      //     }
      //   }
      // }]
      // $('#taxa-cs-control').idcCustomScript({
      //   id: 'taxa-custom-script',
      //   source: {'taxa-source': ''},
      //   functionName: 'taxaList',
      // })
      // indiciaFns.initDataSources();
      // indiciaFns.hookupDataSources();
      // indiciaFns.populateDataSources();
    }

    function taxonSelected() {

      setBusy(true)

      $ct.html('<span style="color: silver">Click on a dot for info</span>')
      
      //$csTaxa.removeClass('idc-output')
      //$csTaxa.removeClass('idc-output-customScript')
      $csHectad.addClass('idc-output')
      $csHectad.addClass('idc-output-customScript')
      $csPhenology.addClass('idc-output')
      $csPhenology.addClass('idc-output-customScript')
      $csYearly.addClass('idc-output')
      $csYearly.addClass('idc-output-customScript')
      $csVerification.addClass('idc-output')
      $csVerification.addClass('idc-output-customScript')

      indiciaData.esSources = []

      // ES source and custom script control for Hectad mapping
      indiciaData.esSources.push({
        id: "hectad-map-source",
        mode: "compositeAggregation",
        uniqueField: "location.grid_square.10km.centre",
        fields: [
          "location.grid_square.10km.centre"
        ],
        filterBoolClauses: {
          "must":[
            {"query_type": "match_phrase","field": "taxon.accepted_name","value":$taxon.val()}
          ]
        }
      })
      $('#hectad-map-cs-control').idcCustomScript({
        id: 'hectad-map-custom-script',
        source: {'hectad-map-source': ''},
        functionName: 'hectadMap',
      })

      // ES source and custom script control for phenology chart
      indiciaData.esSources.push({
        id: "phenology-source",
        mode: "compositeAggregation",
        uniqueField: "event.week",
        fields: [
          "event.week"
        ],
        filterBoolClauses: {
          "must":[
            {"query_type": "match_phrase","field": "taxon.accepted_name","value":$taxon.val()}
          ]
        }
      })
      $('#phenology-cs-control').idcCustomScript({
        id: 'phenology-custom-script',
        source: {'phenology-source': ''},
        functionName: 'phenologyChart',
      })

      // ES source and custom script control for yearly chart
      indiciaData.esSources.push({
        id: "yearly-source",
        mode: "compositeAggregation",
        uniqueField: "event.year",
        fields: [
          "event.year"
        ],
        filterBoolClauses: {
          "must":[
            {"query_type": "match_phrase","field": "taxon.accepted_name","value":$taxon.val()}
          ]
        }
      })
      $('#yearly-cs-control').idcCustomScript({
        id: 'yearly-custom-script',
        source: {'yearly-source': ''},
        functionName: 'yearlyChart',
      })

      // ES source and custom script control for verification pie chart
      indiciaData.esSources.push({
        size: 0,
        id: "verification-source",
        mode: "compositeAggregation",
        uniqueField: "identification.verification_status",
        uniqueField: "identification.verification_substatus",
        fields: [
          "identification.verification_status",
          "identification.verification_substatus"
        ],
        filterBoolClauses: {
          "must":[
            {"query_type": "match_phrase","field": "taxon.accepted_name","value":$taxon.val()}
          ]
        }
      })
      $('#verification-cs-control').idcCustomScript({
        id: 'verification-custom-script',
        source: {'verification-source': ''},
        functionName: 'verificationChart',
      })

      indiciaFns.initDataSources();
      indiciaFns.hookupDataSources();
      indiciaFns.populateDataSources();
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

    function getHectadsColour() {

      return new Promise(function (resolve, reject) {
        // At this stage, there might be some records without a 
        // resolved hectad (possibly outside UK?) so filter these out.
        var colour = d3.scaleQuantize()
          .domain(d3.extent(hectadData, function(h) {return Math.log(h.recs)}))
          .range(viridis)

        var recs = hectadData.filter(function(h){return h.gr}).map(function(h) {
          return {
            gr: h.gr,
            id: h.gr,
            colour: colour(Math.log(h.recs)),
            caption: h.recs
          }
        })
        resolve({
          records: recs,
          size: 1,
          precision: 10000,
          shape: 'circle',
          opacity: 1,
          // legend: {
          //   precision: 10000,
          //   size: 1,
          //   lines: [
          //     {
          //       colour: 'magenta',
          //       shape: 'triangle-up',
          //       text: 'Araneus diadematus only'
          //     },
          //     {
          //       colour: 'blue',
          //       shape: 'triangle-down',
          //       text: 'Araneus quadratus only',
          //     },
          //   ]
          // }
        })
      })
    }

    function setBusy(init) {
      if (init === undefined) {
        if(busy.map || busy.phen || busy.yearly || busy.verification) {
          $('.lds-ellipsis').show()
        } else  {
          $('.lds-ellipsis').hide()
        }
      } else {
        busy = {
          map: init,
          phen: init,
          yearly: init,
          verification: init
        }
        if (init) {
          $('.lds-ellipsis').show()
        } else {
          $('.lds-ellipsis').hide()
        } 
      }
    }

    function mapClick(gr, id, caption) {
      console.log(gr, id, caption)

      var recs =  Number(caption) === 1 ? ' record' : ' records'
      $('#hectad-click-text').html(gr + ' - ' + caption + recs)
    }
  })

})(jQuery);