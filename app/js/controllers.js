'use strict';

/* Controllers */

var stavrCtrl = angular.module('stavrControllers', []);

stavrCtrl.controller('PhoneListCtrl', ['$scope', 'Phone',
  function($scope, Phone) {
    $scope.phones = Phone.query();
    $scope.orderProp = 'age';
  }]);

stavrCtrl.controller('PhoneDetailCtrl', ['$scope', '$routeParams', 'Phone',
  function($scope, $routeParams, Phone) {
    $scope.phone = Phone.get({phoneId: $routeParams.phoneId}, function(phone) {
      $scope.mainImageUrl = phone.images[0];
    });

    $scope.setImage = function(imageUrl) {
      $scope.mainImageUrl = imageUrl;
    };
  }]);






stavrCtrl.controller('ContentCtrl',['$scope','$routeParams',function($scope,$routeParams){
    $scope.$on('updateData',function(evt, data){

    });
}]);


/*
 * Three View  for   ViewCtrl => OverView
 *                   View1Ctrl => View1
 *                   View2Ctrl => View2
 */
stavrCtrl.controller('ViewCtrl',['$scope','$routeParams',function($scope,$routeParams){
   $scope.$on('updateData',function(evt, data){

   });
}]);
stavrCtrl.controller('View1Ctrl',['$scope','$routeParams','ActiveDataFactory',function($scope,$routeParams,ActiveDataFactory){
    $scope.$on('addVisualToolBox',function () {
        var seqBox = document.getElementById('seqBox');
    });
    $(".connectedSortable").sortable({
        placeholder: "sort-highlight",
        connectWith: ".connectedSortable",
        handle: ".box-header, .nav-tabs",
        forcePlaceholderSize: true,
        zIndex: 999999
    });
    $(".connectedSortable .box-header, .connectedSortable .nav-tabs-custom").css("cursor", "move");


    $scope.selectedStartDate = "2013-01-01";
    $scope.selectedEndDate = "2013-02-28";

    /* initialize the calendar
     -----------------------------------------------------------------*/
    //Date for the calendar events (dummy data)
    var start = $.fullCalendar.moment('2013-01-01');
    var date = new Date("2013-01-01");
    var d = date.getDate(),
        m = date.getMonth(),
        y = date.getFullYear();
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        buttonText: {
            today: 'today',
            month: 'month',
            week: 'week',
            day: 'day'
        },
        //Random default events
        events: [
            {
                title: 'All Day Event',
                start: new Date(y, m, 1),
                backgroundColor: "#f56954", //red
                borderColor: "#f56954" //red
            },
            {
                title: 'Long Event',
                start: new Date(y, m, d - 5),
                end: new Date(y, m, d - 2),
                backgroundColor: "#f39c12", //yellow
                borderColor: "#f39c12" //yellow
            },
            {
                title: 'Birthday Party',
                start: new Date(y, m, d + 1, 19, 0),
                end: new Date(y, m, d + 1, 22, 30),
                allDay: false,
                backgroundColor: "#00a65a", //Success (green)
                borderColor: "#00a65a" //Success (green)
            },
            {
                title: 'Click for Google',
                start: new Date(y, m, 28),
                end: new Date(y, m, 29),
                url: 'http://google.com/',
                backgroundColor: "#3c8dbc", //Primary (light-blue)
                borderColor: "#3c8dbc" //Primary (light-blue)
            }
        ],
        editable: true,
        defaultDate:start,
        eventRender:function(event,element){
            $(element).append().html("");
            var width = 310;
            var height = 60;
            var svg = d3.select(document.createElement("div")).append("svg")
                .attr("height",height).append("g");
            var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1);

            var y = d3.scale.linear()
                .range([height-10, 0]);

            var data =[{a:1,b:10},{a:2,b:20},{a:3,b:30},{a:4,b:15}];

            x.domain(data.map(function(d) { return d.a; }));
            y.domain([0, d3.max(data, function(d) { return d.b; })]);


            svg.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return x(d.a); })
                .attr("width", x.rangeBand())
                .attr("y", function(d) { return y(d.b); })
                .attr("height", function(d) { return height - y(d.b); });

            $(element).append(svg[0]);

        }




    });




    $scope.isSelectedDataTable = false;
    $scope.queryClick = function(){
        var tID = "";
        var tOwner = "";
        var carNumber = document.getElementById("TNumber").value;
        var tStartTime = document.getElementById("TStartTime").value;
        var tEndTime = document.getElementById("TEndTime").value;
        var typeFeature = "MultiPoint";

        var url = "http://localhost:8080/DataVisualor/ServletJson?"+
            "TID=&"+tID +
            "TOwner=&"+tOwner+
            "TNumber="+carNumber+"&"+
            "TStartTime="+tStartTime+"&"+
            "TEndTime=" + tEndTime+"&"+
            "Type="+typeFeature;

   //     $rootScope.$broadcast('updateTrajectory',url);



        //UpdateTrajectoryDataSever.url = url;

        //UpdateTrajectoryDataSever.resouce.get({ TID:tID,TOwner:tOwner,TNumber:carNumber,TStartTime:tStartTime,TEndTime:tEndTime},function(data){},{});

    };


    $scope.ClearResult = function () {
        $rootScope.$broadcast('removeTrajectory');
    }


    // response the click on tableView
    // response the click on tableView
    $scope.tableViewClick = function () {
        if($scope.selectTableView){

        }
    }
    


}]);
stavrCtrl.controller('View2Ctrl',['$scope','$routeParams',function($scope,$routeParams){
    $(".connectedSortable").sortable({
        placeholder: "sort-highlight",
        connectWith: ".connectedSortable",
        handle: ".box-header, .nav-tabs",
        forcePlaceholderSize: true,
        zIndex: 999999
    });
    $(".connectedSortable .box-header, .connectedSortable .nav-tabs-custom").css("cursor", "move");

    // control the update of views

    $scope.isSelectedDataTable = false;
    $scope.isUpdateMapView = false;
    $scope.isUpdateRelationView = false;
    $scope.isUpdateTimeView = false;
    $scope.isUpdateStackView = false;

    // response the click on tableView
    // response the click on tableView
    $scope.tableViewClick = function () {
        if($scope.selectTableView){
            var selectedData = $scope.selectTableView.rows('.active').data();
            if(selectedData.length>0)MapViewerSever.selectTrajectoryFeatures(selectedData[0][0]);
            else MapViewerSever.selectTrajectoryFeatures("");
        }
    };

}]);

/*
 *   control the main side bar 
 */
stavrCtrl.controller('mainSideBarCtrl',['$scope','$uibModal','$log',function($scope, $uibModal, $log){
    $scope.visualToolChoose = function(t){
        switch (t){
            case 'Line': callModalFun();
                break;
            default:

        }
    }

    $scope.items = ['item1', 'item2', 'item3'];

    $scope.animationsEnabled = true;

    var callModalFun = function (templateUrlHtml,size) {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'template/visualtoolhtml/visualtool.html',
            controller: 'ModalInstanceCtrl',
            size: 'lg',
            resolve: {
                items: function () {
                    return $scope.items;
                }
            }
        });

        // modalInstance.result.then(function (selectedItem) {
        //     $scope.selected = selectedItem;
        // }, function () {
        //     $log.info('Modal dismissed at: ' + new Date());
        // });
    };


    $scope.view2Click = function () {
        //Handle sidebar to collapse
        if (!( $("body").hasClass('sidebar-collapse') || $("body").hasClass('sidebar-open') ) ) {
            var naviBtn = document.getElementById("btnSideBar");
            naviBtn.click();
        }
    }

}]);

stavrCtrl.controller('MapCtrl',['$scope','MapViewerSever','StopEventlayerSever',function ($scope,MapViewerSever,StopEventlayerSever) {

    // $(".connectedSortable").sortable({
    //     placeholder: "sort-highlight",
    //     connectWith: ".connectedSortable",
    //     handle: ".box-header, .nav-tabs",
    //     forcePlaceholderSize: true,
    //     zIndex: 999999
    // });
    // $(".connectedSortable .box-header, .connectedSortable .nav-tabs-custom").css("cursor", "move");

    var  map = MapViewerSever.map ;
    var divMap = document.getElementById('map');
    map.setTarget(divMap);

    $scope.$on('updateTrajectory', function(evt, url) {

        var trajectoryLayer = new ol.layer.Vector();
        trajectoryLayer.setSource( new ol.source.Vector({
            url: url,
            format: new ol.format.GeoJSON()
        }));

        map.addLayer(trajectoryLayer);
     //   map.render();
    });

    // remove Layers
    $scope.$on('removeTrajectory', function (e,data) {

    });


    //add EventLayer
    var styleFunction = function (feature, resolution) {
        var startStyle = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: '#32CD32'
                    })
                })
            });

        return [startStyle];

    };

    // var urlgeoJsonFileSet = ["luoyuRoad.geojson","track20196.geojson","track18308.geojson","track19701.geojson"];
    // //var urlgeoJsonFileSet = ["luoyuRoad.geojson","track18308_8.geojson","track20196_19.geojson"];
    // var d3color = d3.scale.category10();
    // for(var i=0;i<urlgeoJsonFileSet.length;i++)
    // {
    //     var eventLayer = new ol.layer.Vector();
    //     eventLayer.setSource( new ol.source.Vector({
    //         url: urlgeoJsonFileSet[i],
    //         format: new ol.format.GeoJSON()
    //     }));
    //     if(i>0){
    //         eventLayer.setStyle(new ol.style.Style({
    //             image: new ol.style.Circle({
    //                 radius: 8,
    //                 fill: new ol.style.Fill({
    //                     color: d3color(i)
    //                 })
    //             })
    //         }));
    //     }
    //     else {
    //         eventLayer.setStyle(new ol.style.Style({
    //             stroke: new ol.style.Stroke({
    //                 color: '#ff0000',
    //                 width: 1
    //             })
    //         }));
    //     }
    //
    //    // eventLayer.setStyle(styleFunction);
    //     map.addLayer(eventLayer);
    //
    // }


    var urlgeoJsonFileSet = ["luoyuRoad.geojson","track18308.geojson"];
    var d3color = d3.scale.category10();
    for(var i=0;i<urlgeoJsonFileSet.length;i++)
    {
        var eventLayer = new ol.layer.Vector();
        eventLayer.setSource( new ol.source.Vector({
            url: urlgeoJsonFileSet[i],
            format: new ol.format.GeoJSON()
        }));
        if(i==1){
            eventLayer.setStyle(new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#ff7f0e',
                    width: 1
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: '#ff7f0e',
                        width: 3
                    })
                })
            }));
        }
        else if(i==2){
            eventLayer.setStyle(new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 8,
                    fill: new ol.style.Fill({
                        color: '#1f77b4'
                    })
                })
            }));
        }
        else {
            eventLayer.setStyle(new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#ff0000',
                    width: 1
                })
            }));
        }

        // eventLayer.setStyle(styleFunction);
        map.addLayer(eventLayer);

    }



    function getTableColumnValue(tableId, rowNumber, columnNumber) {
        var tableRef = document.getElementById(tableId);

        var elementRef = tableRef.rows[rowNumber].cells[columnNumber];
        var elementValue = '';

        if (elementRef.textContent) {
            // Firefox
            elementValue = elementRef.textContent;
        }
        else if (elementRef.innerText) {
            // IE
            elementValue = elementRef.innerText;
        }
        else {
            // Default
            elementValue = elementRef.innerHTML;
            var regExp = /<\/?[^>]+>/gi;

            elementValue = elementValue.replace(regExp, '');
        }

        //alert(elementValue);

        return elementValue;
    }


    // add Marker
    for(var i=0; i<0;i++)
    {
        var markerId = StopEventlayerSever();

        var pos = ol.proj.fromLonLat([114.3707, 30.52]);

        // Vienna marker
        var marker = new ol.Overlay({
            position: pos,
            positioning: 'center-center',
            element: document.getElementById(markerId),
            stopEvent: false
        });
        map.addOverlay(marker);
    }





}]);

stavrCtrl.controller('EventTimeGraphCtrl',['$scope','MapViewerSever','StopEventlayerSever',function($scope,MapViewerSever,StopEventlayerSever){
    // event time graph
    function renderTimeGraph()
    {
        if (data.length==geoJsonFileSet.length) {
            var color = d3.scale.category10();

            for(var i=0;i<data.length;i++)
            {
                data[i].name=trackName[i];
            }

            var width = document.getElementById("eventTimeGraph").offsetWidth
            if(width<=0) return;

            // create chart function
            var eventDropsChart = d3.chart.eventDrops()
                .eventLineColor(function (datum, index) {
                    return color(index);
                })
                .start(new Date(startTime))
                .end(new Date(endTime))
                .width(width)

            
            // bind data with DOM
            var element = d3.select("#eventTimeGraph").datum(data);

            // draw the chart
            eventDropsChart(element);
        }
    }

    var month = 30 * 24 * 60 * 60 * 1000;
    var hours = 60 * 60 * 1000;
    var endTime = 0;
    var startTime = Date.now();

    var geoJsonFileSet = ["track20196.geojson","track18308.geojson","track19701.geojson"];
    var trackName = ["taxi_20196","taxi_18308","taxi_19701"];
    var data = [];
    for(var i=0; i<geoJsonFileSet.length;i++)
    {
        var url = geoJsonFileSet[i];
        jQuery.getJSON(url,function(dataJson){

            var EventFeatures = dataJson;

            var EventFeatureSet = EventFeatures.features;
            var event = {
                name: name,
                dates: []
            };
            for(var i = 0; i<EventFeatureSet.length; i++)
            {
                var tableStr = jQuery.parseHTML(EventFeatureSet[i].properties.Description);
                var dateStrArry = tableStr[3].innerText.split('   ');
                var dateStr = dateStrArry[4].substr(5);
                var date = new Date(dateStr);
                var time = date.getTime();
                if(time<startTime) startTime = time;
                if(time>endTime) endTime = time;

                event.dates.push(date);
            }

            data.push(event);

            renderTimeGraph();
        });
    }
}]);

stavrCtrl.controller('RelationGraphCtrl',['$scope','MapViewerSever','StopEventlayerSever',function($scope,MapViewerSever,StopEventlayerSever){

    function name(d) { return d.name; }
    function group(d) { return d.group; }

    //var color = d3.scale.category10();
    var color = function(i){
        if(i==1) return '#1f77b4';
        else return '#ff7f0e';
    };
    function colorByGroup(d) { return color(group(d)); }

    var width = document.getElementById("relationGraph").offsetWidth
    var height = width * 0.5

    var svg = d3.select('#relationGraph')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    var node, link,nodes_labels;

    var voronoi = d3.geom.voronoi()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .clipExtent([[-10, -10], [width+10, height+10]]);

    function recenterVoronoi(nodes) {
        var shapes = [];
        voronoi(nodes).forEach(function(d) {
            if ( !d.length ) return;
            var n = [];
            d.forEach(function(c){
                n.push([ c[0] - d.point.x, c[1] - d.point.y ]);
            });
            n.point = d.point;
            shapes.push(n);
        });
        return shapes;
    }

    var force = d3.layout.force()
        .charge(-2000)
        .friction(0.3)
        .linkDistance(20)
        .size([width,height]);

    force.on('tick', function() {
        node.attr('transform', function(d) { return 'translate('+d.x+','+d.y+')'; })
            .attr('clip-path', function(d) { return 'url(#clip-'+d.index+')'; });

        link.attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

        nodes_labels.attr("x", function (d) {  return d.x;  });
        nodes_labels.attr("y", function (d) {  return d.y;  });


        var clip = svg.selectAll('.clip')
            .data( recenterVoronoi(node.data()), function(d) { return d.point.index; } );

        clip.enter().append('clipPath')
            .attr('id', function(d) { return 'clip-'+d.point.index; })
            .attr('class', 'clip');
        clip.exit().remove()

        clip.selectAll('path').remove();
        clip.append('path')
            .attr('d', function(d) { return 'M'+d.join(',')+'Z'; });
    });

    d3.json('mbar/relation.json', function(err, data) {

        data.nodes.forEach(function(d, i) {
            d.id = i;
        });

        link = svg.selectAll('.link')
            .data( data.links )
            .enter().append('line')
            .attr('class', 'link')
            .style("stroke-width", function(d) { return Math.sqrt(d.value); });

        node = svg.selectAll('.node')
            .data( data.nodes )
            .enter().append('g')
            .attr('title', name)
            .attr('class', 'node')
            .call( force.drag );



        node.append('circle')
            .attr('r', 20)
            .attr('fill', colorByGroup)
            .attr('fill-opacity', 0.5);

        node.append('circle')
            .attr('r', 4)
            .attr('stroke', 'black');

        //标签
        nodes_labels = svg.selectAll("text")
            .data(data.nodes)
            .enter()
            .append('text')
            .attr("dx", function (d, i) {
                return (data.nodes[i].name.length);
            })
            .attr("dy", 5)
            .attr("fill", "#fff")
            .style("font-size", 16)
            .text(function (d, i) {
                return data.nodes[i].name;
            });

        force
            .nodes( data.nodes )
            .links( data.links )
            .start();
    });

}]);

stavrCtrl.controller('StackedBarChartsCtrl',['$scope','MapViewerSever','StopEventlayerSever',function($scope,MapViewerSever,StopEventlayerSever){

    var w = document.getElementById("mbars").offsetWidth;
    if(w<=0) return;
    var h =0.6 * w;
    // var w = 530;                        //width
    // var h = 280;                        //height
    var padding = {top: 40, right: 40, bottom: 40, left:40};
    var dataset;
    //Set up stack method
    var stack = d3.layout.stack();

    d3.json("mbar/mperday.json",function(json){
        dataset = json;

        //Data, stacked
        stack(dataset);
        var color = d3.scale.category10();
        var color_hash = {
            0 : ["taxi_20196",color(0)],
            1 : ["taxi_18308",color(1)],
            2 : ["taxi_19701",color(2)]
        };


        //Set up scales
        var xScale = d3.time.scale()
            .domain([new Date(dataset[0][0].time),d3.time.day.offset(new Date(dataset[0][dataset[0].length-1].time),8)])
            .rangeRound([0, w-padding.left-padding.right]);

        var yScale = d3.scale.linear()
            .domain([0,
                d3.max(dataset, function(d) {
                    return d3.max(d, function(d) {
                        return d.y0 + d.y;
                    });
                })
            ])
            .range([h-padding.bottom-padding.top,0]);

        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(d3.time.days,1);

        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .ticks(10);



        //Easy colors accessible via a 10-step ordinal scale
        var colors = d3.scale.category10();

        //Create SVG element
        var svg = d3.select("#mbars")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        // Add a group for each row of data
        var groups = svg.selectAll("g")
            .data(dataset)
            .enter()
            .append("g")
            .attr("class","rgroups")
            .attr("transform","translate("+ padding.left + "," + (h - padding.bottom) +")")
            .style("fill", function(d, i) {
                return color_hash[dataset.indexOf(d)][1];
            });

        // Add a rect for each data value
        var rects = groups.selectAll("rect")
            .data(function(d) { return d; })
            .enter()
            .append("rect")
            .attr("width", 2)
            .style("fill-opacity",1e-6);


        rects.transition()
            .duration(function(d,i){
                return 500 * i;
            })
            .ease("linear")
            .attr("x", function(d) {
                return xScale(new Date(d.time));
            })
            .attr("y", function(d) {
                return -(- yScale(d.y0) - yScale(d.y) + (h - padding.top - padding.bottom)*2);
            })
            .attr("height", function(d) {
                return -yScale(d.y) + (h - padding.top - padding.bottom);
            })
            .attr("width", 15)
            .style("fill-opacity",1);

        svg.append("g")
            .attr("class","x axis")
            .attr("transform","translate(40," + (h - padding.bottom) + ")")
            .call(xAxis);


        svg.append("g")
            .attr("class","y axis")
            .attr("transform","translate(" + padding.left + "," + padding.top + ")")
            .call(yAxis);

        // adding legend

        var legend = svg.append("g")
            .attr("class","legend")
            .attr("x", w - padding.right - 65)
            .attr("y", 25)
            .attr("height", 100)
            .attr("width",100);

        legend.selectAll("g").data(dataset)
            .enter()
            .append('g')
            .each(function(d,i){
                var g = d3.select(this);
                g.append("rect")
                    .attr("x", w - padding.right - 65)
                    .attr("y", i*25 + 10)
                    .attr("width", 10)
                    .attr("height",10)
                    .style("fill",color_hash[String(i)][1]);

                g.append("text")
                    .attr("x", w - padding.right - 50)
                    .attr("y", i*25 + 20)
                    .attr("height",30)
                    .attr("width",100)
                    .style("fill",color_hash[String(i)][1])
                    .text(color_hash[String(i)][0]);
            });


        // y axis text
        svg.append("text")
            .attr("transform","rotate(-90)")
            .attr("y", 0 - 5)
            .attr("x", 0-(h/2))
            .attr("dy","1em")
            .text("Number of Events");
        // x axis text
        svg.append("text")
            .attr("class","xtext")
            .attr("x",w/2 - padding.left)
            .attr("y",h - 5)
            .attr("text-anchor","middle")
            .text("Days");

        // title text
        svg.append("text")
            .attr("class","title")
            .attr("x", (w / 2))
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("Number of Events per day.");

        //On click, update with new data
        d3.selectAll(".m")
            .on("click", function() {
                var date = this.getAttribute("value");

                var str;
                if(date == "2014-02-19"){
                    str = "mbar/19.json";
                }else if(date == "2014-02-20"){
                    str = "mbar/20.json";
                }else if(date == "2014-02-21"){
                    str = "mbar/21.json";
                }else if(date == "2014-02-22"){
                    str = "mbar/22.json";
                }else{
                    str = "mbar/23.json";
                }

                d3.json(str,function(json){

                    dataset = json;
                    stack(dataset);

                    console.log(dataset);

                    xScale.domain([new Date(0, 0, 0,dataset[0][0].time,0, 0, 0),new Date(0, 0, 0,dataset[0][dataset[0].length-1].time,0, 0, 0)])
                        .rangeRound([0, w-padding.left-padding.right]);

                    yScale.domain([0,
                            d3.max(dataset, function(d) {
                                return d3.max(d, function(d) {
                                    return d.y0 + d.y;
                                });
                            })
                        ])
                        .range([h-padding.bottom-padding.top,0]);

                    xAxis.scale(xScale)
                        .ticks(d3.time.hour,2)
                        .tickFormat(d3.time.format("%H"));

                    yAxis.scale(yScale)
                        .orient("left")
                        .ticks(10);

                    groups = svg.selectAll(".rgroups")
                        .data(dataset);

                    groups.enter().append("g")
                        .attr("class","rgroups")
                        .attr("transform","translate("+ padding.left + "," + (h - padding.bottom) +")")
                        .style("fill",function(d,i){
                            return color(i);
                        });


                    rects = groups.selectAll("rect")
                        .data(function(d){return d;});

                    rects.enter()
                        .append("rect")
                        .attr("x",w)
                        .attr("width",1)
                        .style("fill-opacity",1e-6);

                    rects.transition()
                        .duration(1000)
                        .ease("linear")
                        .attr("x",function(d){
                            return xScale(new Date(0, 0, 0,d.time,0, 0, 0));
                        })
                        .attr("y",function(d){
                            return -(- yScale(d.y0) - yScale(d.y) + (h - padding.top - padding.bottom)*2);
                        })
                        .attr("height",function(d){
                            return -yScale(d.y) + (h - padding.top - padding.bottom);
                        })
                        .attr("width",15)
                        .style("fill-opacity",1);

                    rects.exit()
                        .transition()
                        .duration(1000)
                        .ease("circle")
                        .attr("x",w)
                        .remove();

                    groups.exit()
                        .transition()
                        .duration(1000)
                        .ease("circle")
                        .attr("x",w)
                        .remove();


                    svg.select(".x.axis")
                        .transition()
                        .duration(1000)
                        .ease("circle")
                        .call(xAxis);

                    svg.select(".y.axis")
                        .transition()
                        .duration(1000)
                        .ease("circle")
                        .call(yAxis);

                    svg.select(".xtext")
                        .text("Hours");

                    svg.select(".title")
                        .text("Number of messages per hour on " + date + ".");
                });
            });


    });

}]);

stavrCtrl.controller('InfoTableCtrl',['$scope','$rootScope','ActiveDataFactory',function($scope,$rootScope,ActiveDataFactory) {

    $scope.$emit('MapUpdate');
    $scope.selectedrows = 0;
    $scope.tableData = "";
    $scope.showUrl = "";
    $scope.isNewTable = false;
    $scope.isSelectedDataTable = false;
    $scope.selectedStartDate = "2013-01-01";
    $scope.selectedEndDate = "2016-01-01";


    ActiveDataFactory.callDatabase().then(function (data) {
        $scope.tableData = data;
        $scope.isNewTable = true;
    },function (data) {
        alert(data);
    });
    
    
   $scope.refresh = function () {
       $scope.isNewTable = !$scope.isNewTable;
   };

    $scope.selectAll = function () {
        if($scope.table){
            $scope.selectedrows = $scope.table.data().length;
            var selectedData = $scope.table.data();
            ActiveDataFactory.setSelectData(selectedData);
            ActiveDataFactory.setDateRange($scope.selectedStartDate,$scope.selectedEndDate);
            $scope.isSelectedDataTable = !$scope.isSelectedDataTable;
        }
    };

    $scope.tableClick =function () {
        if($scope.table){
            $scope.selectedrows = $scope.table.rows('.active').data().length;
            var selectedData = $scope.table.rows('.active').data();
            ActiveDataFactory.setSelectData(selectedData);
            ActiveDataFactory.setDateRange($scope.selectedStartDate,$scope.selectedEndDate);
            $scope.isSelectedDataTable = !$scope.isSelectedDataTable;
        }
    };

    $scope.showSelect = function () {
        if($scope.table){
            $scope.showUrl = '#/overview/view1';
        }
    };

    $('.daterange').daterangepicker({
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        startDate: moment("2013-01-01"),
        endDate: moment()
    }, function (start, end) {
       // window.alert("You chose: " + start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));

        $scope.selectedStartDate = start.format('YYYY-MM-DD');
        $scope.selectedEndDate = end.format('YYYY-MM-DD');
    });

   

}]);


stavrCtrl.controller('queryCtrl',['$scope','$rootScope','$document',function($scope,$rootScope){
    $scope.queryClick = function(){
      var tID = "";
      var tOwner = "";
      var carNumber = document.getElementById("TNumber").value;
      var tStartTime = document.getElementById("TStartTime").value;
      var tEndTime = document.getElementById("TEndTime").value;
        var typeFeature = "MultiPoint";

      var url = "http://localhost:8080/DataVisualor/ServletJson?"+
          "TID=&"+tID +
          "TOwner=&"+tOwner+
          "TNumber="+carNumber+"&"+
          "TStartTime="+tStartTime+"&"+
          "TEndTime=" + tEndTime+"&"+
          "Type="+typeFeature;
        
        $rootScope.$broadcast('updateTrajectory',url);

        //UpdateTrajectoryDataSever.url = url;

        //UpdateTrajectoryDataSever.resouce.get({ TID:tID,TOwner:tOwner,TNumber:carNumber,TStartTime:tStartTime,TEndTime:tEndTime},function(data){},{});

    };
    $scope.ClearResult = function () {
        $rootScope.$broadcast('removeTrajectory');
    }
    
}]);

stavrCtrl.controller('SettingCtrl',['$scope','$rootScope',function($scope,$rootScope){

}]);
stavrCtrl.controller('HelpCtrl',['$scope','$rootScope',function($scope,$rootScope){

}]);

stavrCtrl.controller('ParameterCtrl',['$scope','$rootScope','$uibModal',function($scope,$rootScope,$uibModal){
   $scope.updateStackClick = function () {
       $rootScope.$broadcast('dataUpdate');
   }

    /*
     *
     */
    $scope.mapLayerEdit = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'template/mapLayerEdit/mapLayerEdit.html',
            controller: 'MapLayerMICtrl',
            size: 'lg',
            resolve: {}
        });
    };

    /*
     *
     */
    $scope.trajLayerEdit = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'template/mapLayerEdit/trajectoryLayerEdit.html',
            controller: 'TrajectoryLayerMICtrl',
            size: 'lg',
            resolve: {}
        });
    };


}]);

/*
 *   Modal Controller  for each Modal
 */
stavrCtrl.controller('ModalInstanceCtrl',['$scope','$uibModalInstance','$rootScope','items',function ($scope, $uibModalInstance,$rootScope,items) {

    $scope.items = items;
    $scope.selected = {
        item: $scope.items[0]
    };

    $scope.ok = function () {
        $rootScope.$broadcast('addVisualToolBox',url);
        $uibModalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);
stavrCtrl.controller('MapLayerMICtrl',['$scope','$uibModalInstance','$rootScope',function ($scope, $uibModalInstance,$rootScope) {

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);
stavrCtrl.controller('TrajectoryLayerMICtrl',['$scope','$uibModalInstance','$rootScope','MapViewerSever','ActiveDataFactory',function ($scope, $uibModalInstance,$rootScope,MapViewerSever,ActiveDataFactory) {
    var map = MapViewerSever.map;
    // var layers = map.getLayers().getArray();
    var layers = MapViewerSever.trajectoryFeatures.getArray();
    var layerSet = [];
    for(var i=0;i<layers.length;i++)
    {
        var layer = layers[i];
        var layerIntance ={};
        layerIntance.id = i;
        layerIntance.name = layer.get('name');
        layerIntance.color = "color:rgb("+ layer.get('color')[0]+","+layer.get('color')[1]+","+layer.get('color')[2]+")";
        layerIntance.type = layer.get('type');
        layerIntance.date = layer.get('date');
        // layerIntance.number = layer.getSource().getFeatures().length;
        layerIntance.number = 0;
        layerSet.push(layerIntance);
    }

    $scope.LayerSet = layerSet;

    $scope.layerClick = function (ele,data) {

    };

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);

stavrCtrl.controller('CarDataTableMICtrl',['$scope','$uibModalInstance','$rootScope','ActiveDataFactory',function ($scope, $uibModalInstance,$rootScope,ActiveDataFactory) {

    $scope.selectedrows = 0;
    $scope.tableData = "";
    $scope.isNewTable = false;
    $scope.isSelectedDataTable = false;

    ActiveDataFactory.callDatabase().then(function (data) {
        $scope.tableData = data;
        $scope.isNewTable = true;
    },function (data) {
        alert(data);
    });


    $scope.selectAll = function () {
        if($scope.table){
            $scope.selectedrows = $scope.table.data().length;
            var selectedData = $scope.table.data();
            ActiveDataFactory.setSelectData(selectedData);
            $scope.isSelectedDataTable = !$scope.isSelectedDataTable;
        }
    };

    $scope.selectPage =function(){
        if($scope.table) {
            // select all current rows
            var p = $scope.table.rows({page: 'current'}).nodes();
            p.each(function (e) {
                $(e).addClass('active');
            });
            $scope.selectedrows = $scope.table.rows('.active').data().length;
            var selectedData = $scope.table.rows('.active').data();
            ActiveDataFactory.setSelectData(selectedData);
            $scope.isSelectedDataTable = !$scope.isSelectedDataTable;
        }
    }

    $scope.tableClick =function () {
        if($scope.table){
            $scope.selectedrows = $scope.table.rows('.active').data().length;
            var selectedData = $scope.table.rows('.active').data();
            ActiveDataFactory.setSelectData(selectedData);
            $scope.isSelectedDataTable = !$scope.isSelectedDataTable;
        }
    };

    $scope.ok = function () {
        $uibModalInstance.close();

        //  update the selected data eg.  car  number
        $rootScope.$broadcast('updateSelectData');
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);

/*
 *  CrossFilter
 */
stavrCtrl.controller('CrossFilterCtrl',['$scope','ActiveDataFactory',function ($scope,ActiveDataFactory) {

// (It's CSV, but GitHub Pages only gzip's JSON at the moment.)

    /*d3.csv("mbar/flights-3m.json", function(error, flights) {

        // Various formatters.
        var formatNumber = d3.format(",d"),
            formatChange = d3.format("+,d"),
            formatDate = d3.time.format("%B %d, %Y"),
            formatTime = d3.time.format("%I:%M %p");

        // A nest operator, for grouping the flight list.
        var nestByDate = d3.nest()
            .key(function(d) { return d3.time.day(d.date); });

        // A little coercion, since the CSV is untyped.
        flights.forEach(function(d, i) {
            d.index = i;
            d.date = parseDate(d.date);
            d.delay = +d.delay;
            d.distance = +d.distance;
        });

        // Create the crossfilter for the relevant dimensions and groups.
        var flight = crossfilter(flights),
            all = flight.groupAll(),
            date = flight.dimension(function(d) { return d.date; }),
            dates = date.group(d3.time.day),
            hour = flight.dimension(function(d) { return d.date.getHours() + d.date.getMinutes() / 60; }),
            hours = hour.group(Math.floor),
            delay = flight.dimension(function(d) { return Math.max(-60, Math.min(149, d.delay)); }),
            delays = delay.group(function(d) { return Math.floor(d / 10) * 10; }),
            distance = flight.dimension(function(d) { return Math.min(1999, d.distance); }),
            distances = distance.group(function(d) { return Math.floor(d / 50) * 50; });

        var charts = [

            barChart()
                .dimension(hour)
                .group(hours)
                .x(d3.scale.linear()
                    .domain([0, 24])
                    .rangeRound([0, 10 * 24])),

            barChart()
                .dimension(delay)
                .group(delays)
                .x(d3.scale.linear()
                    .domain([-60, 150])
                    .rangeRound([0, 10 * 21])),

            barChart()
                .dimension(distance)
                .group(distances)
                .x(d3.scale.linear()
                    .domain([0, 2000])
                    .rangeRound([0, 10 * 40])),

            barChart()
                .dimension(date)
                .group(dates)
                .round(d3.time.day.round)
                .x(d3.time.scale()
                    .domain([new Date(2001, 0, 1), new Date(2001, 3, 1)])
                    .rangeRound([0, 10 * 90]))
                .filter([new Date(2001, 1, 1), new Date(2001, 2, 1)])

        ];

        // Given our array of charts, which we assume are in the same order as the
        // .chart elements in the DOM, bind the charts to the DOM and render them.
        // We also listen to the chart's brush events to update the display.
        var chart = d3.selectAll(".chart")
            .data(charts)
            .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

        // Render the initial lists.
        var list = d3.selectAll(".list")
            .data([flightList]);

        // Render the total.
        d3.selectAll("#total")
            .text(formatNumber(flight.size()));

        renderAll();

        // Renders the specified chart or list.
        function render(method) {
            d3.select(this).call(method);
        }

        // Whenever the brush moves, re-rendering everything.
        function renderAll() {
            chart.each(render);
            list.each(render);
            d3.select("#active").text(formatNumber(all.value()));
        }

        // Like d3.time.format, but faster.
        function parseDate(d) {
            return new Date(2001,
                d.substring(0, 2) - 1,
                d.substring(2, 4),
                d.substring(4, 6),
                d.substring(6, 8));
        }

        window.filter = function(filters) {
            filters.forEach(function(d, i) { charts[i].filter(d); });
            renderAll();
        };

        window.reset = function(i) {
            charts[i].filter(null);
            renderAll();
        };

        function flightList(div) {
            var flightsByDate = nestByDate.entries(date.top(40));

            div.each(function() {
                var date = d3.select(this).selectAll(".date")
                    .data(flightsByDate, function(d) { return d.key; });

                date.enter().append("div")
                    .attr("class", "date")
                    .append("div")
                    .attr("class", "day")
                    .text(function(d) { return formatDate(d.values[0].date); });

                date.exit().remove();

                var flight = date.order().selectAll(".flight")
                    .data(function(d) { return d.values; }, function(d) { return d.index; });

                var flightEnter = flight.enter().append("div")
                    .attr("class", "flight");

                flightEnter.append("div")
                    .attr("class", "time")
                    .text(function(d) { return formatTime(d.date); });

                flightEnter.append("div")
                    .attr("class", "origin")
                    .text(function(d) { return d.origin; });

                flightEnter.append("div")
                    .attr("class", "destination")
                    .text(function(d) { return d.destination; });

                flightEnter.append("div")
                    .attr("class", "distance")
                    .text(function(d) { return formatNumber(d.distance) + " mi."; });

                flightEnter.append("div")
                    .attr("class", "delay")
                    .classed("early", function(d) { return d.delay < 0; })
                    .text(function(d) { return formatChange(d.delay) + " min."; });

                flight.exit().remove();

                flight.order();
            });
        }

        function barChart() {
            if (!barChart.id) barChart.id = 0;

            var margin = {top: 10, right: 10, bottom: 20, left: 10},
                x,
                y = d3.scale.linear().range([100, 0]),
                id = barChart.id++,
                axis = d3.svg.axis().orient("bottom"),
                brush = d3.svg.brush(),
                brushDirty,
                dimension,
                group,
                round;

            function chart(div) {
                var width = x.range()[1],
                    height = y.range()[0];

                y.domain([0, group.top(1)[0].value]);

                div.each(function() {
                    var div = d3.select(this),
                        g = div.select("g");

                    // Create the skeletal chart.
                    if (g.empty()) {
                        div.select(".title").append("a")
                            .attr("href", "javascript:reset(" + id + ")")
                            .attr("class", "reset")
                            .text("reset")
                            .style("display", "none");

                        g = div.append("svg")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom)
                            .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                        g.append("clipPath")
                            .attr("id", "clip-" + id)
                            .append("rect")
                            .attr("width", width)
                            .attr("height", height);

                        g.selectAll(".bar")
                            .data(["background", "foreground"])
                            .enter().append("path")
                            .attr("class", function(d) { return d + " bar"; })
                            .datum(group.all());

                        g.selectAll(".foreground.bar")
                            .attr("clip-path", "url(#clip-" + id + ")");

                        g.append("g")
                            .attr("class", "axis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(axis);

                        // Initialize the brush component with pretty resize handles.
                        var gBrush = g.append("g").attr("class", "brush").call(brush);
                        gBrush.selectAll("rect").attr("height", height);
                        gBrush.selectAll(".resize").append("path").attr("d", resizePath);
                    }

                    // Only redraw the brush if set externally.
                    if (brushDirty) {
                        brushDirty = false;
                        g.selectAll(".brush").call(brush);
                        div.select(".title a").style("display", brush.empty() ? "none" : null);
                        if (brush.empty()) {
                            g.selectAll("#clip-" + id + " rect")
                                .attr("x", 0)
                                .attr("width", width);
                        } else {
                            var extent = brush.extent();
                            g.selectAll("#clip-" + id + " rect")
                                .attr("x", x(extent[0]))
                                .attr("width", x(extent[1]) - x(extent[0]));
                        }
                    }

                    g.selectAll(".bar").attr("d", barPath);
                });

                function barPath(groups) {
                    var path = [],
                        i = -1,
                        n = groups.length,
                        d;
                    while (++i < n) {
                        d = groups[i];
                        path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
                    }
                    return path.join("");
                }

                function resizePath(d) {
                    var e = +(d == "e"),
                        x = e ? 1 : -1,
                        y = height / 3;
                    return "M" + (.5 * x) + "," + y
                        + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
                        + "V" + (2 * y - 6)
                        + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
                        + "Z"
                        + "M" + (2.5 * x) + "," + (y + 8)
                        + "V" + (2 * y - 8)
                        + "M" + (4.5 * x) + "," + (y + 8)
                        + "V" + (2 * y - 8);
                }
            }

            brush.on("brushstart.chart", function() {
                var div = d3.select(this.parentNode.parentNode.parentNode);
                div.select(".title a").style("display", null);
            });

            brush.on("brush.chart", function() {
                var g = d3.select(this.parentNode),
                    extent = brush.extent();
                if (round) g.select(".brush")
                    .call(brush.extent(extent = extent.map(round)))
                    .selectAll(".resize")
                    .style("display", null);
                g.select("#clip-" + id + " rect")
                    .attr("x", x(extent[0]))
                    .attr("width", x(extent[1]) - x(extent[0]));
                dimension.filterRange(extent);
            });

            brush.on("brushend.chart", function() {
                if (brush.empty()) {
                    var div = d3.select(this.parentNode.parentNode.parentNode);
                    div.select(".title a").style("display", "none");
                    div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
                    dimension.filterAll();
                }
            });

            chart.margin = function(_) {
                if (!arguments.length) return margin;
                margin = _;
                return chart;
            };

            chart.x = function(_) {
                if (!arguments.length) return x;
                x = _;
                axis.scale(x);
                brush.x(x);
                return chart;
            };

            chart.y = function(_) {
                if (!arguments.length) return y;
                y = _;
                return chart;
            };

            chart.dimension = function(_) {
                if (!arguments.length) return dimension;
                dimension = _;
                return chart;
            };

            chart.filter = function(_) {
                if (_) {
                    brush.extent(_);
                    dimension.filterRange(_);
                } else {
                    brush.clear();
                    dimension.filterAll();
                }
                brushDirty = true;
                return chart;
            };

            chart.group = function(_) {
                if (!arguments.length) return group;
                group = _;
                return chart;
            };

            chart.round = function(_) {
                if (!arguments.length) return round;
                round = _;
                return chart;
            };

            return d3.rebind(chart, brush, "on");
        }
    });*/

    d3.csv("mbar/wuhan_weather.csv", function(error, weather) {
    // d3.csv("mbar/flights-3m.json", function(error, flights) {

        // Various formatters.
        var formatNumber = d3.format(",d"),
            formatChange = d3.format("+,d"),
            formatDate = d3.time.format("%B %d, %Y"),
            formatTime = d3.time.format("%I:%M %p");

        // A nest operator, for grouping the flight list.
        var nestByDate = d3.nest()
            .key(function(d) { return d3.time.day(d.date); });

        // A little coercion, since the CSV is untyped.  date,temp,rh,pop,wDir,wSpeed
        weather.forEach(function(d, i) {
            d.index = i;
            d.date = parseDate(d.date);
            d.temp = +d.temp;
            d.rh = +d.rh;
            d.pop = +d.pop;
            d.wDir = +d.wDir;
            d.wSpeed = +d.wSpeed;

        });

        // Create the crossfilter for the relevant dimensions and groups.
        var weatherRecords = crossfilter(weather),
            all = weatherRecords.groupAll(),
            date = weatherRecords.dimension(function(d) { return d.date; }),
            dates = date.group(d3.time.day),
            hour = weatherRecords.dimension(function(d) { return d.date.getHours() + d.date.getMinutes() / 60; }),
            hours = hour.group(Math.floor),
            temp = weatherRecords.dimension(function(d) { return Math.max(-10, Math.min(50, d.temp)); }),
            temps = temp.group(function(d) { return Math.floor(d / 5) * 5; }),
            rh = weatherRecords.dimension(function(d) { return d.rh; }),
            rhs = rh.group(function(d) { return Math.floor(d / 10) * 10; });

        var charts = [

            barChart()
                .dimension(hour)
                .group(hours)
                .x(d3.scale.linear()
                    .domain([0, 24])
                    .rangeRound([0, 10 * 24])),

            barChart()
                .dimension(temp)
                .group(temps)
                .x(d3.scale.linear()
                    .domain([-10, 50])
                    .rangeRound([0, 10 * 21])),

            barChart()
                .dimension(rh)
                .group(rhs)
                .x(d3.scale.linear()
                    .domain([0, 100])
                    .rangeRound([0, 10 * 40])),

            barChart()
                .dimension(date)
                .group(dates)
                .round(d3.time.day.round)
                .x(d3.time.scale()
                    .domain([new Date(2015, 0, 1), new Date(2015, 12, 31)])
                    .rangeRound([0, 10 * 90]))
                .filter([new Date(2015, 0, 1), new Date(2015, 12, 31)])

        ];

        // Given our array of charts, which we assume are in the same order as the
        // .chart elements in the DOM, bind the charts to the DOM and render them.
        // We also listen to the chart's brush events to update the display.
        var chart = d3.selectAll(".chart")
            .data(charts)
            .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

        // Render the initial lists.
        var list = d3.selectAll(".list")
            .data([flightList]);

        // Render the total.
        d3.selectAll("#total")
            .text(formatNumber(weatherRecords.size()));

        renderAll();

        // Renders the specified chart or list.
        function render(method) {
            d3.select(this).call(method);
        }

        // Whenever the brush moves, re-rendering everything.
        function renderAll() {
            chart.each(render);
            list.each(render);
            d3.select("#active").text(formatNumber(all.value()));
        }

        // Like d3.time.format, but faster.
        function parseDate(d) {
            // return new Date(2001,
            //     d.substring(0, 2) - 1,
            //     d.substring(2, 4),
            //     d.substring(4, 6),
            //     d.substring(6, 8));

            return new Date(
                d.substring(0, 4),
                d.substring(4, 6),
                d.substring(6, 8),
                d.substring(8, 10));
        }

        window.filter = function(filters) {
            filters.forEach(function(d, i) { charts[i].filter(d); });
            renderAll();
        };

        window.reset = function(i) {
            charts[i].filter(null);
            renderAll();
        };

        function flightList(div) {
            var flightsByDate = nestByDate.entries(date.top(40));

            div.each(function() {
                var date = d3.select(this).selectAll(".date")
                    .data(flightsByDate, function(d) { return d.key; });

                date.enter().append("div")
                    .attr("class", "date")
                    .append("div")
                    .attr("class", "day")
                    .text(function(d) { return formatDate(d.values[0].date); });

                date.exit().remove();

                var flight = date.order().selectAll(".flight")
                    .data(function(d) { return d.values; }, function(d) { return d.index; });

                var flightEnter = flight.enter().append("div")
                    .attr("class", "flight");

                flightEnter.append("div")
                    .attr("class", "time")
                    .text(function(d) { return formatTime(d.date); });

                flightEnter.append("div")
                    .attr("class", "temp")
                    .text(function(d) { return formatChange(d.temp) + " C"; });

                flightEnter.append("div")
                    .attr("class", "rh")
                    .text(function(d) { return formatNumber(d.rh) + " %rh"; });


                flight.exit().remove();

                flight.order();
            });
        }

        function barChart() {
            if (!barChart.id) barChart.id = 0;

            var margin = {top: 10, right: 10, bottom: 20, left: 10},
                x,
                y = d3.scale.linear().range([100, 0]),
                id = barChart.id++,
                axis = d3.svg.axis().orient("bottom"),
                brush = d3.svg.brush(),
                brushDirty,
                dimension,
                group,
                round;

            function chart(div) {
                var width = x.range()[1],
                    height = y.range()[0];

                y.domain([0, group.top(1)[0].value]);

                div.each(function() {
                    var div = d3.select(this),
                        g = div.select("g");

                    // Create the skeletal chart.
                    if (g.empty()) {
                        div.select(".title").append("a")
                            .attr("href", "javascript:reset(" + id + ")")
                            .attr("class", "reset")
                            .text("reset")
                            .style("display", "none");

                        g = div.append("svg")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom)
                            .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                        g.append("clipPath")
                            .attr("id", "clip-" + id)
                            .append("rect")
                            .attr("width", width)
                            .attr("height", height);

                        g.selectAll(".bar")
                            .data(["background", "foreground"])
                            .enter().append("path")
                            .attr("class", function(d) { return d + " bar"; })
                            .datum(group.all());

                        g.selectAll(".foreground.bar")
                            .attr("clip-path", "url(#clip-" + id + ")");

                        g.append("g")
                            .attr("class", "axis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(axis);

                        // Initialize the brush component with pretty resize handles.
                        var gBrush = g.append("g").attr("class", "brush").call(brush);
                        gBrush.selectAll("rect").attr("height", height);
                        gBrush.selectAll(".resize").append("path").attr("d", resizePath);
                    }

                    // Only redraw the brush if set externally.
                    if (brushDirty) {
                        brushDirty = false;
                        g.selectAll(".brush").call(brush);
                        div.select(".title a").style("display", brush.empty() ? "none" : null);
                        if (brush.empty()) {
                            g.selectAll("#clip-" + id + " rect")
                                .attr("x", 0)
                                .attr("width", width);
                        } else {
                            var extent = brush.extent();
                            g.selectAll("#clip-" + id + " rect")
                                .attr("x", x(extent[0]))
                                .attr("width", x(extent[1]) - x(extent[0]));
                        }
                    }

                    g.selectAll(".bar").attr("d", barPath);
                });

                function barPath(groups) {
                    var path = [],
                        i = -1,
                        n = groups.length,
                        d;
                    while (++i < n) {
                        d = groups[i];
                        path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
                    }
                    return path.join("");
                }

                function resizePath(d) {
                    var e = +(d == "e"),
                        x = e ? 1 : -1,
                        y = height / 3;
                    return "M" + (.5 * x) + "," + y
                        + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
                        + "V" + (2 * y - 6)
                        + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
                        + "Z"
                        + "M" + (2.5 * x) + "," + (y + 8)
                        + "V" + (2 * y - 8)
                        + "M" + (4.5 * x) + "," + (y + 8)
                        + "V" + (2 * y - 8);
                }
            }

            brush.on("brushstart.chart", function() {
                var div = d3.select(this.parentNode.parentNode.parentNode);
                div.select(".title a").style("display", null);
            });

            brush.on("brush.chart", function() {
                var g = d3.select(this.parentNode),
                    extent = brush.extent();
                if (round) g.select(".brush")
                    .call(brush.extent(extent = extent.map(round)))
                    .selectAll(".resize")
                    .style("display", null);
                g.select("#clip-" + id + " rect")
                    .attr("x", x(extent[0]))
                    .attr("width", x(extent[1]) - x(extent[0]));
                dimension.filterRange(extent);
            });

            brush.on("brushend.chart", function() {
                if (brush.empty()) {
                    var div = d3.select(this.parentNode.parentNode.parentNode);
                    div.select(".title a").style("display", "none");
                    div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
                    dimension.filterAll();
                }
            });

            chart.margin = function(_) {
                if (!arguments.length) return margin;
                margin = _;
                return chart;
            };

            chart.x = function(_) {
                if (!arguments.length) return x;
                x = _;
                axis.scale(x);
                brush.x(x);
                return chart;
            };

            chart.y = function(_) {
                if (!arguments.length) return y;
                y = _;
                return chart;
            };

            chart.dimension = function(_) {
                if (!arguments.length) return dimension;
                dimension = _;
                return chart;
            };

            chart.filter = function(_) {
                if (_) {
                    brush.extent(_);
                    dimension.filterRange(_);
                } else {
                    brush.clear();
                    dimension.filterAll();
                }
                brushDirty = true;
                return chart;
            };

            chart.group = function(_) {
                if (!arguments.length) return group;
                group = _;
                return chart;
            };

            chart.round = function(_) {
                if (!arguments.length) return round;
                round = _;
                return chart;
            };

            return d3.rebind(chart, brush, "on");
        }
    });




    var renderChart = function (eventSet) {

            // Various formatters.
            var formatNumber = d3.format(",d"),
                formatChange = d3.format("+,d"),
                formatDate = d3.time.format("%B %d, %Y"),
                formatTime = d3.time.format("%I:%M %p");

            // A nest operator, for grouping the flight list.
            var nestByDate = d3.nest()
                .key(function (d) {
                    return d3.time.day(d.time);
                });

            // A little coercion, since the CSV is untyped.
            var endTime = 0;
            var startTime = Date.now();

            eventSet.forEach(function (d, i) {
                d.index = i;
                var time = +(d.time + '000');
                if (time < startTime) startTime = time;
                if (time > endTime) endTime = time;
                d.time = new Date(time);

            });

            // Create the crossfilter for the relevant dimensions and groups.
            var eventFilter = crossfilter(eventSet),
                all = eventFilter.groupAll(),
                date = eventFilter.dimension(function (d) {
                    return d.time;
                }),
                dates = date.group(d3.time.day),
                hour = eventFilter.dimension(function (d) {
                    return d.time.getHours() + d.time.getMinutes() / 60;
                }),
                hours = hour.group(Math.floor);

            var charts = [

                barChart()
                    .dimension(hour)
                    .group(hours)
                    .x(d3.scale.linear()
                        .domain([0, 24])
                        .rangeRound([0, 10 * 24])),

                barChart()
                    .dimension(date)
                    .group(dates)
                    .round(d3.time.day.round)
                    .x(d3.time.scale()
                        .domain([new Date(startTime), new Date(endTime)])
                        .rangeRound([0, 10 * 90]))
                    .filter([new Date(startTime), new Date(startTime + (endTime - startTime) / 4)])

            ];

            // Given our array of charts, which we assume are in the same order as the
            // .chart elements in the DOM, bind the charts to the DOM and render them.
            // We also listen to the chart's brush events to update the display.
            var chart = d3.selectAll(".chart")
                .data(charts)
                .each(function (chart) {
                    chart.on("brush", renderAll).on("brushend", renderAll);
                });

            // Render the initial lists.
            var list = d3.selectAll(".list")
                .data([flightList]);

            // Render the total.
            d3.selectAll("#total")
                .text(formatNumber(eventFilter.size()));

            renderAll();

            // Renders the specified chart or list.
            function render(method) {
                d3.select(this).call(method);
            }

            // Whenever the brush moves, re-rendering everything.
            function renderAll() {
                chart.each(render);
                list.each(render);
                d3.select("#active").text(formatNumber(all.value()));
            }

            // Like d3.time.format, but faster.
            function parseDate(d) {
                return new Date(2001,
                    d.substring(0, 2) - 1,
                    d.substring(2, 4),
                    d.substring(4, 6),
                    d.substring(6, 8));
            }

            window.filter = function (filters) {
                filters.forEach(function (d, i) {
                    charts[i].filter(d);
                });
                renderAll();
            };

            window.reset = function (i) {
                charts[i].filter(null);
                renderAll();
            };

            function flightList(div) {
                var flightsByDate = nestByDate.entries(date.top(40));

                div.each(function () {
                    var date = d3.select(this).selectAll(".date")
                        .data(flightsByDate, function (d) {
                            return d.key;
                        });

                    date.enter().append("div")
                        .attr("class", "date")
                        .append("div")
                        .attr("class", "day")
                        .text(function (d) {
                            return formatDate(d.values[0].time);
                        });

                    date.exit().remove();

                    var flight = date.order().selectAll(".flight")
                        .data(function (d) {
                            return d.values;
                        }, function (d) {
                            return d.index;
                        });

                    var flightEnter = flight.enter().append("div")
                        .attr("class", "flight");

                    flightEnter.append("div")
                        .attr("class", "time")
                        .text(function (d) {
                            return formatTime(d.time);
                        });

                    flight.exit().remove();

                    flight.order();
                });
            }

            function barChart() {
                if (!barChart.id) barChart.id = 0;

                var margin = {top: 10, right: 10, bottom: 20, left: 10},
                    x,
                    y = d3.scale.linear().range([100, 0]),
                    id = barChart.id++,
                    axis = d3.svg.axis().orient("bottom"),
                    brush = d3.svg.brush(),
                    brushDirty,
                    dimension,
                    group,
                    round;

                function chart(div) {
                    var width = x.range()[1],
                        height = y.range()[0];

                    y.domain([0, group.top(1)[0].value]);

                    div.each(function () {
                        var div = d3.select(this),
                            g = div.select("g");

                        // Create the skeletal chart.
                        if (g.empty()) {
                            div.select(".title").append("a")
                                .attr("href", "javascript:reset(" + id + ")")
                                .attr("class", "reset")
                                .text("reset")
                                .style("display", "none");

                            g = div.append("svg")
                                .attr("width", width + margin.left + margin.right)
                                .attr("height", height + margin.top + margin.bottom)
                                .append("g")
                                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                            g.append("clipPath")
                                .attr("id", "clip-" + id)
                                .append("rect")
                                .attr("width", width)
                                .attr("height", height);

                            g.selectAll(".bar")
                                .data(["background", "foreground"])
                                .enter().append("path")
                                .attr("class", function (d) {
                                    return d + " bar";
                                })
                                .datum(group.all());

                            g.selectAll(".foreground.bar")
                                .attr("clip-path", "url(#clip-" + id + ")");

                            g.append("g")
                                .attr("class", "axis")
                                .attr("transform", "translate(0," + height + ")")
                                .call(axis);

                            // Initialize the brush component with pretty resize handles.
                            var gBrush = g.append("g").attr("class", "brush").call(brush);
                            gBrush.selectAll("rect").attr("height", height);
                            gBrush.selectAll(".resize").append("path").attr("d", resizePath);
                        }

                        // Only redraw the brush if set externally.
                        if (brushDirty) {
                            brushDirty = false;
                            g.selectAll(".brush").call(brush);
                            div.select(".title a").style("display", brush.empty() ? "none" : null);
                            if (brush.empty()) {
                                g.selectAll("#clip-" + id + " rect")
                                    .attr("x", 0)
                                    .attr("width", width);
                            } else {
                                var extent = brush.extent();
                                g.selectAll("#clip-" + id + " rect")
                                    .attr("x", x(extent[0]))
                                    .attr("width", x(extent[1]) - x(extent[0]));
                            }
                        }

                        g.selectAll(".bar").attr("d", barPath);
                    });

                    function barPath(groups) {
                        var path = [],
                            i = -1,
                            n = groups.length,
                            d;
                        while (++i < n) {
                            d = groups[i];
                            path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
                        }
                        return path.join("");
                    }

                    function resizePath(d) {
                        var e = +(d == "e"),
                            x = e ? 1 : -1,
                            y = height / 3;
                        return "M" + (.5 * x) + "," + y
                            + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
                            + "V" + (2 * y - 6)
                            + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
                            + "Z"
                            + "M" + (2.5 * x) + "," + (y + 8)
                            + "V" + (2 * y - 8)
                            + "M" + (4.5 * x) + "," + (y + 8)
                            + "V" + (2 * y - 8);
                    }
                }

                brush.on("brushstart.chart", function () {
                    var div = d3.select(this.parentNode.parentNode.parentNode);
                    div.select(".title a").style("display", null);
                });

                brush.on("brush.chart", function () {
                    var g = d3.select(this.parentNode),
                        extent = brush.extent();
                    if (round) g.select(".brush")
                        .call(brush.extent(extent = extent.map(round)))
                        .selectAll(".resize")
                        .style("display", null);
                    g.select("#clip-" + id + " rect")
                        .attr("x", x(extent[0]))
                        .attr("width", x(extent[1]) - x(extent[0]));
                    dimension.filterRange(extent);
                });

                brush.on("brushend.chart", function () {
                    if (brush.empty()) {
                        var div = d3.select(this.parentNode.parentNode.parentNode);
                        div.select(".title a").style("display", "none");
                        div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
                        dimension.filterAll();
                    }
                });

                chart.margin = function (_) {
                    if (!arguments.length) return margin;
                    margin = _;
                    return chart;
                };

                chart.x = function (_) {
                    if (!arguments.length) return x;
                    x = _;
                    axis.scale(x);
                    brush.x(x);
                    return chart;
                };

                chart.y = function (_) {
                    if (!arguments.length) return y;
                    y = _;
                    return chart;
                };

                chart.dimension = function (_) {
                    if (!arguments.length) return dimension;
                    dimension = _;
                    return chart;
                };

                chart.filter = function (_) {
                    if (_) {
                        brush.extent(_);
                        dimension.filterRange(_);
                    } else {
                        brush.clear();
                        dimension.filterAll();
                    }
                    brushDirty = true;
                    return chart;
                };

                chart.group = function (_) {
                    if (!arguments.length) return group;
                    group = _;
                    return chart;
                };

                chart.round = function (_) {
                    if (!arguments.length) return round;
                    round = _;
                    return chart;
                };

                return d3.rebind(chart, brush, "on");
            }

        };

    // d3.json("mbar/events.json", function(error, flights) {
    //     var events = flights.Events;
    //     renderChart(events);
    // });

    ActiveDataFactory.callEventData().then(function (data) {
        var dataObj = JSON.parse(data);
        for(var k=0; k<dataObj.length;k=dataObj.length)
        {
            var events = dataObj[k].data.Events;
            renderChart(events);
        }
    },function (data) {
        alert(data);
    });




}]);


/*
 *  parallel-coordinate graph
 */
stavrCtrl.controller('ClusterAnalyticsCtrl',['$scope',function ($scope) {


    var parcoords = d3.parcoords()("#example")
        .alpha(0.4)
        .mode("queue") // progressive rendering
        //.height(d3.max([document.body.clientHeight-420, 220]))
        .height(d3.max([380, 220]))
        .margin({
            top: 36,
            left: 0,
            right: 0,
            bottom: 16
        });

    // load csv file and create the chart
    d3.csv('mbar/nutrients.csv', function(data) {
        // slickgrid needs each data element to have an id
        data.forEach(function(d,i) { d.id = d.id || i; });

        parcoords
            .data(data)
            .hideAxis(["name"])
            .render()
            .reorderable()
            .brushMode("1D-axes");

        // setting up grid
        var column_keys = d3.keys(data[0]);
        var columns = column_keys.map(function(key,i) {
            return {
                id: key,
                name: key,
                field: key,
                sortable: true
            }
        });

        var options = {
            enableCellNavigation: true,
            enableColumnReorder: false,
            multiColumnSort: false
        };

        var dataView = new Slick.Data.DataView();
        var grid = new Slick.Grid("#grid", dataView, columns, options);
        var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));

        // wire up model events to drive the grid
        dataView.onRowCountChanged.subscribe(function (e, args) {
            grid.updateRowCount();
            grid.render();
        });

        dataView.onRowsChanged.subscribe(function (e, args) {
            grid.invalidateRows(args.rows);
            grid.render();
        });

        // column sorting
        var sortcol = column_keys[0];
        var sortdir = 1;

        function comparer(a, b) {
            var x = a[sortcol], y = b[sortcol];
            return (x == y ? 0 : (x > y ? 1 : -1));
        }

        // click header to sort grid column
        grid.onSort.subscribe(function (e, args) {
            sortdir = args.sortAsc ? 1 : -1;
            sortcol = args.sortCol.field;

            if ($.browser && $.browser.msie && $.browser.version <= 8) {
                dataView.fastSort(sortcol, args.sortAsc);
            } else {
                dataView.sort(comparer, args.sortAsc);
            }
        });

        // highlight row in chart
        grid.onMouseEnter.subscribe(function(e,args) {
            var i = grid.getCellFromEvent(e).row;
            var d = parcoords.brushed() || data;
            parcoords.highlight([d[i]]);
        });
        grid.onMouseLeave.subscribe(function(e,args) {
            parcoords.unhighlight();
        });

        // fill grid with data
        gridUpdate(data);

        // update grid on brush
        parcoords.on("brush", function(d) {
            gridUpdate(d);
        });

        function gridUpdate(data) {
            dataView.beginUpdate();
            dataView.setItems(data);
            dataView.endUpdate();
        };

    });
}]);


/*
 *  EventsRelationVACtrl
 */
stavrCtrl.controller('EventsRelationVACtrl',['$scope','$rootScope','$uibModal','ActiveDataFactory','MapViewerSever',function($scope,$rootScope,$uibModal,ActiveDataFactory,MapViewerSever) {

    $(".connectedSortable").sortable({
        placeholder: "sort-highlight",
        connectWith: ".connectedSortable",
        handle: ".box-header, .nav-tabs",
        forcePlaceholderSize: true,
        zIndex: 999999
    });
    $(".connectedSortable .box-header, .connectedSortable .nav-tabs-custom").css("cursor", "move");

    // control the update of views

    $scope.isSelectedDataTable = false;
    $scope.isUpdateMapView = false;
    $scope.isUpdateRelationView = false;
    $scope.isUpdateTimeView = false;
    $scope.isUpdateStackView = false;

    // response the click on tableView
    // response the click on tableView
    $scope.tableViewClick = function () {
        if($scope.selectTableView){
            var selectedData = $scope.selectTableView.rows('.active').data();
            if(selectedData.length>0)MapViewerSever.selectTrajectoryFeatures(selectedData[0][0]);
            else MapViewerSever.selectTrajectoryFeatures("");
        }
    };

    $scope.selectedStartDate = "2013-01-01";
    $scope.selectedEndDate = "2013-02-28";

    $('#reservationtime').daterangepicker({timePicker: true, timePickerIncrement: 30, format: 'MM/DD/YYYY h:mm A',startDate: moment($scope.selectedStartDate),
        endDate: moment($scope.selectedEndDate)}, function (start, end) {
        // window.alert("You chose: " + start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));

        $scope.selectedStartDate = start.format('YYYY-MM-DD');
        $scope.selectedEndDate = end.format('YYYY-MM-DD');
    });

    /*
     *
     */
    $scope.mapLayerEdit = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'template/mapLayerEdit/mapLayerEdit.html',
            controller: 'MapLayerMICtrl',
            size: 'lg',
            resolve: {}
        });
    };

    /*
     *
     */
    $scope.trajLayerEdit = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'template/mapLayerEdit/trajectoryLayerEdit.html',
            controller: 'TrajectoryLayerMICtrl',
            size: 'lg',
            resolve: {}
        });
    };


    $scope.showDataTable = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'template/dataTable/carDataTable.html',
            controller: 'CarDataTableMICtrl',
            size: 'lg',
            resolve: {}
        });
    };


    $scope.$on('updateSelectData',function () {
        $scope.selectedCars = ActiveDataFactory.getSelectDataCarNumberStr();
    });
    
    // Select Spatial Area
    $scope.showSpatialAreaTable = function () {

    }


    $scope.queryClick = function(){
        ActiveDataFactory.setEventsType($scope.eventsType);
        ActiveDataFactory.setDateRange($scope.selectedStartDate,$scope.selectedEndDate);

        $scope.isSelectedDataTable = !$scope.isSelectedDataTable;
        $scope.isUpdateMapView =  !$scope.isUpdateMapView ;
        $scope.isUpdateRelationView = !$scope.isUpdateRelationView;
        $scope.isUpdateTimeView =  !$scope.isUpdateTimeView;
        $scope.isUpdateStackView = !$scope.isUpdateStackView;

    };


    $scope.ClearResult = function () {

        MapViewerSever.trajectoryFeatures.clear();
        ActiveDataFactory.clearActiveData();

        $scope.isSelectedDataTable = !$scope.isSelectedDataTable;
        $scope.isUpdateMapView =  !$scope.isUpdateMapView ;
        $scope.isUpdateRelationView = !$scope.isUpdateRelationView;
        $scope.isUpdateTimeView =  !$scope.isUpdateTimeView;
        $scope.isUpdateStackView = !$scope.isUpdateStackView;
    };


    // relations execute
    $scope.spatialDistance = 100;
    $scope.tepmoralDistance = "1 hour";
    $scope.executeRelation = function () {
        console.log($scope.spatialDistance);
        console.log($scope.tepmoralDistance);

        ActiveDataFactory.setRelationParameter($scope.spatialDistance,$scope.tepmoralDistance);

        $scope.isUpdateRelationView = !$scope.isUpdateRelationView;
        $scope.isUpdateMapView =  !$scope.isUpdateMapView ;


    };


    //time
    $scope.isBind2Trajectory = true;
    $scope.isBind2Events = true;
    $scope.timeControllerBind = function () {
        $scope.isBind2Trajectory = document.getElementById("cbBindTrajectory").checked;
        $scope.isBind2Events = document.getElementById("cbBindEvents").checked;
    }


}]);

/*
 *  Just for test Controller
 */
stavrCtrl.controller('Ctrl1',['$scope','$rootScope',function($scope,$rootScope){
    $scope.click = function(){
        $rootScope.$broadcast('Update',  "CCC");
    }
}]);
stavrCtrl.controller('Ctrl2',['$scope','$rootScope',function($scope,$rootScope){
    $scope.content = "AAA";
    $rootScope.$on('Update',function(e,c){
        $scope.content = c;
    });
}]);








