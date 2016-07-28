'use strict';

/* Directives */
var stavrDirts = angular.module('stavrDirectives', []);

stavrDirts.directive('myInfoTableDirective',function(){
   return {
       restrict : 'A',
       transclude: true,
       controller:
       function ($scope,$element,$transclude,$http) {
           $transclude(function(clone){
               $http.get('http://localhost:8080/DataVisualor/TraTableJsonSevlet',{cache:true}).
               success(function(data, status, headers, config) {
                   // this callback will be called asynchronously
                   // when the response is available
                   try {
                       var object = angular.fromJson(data);
                       var head = object.tableHead;
                       var rowData = object.tableData;
                       var htmlStr = "<thead ><tr>";
                       for(var i=0 ; i < head.length;i++)
                       {
                           htmlStr += "<th>" +
                               head[i] +
                               "</th>";
                       }
                       htmlStr +="</tr></thead>";
                       htmlStr +="<tbody>";
                       for(var i=0 ; i < rowData.length;i++)
                       {
                           var rowObject = angular.fromJson(rowData[i]);
                           htmlStr += "<tr>"+
                               "<td>"+rowObject.Num+"</td>"+
                               "<td>"+rowObject.Own+"</td>"+
                               "<td>"+rowObject.Time+"</td>" +
                               "</tr>";
                       }
                       htmlStr +="</tbody>";

                       $element.append(htmlStr);
                   }catch(e)
                   {

                   }

               }).
               error(function(data, status, headers, config) {
                   // called asynchronously if an error occurs
                   // or server returns response with an error status.
               });
           });


       },
       link: function (scope,ele,attrs) {
           return {
               pre: function (tElement,tAttrs,transclude) {

               },
               post:function (scope,iElement,iAttrs,controller) {

               }
           }
       }
   }; 
});

stavrDirts.directive('myDataBaseTable',['$rootScope',function($rootScope){
    return function (scope,ele,attrs){
            attrs.$observe('title',function () {
                if(scope.tableData.length ==0) return;
                var tableElement = ele[0];
                tableElement.innerHTML = scope.tableData;

               scope.table = $(tableElement).DataTable({
                    "paging": true,
                    "lengthChange": true,
                    "searching": true,
                    "ordering": true,
                    "info": true,
                    "autoWidth": true,
                    "select": true
                });

                $('#example1 tbody').on( 'click', 'tr', function () {
                    $(this).toggleClass('active');
                } );               

                
            })
    }
}]);


stavrDirts.directive('myRowDirective',function(){
    return {
        require: '^myInfoTableDirective',
        restrict: 'E',
        transclude: true,
        scope: {
            title: '@'
        },
        link: function(scope, element, attrs, tabsCtrl) {
            tabsCtrl.addRow(scope);

            // Prevent default dragging of selected co
            element.on('mousedown', function(event) {
                event.preventDefault();

                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {

                element.css({
                    top: y + 'px',
                    left:  x + 'px'
                });
            }

            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
            }
        }
    };
});

stavrDirts.directive('myMapChart', ['$interval','MapViewerSever','ActiveDataFactory', function($interval,MapViewerSever,ActiveDataFactory) {
    return {
        restrict : 'A',
        transclude: true,
        controller: function ($scope,$element,$transclude,$http) {
           
                
        },
        link:{
            pre: function (scope,iElement,iAttrs,controller) {

            },
            post:function (scope,iElement,iAttrs,controller) {
                var map = MapViewerSever.map;
                map.setTarget(iElement[0]);

                iAttrs.$observe('title',function () {
                    if(ActiveDataFactory.isMapUpdate && ActiveDataFactory.isSelectDataExist()){

                        var map = MapViewerSever.map;
                       // MapViewerSever.removeAllLayers();

                        var trajectoryFeatures = MapViewerSever.trajectoryFeatures;

                        var selectData = ActiveDataFactory.getSelectData();
                        var typeFeature = "MultiPoint";
                        var d3Color = d3.scale.category10();
                        var featureSet = [];

                        for(var i=0;i<selectData.length;i++){
                            var featureObj = {};
                            featureObj.carNumber = selectData[i][0];
                            //var url = ActiveDataFactory.getTrajUrlByCarNumber(carNumber,typeFeature);
                            featureObj.colorLine = d3Color(i);
                            featureSet[i] = featureObj;

                            var feature = new ol.Feature({
                                style:   new ol.style.Style({
                                    // stroke: new ol.style.Stroke({
                                    //     color: '#ffcc00',
                                    //     width: 2
                                    // }),
                                    // fill: new ol.style.Fill({
                                    //     color: featureObj.colorLine
                                    // }),
                                    image: new ol.style.Circle({
                                        radius: 7,
                                        fill: new ol.style.Fill({
                                            color: featureObj.colorLine
                                        })
                                    })
                                })
                            });

                            feature.set('name',featureObj.carNumber);
                            feature.set('color',featureObj.colorLine);
                            feature.set('type',typeFeature);
                            feature.set('date',"2013-3-28");

                            trajectoryFeatures.push(feature);

                        }
                        featureSet.forEach(function (obj) {
                            ActiveDataFactory.callTrajectoryData(obj.carNumber,typeFeature)
                                .then(function (data) {
                                    var trajectoryCoords =data.geometry.coordinates;
                                    var trajectoryTimes = data.geometry.times;
                                    var transformFn = ol.proj.getTransform('EPSG:4326', 'EPSG:3857');
                                    trajectoryCoords.forEach(function (coord) {
                                        var c = transformFn(coord, undefined, coord.length);
                                        coord[0] = c[0];
                                        coord[1] = c[1];
                                    });
                                    var features = MapViewerSever.trajectoryFeatures.getArray();
                                    var featureCurrent = features.filter(function(f){ return f.get('name')==obj.carNumber});


                                    function geomCreator(type,coords) {
                                        var geometry = null;
                                        switch (type){
                                            case 'LineString': geometry = new ol.geom.LineString(coords); break;
                                            case 'LinearRing': geometry = new ol.geom.LinearRing(coords); break;
                                            case 'MultiLineString': geometry = new ol.geom.MultiLineString(coords); break;
                                            case 'MultiPoint': geometry = new ol.geom.MultiPoint(coords); break;
                                            case 'MultiPolygon': geometry = new ol.geom.MultiPolygon(coords); break;
                                            case 'Point': geometry = new ol.geom.Point(coords); break;
                                            case 'Polygon': geometry = new ol.geom.Polygon(coords); break;
                                        }
                                        return geometry;
                                    }

                                    var geoM  = geomCreator(typeFeature,trajectoryCoords);
                                    geoM.set("times",trajectoryTimes);

                                    featureCurrent[0].setGeometry(geoM);
                                    var color = featureCurrent[0].get("color");
                                    featureCurrent[0].setStyle( new ol.style.Style({
                                        // stroke: new ol.style.Stroke({
                                        //     color: '#ffcc00',
                                        //     width: 2
                                        // }),
                                        // fill: new ol.style.Fill({
                                        //     color: color
                                        // }),
                                        image: new ol.style.Circle({
                                            radius: 7,
                                            fill: new ol.style.Fill({
                                                color: color
                                            })
                                        })
                                    }));

                                },function (data) {
                                    alert(data);
                                });
                        });

                        ActiveDataFactory.isMapUpdate =false;






                    }
                });
                
            }
        }
    }
}]);

stavrDirts.directive('myLineChart', ['$interval','MapViewerSever','ActiveDataFactory', function($interval,MapViewerSever,ActiveDataFactory) {
    return {
        restrict : 'A',
        transclude: false,
        templateUrl:'template/visualtoolhtml/boxTimeLineTemplate.html',
        controller: function ($scope,$element,$transclude,$http) {

            var selectedData = ActiveDataFactory.getSelectData();
            var dateRange = ActiveDataFactory.getDateRange();
            $scope.isPlay = false;
            $scope.playShow = "block";
            $scope.pasueShow = "none";
            $scope.changePlayState = function(){
                $scope.isPlay = !$scope.isPlay;
                if($scope.isPlay){
                    $scope.playShow = "none";
                    $scope.pasueShow = "block";
                }else{
                    $scope.playShow = "block";
                    $scope.pasueShow = "none";
                }

            };
            
            
            

        },
        link:{
                pre: function (tElement,tAttrs,transclude) {

                },
                post:function (scope,iElement,iAttrs,controller) {

                    // Control tiemline  displayer
                    var margin = {top: 10, right: 30, bottom: 40, left: 30},
                        width = iElement.width() * 0.65 - margin.left - margin.right,
                        parentHeight = 120,
                        height = parentHeight - margin.top - margin.bottom;

                    var timeLineBarDOM = iElement.find("#timaLineBar")[0];
                    var svg = d3.select(timeLineBarDOM).append("svg")
                        .attr("width",  iElement.width() * 0.65 )
                        .attr("height", parentHeight);

                    svg.append("defs").append("clipPath")
                        .attr("id", "clip")
                        .append("rect")
                        .attr("width", width)
                        .attr("height", height);

                    var context = svg.append("g")
                        .attr("class", "context")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    function brushed() {
                        // x.domain(brush.empty() ? x2.domain() : brush.extent());
                        // focus.select(".line").attr("d", area);
                        // focus.select(".x.axis").call(xAxis);

                        if(scope.brush.empty()){
                            scope.pause();
                            clearHighlighdPoints();
                        }else
                        {
                            //choose features in this brush domain
                            updateSelectedPoints(scope.brush.extent());
                        };
                    }

                    function brushStart(){
                        scope.pause();
                    }

                    scope.x = d3.time.scale().range([0, width]),
                        scope.y = d3.scale.linear().range([height, 0]);


                    var xAxis = d3.svg.axis().scale(scope.x).orient("bottom"),
                        yAxis = d3.svg.axis().scale(scope.y).orient("left");



                    var area = d3.svg.line()
                        .x(function(d) { return scope.x(d.date); })
                        .y(function(d) { return scope.y(d.count); });

                    var EventData = [];
                    var endTime = 0;
                    var startTime = Date.now();

                    // event time graph
                    function renderTimeGraph(data) {
                        if (data.length > 0) {
                            var color = d3.scale.category10();

                            var boxTitle = iElement[0].children[0].children[0];
                            boxTitle.innerText = iElement.attr('my-line-chart');
                            var boxBody = iElement.context.lastChild;
                            var width = boxBody.offsetWidth;
                            if (width <= 0) return;

                            // create chart function
                            var eventDropsChart = d3.chart.eventDrops()
                                .eventLineColor(function (datum, index) {
                                    return color(index);
                                })
                                .start(new Date(startTime))
                                .end(new Date(endTime))
                                .width(width)
                                .eventZoom(function(e){

                                })
                                .axisFormat(function(axis){

                                });


                            // bind data with DOM
                            var element = d3.select(iElement.find("#eventDrop")[0]).datum(data);

                            // draw the chart
                            eventDropsChart(element);
                        }
                    }

                    iAttrs.$observe('title',function () {

                        var month = 30 * 24 * 60 * 60 * 1000;
                        var hours = 60 * 60 * 1000;
                        EventData = [];

                        ActiveDataFactory.callEventData().then(function (data) {
                            var dataObj = JSON.parse(data);
                            if(dataObj.length===0) return;
                            var dataCount = [];
                            var maxCount = 0;
                            for (var k = 0; k < dataObj.length; k++) {
                                var name = dataObj[k].data.Name;
                                var eventArr = dataObj[k].data.Events;
                                var event = {
                                    name: name,
                                    dates: []
                                };
                                if (eventArr.length <= 0) continue;
                                for (var i = 0; i < eventArr.length; i++) {
                                    var dateStr = Number(eventArr[i].time + '000');
                                    var date = new Date(dateStr);
                                    var time = date.getTime();
                                    if (time < startTime) startTime = time;
                                    if (time > endTime) endTime = time;
                                    event.dates.push(date);
                                    var dateS   = date.toDateString();
                                    var itemDate = dataCount.find(function(e){ return e.date.toDateString() == dateS});
                                    if(itemDate){
                                        itemDate.count +=1;
                                    }
                                    else{
                                        var bar = { date:new Date(dateS),count:1};
                                        dataCount.push(bar);
                                    }
                                    if(itemDate && (itemDate.count > maxCount)) maxCount = itemDate.count ;
                                }
                                EventData.push(event);
                            }


                            renderTimeGraph(EventData);

                            dataCount.sort(function(a,b){
                                if(a.date > b.date){
                                    return 1;
                                }
                                else{
                                    return -1;
                                }
                            });





                            scope.x.domain(d3.extent(dataCount.map(function(d){return d.date;})));
                            scope.y.domain([0,maxCount]);
                            xAxis = d3.svg.axis().scale( scope.x).orient("bottom"),
                                yAxis = d3.svg.axis().scale(scope.y).orient("left");
                            scope.brush = d3.svg.brush()
                                .x(scope.x)
                                .on("brush", brushed)
                                .on("brushstart", brushStart);



                            context.selectAll("path").remove();
                            context.selectAll("g").remove();
                            context.append("path")
                                .datum(dataCount)
                                .attr("class", "line")
                                .attr("d", area);

                            context.append("g")
                                .attr("class", "x axis")
                                .attr("transform", "translate(0," + height + ")")
                                .call(xAxis);

                            context.append("g")
                                .attr("class", "y axis")
                                .call(yAxis);

                            context.append("g")
                                .attr("class", "x brush")
                                .call(scope.brush)
                                .selectAll("rect")
                                .attr("y", -6)
                                .attr("height", height + 7);

                        }, function (data) {
                            alert(data);
                        });

                    });


                    var resizeView = function(){
                        var newWidth = iElement.width() * 0.65 - margin.left - margin.right;
                        if(width == newWidth) return;
                        width = newWidth;
                        height = parentHeight - margin.top - margin.bottom;
                        svg.attr("width",  iElement.width() * 0.65 );
                        svg.select("defs").select("clipPath")
                            .select("rect")
                            .attr("width", width)
                            .attr("height", height);
                        scope.x = d3.time.scale().range([0, width]),
                            scope.y = d3.scale.linear().range([height, 0]);
                        scope.x.domain([new Date(startTime),new Date(endTime)]);
                        scope.brush = d3.svg.brush()
                            .x(scope.x)
                            .on("brush", brushed)
                            .on("brushstart", brushStart);

                        renderTimeGraph(EventData);
                    };

                    var timer;
                    var updateScene = function () {
                        resizeView();
                        timer = setTimeout(updateScene, 1000);
                    };
                    updateScene();

                    //Animation button control
                    var timerAinmation = null, speedAnimation = 100;
                    scope.play = function(){
                        if(scope.brush.empty())
                        {
                            return alert("Need brush the timeline");
                        }
                        if(scope.isPlay){
                            if(timerAinmation)clearTimeout(timerAinmation), speedAnimation = 100;
                            scope.changePlayState();
                            return ;
                        }
                        else{
                            scope.changePlayState();
                        }
                        var z = [];
                        //z[0] = new Date(startTime);
                        var brushBackRectWidth = context.select(".brush").select(".background").attr("width");
                        var brushRect = context.select(".brush").select(".extent");
                        var x_w = +brushRect.attr("x");
                        var widthRect = +brushRect.attr("width");
                        var x_e = x_w + widthRect;
                        z[0] = scope.x.invert(x_w);
                        z[1] = scope.x.invert(x_e);
                        // brush.extent(z);


                        var player = function(){
                            z[0].setDate(z[0].getDate() + 1);
                            z[1].setDate(z[1].getDate() + 1);
                            updateSelectedPoints(z);
                            var xOffset = scope.x(z[0]);
                            var xEOffset = xOffset + widthRect;
                            if(brushBackRectWidth < xEOffset){
                                xOffset = 0;
                                z[0] = scope.x.invert(xOffset);
                                z[1] = scope.x.invert(widthRect);
                            }
                            brushRect.attr("x",xOffset);
                            timerAinmation = setTimeout(player,speedAnimation);
                        };
                        player();

                    };

                    scope.pause = function(){
                        if(scope.isPlay){
                            if(timerAinmation)clearTimeout(timerAinmation), speedAnimation = 1000;
                            scope.changePlayState();
                        }
                    };

                    scope.forward = function(){
                        if(speedAnimation>30)speedAnimation *= 0.8;
                    };

                    scope.backward = function(){
                        if(speedAnimation<1000)speedAnimation *= 1.3;
                    };



                    // selected features points  by  brush
                    function updateSelectedPoints(brushExtent){
                        var timeRange = [];
                        timeRange[0] = brushExtent[0].getTime()/1000;
                        timeRange[1] = brushExtent[1].getTime()/1000;

                        MapViewerSever.selectTrajectoryFeaturesByUTCTime(timeRange);
                    }
                    function clearHighlighdPoints(){
                        MapViewerSever.clearHighlightFeatures();
                    };



                }
            }
        }
}]);

stavrDirts.directive('myGraphChart', ['$interval', function($interval) {
    return {
        restrict : 'A',
        transclude: false,
        templateUrl:'template/visualtoolhtml/boxRelationGraphTemplate.html',
        controller: function ($scope,$element,$transclude,$http) {


        },
        link:{
            pre: function (tElement,tAttrs,transclude) {

            },
            post:function (scope,iElement,iAttrs,controller) {

                scope.isShowForceTool = "none";
                scope.isShowMatrixGraph = "block";
                scope.isShowNLGraph = "none";


                scope.toggleForceTool = function(){
                    switch(scope.isShowForceTool){
                        case "block" : scope.isShowForceTool = "none"; break;
                        case "none": scope.isShowForceTool = "block"; break;
                    }
                };

                scope.toggleMatrixGraph = function () {
                    switch(scope.isShowMatrixGraph){
                        case "block" : scope.isShowMatrixGraph = "none"; break;
                        case "none": scope.isShowMatrixGraph = "block"; break;
                    }
                };

                scope.toggleNLGraph = function(){
                    switch(scope.isShowNLGraph){
                        case "block" : scope.isShowNLGraph = "none"; break;
                        case "none": scope.isShowNLGraph = "block"; break;
                    }
                };

                // charge
                iElement.find('#range_1').ionRangeSlider({
                    min: -3000,
                    max: 3000,
                    from: -2000,
                    type: 'single',
                    step: 10,
                    prettify: false,
                    grid: true
                });
                // Friction
                iElement.find('#range_2').ionRangeSlider({
                    min: -1,
                    max: 1,
                    from:0.9,
                    type: 'single',
                    step: 0.01,
                    prettify: false,
                    grid: true
                });
                // Gravity
                iElement.find('#range_3').ionRangeSlider({
                    min: -1,
                    max: 1,
                    from:0.85,
                    type: 'single',
                    step: 0.01,
                    prettify: false,
                    grid: true
                });
                //LinkDistance
                iElement.find('#range_4').ionRangeSlider({
                    min: -1000,
                    max: 1000,
                    from: -20,
                    type: 'single',
                    step: 1,
                    prettify: false,
                    grid: true
                });

                scope.resetForceTool = function(){
                    iElement.find('#range_1').data("ionRangeSlider").reset();
                    iElement.find('#range_2').data("ionRangeSlider").reset();
                    iElement.find('#range_3').data("ionRangeSlider").reset();
                    iElement.find('#range_4').data("ionRangeSlider").reset();
                };

                var force;

                function name(d) { return d.name; }
                function group(d) { return d.group; }

                var color = d3.scale.category10();
                // var color = function(i){
                //     if(i==1) return '#1f77b4';
                //     else return '#ff7f0e';
                // };
                function colorByGroup(d) { return color(group(d)); }

                var boxTitle = iElement[0].children[0].children[0];
                boxTitle.innerText = iElement.attr('my-graph-chart');
                var boxBody = iElement.context.lastChild;
                var width = boxBody.offsetWidth;
                if(width<=0) return;
                var height = width * 0.5;

                var nodelinkGraph = iElement.find('#nodeLinkGraph')[0];
                var svg = d3.select(nodelinkGraph)
                    .append('svg')
                    .attr('width', width-20)
                    .attr('height', height);

                var node, link,nodes_labels;

                var voronoi = d3.geom.voronoi()
                    .x(function(d) { return d.x; })
                    .y(function(d) { return d.y; })
                    .clipExtent([[10, 10], [width-20, height-20]]);

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

                force = d3.layout.force()
                    .charge(-2000)
                    .gravity(1)
                    .friction(0.9)
                    .linkDistance(-20)
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
                    clip.exit().remove();

                    clip.selectAll('path').remove();
                    clip.append('path')
                        .attr('d', function(d) { return 'M'+d.join(',')+'Z'; });
                });

                d3.json('mbar/relation2.json', function(err, data) {

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
                        })
                        .attr("onselectstart","return false");

                    force
                        .nodes( data.nodes )
                        .links( data.links )
                        .start();
                });

                var slidvalueChange = function (){
                    //change force
                    force.charge(iElement.find("#range_1")[0].value);
                    force.friction(iElement.find("#range_2")[0].value);
                    force.gravity(iElement.find("#range_3")[0].value);
                    force.linkDistance(iElement.find("#range_4")[0].value);
                    force.start();
                };
                iElement.find("#range_1").on("change",slidvalueChange);
                iElement.find("#range_2").on("change",slidvalueChange);
                iElement.find("#range_3").on("change",slidvalueChange);
                iElement.find("#range_4").on("change",slidvalueChange);


                var resizeView = function(){
                    var newWidth = iElement.width();
                    if(width == newWidth) return;
                    width = newWidth;
                    height = width * 0.5;
                    svg.attr('width', newWidth-20)
                        .attr('height', height);

                    force.size([width,height]);

                    voronoi.clipExtent([[10, 10], [width-20, height-20]]);

                    force.start();

                    //update Matrix Graph
                    iElement.find("#matrixGraph").find("svg").remove();
                    renderMatrixGraph();
                };

                var timer;
                var updateScene = function () {
                    resizeView();
                    timer = setTimeout(updateScene, 1000);
                };
                updateScene();


                // matrix  graph
                var matrixGraphDiv = iElement.find("#matrixGraph")[0];

                function renderMatrixGraph(){
                    var margin = {top: 80, right: 0, bottom: 10, left: 80};
                    var widthMatrix =  width - margin.left - margin.right;
                    var heightMatrix = width - margin.top;

                    var x = d3.scale.ordinal().rangeBands([0, widthMatrix]),
                        z = d3.scale.linear().domain([0, 4]).clamp(true),
                        c = d3.scale.category10().domain(d3.range(10));

                    var matrixGraphSVG = d3.select(matrixGraphDiv).append("svg")
                        .attr("width", width)
                        .attr("height", width +  margin.bottom)
                        // .style("margin-left", -margin.left + "px")
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    d3.json("mbar/relation2.json", function(miserables) {
                        var matrix = [],
                            nodes = miserables.nodes,
                            n = nodes.length;

                        // Compute index per node.
                        nodes.forEach(function(node, i) {
                            node.index = i;
                            node.count = 0;
                            matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
                        });

                        // Convert links to matrix; count character occurrences.
                        miserables.links.forEach(function(link) {
                            matrix[link.source][link.target].z += link.value;
                            matrix[link.target][link.source].z += link.value;
                            matrix[link.source][link.source].z += link.value;
                            matrix[link.target][link.target].z += link.value;
                            nodes[link.source].count += link.value;
                            nodes[link.target].count += link.value;
                        });

                        // Precompute the orders.
                        var orders = {
                            name: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].name, nodes[b].name); }),
                            count: d3.range(n).sort(function(a, b) { return nodes[b].count - nodes[a].count; }),
                            group: d3.range(n).sort(function(a, b) { return nodes[b].group - nodes[a].group; })
                        };

                        // The default sort order.
                        x.domain(orders.name);

                        matrixGraphSVG.append("rect")
                            .attr("class", "background")
                            .attr("width", widthMatrix)
                            .attr("height", heightMatrix)
                            .style("fill", '#eee');

                        var row = matrixGraphSVG.selectAll(".row")
                            .data(matrix)
                            .enter().append("g")
                            .attr("class", "row")
                            .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
                            .each(row);

                        row.append("line")
                            .attr("x2", widthMatrix)
                            .style("stroke", '#fff');

                        row.append("text")
                            .attr("x", -6)
                            .attr("y", x.rangeBand() / 2)
                            .attr("dy", ".32em")
                            .attr("text-anchor", "end")
                            .text(function(d, i) { return nodes[i].name; });

                        var column = matrixGraphSVG.selectAll(".column")
                            .data(matrix)
                            .enter().append("g")
                            .attr("class", "column")
                            .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

                        column.append("line")
                            .attr("x1", -widthMatrix)
                            .style("stroke", '#fff');

                        column.append("text")
                            .attr("x", 6)
                            .attr("y", x.rangeBand() / 2)
                            .attr("dy", ".32em")
                            .attr("text-anchor", "start")
                            .text(function(d, i) { return nodes[i].name; });

                        function row(row) {
                            var cell = d3.select(this).selectAll(".cell")
                                .data(row.filter(function(d) { return d.z; }))
                                .enter().append("rect")
                                .attr("class", "cell")
                                .attr("x", function(d) { return x(d.x); })
                                .attr("width", x.rangeBand())
                                .attr("height", x.rangeBand())
                                .style("fill-opacity", function(d) { return z(d.z); })
                                .style("fill", function(d) { return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null; })
                                .on("mouseover", mouseover)
                                .on("mouseout", mouseout);
                        }

                        function mouseover(p) {
                            d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
                            d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
                        }

                        function mouseout() {
                            d3.selectAll("text").classed("active", false);
                        }

                        d3.select("#order").on("change", function() {
                            clearTimeout(timeout);
                            order(this.value);
                        });

                        function order(value) {
                            x.domain(orders[value]);

                            var t = matrixGraphSVG.transition().duration(2500);

                            t.selectAll(".row")
                                .delay(function(d, i) { return x(i) * 4; })
                                .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
                                .selectAll(".cell")
                                .delay(function(d) { return x(d.x) * 4; })
                                .attr("x", function(d) { return x(d.x); });

                            t.selectAll(".column")
                                .delay(function(d, i) { return x(i) * 4; })
                                .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
                        }

                        var timeout = setTimeout(function() {
                            order("group");
                            //d3.select("#order").property("selectedIndex", 2).node().focus();
                        }, 5000);
                    });
                };

                renderMatrixGraph();

                



            }
        }
    }
}]);

stavrDirts.directive('myBarChart', ['$interval', function($interval) {
    return {
        restrict: 'A',
        transclude: false,
        templateUrl: 'template/visualtoolhtml/boxTemplate.html',
        scope: {
            isDataChange: '@'
        },
        controller: function ($scope, $element, $transclude, $http) {
            $scope.isdatachange = false;
            $scope.$on('dataUpdate',function () {
                $scope.isdatachange = !$scope.isdatachange;
                $element[0].innerText = "Change the Box";

            })
        },
        link: {
            pre: function (scope, iElement, iAttrs, controller) {

            },
            post: function (scope, iElement, iAttrs, controller) {

                var boxTitle = iElement[0].children[0].children[0];
                boxTitle.innerText = iElement.attr('my-bar-chart');
                var boxBody = iElement.context.lastChild;
                boxBody.setAttribute('my-data-pan', 'true');
                var w = boxBody.offsetWidth;
                if (w <= 0) return;
                var h = 0.6 * w;

                var padding = {top: 40, right: 40, bottom: 40, left: 40};
                var dataset;
                //Set up stack method
                var stack = d3.layout.stack();

                d3.json("mbar/mperday.json", function (json) {
                        dataset = json;

                        //Data, stacked
                        stack(dataset);
                        var color = d3.scale.category10();
                        var color_hash = {
                            0: ["taxi_20196", color(0)],
                            1: ["taxi_18308", color(1)],
                            2: ["taxi_19701", color(2)]
                        };


                        //Set up scales
                        var xScale = d3.time.scale()
                            .domain([new Date(dataset[0][0].time), d3.time.day.offset(new Date(dataset[0][dataset[0].length - 1].time), 8)])
                            .rangeRound([0, w - padding.left - padding.right]);

                        var yScale = d3.scale.linear()
                            .domain([0,
                                d3.max(dataset, function (d) {
                                    return d3.max(d, function (d) {
                                        return d.y0 + d.y;
                                    });
                                })
                            ])
                            .range([h - padding.bottom - padding.top, 0]);

                        var xAxis = d3.svg.axis()
                            .scale(xScale)
                            .orient("bottom")
                            .ticks(d3.time.days, 1);

                        var yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient("left")
                            .ticks(10);


                        //Create SVG element
                        var svg = d3.select(boxBody)
                            .append("svg")
                            .attr("width", w)
                            .attr("height", h);

                        // Add a group for each row of data
                        var groups = svg.selectAll("g")
                            .data(dataset)
                            .enter()
                            .append("g")
                            .attr("class", "rgroups")
                            .attr("transform", "translate(" + padding.left + "," + (h - padding.bottom) + ")")
                            .style("fill", function (d, i) {
                                return color_hash[dataset.indexOf(d)][1];
                            });

                        // Add a rect for each data value
                        var rects = groups.selectAll("rect")
                            .data(function (d) {
                                return d;
                            })
                            .enter()
                            .append("rect")
                            .attr("width", 2)
                            .style("fill-opacity", 1e-6);


                        rects.transition()
                            .duration(function (d, i) {
                                return 500 * i;
                            })
                            .ease("linear")
                            .attr("x", function (d) {
                                return xScale(new Date(d.time));
                            })
                            .attr("y", function (d) {
                                return -(-yScale(d.y0) - yScale(d.y) + (h - padding.top - padding.bottom) * 2);
                            })
                            .attr("height", function (d) {
                                return -yScale(d.y) + (h - padding.top - padding.bottom);
                            })
                            .attr("width", 15)
                            .style("fill-opacity", 1);

                        svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(40," + (h - padding.bottom) + ")")
                            .call(xAxis);


                        svg.append("g")
                            .attr("class", "y axis")
                            .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
                            .call(yAxis);

                        // adding legend

                        var legend = svg.append("g")
                            .attr("class", "legend")
                            .attr("x", w - padding.right - 65)
                            .attr("y", 25)
                            .attr("height", 100)
                            .attr("width", 100);

                        legend.selectAll("g").data(dataset)
                            .enter()
                            .append('g')
                            .each(function (d, i) {
                                var g = d3.select(this);
                                g.append("rect")
                                    .attr("x", w - padding.right - 65)
                                    .attr("y", i * 25 + 10)
                                    .attr("width", 10)
                                    .attr("height", 10)
                                    .style("fill", color_hash[String(i)][1]);

                                g.append("text")
                                    .attr("x", w - padding.right - 50)
                                    .attr("y", i * 25 + 20)
                                    .attr("height", 30)
                                    .attr("width", 100)
                                    .style("fill", color_hash[String(i)][1])
                                    .text(color_hash[String(i)][0]);
                            });


                        // y axis text
                        svg.append("text")
                            .attr("transform", "rotate(-90)")
                            .attr("y", 0 - 5)
                            .attr("x", 0 - (h / 2))
                            .attr("dy", "1em")
                            .text("Number of Events");

                        // x axis text
                        svg.append("text")
                            .attr("class", "xtext")
                            .attr("x", w / 2 - padding.left)
                            .attr("y", h - 5)
                            .attr("text-anchor", "middle")
                            .text("Days");

                        // title text
                        svg.append("text")
                            .attr("class", "title")
                            .attr("x", (w / 2))
                            .attr("y", 20)
                            .attr("text-anchor", "middle")
                            .style("font-size", "16px")
                            .style("text-decoration", "underline")
                            .text("Number of Events per day.");

                        //On click, update with new data
                        d3.selectAll(".m")
                            .on("click", function () {
                                var date = this.getAttribute("value");

                                var str;
                                if (date == "2014-02-19") {
                                    str = "mbar/19.json";
                                } else if (date == "2014-02-20") {
                                    str = "mbar/20.json";
                                } else if (date == "2014-02-21") {
                                    str = "mbar/21.json";
                                } else if (date == "2014-02-22") {
                                    str = "mbar/22.json";
                                } else {
                                    str = "mbar/23.json";
                                }

                                d3.json(str, function (json) {

                                    dataset = json;
                                    stack(dataset);

                                    console.log(dataset);

                                    xScale.domain([new Date(0, 0, 0, dataset[0][0].time, 0, 0, 0), new Date(0, 0, 0, dataset[0][dataset[0].length - 1].time, 0, 0, 0)])
                                        .rangeRound([0, w - padding.left - padding.right]);

                                    yScale.domain([0,
                                            d3.max(dataset, function (d) {
                                                return d3.max(d, function (d) {
                                                    return d.y0 + d.y;
                                                });
                                            })
                                        ])
                                        .range([h - padding.bottom - padding.top, 0]);

                                    xAxis.scale(xScale)
                                        .ticks(d3.time.hour, 2)
                                        .tickFormat(d3.time.format("%H"));

                                    yAxis.scale(yScale)
                                        .orient("left")
                                        .ticks(10);

                                    groups = svg.selectAll(".rgroups")
                                        .data(dataset);

                                    groups.enter().append("g")
                                        .attr("class", "rgroups")
                                        .attr("transform", "translate(" + padding.left + "," + (h - padding.bottom) + ")")
                                        .style("fill", function (d, i) {
                                            return color(i);
                                        });


                                    rects = groups.selectAll("rect")
                                        .data(function (d) {
                                            return d;
                                        });

                                    rects.enter()
                                        .append("rect")
                                        .attr("x", w)
                                        .attr("width", 1)
                                        .style("fill-opacity", 1e-6);

                                    rects.transition()
                                        .duration(1000)
                                        .ease("linear")
                                        .attr("x", function (d) {
                                            return xScale(new Date(0, 0, 0, d.time, 0, 0, 0));
                                        })
                                        .attr("y", function (d) {
                                            return -(-yScale(d.y0) - yScale(d.y) + (h - padding.top - padding.bottom) * 2);
                                        })
                                        .attr("height", function (d) {
                                            return -yScale(d.y) + (h - padding.top - padding.bottom);
                                        })
                                        .attr("width", 15)
                                        .style("fill-opacity", 1);

                                    rects.exit()
                                        .transition()
                                        .duration(1000)
                                        .ease("circle")
                                        .attr("x", w)
                                        .remove();

                                    groups.exit()
                                        .transition()
                                        .duration(1000)
                                        .ease("circle")
                                        .attr("x", w)
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


            }

        }
    }
}]);

stavrDirts.directive('myStackBarChart', ['$interval', function($interval) {
    return {
        restrict: 'A',
        transclude: false,
        templateUrl: 'template/visualtoolhtml/stackBarBox.html',
        controller: function ($scope, $element, $transclude, $http) {
            $scope.isdatachange = false;
            $scope.dropBtnName = "Events per day";
            $scope.dateSet = [{value:"2014-02-19"},
                {value:"2014-02-20"},
                {value:"2014-02-21"},
                {value:"2014-02-22"},
                {value:"2014-02-23"}];


            $scope.$on('dataUpdate',function () {
                $scope.isdatachange = !$scope.isdatachange;
                $element[0].innerText = "Change the Box";

            })
        },
        link: {
            pre: function (scope, iElement, iAttrs, controller) {

            },
            post: function (scope, iElement, iAttrs, controller) {

                var boxTitle = iElement[0].children[0].children[0];
                boxTitle.innerText = iElement.attr('my-stack-bar-chart');
                var boxBody = iElement[0].children[1].children[1];
                var w = boxBody.offsetWidth;
                if (w <= 0) return;
                var h = 0.6 * w;

                var padding = {top: 40, right: 40, bottom: 40, left: 40};
                var dataset;
                //Set up stack method
                var stack = d3.layout.stack();

                d3.json("mbar/mperday.json", function (json) {
                    dataset = json;

                    //Data, stacked
                    stack(dataset);
                    var color = d3.scale.category10();
                    var color_hash = {
                        0: ["taxi_20196", color(0)],
                        1: ["taxi_18308", color(1)],
                        2: ["taxi_19701", color(2)]
                    };


                    //Set up scales
                    var xScale = d3.time.scale()
                        .domain([new Date(dataset[0][0].time), d3.time.day.offset(new Date(dataset[0][dataset[0].length - 1].time), 8)])
                        .rangeRound([0, w - padding.left - padding.right]);

                    var yScale = d3.scale.linear()
                        .domain([0,
                            d3.max(dataset, function (d) {
                                return d3.max(d, function (d) {
                                    return d.y0 + d.y;
                                });
                            })
                        ])
                        .range([h - padding.bottom - padding.top, 0]);

                    var xAxis = d3.svg.axis()
                        .scale(xScale)
                        .orient("bottom")
                        .ticks(d3.time.days, 1);

                    var yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient("left")
                        .ticks(10);


                    //Create SVG element
                    var svg = d3.select(boxBody)
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h);

                    // Add a group for each row of data
                    var groups = svg.selectAll("g")
                        .data(dataset)
                        .enter()
                        .append("g")
                        .attr("class", "rgroups")
                        .attr("transform", "translate(" + padding.left + "," + (h - padding.bottom) + ")")
                        .style("fill", function (d, i) {
                            return color_hash[dataset.indexOf(d)][1];
                        });

                    // Add a rect for each data value
                    var rects = groups.selectAll("rect")
                        .data(function (d) {
                            return d;
                        })
                        .enter()
                        .append("rect")
                        .attr("width", 2)
                        .style("fill-opacity", 1e-6);


                    rects.transition()
                        .duration(function (d, i) {
                            return 500 * i;
                        })
                        .ease("linear")
                        .attr("x", function (d) {
                            return xScale(new Date(d.time));
                        })
                        .attr("y", function (d) {
                            return -(-yScale(d.y0) - yScale(d.y) + (h - padding.top - padding.bottom) * 2);
                        })
                        .attr("height", function (d) {
                            return -yScale(d.y) + (h - padding.top - padding.bottom);
                        })
                        .attr("width", 15)
                        .style("fill-opacity", 1);

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(40," + (h - padding.bottom) + ")")
                        .call(xAxis);


                    svg.append("g")
                        .attr("class", "y axis")
                        .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
                        .call(yAxis);

                    // adding legend

                    var legend = svg.append("g")
                        .attr("class", "legend")
                        .attr("x", w - padding.right - 65)
                        .attr("y", 25)
                        .attr("height", 100)
                        .attr("width", 100);

                    legend.selectAll("g").data(dataset)
                        .enter()
                        .append('g')
                        .each(function (d, i) {
                            var g = d3.select(this);
                            g.append("rect")
                                .attr("x", w - padding.right - 65)
                                .attr("y", i * 25 + 10)
                                .attr("width", 10)
                                .attr("height", 10)
                                .style("fill", color_hash[String(i)][1]);

                            g.append("text")
                                .attr("x", w - padding.right - 50)
                                .attr("y", i * 25 + 20)
                                .attr("height", 30)
                                .attr("width", 100)
                                .style("fill", color_hash[String(i)][1])
                                .text(color_hash[String(i)][0]);
                        });


                    // y axis text
                    svg.append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 0 - 5)
                        .attr("x", 0 - (h / 2))
                        .attr("dy", "1em")
                        .text("Number of Events");

                    // x axis text
                    svg.append("text")
                        .attr("class", "xtext")
                        .attr("x", w / 2 - padding.left)
                        .attr("y", h - 5)
                        .attr("text-anchor", "middle")
                        .text("Days");

                    // title text
                    svg.append("text")
                        .attr("class", "title")
                        .attr("x", (w / 2))
                        .attr("y", 20)
                        .attr("text-anchor", "middle")
                        .style("font-size", "16px")
                        .style("text-decoration", "underline")
                        .text("Number of Events per day.");

                    //On click, update with new data
                    d3.selectAll(".m")
                        .on("click", function () {
                            var date = this.getAttribute("value");

                            var str;
                            if (date == "2014-02-19") {
                                str = "mbar/19.json";
                            } else if (date == "2014-02-20") {
                                str = "mbar/20.json";
                            } else if (date == "2014-02-21") {
                                str = "mbar/21.json";
                            } else if (date == "2014-02-22") {
                                str = "mbar/22.json";
                            } else {
                                str = "mbar/23.json";
                            }

                            d3.json(str, function (json) {

                                dataset = json;
                                stack(dataset);

                                console.log(dataset);

                                xScale.domain([new Date(0, 0, 0, dataset[0][0].time, 0, 0, 0), new Date(0, 0, 0, dataset[0][dataset[0].length - 1].time, 0, 0, 0)])
                                    .rangeRound([0, w - padding.left - padding.right]);

                                yScale.domain([0,
                                        d3.max(dataset, function (d) {
                                            return d3.max(d, function (d) {
                                                return d.y0 + d.y;
                                            });
                                        })
                                    ])
                                    .range([h - padding.bottom - padding.top, 0]);

                                xAxis.scale(xScale)
                                    .ticks(d3.time.hour, 2)
                                    .tickFormat(d3.time.format("%H"));

                                yAxis.scale(yScale)
                                    .orient("left")
                                    .ticks(10);

                                groups = svg.selectAll(".rgroups")
                                    .data(dataset);

                                groups.enter().append("g")
                                    .attr("class", "rgroups")
                                    .attr("transform", "translate(" + padding.left + "," + (h - padding.bottom) + ")")
                                    .style("fill", function (d, i) {
                                        return color(i);
                                    });


                                rects = groups.selectAll("rect")
                                    .data(function (d) {
                                        return d;
                                    });

                                rects.enter()
                                    .append("rect")
                                    .attr("x", w)
                                    .attr("width", 1)
                                    .style("fill-opacity", 1e-6);

                                rects.transition()
                                    .duration(1000)
                                    .ease("linear")
                                    .attr("x", function (d) {
                                        return xScale(new Date(0, 0, 0, d.time, 0, 0, 0));
                                    })
                                    .attr("y", function (d) {
                                        return -(-yScale(d.y0) - yScale(d.y) + (h - padding.top - padding.bottom) * 2);
                                    })
                                    .attr("height", function (d) {
                                        return -yScale(d.y) + (h - padding.top - padding.bottom);
                                    })
                                    .attr("width", 15)
                                    .style("fill-opacity", 1);

                                rects.exit()
                                    .transition()
                                    .duration(1000)
                                    .ease("circle")
                                    .attr("x", w)
                                    .remove();

                                groups.exit()
                                    .transition()
                                    .duration(1000)
                                    .ease("circle")
                                    .attr("x", w)
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


            }

        }
    }
}]);


stavrDirts.directive('myTrajectoryLayerTable',['MapViewerSever',function (MapViewerSever) {
    return {
        restrict: 'A',
        transclude: false,
        link: {
            pre: function (scope, iElement, iAttrs, controller) {

            },
            post: function (scope, iElement, iAttrs, controller) {
                
            }

        }
    }
}]);

stavrDirts.directive('mySelectedTable',['$rootScope','ActiveDataFactory',function($rootScope,ActiveDataFactory){
    return {
        restrict : 'A',
        transclude: false,
        templateUrl:'template/visualtoolhtml/boxTemplate.html',
        controller: function ($scope,$element,$transclude,$http) {

        },
        link:{
            pre: function (tElement,tAttrs,transclude) {

            },
            post:function (scope,iElement,iAttrs,controller) {

                iAttrs.$observe('title',function () {
                    var boxTitle = iElement[0].children[0].children[0];
                    boxTitle.innerText = iElement.attr('my-selected-table');
                    var boxBody = iElement.context.lastChild;
                    var width = boxBody.offsetWidth;
                    if (width <= 0) return;
                    boxBody.innerHTML = ActiveDataFactory.callSelectedDataTable();
                    var tableElement = boxBody.firstChild;
                    if(tableElement==null) return;

                    scope.selectTableView = $(tableElement).DataTable({
                        "paging": true,
                        "lengthChange": true,
                        "searching": true,
                        "ordering": true,
                        "info": true,
                        "autoWidth": true,
                        "select": true
                    });

                    var tableBodyElement = boxBody.lastChild;
                    $(tableBodyElement).on( 'click', 'tr', function () {
                        var currentTr = this;
                        var trSet = scope.selectTableView.rows('.active').nodes();
                        trSet.each(function (e,i) {
                            if(e!==currentTr)
                            {
                                $(e).toggleClass('active');
                            }
                        });
                        $(this).toggleClass('active');
                    } );

                });


            }
        }
    }
}]);

// stavrDirts.directive('mySideLayout',function () {
//     return {
//         restrict : 'A',
//         transclude: true,
//         controller: function ($scope,$element,$transclude,$http) {
//
//         },
//         link:{
//             pre: function (scope,iElement,iAttrs,controller) {
//
//             },
//             post:function (scope,iElement,iAttrs,controller) {
//
//             }
//         }
//     }
// });